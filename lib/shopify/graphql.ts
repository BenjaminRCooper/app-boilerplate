import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import fetch from 'node-fetch';
import { createClient as createUrlqClient } from 'urql';
import { ShopSession } from '~/lib/session';

const webhookMutation = gql`
mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
  webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
    userErrors {
      field
      message
    }
    webhookSubscription {
      id
    }
  }
}
`;

export function createClient({ name, accessToken }: ShopSession): ShopifyGraphqlClient {
  const client = createUrlqClient({
    url: `https://${name}.myshopify.com/${process.env.SHOPIFY_ADMIN_GRAPHQL_ENDPOINT}`,
    fetch: fetch as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    fetchOptions: {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    }
  });

  return {
    async executeQuery<T>(query: DocumentNode, variables?: {}): Promise<T> {
      const { data, error } = await client.query(query, variables).toPromise();

      if (error) {
        throw error;
      }

      if (data.userErrors && data.userErrors.message) {
        throw data.userErrors.message;
      }

      return data;
    },
    async executeMutation<T>(query: DocumentNode, variables?: {}): Promise<T> {
      const { data, error } = await client.mutation(query, variables).toPromise();

      if (error) {
        throw error;
      }

      if (data.userErrors && data.userErrors.message) {
        throw data.userErrors.message;
      }

      return data;
    },
    registerWebhook(topic: string, webhookSubscription?: WebhookSubscriptionInput): Promise<WebhookSubscriptionResponse> {
      const callbackUrl = webhookSubscription?.callbackUrl
        ? webhookSubscription.callbackUrl.startsWith('/')
          ? `${process.env.SHOPIFY_APP_URL}${webhookSubscription.callbackUrl}`
          : webhookSubscription.callbackUrl
        : `${process.env.SHOPIFY_APP_URL}/api/webhooks`;

      return this.executeMutation(webhookMutation, { topic, webhookSubscription: { ...webhookSubscription, callbackUrl } });
    }
  };
}

export interface WebhookSubscriptionInput {
  callbackUrl?: string;
  format?: 'JSON' | 'XML';
  includeFields?: string[];
  metafieldNamespaces?: string[];
}

export interface WebhookSubscriptionResponse {
  userErrors: {
    field: string;
    message: string;
  };
  webhookSubscription: {
    id: string;
  };
}

export interface ShopifyGraphqlClient {
  executeMutation<T>(query: DocumentNode, variables?: {}): Promise<T>;
  executeQuery<T>(query: DocumentNode, variables?: {}): Promise<T>;
  registerWebhook(topic: string, webhookSubscription?: WebhookSubscriptionInput): Promise<WebhookSubscriptionResponse>;
}
