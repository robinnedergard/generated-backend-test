import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { UsersService } from '#src/users/users.service';
import { User } from '#src/users/entities/user.entity';
import { UserPermissionEntity } from '#src/users/entities/user-permission.entity';
import { CreateUserDto } from '#src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let _repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserPermissionRepository = {
    findOne: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(UserPermissionEntity),
          useValue: mockUserPermissionRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    _repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should create a new user', async () => {
      const hashedPassword = 'hashedPassword123';
      const savedUser = {
        id: '1',
        ...createUserDto,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedUser);
      mockRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedUser);
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = {
        id: '1',
        email: createUserDto.email,
        password: 'hashed',
        firstName: 'Jane',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        {
          id: '1',
          email: 'test@example.com',
          password: 'hashed',
          firstName: 'John',
          lastName: 'Doe',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const usersWithPermissions = users.map((u) => ({
        ...u,
        permissions: [],
      }));
      mockRepository.find.mockResolvedValue(usersWithPermissions);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['permissions'],
      });
      expect(result).toEqual(usersWithPermissions);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userWithPermissions = { ...user, permissions: [] };
      mockRepository.findOne.mockResolvedValue(userWithPermissions);

      const result = await service.findOne('1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['permissions'],
      });
      expect(result).toEqual(userWithPermissions);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userWithPermissions = { ...user, permissions: [] };
      mockRepository.findOne.mockResolvedValue(userWithPermissions);

      const result = await service.findByEmail('test@example.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['permissions'],
      });
      expect(result).toEqual(userWithPermissions);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        password: 'oldHashed',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateDto = {
        firstName: 'Jane',
      };

      const existingUserWithPermissions = {
        ...existingUser,
        permissions: [],
      };
      const updatedUser = {
        ...existingUserWithPermissions,
        ...updateDto,
      };

      mockRepository.findOne.mockResolvedValue(existingUserWithPermissions);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['permissions'],
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.firstName).toBe('Jane');
    });

    it('should hash password if provided in update', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        password: 'oldHashed',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateDto = {
        password: 'newPassword123',
      };

      const hashedPassword = 'newHashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const existingUserWithPermissions = {
        ...existingUser,
        permissions: [],
      };
      mockRepository.findOne.mockResolvedValue(existingUserWithPermissions);
      mockRepository.save.mockResolvedValue({
        ...existingUserWithPermissions,
        password: hashedPassword,
      });

      await service.update('1', updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['permissions'],
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
