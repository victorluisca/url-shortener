export interface URLData {
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  accessCount: number;
}

export interface CreateURLRequest {
  url: string;
}

export interface URLResponse {
  originalUrl: string;
  shortCode: string;
  createdAt: string;
}

export interface URLStatsResponse extends URLResponse {
  accessCount: number;
}
