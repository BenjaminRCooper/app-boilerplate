import { RoutePropagator as AppBridgeRoutePropagator } from '@shopify/app-bridge-react';
import { withRouter } from 'next/router';

export default withRouter((props): JSX.Element => {
  const { asPath } = props.router;
  return <AppBridgeRoutePropagator location={asPath.split('?')[0]} />;
});
