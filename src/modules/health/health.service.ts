import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Logger } from '../../common/logger/logger';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  database: 'connected' | 'disconnected';
}

@Injectable()
export class HealthService {
  private logger = new Logger('HealthService');

  constructor(private readonly databaseService: DatabaseService) {}

  async getHealth(): Promise<HealthStatus> {
    try {
      const connection = await this.databaseService.getConnection();
      await connection.close();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      this.logger.error('Health Check 실패:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      };
    }
  }
}
