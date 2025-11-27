import { useEffect, useState } from "react";
import { createTrainingClass } from "../api/trainingApi";
import { getStaff } from "../api/staff";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CreateTrainingClass = () => {
  const navigate = useNavigate();

  const [trainers, setTrainers] = useState([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);

  const [form, setForm] = useState({
    className: "",
    classType: "",
    trainer: "",   // <-- FIXED (backend expects "trainer")
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    capacity: "",
    status: "active",
  });

  useEffect(() => {
    const loadTrainers = async () => {
      try {
        const data = await getStaff(); // returns array
        setTrainers(data);
      } catch (err) {
        toast.error("Failed to load trainers");
      } finally {
        setLoadingTrainers(false);
      }
    };

    loadTrainers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (!form.className || !form.classType || !form.trainer) {
        toast.error("Please fill all required fields");
        return;
      }

      await createTrainingClass(form);

      toast.success("Class created successfully!");
      navigate("/classes");
    } catch (err) {
      console.log(err);
      toast.error("Error creating class");
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">Add New Class</h2>

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <label>
          <span className="text-sm text-gray-700">Class Name</span>
          <input
            name="className"
            value={form.className}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            placeholder="Morning Yoga Flow"
            required
          />
        </label>

        <label>
          <span className="text-sm text-gray-700">Class Type</span>
          <select
            name="classType"
            value={form.classType}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          >
            <option value="">Select Type</option>
            <option value="Yoga">Yoga</option>
            <option value="Strength Training">Strength Training</option>
            <option value="Martial Arts">Martial Arts</option>
            <option value="Cardio">Cardio</option>
          </select>
        </label>

        <label>
          <span className="text-sm text-gray-700">Trainer</span>
          {loadingTrainers ? (
            <div className="text-gray-500 italic">Loading...</div>
          ) : (
            <select
              name="trainer"
              value={form.trainer}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            >
              <option value="">Select Trainer</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.firstname + " " + t.lastname}>
                  {t.firstname} {t.lastname}
                </option>
              ))}
            </select>
          )}
        </label>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        <label>
          <span className="text-sm text-gray-700">Date</span>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />
        </label>

        <label>
          <span className="text-sm text-gray-700">Start Time</span>
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />
        </label>

        <label>
          <span className="text-sm text-gray-700">End Time</span>
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />
        </label>

        <label>
          <span className="text-sm text-gray-700">Location</span>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            placeholder="Studio A"
          />
        </label>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-2 mt-6">
        <label>
          <span className="text-sm text-gray-700">Capacity</span>
          <input
            type="number"
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />
        </label>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-green-700 text-white rounded-lg"
        >
          Save Class
        </button>

        <button
          onClick={() => navigate("/classes")}
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateTrainingClass;
