import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto, UserListResponseDto } from './dto/user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Logger } from '../../common/logger/logger';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');

  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    this.logger.info(`새 사용자 생성 시작: ${createUserDto.email}`);
    return this.userRepository.create(createUserDto);
  }

  async findAll(paginationDto: PaginationDto): Promise<UserListResponseDto> {
    this.logger.info(`사용자 목록 조회: 페이지 ${paginationDto.page}`);

    const { users, total } = await this.userRepository.findAll(
      paginationDto.offset,
      paginationDto.limit!,
    );

    return {
      data: users,
      total,
      page: paginationDto.page!,
      limit: paginationDto.limit!,
    };
  }

  async findById(id: number): Promise<UserDto> {
    this.logger.info(`사용자 조회: ID ${id}`);

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`사용자를 찾을 수 없습니다: ID ${id}`);
    }

    return user;
  }

  async delete(id: number): Promise<void> {
    this.logger.info(`사용자 삭제 시작: ID ${id}`);

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`사용자를 찾을 수 없습니다: ID ${id}`);
    }
  }
}
