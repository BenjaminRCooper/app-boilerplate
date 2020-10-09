import gql from 'graphql-tag';
import { ShopSession } from '~/lib/session';
import faunaClient from './client';

const createShopMutation = gql`
mutation CreateShop($name: String!, $accessToken: String!) {
  createShop(data: {
    name: $name,
    accessToken: $accessToken
  }) {
    _id
    name
    accessToken
  }
}`;

const getShopQuery = gql`
query GetShop($name: String!) {
  shopByName(name: $name) {
    _id
    name
    accessToken
  }
}`;

const deleteShopMutation = gql`
mutation DeleteShop($id: ID!) {
  deleteShop(id: $id) {
    _id
  }
}`;

export async function getShop(shopName: string): Promise<ShopRecord> {
  const name = shopName.replace('.myshopify.com', '');

  const response = await faunaClient<{ shopByName: ShopRecord }>(getShopQuery, { name });

  return response.shopByName;
}

export async function createShop(shopData: ShopSession): Promise<ShopRecord> {
  const name = shopData.name.replace('.myshopify.com', '');
  const { accessToken } = shopData;

  const response = await faunaClient<{ createShop: ShopRecord }>(createShopMutation, { name, accessToken });

  return response.createShop;
}

export async function deleteShop(shopName: string): Promise<void> {
  const { _id } = await getShop(shopName);

  if (!_id) return;

  await faunaClient<{ deleteShop: { _id: number } | null }>(deleteShopMutation, { id: _id });
}

export interface ShopRecord {
  _id: number;
  name: string;
  accessToken: string;
}
