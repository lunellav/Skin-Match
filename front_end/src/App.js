import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./signup";
import Preferences from "./preferences";
import Products from "./products";
import Profile from "./profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/products" element={<Products />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
