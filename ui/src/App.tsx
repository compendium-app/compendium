import React from "react";
import { Layout } from "antd";
import "./App.css";
import { useSearchParams } from "react-router-dom";

import { Diagram } from "./components/diagram";

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <Layout style={{ height: "100%" }}>
      {/* <Layout.Header>aaa</Layout.Header> */}
      {/* <Layout>
        <Layout.Sider theme="light">aaa</Layout.Sider> */}
      <Layout.Content>
        <Diagram
          node={searchParams.get("node") || ""}
          nodeSelected={(node) => {
            searchParams.set("node", node);
            setSearchParams(searchParams);
          }}
        />
      </Layout.Content>
      {/* </Layout> */}
    </Layout>
  );
}

export default App;
