import { IncomingHttpHeaders } from 'http';
import appHandlers from './app';

export type WebhookHandler = (headers: IncomingHttpHeaders, data: {}) => Promise<void>;

const handlers: { [topic: string]: WebhookHandler } = {
  ...appHandlers
};

export default handlers;
