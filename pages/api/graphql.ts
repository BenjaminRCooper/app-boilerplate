import { NextApiHandler } from 'next';
import fetch from 'node-fetch';
import { verifyHeader } from '~/lib/session';

const handler: NextApiHandler = async ({ headers, body }, { status, json }) => {
  try {
    const session = await verifyHeader(headers);

    if (!session) {
      return status(401).send('Unauthorized');
    }

    const response = await fetch(`https://${session.name}.myshopify.com/${process.env.SHOPIFY_ADMIN_GRAPHQL_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': session.accessToken
      },
      body: JSON.stringify(body)
    });

    return json(await response.json());
  } catch (error) {
    // TODO: Better error handling/logging?
    return status(500).send('Server Error');
  }
};

export default handler;
