import { GetServerSideProps } from 'next';
import { stringify } from 'querystring';
import { useEffect } from 'react';
import fetch from '~/lib/fetch';

export default function Callback({ error, success, appUrl }: { success: boolean; error?: string; appUrl?: string }): JSX.Element {
  useEffect(() => {
    if (success) {
      window.location.assign(appUrl);
    }
  }, [success]);

  // TODO: Nicer error message/handling
  return (
    <>
      {success
        ? <h1>Redirecting...</h1>
        : (
          <>
            <h1>Installation Failed</h1>
            <pre>{ JSON.stringify(error, null, 2) }</pre>
          </>
        )
      }
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { shop } = query;

  try {
    const { appHandle }: { appHandle: string } = await fetch(`/api/auth/install?${stringify(query)}`);

    const appUrl = `https://${shop}/admin/apps/${appHandle}`;

    return { props: { appUrl, success: true } };
  } catch (error) {
    return { props: { error, success: false } };
  }
};
