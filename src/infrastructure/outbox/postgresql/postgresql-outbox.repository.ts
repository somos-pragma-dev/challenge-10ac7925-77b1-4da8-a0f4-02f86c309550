import { Injectable, Logger } from '@nestjs/common';
import { Pool, PoolClient, QueryResult } from 'pg';
import { OutboxMessage } from '@domain/models/outbox-message.model';
import {
  OutboxRepository,
  OutboxMessageFilter,
} from '../outbox.repository';

export interface PostgreSQLOutboxConfig {
  readonly schema: string;
  readonly tableName: string;
  readonly maxRetries: number;
  readonly retentionDays: number;
}

const DEFAULT_CONFIG: PostgreSQLOutboxConfig = {
  schema: 'outbox',
  tableName: 'messages',
  maxRetries: 5,
  retentionDays: 7,
};

@Injectable()
export class PostgreSqlOutboxRepository implements OutboxRepository {
  private readonly logger = new Logger(PostgreSqlOutboxRepository.name);
  private readonly pool: Pool;
  private readonly config: PostgreSQLOutboxConfig;

  constructor(pool: Pool, config?: Partial<PostgreSQLOutboxConfig>) {
    this.pool = pool;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    const createSchemaSQL = `
      CREATE SCHEMA IF NOT EXISTS ${this.config.schema};
    `;
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.config.schema}.${this.config.tableName} (
        message_id VARCHAR(255) PRIMARY KEY,
        event_id VARCHAR(255) NOT NULL UNIQUE,
        event_type VARCHAR(255) NOT NULL,
        payload JSONB NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        processed_at TIMESTAMP WITH TIME ZONE,
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        CONSTRAINT chk_status CHECK (status IN ('pending', 'processed', 'failed'))
      );
    `;
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_outbox_status_created
      ON ${this.config.schema}.${this.config.tableName} (status, created_at);
      CREATE INDEX IF NOT EXISTS idx_outbox_event_type
      ON ${this.config.schema}.${this.config.tableName} (event_type);
      CREATE INDEX IF NOT EXISTS idx_outbox_event_id
      ON ${this.config.schema}.${this.config.tableName} (event_id);
    `;

