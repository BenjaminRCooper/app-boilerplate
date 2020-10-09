import { NextApiHandler } from 'next';
import { getShop } from '~/lib/db';
import { encode } from '~/lib/session';
import verifyQuery from '~/lib/shopify/hmac';

const handler: NextApiHandler =  async ({ query }, { status }) => {
  if (!verifyQuery(query)) {
    return status(401).send('Unauthorized');
  }

  try {
    const { shop } = query;
    const shopData = await getShop(shop as string);

    const token = await encode(shopData);

    return status(200).json({ token, name: shopData.name });
  } catch (error) {
    // TODO: Better error handling/logging?
    return status(400).json({ error: 'Bad Request' });
  }
};

export default handler;
