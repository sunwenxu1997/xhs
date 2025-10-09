import * as crypto from 'crypto';

export class SignatureUtil {
  /**
   * 生成签名
   * @param appKey 唯一标识
   * @param nonce 随机字符串，需要和接口请求中保持一致
   * @param timeStamp 当前毫秒级时间戳，需要和接口请求中保持一致
   * @param appSecret 密钥，第一次使用appSecret，第二次使用access_token
   * @returns 签名字符串
   */
  static buildSignature(
    appKey: string,
    nonce: string,
    timeStamp: string,
    appSecret: string,
  ): string {
    const params: Record<string, string> = {
      appKey,
      nonce,
      timeStamp,
    };

    return this.generateSignature(appSecret, params);
  }

  /**
   * 构建签名的核心方法
   * @param secretKey 密钥
   * @param params 参与签名的参数
   * @returns 签名结果
   */
  static generateSignature(
    secretKey: string,
    params: Record<string, string>,
  ): string {
    // 1. 按key排序参数（与Java的TreeMap行为一致）
    const sortedKeys = Object.keys(params).sort();
    const sortedParams: Record<string, string> = {};
    sortedKeys.forEach((key) => {
      sortedParams[key] = params[key];
    });

    // 2. 拼接排序后的参数
    const paramsString = sortedKeys
      .map((key) => `${key}=${sortedParams[key]}`)
      .join('&');

    // 3. 在参数字符串后添加密钥
    const signatureSource = `${paramsString}${secretKey}`;

    // 4. 使用SHA-256计算签名
    const sha256 = crypto.createHash('sha256');
    sha256.update(signatureSource, 'utf8');
    return sha256.digest('hex');
  }

  /**
   * 生成随机字符串（32位以内）
   * @param length 随机字符串长度，默认16
   * @returns 随机字符串
   */
  static generateNonce(length: number = 16): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    for (let i = 0; i < length; i++) {
      nonce += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return nonce;
  }

  /**
   * 获取当前毫秒级时间戳
   * @returns 时间戳字符串
   */
  static getCurrentTimestamp(): string {
    return Date.now().toString();
  }
}
