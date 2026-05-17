import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as oracledb from 'oracledb';
import { Logger } from '../common/logger/logger';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private logger = new Logger('DatabaseService');
  private pool: oracledb.Pool | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializePool();
  }

  private async initializePool(): Promise<void> {
    try {
      const poolAlias = 'default';

      if (oracledb.getPool(poolAlias)) {
        this.pool = oracledb.getPool(poolAlias);
        this.logger.info('기존 Connection Pool 사용');
        return;
      }

      this.pool = await oracledb.createPool({
        user: this.configService.get<string>('DB_USER'),
        password: this.configService.get<string>('DB_PASSWORD'),
        connectString: `${this.configService.get<string>('DB_HOST')}:${this.configService.get<string>('DB_PORT')}/${this.configService.get<string>('DB_SERVICE_NAME')}`,
        poolAlias,
        poolMin: parseInt(
          this.configService.get<string>('DATABASE_POOL_MIN', '10'),
          10,
        ),
        poolMax: parseInt(
          this.configService.get<string>('DATABASE_POOL_MAX', '50'),
          10,
        ),
        poolIncrement: 1,
        poolTimeout: parseInt(
          this.configService.get<string>('DATABASE_POOL_TIMEOUT', '60'),
          10,
        ),
        waitTimeout: 60000,
        queueTimeout: 60000,
      });

      this.logger.info('Oracle Connection Pool 생성 완료');
    } catch (error) {
      this.logger.error('Connection Pool 초기화 실패:', error);
      throw error;
    }
  }

  async getConnection(): Promise<oracledb.Connection> {
    if (!this.pool) {
      throw new Error('Connection Pool이 초기화되지 않았습니다.');
    }

    try {
      const connection = await this.pool.getConnection();
      this.logger.debug('Connection 획득 완료');
      return connection;
    } catch (error) {
      this.logger.error('Connection 획득 실패:', error);
      throw error;
    }
  }

  async getPool(): Promise<oracledb.Pool> {
    if (!this.pool) {
      throw new Error('Connection Pool이 초기화되지 않았습니다.');
    }
    return this.pool;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.close(10);
        this.logger.info('Connection Pool 종료 완료');
      } catch (error) {
        this.logger.error('Connection Pool 종료 실패:', error);
      }
    }
  }
}
