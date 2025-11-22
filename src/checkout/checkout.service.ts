import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Checkout,
  CheckoutStatus,
  PaymentMethod,
} from './entities/checkout.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    @InjectRepository(Checkout)
    private checkoutRepository: Repository<Checkout>,
  ) {}

  async create(
    createCheckoutDto: CreateCheckoutDto,
    userId?: string,
  ): Promise<Checkout> {
    const checkout = this.checkoutRepository.create({
      ...createCheckoutDto,
      status: CheckoutStatus.PENDING,
      userId,
    });

    const savedCheckout = await this.checkoutRepository.save(checkout);

    // Simulate payment processing
    this.logger.log(`Processing payment for checkout ${savedCheckout.id}`);
    await this.processPayment(savedCheckout);

    return this.checkoutRepository.findOne({ where: { id: savedCheckout.id } });
  }

  async findAll(): Promise<Checkout[]> {
    return this.checkoutRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Checkout> {
    return this.checkoutRepository.findOne({ where: { id } });
  }

  async findByStatus(status: CheckoutStatus): Promise<Checkout[]> {
    return this.checkoutRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<Checkout[]> {
    return this.checkoutRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  private async processPayment(checkout: Checkout): Promise<void> {
    // Simulate payment processing delay
    await new Promise((resolve) => {
      // eslint-disable-next-line no-undef
      setTimeout(resolve, 1000);
    });

    // Update status to processing
    checkout.status = CheckoutStatus.PROCESSING;
    await this.checkoutRepository.save(checkout);

    // Mock payment processing logic
    const paymentSuccess = this.mockPaymentProcessing(checkout);

    if (paymentSuccess) {
      checkout.status = CheckoutStatus.COMPLETED;
      checkout.transactionId = this.generateTransactionId();
      this.logger.log(
        `Payment successful for checkout ${checkout.id}. Transaction ID: ${checkout.transactionId}`,
      );
    } else {
      checkout.status = CheckoutStatus.FAILED;
      this.logger.warn(`Payment failed for checkout ${checkout.id}`);
    }

    await this.checkoutRepository.save(checkout);
  }

  private mockPaymentProcessing(checkout: Checkout): boolean {
    // Mock payment processing - simulate different scenarios based on payment method
    const random = Math.random();

    switch (checkout.paymentMethod) {
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        // 95% success rate for cards
        return random > 0.05;

      case PaymentMethod.PAYPAL:
        // 98% success rate for PayPal
        return random > 0.02;

      case PaymentMethod.APPLE_PAY:
      case PaymentMethod.GOOGLE_PAY:
        // 99% success rate for mobile payments
        return random > 0.01;

      case PaymentMethod.BANK_TRANSFER:
        // 90% success rate for bank transfers
        return random > 0.1;

      default:
        // 95% default success rate
        return random > 0.05;
    }
  }

  private generateTransactionId(): string {
    // Generate a mock transaction ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }

  async cancel(id: string): Promise<Checkout> {
    const checkout = await this.findOne(id);
    if (!checkout) {
      throw new Error('Checkout not found');
    }

    if (checkout.status === CheckoutStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed checkout');
    }

    checkout.status = CheckoutStatus.CANCELLED;
    return this.checkoutRepository.save(checkout);
  }
}
