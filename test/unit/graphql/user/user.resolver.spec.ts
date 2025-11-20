import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from '#src/graphql/user/user.resolver';
import { UsersService } from '#src/users/users.service';
import { CreateUserInput } from '#src/graphql/user/create-user.input';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let usersService: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users without passwords', async () => {
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

      mockUsersService.findAll.mockResolvedValue(users);

      const result = await resolver.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[0]).toHaveProperty('id', '1');
      expect(result[0]).toHaveProperty('email', 'test@example.com');
    });
  });

  describe('findOne', () => {
    it('should return a user without password', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findOne.mockResolvedValue(user);

      const result = await resolver.findOne('1');

      expect(usersService.findOne).toHaveBeenCalledWith('1');
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('email', 'test@example.com');
    });
  });

  describe('createUser', () => {
    it('should create a user and return without password', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const createdUser = {
        id: '1',
        ...createUserInput,
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await resolver.createUser(createUserInput);

      expect(usersService.create).toHaveBeenCalledWith(createUserInput);
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('email', 'test@example.com');
    });
  });
});
