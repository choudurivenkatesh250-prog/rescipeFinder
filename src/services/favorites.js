/**
 * Cookbook / favourites storage.
 *
 * Keeps the "heart" buttons and the /cookbook page in sync through a single
 * localStorage key plus a window event so every mounted page can react.
 */

const STORAGE_KEY = "recipe_favorites";

export const FAVORITES_EVENT = "recipe-favorites:change";

/** Read the saved recipes, tolerating corrupted storage. */
export const readFavorites = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && item.id)
      .map((item) => ({
        id: String(item.id),
        name: String(item.name ?? "Untitled recipe"),
        thumbnail: String(item.thumbnail ?? ""),
        category: String(item.category ?? ""),
      }));
  } catch {
    return [];
  }
};

const writeFavorites = (items) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage can be unavailable (private mode / quota) - the app keeps working.
  }

  window.dispatchEvent(new Event(FAVORITES_EVENT));

  return items;
};

export const isFavorite = (id) => {
  const target = String(id ?? "");
  return target !== "" && readFavorites().some((item) => item.id === target);
};

/** Add the recipe when missing, remove it when already saved. */
export const toggleFavorite = (meal) => {
  const id = String(meal?.id ?? "");

  if (!id) {
    return readFavorites();
  }

  const current = readFavorites();

  if (current.some((item) => item.id === id)) {
    return writeFavorites(current.filter((item) => item.id !== id));
  }

  return writeFavorites([
    ...current,
    {
      id,
      name: String(meal.name ?? "Untitled recipe"),
      thumbnail: String(meal.thumbnail ?? ""),
      category: String(meal.category ?? ""),
    },
  ]);
};

export const removeFavorite = (id) => {
  const target = String(id ?? "");

  return writeFavorites(readFavorites().filter((item) => item.id !== target));
};
