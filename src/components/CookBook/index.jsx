import { useEffect, useState } from "react";
import { Link } from "react-router";
import Header from "../Header";
import { FaBookOpen, FaHeart, FaTrashAlt, FaUtensils } from "react-icons/fa";
import {
  FAVORITES_EVENT,
  readFavorites,
  removeFavorite,
} from "../../services/favorites";
import "./index.css";

const CookBook = () => {
  const [favorites, setFavorites] = useState(() => readFavorites());

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());

    window.addEventListener(FAVORITES_EVENT, sync);

    return () => window.removeEventListener(FAVORITES_EVENT, sync);
  }, []);

  return (
    <>
      <Header />

      <div className="cookbook-page">
        <section className="cookbook-hero">
          <h1>
            My
            <span> Cookbook</span>
          </h1>

          <p>Every recipe you saved while browsing, all in one place.</p>

          <p className="cookbook-count">
            {favorites.length} {favorites.length === 1 ? "recipe" : "recipes"}{" "}
            saved
          </p>
        </section>

        {favorites.length === 0 ? (
          <div className="cookbook-empty">
            <span className="cookbook-empty-icon">
              <FaBookOpen />
            </span>

            <h2>Your cookbook is empty</h2>

            <p>Tap the heart on any recipe to save it here for later.</p>

            <div className="cookbook-actions">
              <Link className="cookbook-btn" to="/browse">
                Browse Recipes
              </Link>

              <Link className="cookbook-btn cookbook-btn-ghost" to="/home">
                Go Home
              </Link>
            </div>
          </div>
        ) : (
          <section className="cookbook-recipes">
            <div className="recipe-grid">
              {favorites.map((meal) => (
                <div className="recipe-card" key={meal.id}>
                  <div className="image-wrapper">
                    <img src={meal.thumbnail} alt={meal.name} loading="lazy" />

                    <button
                      type="button"
                      className="fav-btn fav-btn-active"
                      onClick={() => removeFavorite(meal.id)}
                      title="Remove from cookbook"
                      aria-label={`Remove ${meal.name} from cookbook`}
                    >
                      <FaTrashAlt />
                    </button>

                    <div className="rating">{meal.category || "Recipe"}</div>
                  </div>

                  <div className="recipe-info">
                    <h3>{meal.name}</h3>

                    <div className="recipe-meta">
                      <span>
                        <FaUtensils />
                        {meal.category || "Recipe"}
                      </span>

                      <span>
                        <FaHeart />
                        Saved
                      </span>
                    </div>

                    <Link className="view-btn" to={`/recipe/${meal.id}`}>
                      View Recipe
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default CookBook;
