import { deleteShop } from '~/lib/db';
import { WebhookHandler } from '.';

const handlers: { [topic: string]: WebhookHandler } = {
  'app/uninstalled': async headers => {
    // TODO: We probably don't want to just delete store, billing implications etc.
    await deleteShop(headers['x-shopify-shop-domain'] as string);
  }
};

export default handlers;
