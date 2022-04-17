import { Breadcrumb, Layout } from "antd";
import React from "react";
import "./App.css";

import { Diagram } from "./components/diagram";

function App() {
  return (
    <Layout style={{ height: "100%" }}>
      {/* <Layout.Header>aaa</Layout.Header> */}
      {/* <Layout>
        <Layout.Sider theme="light">aaa</Layout.Sider> */}
      <Layout.Content>
        <Diagram />
      </Layout.Content>
      {/* </Layout> */}
    </Layout>
  );
}

export default App;
