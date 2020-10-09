import _omit from 'lodash/omit';
import { NextApiHandler } from 'next';
import fetch from 'node-fetch';
import parseLinkHeader from 'parse-link-header';
import { verifyHeader } from '~/lib/session';

const parseLink = (header: string): any => {
  const parsed = parseLinkHeader(header);

  for (const key in parsed) {
    parsed[key].url = parsed[key].url.split(process.env.SHOPIFY_ADMIN_REST_ENDPOINT)[1];
  }

  return parsed
};

const handler: NextApiHandler = async ({ headers, body, query, method }, { status, json }) => {
  try {
    const session = await verifyHeader(headers);

    if (!session || !Array.isArray(query.params) || query.params.length === 0) {
      return status(401).send('Unauthorized');
    }

    const url = new URL(`https://${session.name}.myshopify.com/${process.env.SHOPIFY_ADMIN_REST_ENDPOINT}/${query.params.join('/')}`);

    Object.entries(_omit(query, ['params'])).forEach(([key, value]) => url.searchParams.append(key, value as string));

    const response = await fetch(url, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': session.accessToken
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined
    });

    return json({ ...await response.json(), link: parseLink(response.headers.get('link')) });
  } catch (error) {
    // TODO: Better error handling/logging?
    return status(500).send('Server Error');
  }
};

export default handler;
