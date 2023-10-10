import { Image, Space } from "antd";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import { Link, Outlet } from "react-router-dom";

import "./root.css";

import type React from "react";

const RootLayout = () => {
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Layout>
        <Header className="navigation">
          <Link to={"/"}>
            <Image
              src={"/compendium-logo.svg"}
              preview={false}
              width={170}
              height={"auto"}
            />
          </Link>
        </Header>
        <Content className="content">
          <Outlet />
        </Content>
      </Layout>
    </Space>
  );
};

export default RootLayout;
