import { useEffect } from "react";
import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router";

import Home from "./components/Home";
import Browse from "./components/Browse";
import CookBook from "./components/CookBook";
import LoginForm from "./components/LoginForm";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import RecipeDetails from "./components/RecipeDetails";

// Every navigation starts at the top of the page. Without this, opening a
// recipe from the middle of the Home / Browse grid keeps the old scroll
// position and the recipe title is never visible.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <BrowserRouter>

      <ScrollToTop />

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

        <Route
          path="/cookbook"
          element={
            <ProtectedRoute>
              <CookBook />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recipe"
          element={
            <ProtectedRoute>
              <RecipeDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recipe/:id"
          element={
            <ProtectedRoute>
              <RecipeDetails />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />

      </Routes>

    </BrowserRouter>
  );
};

export default App;