import Header from "../Header";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  FaSearch,
  FaRandom,
  FaFire,
  FaHeart,
  FaRegHeart,
  FaUtensils,
  FaGlobeAmericas,
} from "react-icons/fa";
import {
  ApiError,
  filterMealsByArea,
  filterMealsByCategory,
  getRandomMeal,
  searchMealsByName,
} from "../../services/mealdb";
import {
  FAVORITES_EVENT,
  readFavorites,
  toggleFavorite,
} from "../../services/favorites";
import "./index.css";

const DEFAULT_SOURCE = {
  type: "category",
  value: "Chicken",
  label: "Popular Recipes",
};

const categories = [
  { name: "Indian", type: "area", value: "Indian" },
  { name: "Canadian", type: "area", value: "Canadian" },
  { name: "Chicken", type: "category", value: "Chicken" },
  { name: "Sea Food", type: "category", value: "Seafood" },
];

const Home = () => {
  const [searchList, setSearchList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [sectionLabel, setSectionLabel] = useState(DEFAULT_SOURCE.label);
  const [retryKey, setRetryKey] = useState(0);
  const [favorites, setFavorites] = useState(() => readFavorites());

  const requestIdRef = useRef(0);
  const activeSourceRef = useRef(DEFAULT_SOURCE);
  const baseSourceRef = useRef(DEFAULT_SOURCE);

  const loadMeals = useCallback(async (source) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    activeSourceRef.current = source;

    setStatus("loading");
    setErrorMessage("");
    setSectionLabel(source.label ?? "Recipes");

    try {
      let meals = [];

      if (source.type === "search") {
        meals = await searchMealsByName(source.value);
      } else if (source.type === "area") {
        meals = await filterMealsByArea(source.value);
      } else if (source.type === "random") {
        meals = await getRandomMeal();
      } else {
        meals = await filterMealsByCategory(source.value);
      }

      // Ignore responses that arrive after a newer request was started.
      if (requestId !== requestIdRef.current) {
        return;
      }

      setSearchList(meals);
      setStatus("ready");
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setSearchList([]);
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Something went wrong while loading recipes. Please try again."
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadMeals(activeSourceRef.current);
  }, [loadMeals, retryKey]);

  // Debounced full-catalogue search so the hero search really searches every
  // recipe instead of only the list that happens to be loaded.
  useEffect(() => {
    const term = searchInput.trim();

    if (!term) {
      if (activeSourceRef.current.type === "search") {
        loadMeals(baseSourceRef.current);
      }

      return undefined;
    }

    const timer = setTimeout(() => {
      loadMeals({
        type: "search",
        value: term,
        label: `Search results for "${term}"`,
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [searchInput, loadMeals]);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());

    window.addEventListener(FAVORITES_EVENT, sync);

    return () => window.removeEventListener(FAVORITES_EVENT, sync);
  }, []);

  const surpriseMeal = () => {
    setSearchInput("");
    loadMeals({ type: "random", value: "", label: "Surprise Recipe" });
  };

  const selectCategory = (category) => {
    baseSourceRef.current = {
      type: category.type,
      value: category.value,
      label: `${category.name} Recipes`,
    };
    setSearchInput("");
    loadMeals(baseSourceRef.current);
  };

  const favoriteIds = new Set(favorites.map((item) => item.id));

  const term = searchInput.trim().toLowerCase();

  const searchResult = term
    ? searchList.filter((item) => item.name.toLowerCase().includes(term))
    : searchList;

  return (
    <>
      <Header />

      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <span className="hero-badge">
              <FaFire />
              Trending Recipes
            </span>

            <h1>
              Discover Your
              <br />
              <span>Favorite Recipe</span>
            </h1>

            <p>
              Explore thousands of delicious meals from around the world.
              Search instantly and cook something amazing today.
            </p>

            <div className="search-box">
              <FaSearch className="search-icon" />

              <input
                type="search"
                placeholder="Search recipes..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />

              <button onClick={surpriseMeal}>
                <FaRandom />
                Surprise Me
              </button>
            </div>

            <div className="category-chips">
              {categories.map((item) => (
                <button
                  key={item.name}
                  onClick={() => selectCategory(item)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="recipes-section">
        <div className="section-title">
          <h2>{sectionLabel}</h2>
          <p>
            {status === "loading"
              ? "Loading recipes..."
              : `${searchResult.length} Recipes Found`}
          </p>
        </div>

        {status === "error" ? (
          <div className="recipes-status">
            <h3>We could not load recipes</h3>
            <p>{errorMessage}</p>
            <button
              type="button"
              className="view-btn"
              onClick={() => setRetryKey((value) => value + 1)}
            >
              Try Again
            </button>
          </div>
        ) : null}

        {status === "ready" && searchResult.length === 0 ? (
          <div className="recipes-status">
            <h3>No recipes found</h3>
            <p>
              We could not find any recipe matching your search. Try a different
              keyword or pick one of the categories above.
            </p>
          </div>
        ) : null}

        <div className="recipe-grid">
          {searchResult.map((meal) => {
            const isFav = favoriteIds.has(meal.id);

            return (
              <div className="recipe-card" key={meal.id}>
                <div className="image-wrapper">
                  <img
                    src={meal.thumbnail}
                    alt={meal.name}
                    loading="lazy"
                  />

                  <button
                    type="button"
                    className={`fav-btn ${isFav ? "fav-btn-active" : ""}`}
                    onClick={() => toggleFavorite(meal)}
                    aria-pressed={isFav}
                    title={
                      isFav ? "Remove from cookbook" : "Save to cookbook"
                    }
                  >
                    {isFav ? <FaHeart /> : <FaRegHeart />}
                  </button>

                  <span className="rating">{meal.category || "Recipe"}</span>
                </div>

                <div className="recipe-info">
                  <h3>{meal.name}</h3>

                  <div className="recipe-meta">
                    <span>
                      <FaUtensils />
                      {meal.category || "Recipe"}
                    </span>

                    {meal.area || meal.country ? (
                      <span>
                        <FaGlobeAmericas />
                        {meal.area || meal.country}
                      </span>
                    ) : null}
                  </div>

                  <Link className="view-btn" to={`/recipe/${meal.id}`}>
                    View Recipe →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default Home;