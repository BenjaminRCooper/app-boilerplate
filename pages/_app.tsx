import { Loading, Provider as AppBridgeProvider, TitleBar } from '@shopify/app-bridge-react';
import { AppProvider as PolarisAppProvider, Frame } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { AppProps } from 'next/app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { stringify } from 'querystring';
import { useEffect, useState } from 'react';
import { createClient, Provider as UrqlProvider } from 'urql';
import { Provider as FetchProdivder } from 'use-http';
import ShopContext from '~/lib/context/shop';
import fetch from '~/lib/fetch';
import RoutePropagator from '~/components/route-propagator';

import '~/styles/index.css';
import '@shopify/polaris/styles.css';

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter();

  const [shopState, updateShopState] = useState({ name: '', token: '' });

  useEffect(() => {
    if (shopState.token || !router.query.shop) return;

    const loginToStore = async (): Promise<void> => {
      try {
        const { token, name } = await fetch(`/api/auth/login?${stringify(router.query)}`);
        updateShopState({ token, name });
      } catch (error) {
        router.push('/auth/error');
      }
    };

    loginToStore();
  }, [router.query, shopState]);

  if (router.pathname.startsWith('/auth')) return <Component {...pageProps} />;

  const client = createClient({
    url: '/api/graphql',
    fetchOptions: () => ({
      headers: {
        authorization: process.browser && shopState.token ? `Bearer ${shopState.token}` : ''
      }
    })
  });

  const fetchProdivderProps = {
    url: '/api/rest',
    options: {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      interceptors: {
        request: ({ options }): {} => ({
          ...options,
          headers: { ...options.headers, authorization: `Bearer ${shopState.token}` }
        })
      }
    }
  };

  const LinkComponent = ({ children, url, ...rest }): JSX.Element => (
    <Link href={url}>
      <a {...rest}>{children}</a>
    </Link>
  );

  const withWrapper = shop => (children): JSX.Element => (
    <ShopContext.Provider value={shopState}>
      <PolarisAppProvider i18n={enTranslations} linkComponent={LinkComponent}>
        <AppBridgeProvider config={{ apiKey: process.env.SHOPIFY_APP_KEY, shopOrigin: shop }}>
          <RoutePropagator />
          <UrqlProvider value={client}>
            <FetchProdivder {...fetchProdivderProps}>
              <Frame>
                <TitleBar title="Loading" />
                { children }
              </Frame>
            </FetchProdivder>
          </UrqlProvider>
        </AppBridgeProvider>
      </PolarisAppProvider>
    </ShopContext.Provider>
  );

  if (!shopState.token) {
    if (router.query.shop) return withWrapper(router.query.shop)(<Loading />);

    return null;
  }

  return withWrapper(shopState.name)(<Component {...pageProps} />);
}
