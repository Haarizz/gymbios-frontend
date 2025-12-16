// src/components/ProductionRecipie.jsx
import React, { useMemo, useState, useEffect } from "react";
import * as Icons from "react-icons/hi";
import {
  fetchRecipes,
  createRecipe,
  updateRecipe,
  duplicateRecipe as apiDuplicateRecipe,
  fetchBatches,
  createBatch,
} from "../api/productionRecipeApi";
import { getStaff } from "../api/staff"; // ✅ use your staff API

/* ---------- Small helper to avoid crashing if icon is missing ---------- */
function safeIcon(name) {
  const C = Icons[name];
  return C ? (props) => <C {...props} /> : () => null;
}

// Icons
const HiOutlineDocumentText = safeIcon("HiOutlineDocumentText");
const HiOutlineCheckCircle = safeIcon("HiOutlineCheckCircle");
const HiOutlineCurrencyDollar = safeIcon("HiOutlineCurrencyDollar");
const HiOutlineTrendingUp = safeIcon("HiOutlineTrendingUp");
const HiPrinter = safeIcon("HiPrinter");
const HiPlus = safeIcon("HiPlus");
const HiSearch = safeIcon("HiSearch");
const HiArrowLeft = safeIcon("HiArrowLeft");
const HiSave = safeIcon("HiSave");
const HiTrash = safeIcon("HiTrash");
const HiOutlineCube = safeIcon("HiOutlineCube");
const HiOutlineCake = safeIcon("HiOutlineCake");
const HiOutlineChartBar = safeIcon("HiOutlineChartBar");
const HiX = safeIcon("HiX");

