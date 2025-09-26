import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { SignatureUtil } from '../utils/signature.util';

// 定义 access_token 响应的接口
interface TokenResponse {
  data: { access_token: any; expires_in: any; };
  code: number;
  msg: string;
  success: boolean;
  // 其他可能的字段
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private cachedToken: string;
  private tokenExpiry: number;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  /**
   * 获取有效的 access_token
   * 优先使用缓存的 token，如果过期则重新获取
   */
  async getAccessToken(): Promise<string> {
    // 检查缓存的 token 是否有效
    if (this.cachedToken && this.tokenExpiry > Date.now()) {
      return this.cachedToken;
    }

    // 缓存无效，重新获取
    return this.fetchNewAccessToken();
  }

  /**
   * 从第三方接口获取新的 access_token
   */
  private async fetchNewAccessToken(): Promise<string> {
    try {
      // 获取配置
      const appKey = this.configService.get<string>('THIRD_PARTY_CLIENT_ID')!;
      const appSecret = this.configService.get<string>(
        'THIRD_PARTY_CLIENT_SECRET',
      )!;
      const tokenUrl = this.configService.get<string>('THIRD_PARTY_TOKEN_URL')!;
      // 生成必要参数
      const nonce = SignatureUtil.generateNonce();
      const timestamp = SignatureUtil.getCurrentTimestamp();

      // 生成签名
      const signature = SignatureUtil.buildSignature(
        appKey,
        nonce,
        timestamp,
        appSecret,
      );
      this.logger.log(signature);
      // 根据第三方要求添加其他参数

      // 发送请求
      const response = await firstValueFrom(
        this.httpService.post<TokenResponse>(tokenUrl, {
            app_key: appKey,
            nonce: nonce,
            timestamp: timestamp,
            signature: signature,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      // 处理响应
      const { access_token, expires_in } = response.data.data;

      // 缓存 token 并设置过期时间（提前 60 秒过期以避免边缘情况）
      this.cachedToken = access_token;
      this.tokenExpiry = Date.now() + (expires_in - 60) * 1000;
      this.logger.log(response.data);
      this.logger.log('Successfully fetched new access token');
      return access_token;
    } catch (error) {
      this.logger.error('Failed to fetch access token', error.stack);
      throw new Error(
        'Could not retrieve access token from third-party service',
      );
    }
  }
}
