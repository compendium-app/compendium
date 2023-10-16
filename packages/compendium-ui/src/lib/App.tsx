import "./App.css";
import { Route, Routes } from "react-router-dom";
import RootLayout from "./layouts/root/root";
import Homepage from "./pages/homepage/homepage";
import GraphPage from "./pages/graph/graph";
import NodeType from "./pages/node-type/node-type";
import ScrollToTop from "./components/scroll-to-top/scroll-to-top";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Homepage />} />
          <Route path="graph" element={<GraphPage />} />
          <Route path="node-type/:nodeType" element={<NodeType />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
