import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserPermission } from './permission.enum';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => [UserPermission])
  permissions: UserPermission[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
