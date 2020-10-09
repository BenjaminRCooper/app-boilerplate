import { TitleBar } from '@shopify/app-bridge-react';
import { Card, Page } from '@shopify/polaris';
import gql from 'graphql-tag';
import { useContext } from 'react';
import { useQuery } from 'urql';
import ShopContext from '~/lib/context/shop';

const appQuery = gql`
  query {
    app {
      title
    }
  }
`;

interface AppResponse {
  app: { title: string };
}

export default function Index(): JSX.Element {
  const shop = useContext(ShopContext);
  const [result] = useQuery<AppResponse>({ query: appQuery });

  const { data, fetching } = result;

  return (
    <>
      <TitleBar title="App Boilerplate" primaryAction={{ onAction: (): void => alert('Hello Worls'), content: 'Primary Action' }} />
      <Page title="Dashboard" fullWidth>
        <Card title="Hello World" sectioned>
          Authenticated as: { shop?.name }
          <br />
          App Name: { fetching ? 'Loading...' : data?.app.title }
        </Card>
      </Page>
    </>
  );
}
