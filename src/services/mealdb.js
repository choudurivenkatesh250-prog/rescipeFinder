/**
 * TheMealDB API service.
 *
 * This is the single source of truth for recipe data used across the app.
 * Every response from the API is normalised here so components never have to
 * guess the field names coming back from the server.
 *
 * API reference: https://www.themealdb.com/api.php
 */

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

/** Error thrown by every helper in this module. */
export class ApiError extends Error {
  constructor(message, { code = "API_ERROR", status = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

/** Perform a request and normalise the failure cases into ApiError. */
const request = async (endpoint, params = {}, signal) => {
  const query = new URLSearchParams(params).toString();

  let response;

  try {
    response = await fetch(`${BASE_URL}/${endpoint}?${query}`, { signal });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(
      "We could not reach the recipe service. Please check your internet connection and try again.",
      { code: "NETWORK_ERROR" }
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `The recipe service responded with an error (HTTP ${response.status}). Please try again in a moment.`,
      { code: "HTTP_ERROR", status: response.status }
    );
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError(
      "We received an unexpected response from the recipe service. Please try again.",
      { code: "INVALID_RESPONSE" }
    );
  }
};

/** "Meat,Casserole" -> ["Meat", "Casserole"] */
const parseTags = (tags) => {
  if (typeof tags !== "string") {
    return [];
  }

  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

/** The API spreads ingredients over strIngredient1..20 / strMeasure1..20. */
const parseIngredients = (meal) => {
  const ingredients = [];

  for (let index = 1; index <= 20; index += 1) {
    const ingredient = String(meal[`strIngredient${index}`] ?? "").trim();
    const measure = String(meal[`strMeasure${index}`] ?? "").trim();

    if (ingredient) {
      ingredients.push({ ingredient, measure });
    }
  }

  return ingredients;
};

const STEP_PREFIX = /^(?:step\s*\d+|\d+\s*[.):-])\s*/i;

/**
 * Turn the raw instruction blob into an array of readable steps.
 * The API mixes numbered steps, one-step-per-line text and single paragraphs,
 * so all three shapes are handled.
 */
const parseInstructions = (raw) => {
  if (!raw) {
    return [];
  }

  const lines = String(raw)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  if (lines.some((line) => STEP_PREFIX.test(line))) {
    const steps = [];

    lines.forEach((line) => {
      if (STEP_PREFIX.test(line)) {
        steps.push(line.replace(STEP_PREFIX, "").trim());
      } else if (steps.length > 0) {
        steps[steps.length - 1] = `${steps[steps.length - 1]} ${line}`.trim();
      } else {
        steps.push(line);
      }
    });

    return steps.filter(Boolean);
  }

  if (lines.length === 1 && lines[0].length > 180) {
    const sentences = lines[0].match(/[^.!?]+[.!?]*/g);

    if (sentences && sentences.length > 1) {
      return sentences.map((sentence) => sentence.trim()).filter(Boolean);
    }
  }

  return lines;
};

/** Extract the video id from any of the YouTube URL shapes the API returns. */
export const getYouTubeId = (url) => {
  if (!url) {
    return "";
  }

  const match = String(url).match(
    /(?:youtu\.be\/|[?&]v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{6,})/
  );

  return match ? match[1] : "";
};

/** Full recipe shape used by the details page. */
export const normalizeMeal = (meal) => {
  if (!meal || typeof meal !== "object" || !meal.idMeal) {
    return null;
  }

  return {
    id: String(meal.idMeal),
    name: String(meal.strMeal ?? "").trim() || "Untitled recipe",
    alternateName: String(meal.strMealAlternate ?? "").trim(),
    category: String(meal.strCategory ?? "").trim(),
    area: String(meal.strArea ?? "").trim(),
    country: String(meal.strCountry ?? "").trim(),
    thumbnail: String(meal.strMealThumb ?? "").trim(),
    instructions: String(meal.strInstructions ?? "").trim(),
    steps: parseInstructions(meal.strInstructions),
    tags: parseTags(meal.strTags),
    ingredients: parseIngredients(meal),
    youtube: String(meal.strYoutube ?? "").trim(),
    source: String(meal.strSource ?? "").trim(),
    imageSource: String(meal.strImageSource ?? "").trim(),
    modifiedOn: String(meal.dateModified ?? "").trim(),
  };
};

/** Lightweight shape used by the Home / Browse cards. */
export const normalizeMealSummary = (meal, fallbackCategory = "") => {
  if (!meal || !meal.idMeal) {
    return null;
  }

  return {
    id: String(meal.idMeal),
    name: String(meal.strMeal ?? "").trim() || "Untitled recipe",
    thumbnail: String(meal.strMealThumb ?? "").trim(),
    category: String(meal.strCategory ?? "").trim() || fallbackCategory,
    area: String(meal.strArea ?? "").trim(),
    country: String(meal.strCountry ?? "").trim(),
  };
};

const normalizeSummaryList = (meals, fallbackCategory = "") =>
  (Array.isArray(meals) ? meals : [])
    .map((meal) => normalizeMealSummary(meal, fallbackCategory))
    .filter(Boolean);

/** Fetch one complete recipe by its TheMealDB id. */
export const lookupMealById = async (id, signal) => {
  const mealId = String(id ?? "").trim();

  if (!mealId) {
    throw new ApiError(
      "No recipe was selected. Please pick a recipe to view its details.",
      { code: "MISSING_ID" }
    );
  }

  if (!/^\d+$/.test(mealId)) {
    throw new ApiError(
      `"${mealId}" is not a valid recipe id. Please open a recipe from Home or Browse.`,
      { code: "INVALID_ID" }
    );
  }

  const data = await request("lookup.php", { i: mealId }, signal);
  const meal = normalizeMeal(Array.isArray(data?.meals) ? data.meals[0] : null);

  if (!meal) {
    throw new ApiError(
      `We could not find a recipe with the id "${mealId}". It may have been removed or the link may be incorrect.`,
      { code: "NOT_FOUND" }
    );
  }

  return meal;
};

/** Recipes belonging to a category (e.g. "Seafood"). */
export const filterMealsByCategory = async (category, signal) => {
  const data = await request("filter.php", { c: category }, signal);
  return normalizeSummaryList(data?.meals, category);
};

/**
 * Some areas are listed under one name by `list.php` but indexed under a
 * different name by `filter.php` (e.g. "Indian" is listed, but the recipes are
 * stored as "India"). These aliases are only used when the primary value
 * returns nothing, so the documented name always wins when it works.
 */
const AREA_ALIASES = {
  Dutch: ["Netherlands"],
  French: ["France"],
  Indian: ["India"],
  Norwegian: ["Norway"],
};

/** Recipes belonging to an area/cuisine (e.g. "Indian"). */
export const filterMealsByArea = async (area, signal) => {
  const candidates = [area, ...(AREA_ALIASES[area] ?? [])];

  for (const candidate of candidates) {
    const data = await request("filter.php", { a: candidate }, signal);
    const meals = normalizeSummaryList(data?.meals);

    if (meals.length > 0) {
      return meals;
    }
  }

  return [];
};

/** Full text search by recipe name. */
export const searchMealsByName = async (query, signal) => {
  const term = String(query ?? "").trim();

  if (!term) {
    return [];
  }

  const data = await request("search.php", { s: term }, signal);
  return normalizeSummaryList(data?.meals);
};

/** One random recipe. */
export const getRandomMeal = async (signal) => {
  const data = await request("random.php", {}, signal);
  return normalizeSummaryList(data?.meals);
};

/** Merge several result lists into one de-duplicated list. */
export const mergeMealSummaries = (...lists) => {
  const seen = new Map();

  lists.flat().forEach((meal) => {
    if (meal && !seen.has(meal.id)) {
      seen.set(meal.id, meal);
    }
  });

  return [...seen.values()];
};
