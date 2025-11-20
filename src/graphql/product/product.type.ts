import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class Product {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  category: string;

  @Field(() => Float)
  price: number;

  @Field()
  image: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  badge?: string;

  @Field({ nullable: true })
  featured?: boolean;

  @Field(() => Float)
  rating: number;

  @Field(() => [String])
  colors: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
