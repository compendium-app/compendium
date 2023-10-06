import "./App.css";
import { Route, Routes } from "react-router-dom";
import RootLayout from "./layouts/root";
import Homepage from "./pages/homepage/homepage";
import GraphPage from "./pages/graph/graph";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Homepage />} />
        <Route path="graph" element={<GraphPage />} />
      </Route>
    </Routes>
  );
}

export default App;
