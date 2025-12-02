import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Root,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './user.type';
import { UsersService } from '../../users/users.service';
import { CreateUserInput } from './create-user.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { UserPermission } from './permission.enum';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.PERMISSIONS_READ)
  async findAll(): Promise<User[]> {
    const users = await this.usersService.findAll();
    return users.map(({ password: _password, permissions, ...user }) => ({
      ...user,
      permissions: permissions ? permissions.map((up) => up.permission) : [],
    })) as User[];
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.PERMISSIONS_READ)
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<User> {
    const user = await this.usersService.findOne(id);
    const { password: _password, permissions, ...result } = user;
    return {
      ...result,
      permissions: permissions ? permissions.map((up) => up.permission) : [],
    } as User;
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    const user = await this.usersService.create(createUserInput);
    const { password: _password, permissions, ...result } = user;
    return {
      ...result,
      permissions: permissions ? permissions.map((up) => up.permission) : [],
    } as User;
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.PERMISSIONS_WRITE)
  async assignPermission(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('permission', { type: () => UserPermission })
    permission: UserPermission,
  ): Promise<User> {
    await this.usersService.assignPermission(userId, permission);
    const user = await this.usersService.findOne(userId);
    const { password: _password, permissions, ...result } = user;
    return {
      ...result,
      permissions: permissions ? permissions.map((up) => up.permission) : [],
    } as User;
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.PERMISSIONS_WRITE)
  async removePermission(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('permission', { type: () => UserPermission })
    permission: UserPermission,
  ): Promise<User> {
    await this.usersService.removePermission(userId, permission);
    const user = await this.usersService.findOne(userId);
    const { password: _password, permissions, ...result } = user;
    return {
      ...result,
      permissions: permissions ? permissions.map((up) => up.permission) : [],
    } as User;
  }

  @ResolveField(() => [UserPermission])
  permissions(@Root() user: any): UserPermission[] {
    if (user.permissions && Array.isArray(user.permissions)) {
      // If permissions is already an array of UserPermission enums, return as is
      if (typeof user.permissions[0] === 'string') {
        return user.permissions;
      }
      // If permissions is an array of UserPermissionEntity, map to permission strings
      return user.permissions.map((up: any) => up.permission);
    }
    return [];
  }
}
