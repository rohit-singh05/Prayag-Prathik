import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import PackagesPage from "./pages/PackagePage";
import PlaceDetails from "./pages/PlaceDetails";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/place/:id" element={<PlaceDetails />} />
      </Routes>
    </Router>
  );
}
