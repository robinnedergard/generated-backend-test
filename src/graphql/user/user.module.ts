import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UsersModule } from '../../users/users.module';
import './permission.enum'; // Register the enum

@Module({
  imports: [UsersModule],
  providers: [UserResolver],
})
export class UserGraphQLModule {}
