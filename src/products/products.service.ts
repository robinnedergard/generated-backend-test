import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    return this.productsRepository.findOne({ where: { id } });
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { category },
      order: { createdAt: 'DESC' },
    });
  }

  async findFeatured(): Promise<Product[]> {
    return this.productsRepository.find({
      where: { featured: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
