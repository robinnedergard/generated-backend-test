import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  category: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  image: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  badge?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  colors: string[];
}
