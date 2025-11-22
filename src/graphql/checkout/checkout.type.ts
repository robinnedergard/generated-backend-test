import {
  ObjectType,
  Field,
  ID,
  Float,
  registerEnumType,
} from '@nestjs/graphql';

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  BANK_TRANSFER = 'bank_transfer',
}

export enum CheckoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
});

registerEnumType(CheckoutStatus, {
  name: 'CheckoutStatus',
});

@ObjectType()
export class CheckoutItem {
  @Field()
  productId: string;

  @Field()
  name: string;

  @Field(() => Float)
  quantity: number;

  @Field(() => Float)
  price: number;
}

@ObjectType()
export class Address {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  address: string;

  @Field()
  city: string;

  @Field()
  state: string;

  @Field()
  zipCode: string;

  @Field()
  country: string;
}

@ObjectType()
export class PaymentDetails {
  @Field({ nullable: true })
  cardLast4?: string;

  @Field({ nullable: true })
  cardBrand?: string;

  @Field({ nullable: true })
  paypalEmail?: string;

  @Field({ nullable: true })
  bankAccount?: string;
}

@ObjectType()
export class Checkout {
  @Field(() => ID)
  id: string;

  @Field(() => [CheckoutItem])
  items: CheckoutItem[];

  @Field(() => Float)
  subtotal: number;

  @Field(() => Float)
  tax: number;

  @Field(() => Float)
  shipping: number;

  @Field(() => Float)
  total: number;

  @Field(() => PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field(() => PaymentDetails, { nullable: true })
  paymentDetails?: PaymentDetails;

  @Field(() => CheckoutStatus)
  status: CheckoutStatus;

  @Field(() => Address)
  shippingAddress: Address;

  @Field(() => Address, { nullable: true })
  billingAddress?: Address;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  transactionId?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
