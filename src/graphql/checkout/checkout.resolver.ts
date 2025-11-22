import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Checkout, CheckoutStatus } from './checkout.type';
import { CheckoutService } from '../../checkout/checkout.service';
import { CreateCheckoutInput } from './create-checkout.input';
import { CheckoutStatus as EntityCheckoutStatus } from '../../checkout/entities/checkout.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Resolver(() => Checkout)
export class CheckoutResolver {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Mutation(() => Checkout)
  createCheckout(
    @Args('createCheckoutInput') createCheckoutInput: CreateCheckoutInput,
  ) {
    return this.checkoutService.create(createCheckoutInput);
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
  @UseGuards(JwtAuthGuard)
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.checkoutService.findOne(id);
  }

  @Mutation(() => Checkout)
  @UseGuards(JwtAuthGuard)
  cancelCheckout(@Args('id', { type: () => ID }) id: string) {
    return this.checkoutService.cancel(id);
  }
}
