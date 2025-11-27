// src/components/CreateOrEditBooking.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMembers } from "../api/member";
import { getTrainingClasses } from "../api/trainingApi";
import { addBooking, getBooking, updateBooking } from "../api/bookingApi";
import toast from "react-hot-toast";

const CreateOrEditBooking = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [sessions, setSessions] = useState([]);

  const loadedRef = useRef(false);

  const [form, setForm] = useState({
    memberId: "",
    trainingClassId: "",
    date: "",
    time: "",
    price: "",
    status: "pending",
    type: "",
  });

  useEffect(() => {
    // small guard to avoid double fetch on strict mode
    if (loadedRef.current) return;
    loadedRef.current = true;

    loadMembers();
    loadSessions();
    if (isEdit) loadBookingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMembers = async () => {
    try {
      const cached = sessionStorage.getItem("cached_members_v1");
      if (cached) {
        setMembers(JSON.parse(cached));
        return;
      }
      const data = await getMembers();
      setMembers(data);
      try { sessionStorage.setItem("cached_members_v1", JSON.stringify(data)); } catch {}
    } catch (err) {
      toast.error("Failed to load members");
    }
  };

  const loadSessions = async () => {
    try {
      const cached = sessionStorage.getItem("cached_classes_v1");
      if (cached) {
        setSessions(JSON.parse(cached));
        return;
      }

      const res = await getTrainingClasses();
      const arr = Array.isArray(res) ? res : (res.data ?? res);
      setSessions(arr);
      try { sessionStorage.setItem("cached_classes_v1", JSON.stringify(arr)); } catch {}
    } catch (err) {
      toast.error("Failed to load sessions");
    }
  };

  const loadBookingData = async () => {
    try {
      const { data } = await getBooking(id);
      setForm(data);
    } catch (err) {
      toast.error("Failed to load booking");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "trainingClassId") {
      const cls = sessions.find((c) => c.id == value);
      if (cls) {
        setForm((prev) => ({ ...prev, price: cls.price, type: cls.classType }));
      }
    }
  };

  const saveBooking = async () => {
    if (!form.memberId || !form.trainingClassId || !form.date || !form.time) {
      toast.error("All fields required");
      return;
    }

    try {
      if (isEdit) {
        await updateBooking(id, form);
        toast.success("Updated");
      } else {
        await addBooking(form);
        toast.success("Created");
      }
      navigate("/bookings");
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  };

  return (
    <div className="flex justify-center p-6">
      <div className="bg-white p-6 rounded shadow max-w-xl w-full">
        <h3 className="text-xl font-semibold mb-4">{isEdit ? "Edit Booking" : "New Booking"}</h3>

        <div className="space-y-4">
          <div>
            <label>Member</label>
            <select name="memberId" value={form.memberId} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstname} {m.lastname} (ID: {m.memberId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Session</label>
            <select name="trainingClassId" value={form.trainingClassId} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="">Select session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.className} — {s.trainerName} ({s.classType})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label>Time</label>
              <input type="time" name="time" value={form.time} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
          </div>

          <div>
            <label>Price</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked-in</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => navigate("/bookings")} className="px-4 py-2 border rounded">Cancel</button>
            <button onClick={saveBooking} className="px-4 py-2 bg-green-600 text-white rounded">{isEdit ? "Update" : "Create"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrEditBooking;
