import { IncomingHttpHeaders } from 'http';
import ironStore from 'iron-store';

export async function encode(data: ShopSession): Promise<string> {
  const store = await ironStore({
    password: process.env.SESSION_PASSWORD,
    ttl: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).getTime()
  });

  store.set('shop', data.name);
  store.set('accessToken', data.accessToken);

  return await store.seal();
}

export async function decode(token: string): Promise<ShopSession> {
  const store = await ironStore({
    password: process.env.SESSION_PASSWORD,
    sealed: token
  });

  const name = store.get('shop');
  const accessToken = store.get('accessToken');

  return { name, accessToken };
}

export async function verifyHeader(headers: IncomingHttpHeaders): Promise<ShopSession> {
  const { authorization } = headers;

  if (!authorization) return undefined;

  return await decode(authorization.replace('Bearer ', ''));
}

export interface ShopSession {
  name: string;
  accessToken: string;
}
