import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from './checkout.type';

@InputType()
class CheckoutItemInput {
  @Field()
  @IsString()
  productId: string;

  @Field()
  @IsString()
  name: string;

  @Field(() => Float)
  @IsNumber()
  @Min(1)
  quantity: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;
}

@InputType()
class AddressInput {
  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field()
  @IsString()
  address: string;

  @Field()
  @IsString()
  city: string;

  @Field()
  @IsString()
  state: string;

  @Field()
  @IsString()
  zipCode: string;

  @Field()
  @IsString()
  country: string;
}

@InputType()
class PaymentDetailsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cardLast4?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cardBrand?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  paypalEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bankAccount?: string;
}

@InputType()
export class CreateCheckoutInput {
  @Field(() => [CheckoutItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemInput)
  items: CheckoutItemInput[];

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  subtotal: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  tax: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  shipping: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  total: number;

  @Field(() => PaymentMethod)
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field(() => PaymentDetailsInput, { nullable: true })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PaymentDetailsInput)
  paymentDetails?: PaymentDetailsInput;

  @Field(() => AddressInput)
  @IsObject()
  @ValidateNested()
  @Type(() => AddressInput)
  shippingAddress: AddressInput;

  @Field(() => AddressInput, { nullable: true })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressInput)
  billingAddress?: AddressInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
