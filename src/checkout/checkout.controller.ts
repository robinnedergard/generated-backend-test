import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CheckoutStatus } from './entities/checkout.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCheckoutDto: CreateCheckoutDto, @Request() req: any) {
    const userId = req.user?.userId || undefined;
    return this.checkoutService.create(createCheckoutDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('status') status?: CheckoutStatus) {
    if (status) {
      return this.checkoutService.findByStatus(status);
    }
    return this.checkoutService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.checkoutService.findOne(id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string) {
    return this.checkoutService.cancel(id);
  }
}
