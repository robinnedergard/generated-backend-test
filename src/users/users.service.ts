import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPermissionEntity } from './entities/user-permission.entity';
import { UserPermission } from './entities/permission.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserPermissionEntity)
    private userPermissionRepository: Repository<UserPermissionEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['permissions'],
    });
  }

  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async findOneWithPermissions(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['permissions'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async assignPermission(
    userId: string,
    permission: UserPermission,
  ): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.userPermissionRepository.findOne({
      where: { userId, permission },
    });

    if (!existing) {
      const userPermission = this.userPermissionRepository.create({
        userId,
        permission,
      });
      await this.userPermissionRepository.save(userPermission);
    }
  }

  async removePermission(
    userId: string,
    permission: UserPermission,
  ): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userPermissionRepository.delete({ userId, permission });
  }

  async hasPermission(
    userId: string,
    permission: UserPermission,
  ): Promise<boolean> {
    const userPermission = await this.userPermissionRepository.findOne({
      where: { userId, permission },
    });
    return !!userPermission;
  }
}
