import { Module } from '@nestjs/common';
import { CheckoutResolver } from './checkout.resolver';
import { CheckoutModule as CheckoutServiceModule } from '../../checkout/checkout.module';

@Module({
  imports: [CheckoutServiceModule],
  providers: [CheckoutResolver],
})
export class CheckoutGraphQLModule {}
