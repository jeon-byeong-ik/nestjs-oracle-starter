import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from '../src/modules/user/user.service';
import { UserRepository } from '../src/modules/user/user.repository';
import { CreateUserDto } from '../src/modules/user/dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  const mockUserRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('사용자를 생성할 수 있어야 함', async () => {
      const createUserDto: CreateUserDto = {
        name: '테스트',
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        id: 1,
        name: '테스트',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.create.mockResolvedValue(expectedResult);

      const result = await service.create(createUserDto);

      expect(result).toEqual(expectedResult);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findById', () => {
    it('존재하지 않는 사용자는 NotFoundException을 던져야 함', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
