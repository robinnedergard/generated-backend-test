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
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CheckoutStatus } from './entities/checkout.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCheckoutDto: CreateCheckoutDto) {
    return this.checkoutService.create(createCheckoutDto);
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