/* ====================================================================== */
/* RECIPE DETAIL MODAL                                                    */
/* ====================================================================== */
function RecipeDetailModal({ recipe, onClose }) {
  if (!recipe) return null;

  const ingredients = recipe.ingredients || [];
  const ingredientsCost = ingredients.reduce(
    (sum, i) => sum + (i.total || 0),
    0
  );
  const n = recipe.nutrition || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {recipe.name}
              </h2>
              <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase">
                {recipe.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {recipe.category} • {recipe.servingSize}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Nutrition Facts */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                Nutrition Facts{" "}
                <span className="text-xs font-normal text-gray-400">
                  Per Serving
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <div className="text-gray-500 text-xs">Calories</div>
                  <div className="font-bold text-gray-900 text-lg flex items-center gap-1">
                    🔥 {n.calories ?? 0} kcal
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Protein</div>
                  <div className="font-bold text-gray-900 text-lg flex items-center gap-1">
                    🥩 {n.protein ?? 0} g
                  </div>
                </div>
                <div className="col-span-2 grid grid-cols-4 gap-2 pt-2">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase">
                      Carbs
                    </div>
                    <div className="font-semibold">{n.carbs ?? 0} g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase">
                      Fats
                    </div>
                    <div className="font-semibold">{n.fats ?? 0} g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase">
                      Sugar
                    </div>
                    <div className="font-semibold">{n.sugar ?? 0} g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase">
                      Fiber
                    </div>
                    <div className="font-semibold">{n.fiber ?? 0} g</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Cost Breakdown</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ingredients:</span>
                  <span className="font-medium">
                    {ingredientsCost.toFixed(2)} AED
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Packaging:</span>
                  <span className="font-medium">
                    {(recipe.packagingCost || 0).toFixed(2)} AED
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Labor:</span>
                  <span className="font-medium">
                    {(recipe.laborCost || 0).toFixed(2)} AED
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-emerald-700 font-bold">
                    Total Cost:
                  </span>
                  <span className="text-emerald-700 font-bold text-lg">
                    {(recipe.costPerUnit || 0).toFixed(2)} AED
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-900 font-medium">
                    Selling Price:
                  </span>
                  <span className="text-gray-900 font-bold">
                    {(recipe.sellingPrice || 0).toFixed(2)} AED
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Profit Margin:</span>
                  <span className="text-emerald-600 font-bold">
                    {(recipe.profitMargin || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients List */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">
              Ingredients {ingredients.length ? `(${ingredients.length})` : ""}
            </h3>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Ingredient</th>
                    <th className="px-6 py-3">Quantity</th>
                    <th className="px-6 py-3">Unit</th>
                    <th className="px-6 py-3 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ingredients.map((ing) => (
                    <tr key={ing.id} className="bg-white">
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {ing.name}
                      </td>
                      <td className="px-6 py-3 text-gray-600">{ing.qty}</td>
                      <td className="px-6 py-3 text-gray-600">{ing.unit}</td>
                      <td className="px-6 py-3 text-right text-gray-900">
                        {(ing.total || 0).toFixed(2)} AED
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Metrics */}
          <div className="flex items-center gap-8 text-sm text-gray-600 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">⏱️ Prep Time:</span>
              <span className="font-semibold">{recipe.prepTime} min</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">🍳 Cook Time:</span>
              <span className="font-semibold">{recipe.cookTime} min</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">📦 Yield:</span>
              <span className="font-semibold">{recipe.yieldValue} serving</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* CREATE / EDIT RECIPE FORM                                              */
/* ====================================================================== */

function CreateRecipeForm({ onBack, onSave, initialData }) {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    servingSize: initialData?.servingSize || "",
    description: initialData?.description || "",
    prepTime: initialData?.prepTime || "5",
    cookTime: initialData?.cookTime || "0",
    yieldValue: initialData?.yieldValue || "1",
    packagingCost: initialData?.packagingCost ?? 1.0,
    laborCost: initialData?.laborCost ?? 0.8,
    sellingPrice: initialData?.sellingPrice ?? 15.0,
    status: initialData?.status || "active",
  });

  const [nutrition, setNutrition] = useState({
    calories: initialData?.nutrition?.calories ?? 0,
    protein: initialData?.nutrition?.protein ?? 0,
    carbs: initialData?.nutrition?.carbs ?? 0,
    fats: initialData?.nutrition?.fats ?? 0,
    sugar: initialData?.nutrition?.sugar ?? 0,
    fiber: initialData?.nutrition?.fiber ?? 0,
  });

  const [ingredients, setIngredients] = useState(initialData?.ingredients || []);

  const ingredientsCost = useMemo(
    () => ingredients.reduce((sum, item) => sum + (item.total || 0), 0),
    [ingredients]
  );

  const totalCostPerUnit = useMemo(() => {
    return (
      ingredientsCost +
      parseFloat(formData.packagingCost || 0) +
      parseFloat(formData.laborCost || 0)
    );
  }, [ingredientsCost, formData.packagingCost, formData.laborCost]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    setNutrition((prev) => ({ ...prev, [name]: value }));
  };

  const addIngredient = () => {
    const newId = Date.now();
    setIngredients((prev) => [
      ...prev,
      { id: newId, name: "", qty: 1, unit: "g", costPerUnit: 0, total: 0 },
    ]);
  };

  const removeIngredient = (id) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const updateIngredient = (id, field, value) => {
    setIngredients((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "qty" || field === "costPerUnit") {
            const q = parseFloat(field === "qty" ? value : item.qty);
            const c = parseFloat(
              field === "costPerUnit" ? value : item.costPerUnit
            );
            updatedItem.total = (q || 0) * (c || 0);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleSaveClick = () => {
    onSave({
      id: initialData?.id,
      formData,
      nutrition,
      ingredients,
      totalCostPerUnit,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc]">
      <div className="px-8 py-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <HiArrowLeft className="text-lg" />
            Back
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? "Edit Recipe" : "Create Recipe"}
          </h2>
        </div>
        <button
          onClick={handleSaveClick}
          className="flex items-center gap-2 rounded-lg bg-[#2d7a6e] text-white text-sm font-medium px-6 py-2 hover:bg-[#236359] transition-colors shadow-sm"
        >
          <HiSave className="text-lg" />
          Save Recipe
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-[1920px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-base font-medium text-gray-700 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Recipe Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="E.g., Whey Protein Shake"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7a6e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7a6e]"
                  >
                    <option value="">Select category</option>
                    <option value="Shake">Shake</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Serving Size (ml / g)
                  </label>
                  <input
                    type="text"
                    name="servingSize"
                    placeholder="E.g., 350 ml"
                    value={formData.servingSize}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7a6e]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="2"
                    placeholder="Brief description of the recipe..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7a6e]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 md:col-span-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Prep Time (min)
                    </label>
                    <input
                      type="number"
                      name="prepTime"
                      value={formData.prepTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#2d7a6e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Cook Time (min)
                    </label>
                    <input
                      type="number"
                      name="cookTime"
                      value={formData.cookTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#2d7a6e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Yield
                    </label>
                    <input
                      type="number"
                      name="yieldValue"
                      value={formData.yieldValue}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#2d7a6e]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium text-gray-700">
                  Ingredients
                </h3>
                <button
                  onClick={addIngredient}
                  className="bg-[#2d7a6e] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[#236359] transition-colors flex items-center gap-1"
                >
                  <HiPlus /> Add Ingredient
                </button>
              </div>

              {ingredients.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8 border-2 border-dashed border-gray-100 rounded-lg">
                  <HiOutlineCube className="text-4xl mb-2 opacity-50" />
                  <p className="text-sm font-medium">
                    No ingredients added yet
                  </p>
                  <p className="text-xs">Click "Add Ingredient" to start</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase pb-1 border-b border-gray-100">
                    <div className="col-span-5">Ingredient</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-center">Unit</div>
                    <div className="col-span-2 text-right">Cost/Unit</div>
                    <div className="col-span-1 text-right">Total</div>
                  </div>
                  {ingredients.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-3 items-center group"
                    >
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Ingredient name"
                          value={item.name}
                          onChange={(e) =>
                            updateIngredient(item.id, "name", e.target.value)
                          }
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2d7a6e]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            updateIngredient(item.id, "qty", e.target.value)
                          }
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#2d7a6e]"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={item.unit}
                          onChange={(e) =>
                            updateIngredient(item.id, "unit", e.target.value)
                          }
                          className="w-full px-1 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#2d7a6e]"
                        >
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="pcs">pcs</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.costPerUnit}
                          onChange={(e) =>
                            updateIngredient(
                              item.id,
                              "costPerUnit",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#2d7a6e]"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-end gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {(item.total || 0).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeIngredient(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <HiTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column (Nutrition + Cost) */}
          <div className="xl:col-span-1 space-y-6">
            {/* Nutrition */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineChartBar className="text-[#2d7a6e]" />
                <h3 className="text-base font-medium text-gray-700">
                  Nutrition Summary
                </h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">Per Serving</p>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {Object.keys(nutrition).map((key) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">
                      {key} {key === "calories" ? "(kcal)" : "(g)"}
                    </label>
                    <input
                      type="number"
                      name={key}
                      value={nutrition[key]}
                      onChange={handleNutritionChange}
                      className="w-full py-1 bg-transparent border-b border-gray-200 text-sm font-medium text-center focus:outline-none focus:border-[#2d7a6e]"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Macros Distribution
                </p>
                <div className="w-full h-2 rounded-full flex overflow-hidden">
                  <div className="w-[40%] bg-blue-400"></div>
                  <div className="w-[40%] bg-emerald-400"></div>
                  <div className="w-[20%] bg-yellow-400"></div>
                </div>
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineCurrencyDollar className="text-[#2d7a6e]" />
                <h3 className="text-base font-medium text-gray-700">
                  Cost Summary
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Ingredients Cost:</span>
                  <span className="font-medium text-gray-900">
                    {ingredientsCost.toFixed(2)} AED
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-500">Packaging:</span>
                    <span className="font-medium text-gray-900">
                      {parseFloat(formData.packagingCost || 0).toFixed(2)} AED
                    </span>
                  </div>
                  <input
                    type="number"
                    name="packagingCost"
                    value={formData.packagingCost}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#2d7a6e]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-500">Labor:</span>
                    <span className="font-medium text-gray-900">
                      {parseFloat(formData.laborCost || 0).toFixed(2)} AED
                    </span>
                  </div>
                  <input
                    type="number"
                    name="laborCost"
                    value={formData.laborCost}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#2d7a6e]"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-semibold text-[#2d7a6e]">
                    Total Cost / Unit:
                  </span>
                  <span className="text-lg font-bold text-[#2d7a6e]">
                    {totalCostPerUnit.toFixed(2)} AED
                  </span>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Selling Price
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2d7a6e]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
}

/* ====================================================================== */
/* CREATE BATCH FORM                                                       */
/* ====================================================================== */

function CreateBatchForm({ recipes, onBack, onSave }) {
  const [formData, setFormData] = useState({
    recipeId: "",
    batchSize: "",
    productionDate: "",
    expiryDate: "",
    staff: "",
    notes: "",
  });

  const [staffList, setStaffList] = useState([]);

  // ✅ Load staff from /api/trainers via getStaff()
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const data = await getStaff();
        setStaffList(data || []);
      } catch (err) {
        console.error("Failed to load staff", err);
      }
    };

    loadStaff();
  }, []);

  const selectedRecipe = useMemo(
    () => recipes.find((r) => r.id.toString() === formData.recipeId),
    [recipes, formData.recipeId]
  );

  const estimatedCost = useMemo(() => {
    if (!selectedRecipe || !formData.batchSize) return 0;
    return (
      (selectedRecipe.costPerUnit || 0) *
      parseInt(formData.batchSize || 0, 10)
    );
  }, [selectedRecipe, formData.batchSize]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    onSave({
      ...formData,
      estimatedCost,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc]">
      {/* Header */}
      <div className="px-8 py-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <HiArrowLeft className="text-lg" />
            Back
          </button>
          <h2 className="text-xl font-bold text-gray-900">Batch Production</h2>
        </div>
        <button
          onClick={handleSaveClick}
          className="flex items-center gap-2 rounded-lg bg-[#2d7a6e] text-white text-sm font-medium px-6 py-2 hover:bg-[#236359] transition-colors shadow-sm"
        >
          <HiPlus className="text-lg" />
          Create Batch
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-[1920px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Batch Details */}
          <div className="xl:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
              <h3 className="text-base font-medium text-gray-700 mb-6">
                Batch Details
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Select Recipe
                  </label>
                  <select
                    name="recipeId"
                    value={formData.recipeId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7a6e]"
                  >
                    <option value="">Choose a recipe</option>
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Batch Size (units)
                    </label>
                    <input
                      type="number"
                      name="batchSize"
                      placeholder="e.g. 50"
                      value={formData.batchSize}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7a6e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Production Date
                    </label>
                    <input
                      type="date"
                      name="productionDate"
                      value={formData.productionDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7a6e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7a6e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Assigned To (Staff)
                    </label>
                    <select
                      name="staff"
                      value={formData.staff}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7a6e]"
                    >
                      <option value="">Select staff</option>
                      {staffList.map((s) => {
                        const displayName = `${s.firstName || s.firstname || ""} ${
                          s.lastName || s.lastname || ""
                        }`.trim();

                        return (
                          <option key={s.id} value={displayName}>
                            {displayName || `Staff #${s.id}`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows="3"
                    placeholder="Production notes..."
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7a6e]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stock Impact */}
          <div className="xl:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <HiOutlineCube className="text-[#2d7a6e]" />
                <h3 className="text-base font-medium text-gray-700">
                  Stock & Cost Impact
                </h3>
              </div>

              {!selectedRecipe || !formData.batchSize ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
                  <HiOutlineCube className="text-5xl mb-3 opacity-30" />
                  <p className="text-sm font-medium text-center px-4">
                    Select a recipe and batch size <br /> to see stock impact
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="text-xs text-emerald-700 font-semibold uppercase mb-1">
                        Producing
                      </p>
                      <p className="text-lg font-bold text-emerald-900">
                        {formData.batchSize} Units
                      </p>
                      <p className="text-sm text-emerald-800">
                        {selectedRecipe.name}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        Est. Ingredient Usage
                      </p>
                      <ul className="text-sm space-y-2 text-gray-600">
                        {(selectedRecipe.ingredients || [])
                          .slice(0, 3)
                          .map((ing) => (
                            <li
                              key={ing.id}
                              className="flex justify-between border-b border-gray-50 pb-1"
                            >
                              <span>{ing.name}</span>
                              <span className="font-medium">
                                {(
                                  (ing.qty || 0) *
                                  parseFloat(formData.batchSize || 0)
                                ).toFixed(1)}{" "}
                                {ing.unit}
                              </span>
                            </li>
                          ))}
                        {selectedRecipe.ingredients &&
                          selectedRecipe.ingredients.length > 3 && (
                            <li className="text-xs text-gray-400 italic">
                              + {selectedRecipe.ingredients.length - 3} more...
                            </li>
                          )}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Total Est. Cost
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        {estimatedCost.toFixed(2)} AED
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      Includes labor & overheads
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* MAIN COMPONENT                                                         */
/* ====================================================================== */

function ProductionRecipie() {
  const [view, setView] = useState("list"); // 'list' | 'create-recipe' | 'create-batch'
  const [activeTab, setActiveTab] = useState("recipes");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [recipes, setRecipes] = useState([]);
  const [batches, setBatches] = useState([]);

  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);

  // 🔄 Helper – reload recipes from backend after any change
  const reloadRecipes = async () => {
    try {
      const latest = await fetchRecipes();
      setRecipes(latest || []);
    } catch (err) {
      console.error("Failed to reload recipes", err);
    }
  };

  // 🔄 (Optional) Helper – reload batches if needed
  const reloadBatches = async () => {
    try {
      const latest = await fetchBatches();
      setBatches(latest || []);
    } catch (err) {
      console.error("Failed to reload batches", err);
    }
  };

  // load recipes & batches from backend (initial)
  useEffect(() => {
    const load = async () => {
      try {
        const [r, b] = await Promise.all([fetchRecipes(), fetchBatches()]);
        setRecipes(r || []);
        setBatches(b || []);
      } catch (err) {
        console.error("Failed to load production data", err);
      }
    };
    load();
  }, []);

  const calcProfitMargin = (cost, selling) => {
    const c = parseFloat(cost || 0);
    const s = parseFloat(selling || 0);
    if (!s || s <= 0) return 0;
    return ((s - c) / s) * 100;
  };

  // handlers
  const handleView = (recipe) => setViewingRecipe(recipe);

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setView("create-recipe");
  };

  const handleDuplicate = async (recipe) => {
    try {
      // send the full recipe object to backend – it will create a new row
      await apiDuplicateRecipe(recipe);

      // ⬇️ After successful duplicate, reload recipes from server
      await reloadRecipes();
    } catch (err) {
      console.error(
        "Failed to duplicate recipe",
        err?.response?.data || err.message
      );
      alert(
        "Duplicate failed: " +
          (err?.response?.data?.message || err.message || "Check console")
      );
    }
  };

  const handleSaveRecipe = async (payload) => {
    const { id, formData, nutrition, ingredients, totalCostPerUnit } = payload;

    const body = {
      id,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      servingSize: formData.servingSize,
      prepTime: formData.prepTime,
      cookTime: formData.cookTime,
      yieldValue: formData.yieldValue,
      packagingCost: parseFloat(formData.packagingCost || 0),
      laborCost: parseFloat(formData.laborCost || 0),
      sellingPrice: parseFloat(formData.sellingPrice || 0),
      status: formData.status || "active",
      nutrition,
      ingredients,
      costPerUnit: totalCostPerUnit,
      profitMargin: calcProfitMargin(totalCostPerUnit, formData.sellingPrice),
      ingredientsCount: ingredients.length,
    };

    try {
      if (id) {
        // update existing recipe
        await updateRecipe(id, body);
      } else {
        // create new recipe
        await createRecipe(body);
      }

      // ⬇️ Always reload list from backend so table shows latest data
      await reloadRecipes();

      setEditingRecipe(null);
      setView("list");
      setActiveTab("recipes");
    } catch (err) {
      console.error("Failed to save recipe", err);
      alert(
        "Save failed: " +
          (err?.response?.data?.message || err.message || "Check console")
      );
    }
  };

  const handleSaveBatch = async (payload) => {
    const body = {
      recipeId: payload.recipeId ? parseInt(payload.recipeId, 10) : null,
      batchSize: payload.batchSize ? parseInt(payload.batchSize, 10) : null,
      productionDate: payload.productionDate || null,
      expiryDate: payload.expiryDate || null,
      staff: payload.staff || "",
      notes: payload.notes || "",
    };

    try {
      await createBatch(body);
      await reloadBatches();
      setView("list");
      setActiveTab("batches");
    } catch (err) {
      console.error("Failed to create batch", err);
      alert(
        "Batch save failed: " +
          (err?.response?.data?.message || err.message || "Check console")
      );
    }
  };

  // stats
  const stats = useMemo(() => {
    const totalRecipes = recipes.length;
    const activeRecipes = recipes.filter((r) => r.status === "active").length;
    const avgCost =
      totalRecipes === 0
        ? 0
        : recipes.reduce((sum, r) => sum + (r.costPerUnit || 0), 0) /
          totalRecipes;
    const avgProfit =
      totalRecipes === 0
        ? 0
        : recipes.reduce((sum, r) => sum + (r.profitMargin || 0), 0) /
          totalRecipes;

    return { totalRecipes, activeRecipes, avgCost, avgProfit };
  }, [recipes]);

  // filter
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchSearch =
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchCategory =
        categoryFilter === "All" || r.category === categoryFilter;
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [search, categoryFilter, statusFilter, recipes]);

  // Routing to create / batch forms
  if (view === "create-recipe") {
    return (
      <CreateRecipeForm
        onBack={() => {
          setEditingRecipe(null);
          setView("list");
        }}
        onSave={handleSaveRecipe}
        initialData={editingRecipe}
      />
    );
  }

  if (view === "create-batch") {
    return (
      <CreateBatchForm
        recipes={recipes}
        onBack={() => setView("list")}
        onSave={handleSaveBatch}
      />
    );
  }

  /* -------------------- Tab helpers -------------------- */

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 text-sm font-semibold rounded-full transition-all duration-200
        ${
          activeTab === id
            ? "bg-[#2d7a6e] text-white shadow-sm"
            : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        }`}
    >
      {Icon && (
        <Icon
          className={`text-lg ${
            activeTab === id ? "text-white" : "text-gray-400"
          }`}
        />
      )}
      {label}
    </button>
  );

  const StatusBadge = ({ status }) => {
    const base =
      "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize";
    if (status === "active" || status === "completed")
      return (
        <span
          className={`${base} bg-emerald-50 text-emerald-700 border border-emerald-100`}
        >
          {status}
        </span>
      );
    if (status === "in-progress")
      return (
        <span
          className={`${base} bg-blue-50 text-blue-700 border border-blue-100`}
        >
          {status}
        </span>
      );
    if (status === "draft")
      return (
        <span
          className={`${base} bg-yellow-50 text-yellow-700 border border-yellow-100`}
        >
          {status}
        </span>
      );
    return (
      <span
        className={`${base} bg-gray-100 text-gray-700 border border-gray-200`}
      >
        {status}
      </span>
    );
  };

  const renderRecipesTab = () => (
    <div className="mt-5 space-y-5">
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="text-gray-400 text-lg" />
          </div>
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7a6e] transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#2d7a6e] block px-3 py-2 outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Shake">Shake</option>
            <option value="Snack">Snack</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#2d7a6e] block px-3 py-2 outline-none"
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="in-progress">In Progress</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-gray-800">Recipe List</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {filteredRecipes.length} recipe(s) found
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="py-3 px-6 font-semibold">Recipe</th>
                <th className="py-3 px-6 font-semibold">Category</th>
                <th className="py-3 px-6 font-semibold">Ingredients</th>
                <th className="py-3 px-6 font-semibold">Cost / Unit</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecipes.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6">
                    <div className="font-semibold text-gray-900">
                      {r.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">
                      {r.description}
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded border border-gray-200 text-xs font-medium text-gray-600 bg-white">
                      {r.category}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-gray-600">
                    {r.ingredientsCount || 0} items
                  </td>
                  <td className="py-3 px-6 text-gray-900 font-medium">
                    AED {(r.costPerUnit || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-6">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end items-center gap-3 text-xs font-semibold text-[#2d7a6e]">
                      <button
                        onClick={() => handleView(r)}
                        className="hover:underline hover:text-[#236359]"
                      >
                        View
                      </button>
                      <span className="text-gray-300 font-light">|</span>
                      <button
                        onClick={() => handleEdit(r)}
                        className="hover:underline hover:text-[#236359]"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300 font-light">|</span>
                      <button
                        onClick={() => handleDuplicate(r)}
                        className="hover:underline hover:text-[#236359]"
                      >
                        Duplicate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecipes.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No recipes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBatchesTab = () => (
    <div className="mt-5 space-y-5">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-gray-800">
              Batch Production
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Track and manage production batches
            </p>
          </div>
          <button
            onClick={() => setView("create-batch")}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2d7a6e] text-white text-sm font-medium px-4 py-2 hover:bg-[#236359] transition-colors shadow-sm"
          >
            <HiPlus className="text-lg" />
            New Batch
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="py-3 px-6 font-semibold">Batch Number</th>
                <th className="py-3 px-6 font-semibold">Recipe</th>
                <th className="py-3 px-6 font-semibold">Quantity</th>
                <th className="py-3 px-6 font-semibold">Production Date</th>
                <th className="py-3 px-6 font-semibold">Cost</th>
                <th className="py-3 px-6 font-semibold">Produced By</th>
                <th className="py-3 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 font-semibold text-[#2d7a6e]">
                    {b.batchNumber}
                  </td>
                  <td className="py-3 px-6 text-gray-900 font-medium">
                    {b.recipeName}
                  </td>
                  <td className="py-3 px-6 text-gray-600">
                    {b.batchSize != null ? `${b.batchSize} units` : "-"}
                  </td>
                  <td className="py-3 px-6 text-gray-600">
                    {b.productionDate || "-"}
                  </td>
                  <td className="py-3 px-6 text-gray-900 font-medium">
                    AED {(b.cost || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-6 text-gray-600">
                    {b.staff || "Unassigned"}
                  </td>
                  <td className="py-3 px-6">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No batches created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => {
    const topByProfit = [...recipes].sort(
      (a, b) => (b.profitMargin || 0) - (a.profitMargin || 0)
    );
    const categoryStats = recipes.reduce((map, r) => {
      if (!r.category) return map;
      if (!map[r.category]) map[r.category] = { totalCost: 0, count: 0 };
      map[r.category].totalCost += r.costPerUnit || 0;
      map[r.category].count += 1;
      return map;
    }, {});
    const categoryList = Object.entries(categoryStats);

    return (
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-800">
              Top Recipes by Profit Margin
            </h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {topByProfit.map((r, index) => (
              <li
                key={r.id}
                className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {r.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {r.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-600">
                    {(r.profitMargin || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    AED {(r.costPerUnit || 0).toFixed(2)}
                  </div>
                </div>
              </li>
            ))}
            {topByProfit.length === 0 && (
              <li className="px-6 py-4 text-sm text-gray-500">
                No recipe data for analytics.
              </li>
            )}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-800">
              Cost Distribution by Category
            </h3>
          </div>
          <div className="px-6 py-4 space-y-4">
            {categoryList.map(([category, data]) => {
              const avg = data.totalCost / data.count;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-gray-700">
                    <span>{category}</span>
                    <span className="text-gray-500 text-xs font-normal">
                      {data.count} recipe(s)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-[#2d7a6e] rounded-full"
                      style={{ width: `${Math.min(avg * 5, 100)}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    Total: AED {data.totalCost.toFixed(2)}
                  </div>
                </div>
              );
            })}
            {categoryList.length === 0 && (
              <p className="text-sm text-gray-500">
                No category data for analytics.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-[#f8f9fc] min-h-screen font-sans text-slate-800">
      <header className="px-8 py-4 bg-white border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Production / Recipes
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage recipes, ingredients, and batch production
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <HiPrinter className="text-lg text-gray-500" />
            Print Report
          </button>
          <button
            onClick={() => {
              setEditingRecipe(null);
              setView("create-recipe");
            }}
            className="flex items-center gap-2 rounded-lg bg-[#2d7a6e] text-white text-sm font-medium px-4 py-2 hover:bg-[#236359] transition-colors shadow-sm ring-1 ring-[#236359]/20"
          >
            <HiPlus className="text-lg" />
            Add Recipe
          </button>
        </div>
      </header>

      <main className="flex-1 px-8 py-6 space-y-6 max-w-[1920px] mx-auto w-full relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={HiOutlineDocumentText}
            label="Total Recipes"
            value={stats.totalRecipes}
            theme="blue"
          />
          <StatCard
            icon={HiOutlineCheckCircle}
            label="Active Recipes"
            value={stats.activeRecipes}
            theme="green"
          />
          <StatCard
            icon={HiOutlineCurrencyDollar}
            label="Avg. Cost/Unit"
            value={`AED ${stats.avgCost.toFixed(2)}`}
            theme="purple"
          />
          <StatCard
            icon={HiOutlineTrendingUp}
            label="Avg. Profit Margin"
            value={`${stats.avgProfit.toFixed(1)}%`}
            theme="orange"
          />
        </div>

        <div className="bg-white p-1 rounded-full flex items-center border border-gray-200 shadow-sm w-full">
          <TabButton id="recipes" label="Recipes" icon={HiOutlineCake} />
          <TabButton id="batches" label="Batch Production" icon={HiOutlineCube} />
          <TabButton
            id="analytics"
            label="Analytics"
            icon={HiOutlineChartBar}
          />
        </div>

        <div className="animate-fade-in">
          {activeTab === "recipes" && renderRecipesTab()}
          {activeTab === "batches" && renderBatchesTab()}
          {activeTab === "analytics" && renderAnalyticsTab()}
        </div>

        {/* RECIPE DETAIL MODAL */}
        {viewingRecipe && (
          <RecipeDetailModal
            recipe={viewingRecipe}
            onClose={() => setViewingRecipe(null)}
          />
        )}
      </main>
    </div>
  );
}

/* ====================================================================== */
/* Stat card                                                              */
/* ====================================================================== */

function StatCard({ icon: Icon, label, value, theme = "blue" }) {
  const themes = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    green: { bg: "bg-emerald-50", text: "text-emerald-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
    orange: { bg: "bg-orange-50", text: "text-orange-600" },
  };
  const currentTheme = themes[theme] || themes.blue;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-default group">
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
      </div>
      <div
        className={`w-10 h-10 rounded-xl ${currentTheme.bg} flex items-center justify-center transition-transform group-hover:scale-105`}
      >
        <Icon className={`text-xl ${currentTheme.text}`} />
      </div>
    </div>
  );
}

export default ProductionRecipie;
