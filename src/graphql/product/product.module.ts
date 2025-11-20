import { Module } from '@nestjs/common';
import { ProductResolver } from './product.resolver';
import { ProductsModule } from '../../products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [ProductResolver],
})
export class ProductGraphQLModule {}
