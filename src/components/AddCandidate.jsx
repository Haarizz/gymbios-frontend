import { useEffect, useState } from "react";
import { getJobOpenings, addCandidate } from "../api/recruitment";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AddCandidate() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    currentRole: "",
    experience: "",
    skills: "",
    location: "",
    score: "",
    stage: "applied",
    jobId: "",
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobIdFromUrl = searchParams.get("jobId");

  useEffect(() => {
    getJobOpenings()
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.jobs || [];
        setJobs(data);
      })
      .catch(() => setJobs([]));
  }, []);

  useEffect(() => {
    if (jobIdFromUrl) {
      setForm((prev) => ({ ...prev, jobId: jobIdFromUrl }));
    }
  }, [jobIdFromUrl]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.email || !form.phone || !form.jobId) {
      toast.error("Name, Email, Phone, and Job are required");
      return;
    }

    try {
      await addCandidate(form.jobId, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        currentRole: form.currentRole,
        experience: form.experience,
        skills: form.skills,
        location: form.location,
        score: form.score,
        stage: form.stage,
      });

      toast.success("Candidate added successfully");
      navigate(`/recruitment/job/${form.jobId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add candidate");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Add Candidate</h2>

      <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full border p-2 mb-3" />
      <input name="email" placeholder="Email" onChange={handleChange} className="w-full border p-2 mb-3" />
      <input name="phone" placeholder="Phone" onChange={handleChange} className="w-full border p-2 mb-3" />
      <input name="currentRole" placeholder="Current Role" onChange={handleChange} className="w-full border p-2 mb-3" />
      <input name="location" placeholder="Location" onChange={handleChange} className="w-full border p-2 mb-3" />

      <textarea name="experience" placeholder="Experience Summary" onChange={handleChange} className="w-full border p-2 mb-3" rows={3} />

      <input name="skills" placeholder="Skills (comma separated)" onChange={handleChange} className="w-full border p-2 mb-3" />
      <input type="number" name="score" placeholder="Candidate Score (optional)" onChange={handleChange} className="w-full border p-2 mb-3" />

      <select name="stage" value={form.stage} onChange={handleChange} className="w-full border p-2 mb-3">
        <option value="applied">Applied</option>
        <option value="shortlisted">Shortlisted</option>
        <option value="interviewed">Interviewed</option>
        <option value="offered">Offered</option>
        <option value="hired">Hired</option>
      </select>

      <select name="jobId" value={form.jobId} onChange={handleChange} className="w-full border p-2 mb-4">
        <option value="">Select Job</option>
        {jobs.map((j) => (
          <option key={j.id} value={j.id}>
            {j.title}
          </option>
        ))}
      </select>

      {/* ✅ BUTTON ROW */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 border rounded text-gray-600"
        >
          Cancel
        </button>

        <button
          onClick={submit}
          className="bg-[#236b6b] text-white px-6 py-2 rounded"
        >
          Apply Candidate
        </button>
      </div>
    </div>
  );
}
