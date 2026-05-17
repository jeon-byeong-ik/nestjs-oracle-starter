import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Logger } from '../../common/logger/logger';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserRepository {
  private logger = new Logger('UserRepository');

  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const connection = await this.databaseService.getConnection();

    try {
      const now = new Date();
      const result = await connection.execute(
        `INSERT INTO USERS (NAME, EMAIL, PASSWORD, CREATED_AT, UPDATED_AT)
         VALUES (:name, :email, :password, :createdAt, :updatedAt)
         RETURNING ID INTO :id`,
        {
          name: createUserDto.name,
          email: createUserDto.email,
          password: createUserDto.password,
          createdAt: now,
          updatedAt: now,
          id: { type: 'NUMBER', dir: 3 },
        },
        { autoCommit: true },
      );

      this.logger.info(`사용자 생성 완료: ${createUserDto.email}`);

      return {
        id: result.outBinds.id[0],
        name: createUserDto.name,
        email: createUserDto.email,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      this.logger.error(`사용자 생성 실패: ${createUserDto.email}`, error);
      throw error;
    } finally {
      await connection.close();
    }
  }

  async findAll(offset: number, limit: number): Promise<{
    users: UserDto[];
    total: number;
  }> {
    const connection = await this.databaseService.getConnection();

    try {
      const totalResult = await connection.execute(
        'SELECT COUNT(*) as TOTAL FROM USERS',
      );
      const total = totalResult.rows?.[0][0] as number;

      const result = await connection.execute(
        `SELECT ID, NAME, EMAIL, CREATED_AT, UPDATED_AT
         FROM USERS
         ORDER BY CREATED_AT DESC
         OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
        {
          offset,
          limit,
        },
      );

      const users = (result.rows || []).map((row) => ({
        id: row[0] as number,
        name: row[1] as string,
        email: row[2] as string,
        createdAt: row[3] as Date,
        updatedAt: row[4] as Date,
      }));

      return { users, total };
    } catch (error) {
      this.logger.error('사용자 목록 조회 실패', error);
      throw error;
    } finally {
      await connection.close();
    }
  }

  async findById(id: number): Promise<UserDto | null> {
    const connection = await this.databaseService.getConnection();

    try {
      const result = await connection.execute(
        `SELECT ID, NAME, EMAIL, CREATED_AT, UPDATED_AT
         FROM USERS
         WHERE ID = :id`,
        { id },
      );

      if (!result.rows || result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row[0] as number,
        name: row[1] as string,
        email: row[2] as string,
        createdAt: row[3] as Date,
        updatedAt: row[4] as Date,
      };
    } catch (error) {
      this.logger.error(`사용자 조회 실패: ID ${id}`, error);
      throw error;
    } finally {
      await connection.close();
    }
  }

  async delete(id: number): Promise<boolean> {
    const connection = await this.databaseService.getConnection();

    try {
      const result = await connection.execute(
        'DELETE FROM USERS WHERE ID = :id',
        { id },
        { autoCommit: true },
      );

      const success = (result.rowsAffected || 0) > 0;
      if (success) {
        this.logger.info(`사용자 삭제 완료: ID ${id}`);
      }
      return success;
    } catch (error) {
      this.logger.error(`사용자 삭제 실패: ID ${id}`, error);
      throw error;
    } finally {
      await connection.close();
    }
  }
}
