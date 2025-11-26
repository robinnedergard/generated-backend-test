import { Module } from '@nestjs/common';
import { ReviewResolver } from './review.resolver';
import { ReviewsModule } from '../../reviews/reviews.module';

@Module({
  imports: [ReviewsModule],
  providers: [ReviewResolver],
})
export class ReviewGraphQLModule {}
