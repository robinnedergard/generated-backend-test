import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Product } from './product.type';
import { ProductsService } from '../../products/products.service';
import { CreateProductInput } from './create-product.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { UserPermission } from '../user/permission.enum';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => [Product], { name: 'products' })
  findAll(
    @Args('category', { nullable: true, type: () => String }) category?: string,
  ) {
    if (category) {
      return this.productsService.findByCategory(category);
    }
    return this.productsService.findAll();
  }

  @Query(() => [Product], { name: 'featuredProducts' })
  findFeatured() {
    return this.productsService.findFeatured();
  }

  @Query(() => Product, { name: 'product' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.productsService.findOne(id);
  }

  @Query(() => [Product], { name: 'adminProducts' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.PRODUCTS_READ)
  adminProducts(
    @Args('category', { nullable: true, type: () => String }) category?: string,
  ) {
    if (category) {
      return this.productsService.findByCategory(category);
    }
    return this.productsService.findAll();
  }

  @Mutation(() => Product)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.PRODUCTS_WRITE)
  createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
  ) {
    return this.productsService.create(createProductInput);
  }

  @Mutation(() => Product)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.PRODUCTS_WRITE)
  updateProduct(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateProductInput') updateProductInput: CreateProductInput,
  ) {
    return this.productsService.update(id, updateProductInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.PRODUCTS_WRITE)
  async removeProduct(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.productsService.remove(id);
    return true;
  }
}
