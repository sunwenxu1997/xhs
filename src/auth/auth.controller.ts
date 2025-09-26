import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 提供一个 GET 接口用于测试获取 token
  @Get('token')
  async getAccessToken() {
    try {
      const token = await this.authService.getAccessToken();
      return {
        success: true,
        data: { access_token: token },
        message: '获取 token 成功',
      };
    } catch (error) {
      return {
        success: false,
        message: `获取 token 失败: ${error.message}`,
      };
    }
  }
}
