import { createHmac, timingSafeEqual } from 'crypto';
import { IncomingHttpHeaders } from 'http';
import _omit from 'lodash/omit';

export default function verifyQuery(query: { [key: string]: string | string[] }): boolean {
  const message = Object.entries(_omit(query, ['hmac'])) // Add more props to omit here
    .sort(([a], [b]) => a === b ? 0 : a > b ? 1 : -1)
    .reduce((output, [key, value], i) => {
      const chunk = `${output}${i > 0 ? '&' : ''}`;

      if (key.includes('[]')) {
        const parsedValue = Array.isArray(value)
          ? `[${value.map(v => `"${v}"`).join(', ')}]`
          : `["${value}"]`;

        return `${chunk}${key.replace('[]', '')}=${parsedValue}`;
      }

      return `${chunk}${key}=${value}`;
    }, '');

  const hmac = Buffer.from(
    Array.isArray(query.hmac) ? query.hmac[0] : query.hmac
  );

  const hash = Buffer.from(
    createHmac('sha256', process.env.SHOPIFY_APP_SECRET)
      .update(message)
      .digest('hex'),
  'utf-8');

  try {
    return timingSafeEqual(hash, hmac);
  } catch (_) {
    return false;
  }
}

export function veryifyWebhook(headers: IncomingHttpHeaders, data: Buffer): boolean {
  if (!headers['x-shopify-hmac-sha256']) return false;

  const hmac = Buffer.from(headers['x-shopify-hmac-sha256']);

  const hash = Buffer.from(
    createHmac('sha256', process.env.SHOPIFY_APP_SECRET)
      .update(data)
      .digest('base64'),
    'utf-8');

  try {
    return timingSafeEqual(hash, hmac);
  } catch (_) {
    return false;
  }
}
