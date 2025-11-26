import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CheckoutModule } from './checkout/checkout.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UserGraphQLModule } from './graphql/user/user.module';
import { ProductGraphQLModule } from './graphql/product/product.module';
import { CheckoutGraphQLModule } from './graphql/checkout/checkout.module';
import { ReviewGraphQLModule } from './graphql/review/review.module';
import databaseConfig from './config/database.config';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Checkout } from './checkout/entities/checkout.entity';
import { Review } from './reviews/entities/review.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [User, Product, Checkout, Review],
        synchronize: false, // Always use migrations, never synchronize
        logging: process.env.NODE_ENV === 'development',
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: () => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: process.env.GRAPHQL_PLAYGROUND === 'true',
        context: ({ req }) => ({ req }),
        csrfPrevention: true,
      }),
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CheckoutModule,
    ReviewsModule,
    UserGraphQLModule,
    ProductGraphQLModule,
    CheckoutGraphQLModule,
    ReviewGraphQLModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
