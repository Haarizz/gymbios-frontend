import React, { useEffect, useState } from "react";
import { getCategory, updateCategory } from "../api/category";
import { useNavigate, useParams } from "react-router-dom";

export default function EditCategoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryNumber: ""
  });

  useEffect(() => {
    getCategory(id).then((res) => {
      setForm(res.data);
    });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await updateCategory(id, form);
    navigate("/categories");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Category</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded shadow p-6 grid grid-cols-2 gap-6"
      >
        <div>
          <label className="block text-sm mb-1 font-semibold">Category Name *</label>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-semibold">Category No</label>
          <input
            name="categoryNumber"
            value={form.categoryNumber}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm mb-1 font-semibold">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            rows="4"
          ></textarea>
        </div>

        <div className="col-span-2">
          <button className="bg-teal-600 text-white px-6 py-2 rounded">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
