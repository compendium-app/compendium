import ReactDOM from "react-dom/client";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { client, App } from "./lib/index";

import { ApolloClient, ApolloProvider } from "@apollo/client";

export const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ApolloProvider client={client as unknown as ApolloClient<any>}>
        <App />
      </ApolloProvider>
    </BrowserRouter>
  </React.StrictMode>
);
