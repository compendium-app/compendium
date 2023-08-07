import { Layout } from "antd";
import "./App.css";
import { IndexPage } from "./pages/Index";
import { Settings } from "./components/settings";
import { SettingsContext } from "./contexts/settings";
import { useState } from "react";

function App() {
  const [settings, setSettings] = useState({
    clusteringEnabled: true,
  });

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      <Settings />
      <Layout style={{ height: "100%" }}>
        <Layout.Content>
          <IndexPage />
        </Layout.Content>
      </Layout>
    </SettingsContext.Provider>
  );
}

export default App;