    try {
      await this.pool.query(createSchemaSQL);
      await this.pool.query(createTableSQL);
      await this.pool.query(createIndexSQL);
      this.logger.log(
        `Esquema ${this.config.schema} y tabla ${this.config.tableName} inicializados`,
      );
    } catch (error) {
      this.logger.error('Error al inicializar el outbox en PostgreSQL', error);
      throw error;
    }
  }

  async save(message: OutboxMessage): Promise<void> {
    const exists = await this.existsByEventId(message.eventId);
    if (exists) {
      this.logger.warn(
        `Mensaje con eventId ${message.eventId} ya existe, evitando duplicado`,
      );
      return;
    }

    const insertSQL = `
      INSERT INTO ${this.config.schema}.${this.config.tableName}
        (message_id, event_id, event_type, payload, status, created_at, retry_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (event_id) DO NOTHING
    `;

    const values = [
      message.messageId,
      message.eventId,
      message.eventType,
      JSON.stringify(message.payload),
      message.status,
      message.createdAt,
      message.retryCount || 0,
    ];

    try {
      const result = await this.pool.query(insertSQL, values);
      if (result.rowCount === 0) {
        this.logger.warn(
          `Duplicado detectado para eventId: ${message.eventId}, saltando`,
        );
      } else {
        this.logger.debug(`Mensaje guardado en outbox: ${message.messageId}`);
      }
    } catch (error) {
      this.logger.error(
        `Error al guardar mensaje en outbox: ${message.messageId}`,
        error,
      );
      throw error;
    }
  }

  async saveBatch(messages: OutboxMessage[]): Promise<void> {
    if (messages.length === 0) return;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const insertSQL = `
        INSERT INTO ${this.config.schema}.${this.config.tableName}
          (message_id, event_id, event_type, payload, status, created_at, retry_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (event_id) DO NOTHING
      `;

      for (const message of messages) {
        const values = [
          message.messageId,
          message.eventId,
          message.eventType,
          JSON.stringify(message.payload),
          message.status,
          message.createdAt,
          message.retryCount || 0,
        ];
        await client.query(insertSQL, values);
      }

      await client.query('COMMIT');
      this.logger.debug(`Batch de ${messages.length} mensajes guardado en outbox`);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Error al guardar batch en outbox', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async findPending(limit: number): Promise<OutboxMessage[]> {
    const selectSQL = `
      SELECT message_id, event_id, event_type, payload, status,
             created_at, processed_at, retry_count, last_error
      FROM ${this.config.schema}.${this.config.tableName}
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT $1
    `;

    try {
      const result = await this.pool.query(selectSQL, [limit]);
      return result.rows.map((row) => this.mapRowToMessage(row));
    } catch (error) {
      this.logger.error('Error al buscar mensajes pendientes', error);
      throw error;
    }
  }

  async findByFilter(filter: OutboxMessageFilter): Promise<OutboxMessage[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filter.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(filter.status);
    }

    if (filter.eventType) {
      conditions.push(`event_type = $${paramIndex++}`);
      values.push(filter.eventType);
    }

    if (filter.fromDate) {
      conditions.push(`created_at >= $${paramIndex++}`);
      values.push(filter.fromDate);
    }

    if (filter.toDate) {
      conditions.push(`created_at <= $${paramIndex++}`);
      values.push(filter.toDate);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filter.limit || 100;

    const selectSQL = `
      SELECT message_id, event_id, event_type, payload, status,
             created_at, processed_at, retry_count, last_error
      FROM ${this.config.schema}.${this.config.tableName}
      ${whereClause}
      ORDER BY created_at ASC
      LIMIT $${paramIndex}
    `;

    values.push(limit);

    try {
      const result = await this.pool.query(selectSQL, values);
      return result.rows.map((row) => this.mapRowToMessage(row));
    } catch (error) {
      this.logger.error('Error al buscar mensajes con filtro', error);
      throw error;
    }
  }

  async markAsProcessed(messageId: string, processedAt: Date): Promise<void> {
    const updateSQL = `
      UPDATE ${this.config.schema}.${this.config.tableName}
      SET status = 'processed', processed_at = $2
      WHERE message_id = $1
    `;

    try {
      await this.pool.query(updateSQL, [messageId, processedAt]);
      this.logger.debug(`Mensaje marcado como procesado: ${messageId}`);
    } catch (error) {
      this.logger.error(
        `Error al marcar mensaje como procesado: ${messageId}`,
        error,
      );
      throw error;
    }
  }

  async markAsFailed(messageId: string, error: string): Promise<void> {
    const updateSQL = `
      UPDATE ${this.config.schema}.${this.config.tableName}
      SET status = 'failed', last_error = $2, retry_count = retry_count + 1
      WHERE message_id = $1
    `;

    try {
      await this.pool.query(updateSQL, [messageId, error]);
      this.logger.warn(
        `Mensaje marcado como fallido: ${messageId}, error: ${error}`,
      );
    } catch (error) {
      this.logger.error(`Error al marcar mensaje como fallido: ${messageId}`, error);
      throw error;
    }
  }

  async existsByEventId(eventId: string): Promise<boolean> {
    const selectSQL = `
      SELECT 1 FROM ${this.config.schema}.${this.config.tableName}
      WHERE event_id = $1
      LIMIT 1
    `;

    try {
      const result = await this.pool.query(selectSQL, [eventId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      this.logger.error(`Error al verificar existencia de eventId: ${eventId}`, error);
      throw error;
    }
  }

  async updateRetryCount(messageId: string): Promise<void> {
    const updateSQL = `
      UPDATE ${this.config.schema}.${this.config.tableName}
      SET retry_count = retry_count + 1
      WHERE message_id = $1
    `;

    try {
      await this.pool.query(updateSQL, [messageId]);
    } catch (error) {
      this.logger.error(
        `Error al actualizar retry count para: ${messageId}`,
        error,
      );
      throw error;
    }
  }

  async deleteOldProcessedMessages(olderThan: Date): Promise<number> {
    const deleteSQL = `
      DELETE FROM ${this.config.schema}.${this.config.tableName}
      WHERE status = 'processed' AND processed_at < $1
    `;

    try {
      const result = await this.pool.query(deleteSQL, [olderThan]);
      const deletedCount = result.rowCount || 0;
      this.logger.log(
        `Eliminados ${deletedCount} mensajes procesados antiguos`,
      );
      return deletedCount;
    } catch (error) {
      this.logger.error('Error al eliminar mensajes procesados antiguos', error);
      throw error;
    }
  }

  private mapRowToMessage(row: Record<string, unknown>): OutboxMessage {
    return {
      messageId: row.message_id as string,
      eventId: row.event_id as string,
      eventType: row.event_type as string,
      payload: typeof row.payload === 'string'
        ? JSON.parse(row.payload)
        : row.payload as Record<string, unknown>,
      status: row.status as 'pending' | 'processed' | 'failed',
      createdAt: new Date(row.created_at as string),
      processedAt: row.processed_at
        ? new Date(row.processed_at as string)
        : undefined,
      retryCount: (row.retry_count as number) || 0,
      lastError: row.last_error as string | undefined,
    };
  }
}