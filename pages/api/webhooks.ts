import { NextApiHandler } from 'next';
import getRawBody from 'raw-body';
import { veryifyWebhook } from '~/lib/shopify/hmac';
import handlers from '~/lib/shopify/webhooks';

export const config = {
  api: {
    bodyParser: false
  }
};

const handler: NextApiHandler =  async (request, { status }) => {
  try {
    const { headers, method } = request;
    const rawBody = await getRawBody(request);
    const parsedBody = JSON.parse(rawBody.toString());

    if (method !== 'POST' || !veryifyWebhook(headers, rawBody)) {
      return status(401).send('Unauthorized');
    }

    if (handlers[headers['x-shopify-topic'] as string]) {
      await handlers[headers['x-shopify-topic'] as string](headers, parsedBody);
    }

    return status(200).send('Ok');
  } catch (error) {
    // TODO: Better error handling/logging?
    return status(500).send('Internal Server Error');
  }
};

export default handler;
