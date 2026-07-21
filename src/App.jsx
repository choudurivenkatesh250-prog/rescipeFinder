import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";

import Home from "./components/Home";
import Browse from "./components/Browse";
import LoginForm from "./components/LoginForm";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<LoginForm />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/browse"
          element={
            <ProtectedRoute>
              <Browse />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />

      </Routes>

    </BrowserRouter>
  );
};

export default App;