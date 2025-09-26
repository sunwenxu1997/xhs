import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  // 测试前初始化模块
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule], // 导入 HttpModule 供 AuthService 使用
      providers: [
        AuthService,
        ConfigService, // 实际项目中可替换为模拟的 ConfigService
        // 若需要模拟配置，可使用：
        // {
        //   provide: ConfigService,
        //   useValue: {
        //     get: (key: string) => {
        //       if (key === 'THIRD_PARTY_APP_KEY') return 'test_key';
        //       if (key === 'THIRD_PARTY_APP_SECRET') return 'test_secret';
        //       if (key === 'THIRD_PARTY_TOKEN_URL') return 'https://test.url/token';
        //     }
        //   }
        // }
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  // 测试获取 access_token 的方法
  it('should get access_token successfully', async () => {
    // 调用 AuthService 中的方法
    const token = await authService.getAccessToken();
    
    // 验证结果（根据实际返回格式调整）
    expect(token).toBeDefined(); // 确保返回了 token
    expect(typeof token).toBe('string'); // 确保 token 是字符串
  });
});
    