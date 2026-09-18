import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import {
  FaArrowLeft,
  FaClock,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaGlobeAmericas,
  FaHeart,
  FaListUl,
  FaMapMarkerAlt,
  FaPlay,
  FaRegHeart,
  FaUtensils,
  FaYoutube,
} from "react-icons/fa";
import Header from "../Header";
import { ApiError, getYouTubeId, lookupMealById } from "../../services/mealdb";
import {
  FAVORITES_EVENT,
  isFavorite,
  toggleFavorite,
} from "../../services/favorites";
import "./index.css";

const LOADING = "loading";
const READY = "ready";
const ERROR = "error";

const isHttpUrl = (value) => /^https?:\/\//i.test(String(value ?? ""));

const formatDate = (value) => {
  const date = new Date(String(value ?? "").replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const MetaCard = ({ icon, label, value }) => (
  <div className="rd-meta-card">
    <span className="rd-meta-icon">{icon}</span>
    <span className="rd-meta-text">
      <span className="rd-meta-label">{label}</span>
      <strong className="rd-meta-value">{value}</strong>
    </span>
  </div>
);

const LoadingState = () => (
  <div className="rd-loading" role="status" aria-live="polite">
    <span className="rd-sr-only">Loading recipe details…</span>

    <div className="rd-skeleton rd-skeleton-media" />
    <div className="rd-skeleton rd-skeleton-title" />
    <div className="rd-skeleton rd-skeleton-line" />
    <div className="rd-skeleton rd-skeleton-line rd-skeleton-line-short" />

    <div className="rd-skeleton-grid">
      <div className="rd-skeleton rd-skeleton-block" />
      <div className="rd-skeleton rd-skeleton-block" />
    </div>
  </div>
);

const ErrorState = ({ message, recipeId, onRetry, onBack }) => (
  <section className="rd-state">
    <span className="rd-state-icon">
      <FaExclamationTriangle />
    </span>

    <h1>Recipe unavailable</h1>

    <p className="rd-state-message">{message}</p>

    {recipeId ? (
      <p className="rd-state-id">
        Requested recipe id: <code>{recipeId}</code>
      </p>
    ) : null}

    <div className="rd-actions rd-actions-center">
      <button type="button" className="rd-btn rd-btn-primary" onClick={onRetry}>
        Try again
      </button>

      <button type="button" className="rd-btn rd-btn-ghost" onClick={onBack}>
        <FaArrowLeft />
        Back
      </button>

      <Link className="rd-btn rd-btn-ghost" to="/browse">
        Browse recipes
      </Link>

      <Link className="rd-btn rd-btn-ghost" to="/home">
        Go home
      </Link>
    </div>
  </section>
);

const RecipeDetailsContent = ({ recipe, favorite, onToggleFavorite, onBack }) => {
  const videoId = getYouTubeId(recipe.youtube);
  const updatedOn = formatDate(recipe.modifiedOn);

  return (
    <article className="rd-article">
      <nav className="rd-breadcrumb" aria-label="Breadcrumb">
        <Link to="/home">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to="/browse">Browse</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{recipe.name}</span>
      </nav>

      <header className="rd-hero">
        <div className="rd-hero-media">
          <img src={recipe.thumbnail} alt={recipe.name} />

          <button
            type="button"
            className={`rd-fav-btn ${favorite ? "is-active" : ""}`}
            onClick={onToggleFavorite}
            aria-pressed={favorite}
            title={favorite ? "Remove from cookbook" : "Save to cookbook"}
          >
            {favorite ? <FaHeart /> : <FaRegHeart />}
            <span className="rd-sr-only">
              {favorite ? "Remove from cookbook" : "Save to cookbook"}
            </span>
          </button>
        </div>

        <div className="rd-hero-body">
          <span className="rd-eyebrow">
            <FaUtensils />
            {recipe.category || "Recipe"}
          </span>

          <h1>{recipe.name}</h1>

          {recipe.alternateName ? (
            <p className="rd-alt-name">Also known as {recipe.alternateName}</p>
          ) : null}

          <div className="rd-meta-grid">
            {recipe.category ? (
              <MetaCard
                icon={<FaUtensils />}
                label="Category"
                value={recipe.category}
              />
            ) : null}

            {recipe.area ? (
              <MetaCard
                icon={<FaGlobeAmericas />}
                label="Cuisine / Area"
                value={recipe.area}
              />
            ) : null}

            {recipe.country ? (
              <MetaCard
                icon={<FaMapMarkerAlt />}
                label="Country"
                value={recipe.country}
              />
            ) : null}

            {recipe.ingredients.length > 0 ? (
              <MetaCard
                icon={<FaListUl />}
                label="Ingredients"
                value={`${recipe.ingredients.length} items`}
              />
            ) : null}

            {recipe.steps.length > 0 ? (
              <MetaCard
                icon={<FaClock />}
                label="Instructions"
                value={`${recipe.steps.length} steps`}
              />
            ) : null}
          </div>

          {recipe.tags.length > 0 ? (
            <div className="rd-tags">
              {recipe.tags.map((tag) => (
                <span className="rd-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="rd-actions">
            {recipe.youtube ? (
              <a
                className="rd-btn rd-btn-primary"
                href={recipe.youtube}
                target="_blank"
                rel="noreferrer"
              >
                <FaYoutube />
                Watch video
              </a>
            ) : null}

            {isHttpUrl(recipe.source) ? (
              <a
                className="rd-btn rd-btn-ghost"
                href={recipe.source}
                target="_blank"
                rel="noreferrer"
              >
                <FaExternalLinkAlt />
                Original source
              </a>
            ) : null}

            <button type="button" className="rd-btn rd-btn-ghost" onClick={onBack}>
              <FaArrowLeft />
              Back
            </button>
          </div>
        </div>
      </header>

      <div className="rd-body">
        <section className="rd-card">
          <h2>
            <FaListUl />
            Ingredients
          </h2>

          {recipe.ingredients.length > 0 ? (
            <ul className="rd-ingredients">
              {recipe.ingredients.map((item, index) => (
                <li key={`${item.ingredient}-${index}`}>
                  <span className="rd-ingredient-name">{item.ingredient}</span>
                  <span className="rd-ingredient-measure">
                    {item.measure || "As needed"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rd-muted">
              No ingredient list was provided for this recipe.
            </p>
          )}
        </section>

        <section className="rd-card">
          <h2>
            <FaUtensils />
            Instructions
          </h2>

          {recipe.steps.length > 0 ? (
            <ol className="rd-steps">
              {recipe.steps.map((step, index) => (
                <li key={`step-${index}`}>
                  <span className="rd-step-number">{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rd-muted">
              No instructions were provided for this recipe.
            </p>
          )}
        </section>
      </div>

      {videoId ? (
        <section className="rd-card rd-video">
          <h2>
            <FaPlay />
            Video tutorial
          </h2>

          <div className="rd-video-frame">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`${recipe.name} video tutorial`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <a
            className="rd-video-link"
            href={recipe.youtube}
            target="_blank"
            rel="noreferrer"
          >
            <FaExternalLinkAlt />
            Open on YouTube
          </a>
        </section>
      ) : null}

      <footer className="rd-footer">
        <p>
          Recipe #{recipe.id}
          {updatedOn ? ` · Last updated ${updatedOn}` : ""}
        </p>

        <div>
          {isHttpUrl(recipe.source) ? (
            <a href={recipe.source} target="_blank" rel="noreferrer">
              <FaExternalLinkAlt />
              Recipe source
            </a>
          ) : null}

          {isHttpUrl(recipe.imageSource) ? (
            <a href={recipe.imageSource} target="_blank" rel="noreferrer">
              <FaExternalLinkAlt />
              Image source
            </a>
          ) : null}
        </div>
      </footer>
    </article>
  );
};

const RecipeDetails = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [retryKey, setRetryKey] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [state, setState] = useState(() => ({
    token: "",
    status: LOADING,
    recipe: null,
    message: "",
  }));

  // The token makes every id/retry combination a fresh load, so switching
  // between recipes never flashes the previous recipe's data.
  const token = `${id}::${retryKey}`;

  const result =
    state.token === token
      ? state
      : { token, status: LOADING, recipe: null, message: "" };

  useEffect(() => {
    const controller = new AbortController();
    const activeToken = `${id}::${retryKey}`;

    lookupMealById(id, controller.signal)
      .then((recipe) => {
        setState({
          token: activeToken,
          status: READY,
          recipe,
          message: "",
        });
        setFavorite(isFavorite(recipe.id));
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }

        setState({
          token: activeToken,
          status: ERROR,
          recipe: null,
          message:
            error instanceof ApiError
              ? error.message
              : "Something went wrong while loading this recipe. Please try again.",
        });
        setFavorite(false);
      });

    return () => controller.abort();
  }, [id, retryKey]);

  // Keep the heart in sync when the cookbook is changed elsewhere.
  useEffect(() => {
    const sync = () => setFavorite(isFavorite(id));

    window.addEventListener(FAVORITES_EVENT, sync);

    return () => window.removeEventListener(FAVORITES_EVENT, sync);
  }, [id]);

  const handleRetry = () => setRetryKey((value) => value + 1);

  // "default" is React Router's key for the first entry of the session, which
  // means there is no in-app page to go back to (e.g. a refreshed deep link).
  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/browse");
    }
  };

  return (
    <>
      <Header />

      <main className="recipe-details-page">
        {result.status === LOADING ? <LoadingState /> : null}

        {result.status === ERROR ? (
          <ErrorState
            message={result.message}
            recipeId={id}
            onRetry={handleRetry}
            onBack={handleBack}
          />
        ) : null}

        {result.status === READY && result.recipe ? (
          <RecipeDetailsContent
            recipe={result.recipe}
            favorite={favorite}
            onToggleFavorite={() => toggleFavorite(result.recipe)}
            onBack={handleBack}
          />
        ) : null}
      </main>
    </>
  );
};

export default RecipeDetails;