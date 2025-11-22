import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Context,
  ResolveField,
  Root,
} from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Checkout, CheckoutStatus } from './checkout.type';
import { CheckoutService } from '../../checkout/checkout.service';
import { CreateCheckoutInput } from './create-checkout.input';
import { CheckoutStatus as EntityCheckoutStatus } from '../../checkout/entities/checkout.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { Address } from './checkout.type';
import { PaymentDetails } from './checkout.type';

@Resolver(() => Checkout)
export class CheckoutResolver {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Mutation(() => Checkout)
  @UseGuards(OptionalJwtAuthGuard)
  createCheckout(
    @Args('createCheckoutInput') createCheckoutInput: CreateCheckoutInput,
    @Context() context: any,
  ) {
    const userId = context.req?.user?.userId || undefined;
    return this.checkoutService.create(createCheckoutInput, userId);
  }

  @Query(() => [Checkout], { name: 'checkouts' })
  @UseGuards(JwtAuthGuard)
  findAll(
    @Args('status', { nullable: true, type: () => CheckoutStatus })
    status?: CheckoutStatus,
  ) {
    if (status) {
      return this.checkoutService.findByStatus(status as EntityCheckoutStatus);
    }
    return this.checkoutService.findAll();
  }

  @Query(() => Checkout, { name: 'checkout' })
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.checkoutService.findOne(id);
  }

  @Query(() => [Checkout], { name: 'myOrders' })
  @UseGuards(JwtAuthGuard)
  myOrders(@Context() context: any) {
    const userId = context.req?.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.checkoutService.findByUserId(userId);
  }

  @Mutation(() => Checkout)
  @UseGuards(JwtAuthGuard)
  cancelCheckout(@Args('id', { type: () => ID }) id: string) {
    return this.checkoutService.cancel(id);
  }

  // Field resolvers to conditionally return sensitive data based on authentication
  @ResolveField(() => Address, { nullable: true })
  shippingAddress(
    @Root() checkout: Checkout,
    @Context() context: any,
  ): Address | null {
    // Only return full address if authenticated
    if (context.req?.user) {
      return checkout.shippingAddress;
    }
    // Return minimal address info for unauthenticated users (city and country only)
    if (checkout.shippingAddress) {
      return {
        firstName: '',
        lastName: '',
        address: '',
        city: checkout.shippingAddress.city || '',
        state: '',
        zipCode: '',
        country: checkout.shippingAddress.country || '',
      };
    }
    return null;
  }

  @ResolveField(() => Address, { nullable: true })
  billingAddress(
    @Root() checkout: Checkout,
    @Context() context: any,
  ): Address | null {
    // Only return billing address if authenticated
    if (context.req?.user) {
      return checkout.billingAddress || null;
    }
    return null;
  }

  @ResolveField(() => PaymentDetails, { nullable: true })
  paymentDetails(
    @Root() checkout: Checkout,
    @Context() context: any,
  ): PaymentDetails | null {
    // Only return payment details if authenticated
    if (context.req?.user) {
      return checkout.paymentDetails || null;
    }
    return null;
  }

  @ResolveField(() => String, { nullable: true })
  email(@Root() checkout: Checkout, @Context() context: any): string | null {
    // Only return email if authenticated
    if (context.req?.user) {
      return checkout.email || null;
    }
    return null;
  }

  @ResolveField(() => String, { nullable: true })
  phone(@Root() checkout: Checkout, @Context() context: any): string | null {
    // Only return phone if authenticated
    if (context.req?.user) {
      return checkout.phone || null;
    }
    return null;
  }

  @ResolveField(() => String, { nullable: true })
  transactionId(
    @Root() checkout: Checkout,
    @Context() context: any,
  ): string | null {
    // Only return transaction ID if authenticated
    if (context.req?.user) {
      return checkout.transactionId || null;
    }
    return null;
  }

  @ResolveField(() => String, { nullable: true })
  notes(@Root() checkout: Checkout, @Context() context: any): string | null {
    // Only return notes if authenticated
    if (context.req?.user) {
      return checkout.notes || null;
    }
    return null;
  }
}
