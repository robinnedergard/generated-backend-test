import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '#src/app.controller';
import { AppService } from '#src/app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(controller.getHello()).toBe('Hello World!');
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result.status).toBe('ok');
    });
  });
});
