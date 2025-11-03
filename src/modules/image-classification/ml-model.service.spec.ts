import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { MlModelService } from '../ml-model.service';
import { of } from 'rxjs';

describe('MlModelService', () => {
  let service: MlModelService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MlModelService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'ml.apiUrl': 'http://localhost:5000',
                'ml.timeout': 30000,
                'ml.maxRetries': 3,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MlModelService>(MlModelService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should return true when ML API is healthy', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({ status: 200, data: { status: 'ok' } } as any),
      );

      const result = await service.healthCheck();
      expect(result).toBe(true);
    });

    it('should return false when ML API is unhealthy', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const result = await service.healthCheck();
      expect(result).toBe(false);
    });
  });

  describe('getApiInfo', () => {
    it('should return API info when successful', async () => {
      const mockApiInfo = { 
        version: '1.0.0',
        model: 'angular_leaf_spot_classifier',
        classes: ['angular_leaf_spot', 'healthy']
      };

      jest.spyOn(httpService, 'get').mockReturnValue(
        of({ status: 200, data: mockApiInfo } as any),
      );

      const result = await service.getApiInfo();
      expect(result).toEqual(mockApiInfo);
    });

    it('should throw HttpException when API is not accessible', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() => {
        throw new Error('Service unavailable');
      });

      await expect(service.getApiInfo()).rejects.toThrow();
    });
  });
});