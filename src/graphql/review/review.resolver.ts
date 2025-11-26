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
import { Review } from './review.type';
import { Review as ReviewEntity } from '../../reviews/entities/review.entity';
import { ReviewsService } from '../../reviews/reviews.service';
import { CreateReviewInput } from './create-review.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';

@Resolver(() => Review)
export class ReviewResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Query(() => [Review], { name: 'reviews' })
  async findByProductId(
    @Args('productId', { type: () => ID }) productId: string,
  ): Promise<ReviewEntity[]> {
    return this.reviewsService.findByProductId(productId);
  }

  @Query(() => [Review], { name: 'myReviews' })
  @UseGuards(JwtAuthGuard)
  async myReviews(@Context() context: any): Promise<ReviewEntity[]> {
    const userId = context.req?.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.reviewsService.findByUserId(userId);
  }

  @Mutation(() => Review)
  @UseGuards(OptionalJwtAuthGuard)
  async createReview(
    @Args('createReviewInput') createReviewInput: CreateReviewInput,
    @Context() context: any,
  ): Promise<ReviewEntity> {
    const userId = context.req?.user?.userId || undefined;

    // If user is authenticated, ignore name input
    // If user is not authenticated, name is required
    if (!userId && !createReviewInput.name) {
      throw new Error('Name is required for anonymous reviews');
    }

    return this.reviewsService.create(
      createReviewInput.productId,
      createReviewInput.text,
      createReviewInput.rating,
      userId,
      userId ? undefined : createReviewInput.name,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req?.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    await this.reviewsService.remove(id, userId);
    return true;
  }

  @ResolveField(() => String)
  userName(@Root() review: ReviewEntity): string {
    // Return user's full name if user exists, otherwise return anonymous name
    if (review.user) {
      return `${review.user.firstName} ${review.user.lastName}`;
    }
    return review.name || 'Anonymous';
  }
}
