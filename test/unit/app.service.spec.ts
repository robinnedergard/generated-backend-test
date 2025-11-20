import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '#src/app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(service.getHello()).toBe('Hello World!');
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = service.getHealth();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
    });
  });
});
