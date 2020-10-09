import gql from 'graphql-tag';
import { NextApiHandler } from 'next';
import { createShop } from '~/lib/db';
import fetch from '~/lib/fetch';
import { createClient } from '~/lib/shopify/graphql';
import verifyQuery from '~/lib/shopify/hmac';

const appQuery = gql`
query {
  app {
    handle
  }
}
`;

interface AppResponse {
  app: { handle: string };
}

const handler: NextApiHandler = async ({ query }, { status }) => {
  if (!verifyQuery(query)) {
    return status(401).send('Unauthorized');
  }

  const { shop, code } = query;

  const endpoint = `https://${shop}/admin/oauth/access_token`;

  try {
    const response = await fetch(endpoint, {
      body: JSON.stringify({
        code,
        client_id: process.env.SHOPIFY_APP_KEY, // eslint-disable-line @typescript-eslint/camelcase
        client_secret: process.env.SHOPIFY_APP_SECRET // eslint-disable-line @typescript-eslint/camelcase
      }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const shopData = await createShop({ name: shop as string, accessToken: response.access_token });

    const client = createClient(shopData);

    await client.registerWebhook('APP_UNINSTALLED');

    const { app: { handle } } = await client.executeQuery<AppResponse>(appQuery);

    return status(200).json({ appHandle: handle });
  } catch (error) {
    // TODO: Better error handling/logging?
    return status(400).json({ error });
  }
};

export default handler;
