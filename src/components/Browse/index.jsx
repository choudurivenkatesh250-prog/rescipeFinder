import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Header from "../Header";
import {
  FaSearch,
  FaHeart,
  FaRegHeart,
  FaUtensils,
  FaGlobeAmericas,
} from "react-icons/fa";
import {
  ApiError,
  filterMealsByArea,
  filterMealsByCategory,
  mergeMealSummaries,
  searchMealsByName,
} from "../../services/mealdb";
import {
  FAVORITES_EVENT,
  readFavorites,
  toggleFavorite,
} from "../../services/favorites";
import "./index.css";

// The "popular" view mixes a few well known categories so the page still has a
// rich grid even though the API has no "all recipes" endpoint.
const POPULAR_CATEGORIES = ["Chicken", "Seafood", "Dessert", "Vegetarian"];

// Emoji are written as unicode escapes so the source file stays plain ASCII.
const FILTER_OPTIONS = [
  {
    key: "popular",
    label: "\u2728 Popular",
    title: "Popular Recipes",
    type: "popular",
    value: "",
  },
  {
    key: "Italian",
    label: "\uD83C\uDF55 Italian",
    title: "Italian Recipes",
    type: "area",
    value: "Italian",
  },
  {
    key: "Beef",
    label: "\uD83C\uDF54 Beef",
    title: "Beef Recipes",
    type: "category",
    value: "Beef",
  },
  {
    key: "Indian",
    label: "\uD83C\uDF5B Indian",
    title: "Indian Recipes",
    type: "area",
    value: "Indian",
  },
  {
    key: "Dessert",
    label: "\uD83C\uDF70 Dessert",
    title: "Dessert Recipes",
    type: "category",
    value: "Dessert",
  },
  {
    key: "Seafood",
    label: "\uD83D\uDC1F Sea Food",
    title: "Sea Food Recipes",
    type: "category",
    value: "Seafood",
  },
];

const DEFAULT_FILTER = FILTER_OPTIONS[0];

const Browse = () => {
  const [searchList, setSearchList] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [title, setTitle] = useState(DEFAULT_FILTER.title);
  const [selectedFilter, setSelectedFilter] = useState(DEFAULT_FILTER.key);
  const [retryKey, setRetryKey] = useState(0);
  const [favorites, setFavorites] = useState(() => readFavorites());

  const requestIdRef = useRef(0);
  const activeSourceRef = useRef(DEFAULT_FILTER);
  const activeTitleRef = useRef(DEFAULT_FILTER.title);
  const baseSourceRef = useRef(DEFAULT_FILTER);
  const baseTitleRef = useRef(DEFAULT_FILTER.title);

  const loadRecipes = useCallback(async (filter, label) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    activeSourceRef.current = filter;
    activeTitleRef.current = label;

    setStatus("loading");
    setErrorMessage("");
    setTitle(label);

    try {
      let meals = [];

      if (filter.type === "search") {
        meals = await searchMealsByName(filter.value);
      } else if (filter.type === "area") {
        meals = await filterMealsByArea(filter.value);
      } else if (filter.type === "category") {
        meals = await filterMealsByCategory(filter.value);
      } else {
        const groups = await Promise.all(
          POPULAR_CATEGORIES.map((category) => filterMealsByCategory(category))
        );
        meals = mergeMealSummaries(...groups);
      }

      // A newer request was started while this one was still in flight.
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
    loadRecipes(activeSourceRef.current, activeTitleRef.current);
  }, [loadRecipes, retryKey]);

  // Debounced search across the whole catalogue.
  useEffect(() => {
    const term = search.trim();

    if (!term) {
      if (activeSourceRef.current.type === "search") {
        loadRecipes(baseSourceRef.current, baseTitleRef.current);
      }

      return undefined;
    }

    const timer = setTimeout(() => {
      loadRecipes(
        { type: "search", value: term },
        `Search results for "${term}"`
      );
    }, 450);

    return () => clearTimeout(timer);
  }, [search, loadRecipes]);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());

    window.addEventListener(FAVORITES_EVENT, sync);

    return () => window.removeEventListener(FAVORITES_EVENT, sync);
  }, []);

  const selectFilter = (option) => {
    baseSourceRef.current = option;
    baseTitleRef.current = option.title;
    setSelectedFilter(option.key);
    setSearch("");
    loadRecipes(option, option.title);
  };

  const favoriteIds = new Set(favorites.map((item) => item.id));

  const term = search.trim().toLowerCase();

  const filteredRecipes = term
    ? searchList.filter((item) => item.name.toLowerCase().includes(term))
    : searchList;

  return (
    <>
      <Header />

      <div className="browse-page">
        <section className="browse-hero">
          <h1>
            Discover Amazing
            <span> Recipes</span>
          </h1>

          <p>Browse hundreds of delicious recipes from around the world.</p>

          <div className="browse-search">
            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search your favourite recipe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="categories">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={
                  selectedFilter === option.key ? "category-active" : ""
                }
                onClick={() => selectFilter(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="browse-recipes">
          <div className="browse-title">
            <h2>{title}</h2>

            <p>
              {status === "loading"
                ? "Loading recipes..."
                : `${filteredRecipes.length} Recipes Found`}
            </p>
          </div>

          {status === "error" ? (
            <div className="browse-status">
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

          {status === "ready" && filteredRecipes.length === 0 ? (
            <div className="browse-status">
              <h3>No recipes found</h3>
              <p>
                We could not find any recipe matching your search. Try another
                keyword or pick a different category.
              </p>
            </div>
          ) : null}

          <div className="recipe-grid">
            {filteredRecipes.map((meal) => {
              const isFav = favoriteIds.has(meal.id);

              return (
                <div className="recipe-card" key={meal.id}>
                  <div className="image-wrapper">
                    <img src={meal.thumbnail} alt={meal.name} loading="lazy" />

                    <button
                      type="button"
                      className={`fav-btn ${isFav ? "fav-btn-active" : ""}`}
                      onClick={() => toggleFavorite(meal)}
                      aria-pressed={isFav}
                      title={isFav ? "Remove from cookbook" : "Save to cookbook"}
                    >
                      {isFav ? <FaHeart /> : <FaRegHeart />}
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

                      {meal.area || meal.country ? (
                        <span>
                          <FaGlobeAmericas />
                          {meal.area || meal.country}
                        </span>
                      ) : null}
                    </div>

                    <Link className="view-btn" to={`/recipe/${meal.id}`}>
                      View Recipe
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
};

export default Browse;