import type { CreateURLRequest, URLData } from "../models/url.model";
import { redisClient } from "../server";
import { generateShortCode } from "../utils/base62";

export class ShortenerService {
  private readonly URL_PREFIX = "url:";
  private readonly ACCESS_COUNT_PREFIX = "access_count:";

  async createShortUrl(data: CreateURLRequest): Promise<URLData> {
    const shortCode = generateShortCode();

    const exists = await redisClient.exists(`${this.URL_PREFIX}${shortCode}`);
    if (exists) {
      return this.createShortUrl(data);
    }

    const urlData: URLData = {
      originalUrl: data.url,
      shortCode,
      createdAt: new Date().toISOString(),
      accessCount: 0,
    };

    await redisClient.set(
      `${this.URL_PREFIX}${shortCode}`,
      JSON.stringify(urlData)
    );

    return urlData;
  }

  async getOriginalUrl(shortCode: string): Promise<string | null> {
    const data = await redisClient.get(`${this.URL_PREFIX}${shortCode}`);
    if (!data) return null;

    await redisClient.incr(`${this.ACCESS_COUNT_PREFIX}${shortCode}`);

    const urlData = JSON.parse(data);
    return urlData.originalUrl;
  }

  async getStats(shortCode: string): Promise<URLData | null> {
    const data = await redisClient.get(`${this.URL_PREFIX}${shortCode}`);
    if (!data) return null;

    const urlData = JSON.parse(data);

    const access_count = await redisClient.get(
      `${this.ACCESS_COUNT_PREFIX}${shortCode}`
    );
    urlData.accessCount = access_count ? parseInt(access_count) : 0;

    return urlData;
  }

  async deleteUrl(shortCode: string): Promise<boolean> {
    const deleted = await redisClient.del(`${this.URL_PREFIX}${shortCode}`);
    await redisClient.del(`${this.ACCESS_COUNT_PREFIX}${shortCode}`);
    return deleted > 0;
  }
}

export const shortenerService = new ShortenerService();
