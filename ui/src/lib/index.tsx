import ReactDOM from "react-dom/client";
import "./index.css";
import "antd/dist/antd.css";

import { createAuthLink, AUTH_TYPE, AuthOptions } from "aws-appsync-auth-link";
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
} from "@apollo/client";

const ENV = (window as any).ENV || process.env;
const url = ENV.REACT_APP_COMPENDIUM_GRAPHQL_URL as string;
const region = "eu-central-1";
const auth = ((ENV.REACT_APP_AWS_ACCESS_KEY_ID && {
  type: AUTH_TYPE.AWS_IAM,
  credentials: {
    accessKeyId: ENV.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.REACT_APP_AWS_SECRET_ACCESS_KEY,
    sessionToken: ENV.REACT_APP_AWS_SESSION_TOKEN,
  },
}) || { type: AUTH_TYPE.NONE }) as AuthOptions;
const httpLink = createHttpLink({ uri: url });

const link = ApolloLink.from([
  createAuthLink({ url, region, auth }),
  createSubscriptionHandshakeLink({ url, region, auth }, httpLink),
]);

export const client = new ApolloClient({
  link,
  // uri: url,
  cache: new InMemoryCache(),
});

export const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

export { default as App } from "./App";
