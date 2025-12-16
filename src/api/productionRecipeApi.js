// src/api/productionRecipeApi.js
import api from "./axiosConfig";

const RECIPES_BASE = "/api/production-recipes";
const BATCHES_BASE = "/api/production-batches";

// ✅ always try to send JWT if it exists
function authHeaders() {
  const token = localStorage.getItem("token"); // same key we used in other modules
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ---------- Recipes ----------

// get all recipes
export async function fetchRecipes() {
  const res = await api.get(RECIPES_BASE, {
    headers: authHeaders(),
  });
  return res.data;
}

// create new recipe (used by Add Recipe)
export async function createRecipe(payload) {
  const res = await api.post(RECIPES_BASE, payload, {
    headers: authHeaders(),
  });
  return res.data;
}

// update recipe
export async function updateRecipe(id, payload) {
  const res = await api.put(`${RECIPES_BASE}/${id}`, payload, {
    headers: authHeaders(),
  });
  return res.data;
}

// ✅ DUPLICATE – reuse createRecipe so it behaves EXACTLY like Add Recipe
export async function duplicateRecipe(recipe) {
  if (!recipe) {
    throw new Error("No recipe given for duplicate");
  }

  // build new recipe data
  const payload = {
    ...recipe,
    id: null, // new row
    name: recipe.name + " (Copy)",
  };

  // if there are ingredients, remove their ids too
  if (Array.isArray(payload.ingredients)) {
    payload.ingredients = payload.ingredients.map((ing) => ({
      ...ing,
      id: null,
    }));
  }

  // 👉 use the SAME endpoint and headers as normal create
  return await createRecipe(payload);
}

// ---------- Batches ----------

export async function fetchBatches() {
  const res = await api.get(BATCHES_BASE, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function createBatch(payload) {
  const res = await api.post(BATCHES_BASE, payload, {
    headers: authHeaders(),
  });
  return res.data;
}
