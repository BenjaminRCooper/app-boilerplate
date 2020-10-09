/* eslint-disable @typescript-eslint/no-explicit-any */

import nodeFetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

class NetworkError extends Error {
  response: Response;
  data: any;

  constructor(message: string, response: Response, data: any) {
    super(message);
    this.response = response;
    this.data = data;
  }
}

export default async function fetch(url: RequestInfo): Promise<any>;
export default async function fetch(url: RequestInfo, init: RequestInit): Promise<any>;
export default async function fetch(url: RequestInfo, token: string): Promise<any>;
export default async function fetch(url: RequestInfo, init: RequestInit, token: string): Promise<any>;
export default async function fetch(url: RequestInfo, init?: RequestInit | string, token?: string): Promise<any> {
  try {
    const config = typeof init === 'string'
      ? { headers: { Authorization: `Bearer ${init}` } }
      : init || {};

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }
    const fullUrl = typeof url === 'string' && !url.startsWith('http')
      ? `${process.env.SHOPIFY_APP_URL}${url.startsWith('/') ? '' : '/'}${url}`
      : url;

    const response = await nodeFetch(fullUrl, config);

    const data = await response.json();

    if (response.ok) {
      return data;
    }

    throw new NetworkError(response.statusText, response, data);
  } catch (error) {
    if (!error.data) {
      error.data = { message: error.message };
    }

    throw error;
  }
}
