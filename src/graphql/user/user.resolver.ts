import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './user.type';
import { UsersService } from '../../users/users.service';
import { CreateUserInput } from './create-user.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<
    Omit<import('../../users/entities/user.entity').User, 'password'>[]
  > {
    const users = await this.usersService.findAll();
    return users.map(({ password: _password, ...user }) => user);
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<
    Omit<import('../../users/entities/user.entity').User, 'password'>
  > {
    const user = await this.usersService.findOne(id);
    const { password: _password, ...result } = user;
    return result;
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<
    Omit<import('../../users/entities/user.entity').User, 'password'>
  > {
    const user = await this.usersService.create(createUserInput);
    const { password: _password, ...result } = user;
    return result;
  }
}
