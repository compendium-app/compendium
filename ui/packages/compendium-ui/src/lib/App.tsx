import { Layout } from "antd";
import "./App.css";

import { IndexPage } from "./pages/Index";

function App() {
  return (
    <Layout style={{ height: "100%" }}>
      {/* <Layout.Header>aaa</Layout.Header> */}
      {/* <Layout>
        <Layout.Sider theme="light">aaa</Layout.Sider> */}
      <Layout.Content>
        <IndexPage />
      </Layout.Content>
      {/* </Layout> */}
    </Layout>
  );
}

export default App;
