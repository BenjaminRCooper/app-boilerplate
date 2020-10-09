# Shopify Next App Boilerplate

## Running Locally

First, run the development server:

```bash
npm run dev
```

Shopify won't allow non https apps even in development, use [ngrok](https://ngrok.com) to setup a https tunnel to localhost like so:

```bash
ngrok http 3000
```

## Shopify

In the partner dashboard create an app, make note of the credentials and use the following as settings in app setup:

* App URL: https://{ngrok-url}
* Whitelisted Redirection URL(s): https://{ngrok-url}/auth/callback

### Install URL

To install the app on a Shopify shop construct a URL like the following:

`https://{shop}.myshopify.com/admin/oauth/authorize?client_id={appKey}&scope={scopes}&redirect_uri={redirectUri}`

* `shop`: The myshopify subdomain of the shop you wish to install on.
* `appKey`: Your app's API key, found in partner dashboard.
* `scopes`: Comma-separated list of [scopes](https://shopify.dev/docs/admin-api/access-scopes), e.g. `read_products,read_customers`
* `redirectUri`: Should be `https://{appUrl}/auth/callback`, this must also be added to `Whitelisted Redirection URL(s)` in partner dashboard for the app

## Environment Variables

The app requires some environment variables, when running locally it requires a `.env` file in the root of the project with the following:

* `SESSION_PASSWORD`: Password for encrypting sessions, must be at least 32 characters.
* `GLOBAL_TOKEN_KEY`: Key for the global token window object.
* `SHOPIFY_APP_URL`: The full URL of where the app is hosted.
* `SHOPIFY_APP_KEY`: Shopify App API key from partner dashboard.
* `SHOPIFY_APP_SECRET`: Shopify App API secret from partner dashboard.
* `SHOPIFY_ADMIN_GRAPHQL_ENDPOINT`: The admin GraphQL API endpoint to use in the proxy.
* `FAUNA_DB_SECRET`: Fauna db secret.

# TODO: Improve this readme as we add more functionality here
