import { DocumentNode } from 'graphql';
import fetch from 'node-fetch';

export default async function faunaClient<T>(query: DocumentNode, variables?: { [key: string]: any }): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const response = await fetch('https://graphql.fauna.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FAUNA_DB_SECRET}`,
      'Content-type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      variables,
      query: query.loc.source.body
    })
  });

  const json = await response.json();

  const { errors, data } = json;

  if (errors && errors.length) throw new Error(errors[0].message);

  return data;
}
