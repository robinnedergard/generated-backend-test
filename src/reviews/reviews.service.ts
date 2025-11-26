import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async create(
    productId: string,
    text: string,
    rating: number,
    userId?: string,
    name?: string,
  ): Promise<Review> {
    // Validate rating - must be an integer between 1 and 5
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException(
        'Rating must be an integer between 1 and 5',
      );
    }

    // Validate that name is provided if userId is not provided
    if (!userId && !name) {
      throw new BadRequestException('Name is required for anonymous reviews');
    }

    // If user is logged in, remove all existing reviews for this user/product combination
    if (userId) {
      const existingReviews = await this.reviewsRepository.find({
        where: { productId, userId },
      });

      if (existingReviews.length > 0) {
        await this.reviewsRepository.remove(existingReviews);
      }
    }

    // If userId is provided, ignore name
    const reviewData: Partial<Review> = {
      productId,
      text,
      rating,
      userId: userId || undefined,
      name: userId ? undefined : name,
    };

    const review = this.reviewsRepository.create(reviewData);
    return this.reviewsRepository.save(review);
  }

  async findByProductId(productId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { productId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user owns the review
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewsRepository.remove(review);
  }
}
