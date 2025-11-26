import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from '../user/user.type';

@ObjectType()
export class Review {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  productId: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  text: string;

  @Field(() => Int)
  rating: number;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field()
  userName: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
