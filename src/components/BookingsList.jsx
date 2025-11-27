// src/components/BookingsList.jsx
import { useEffect, useRef, useState } from "react";
import { getBookings, deleteBooking } from "../api/bookingApi";
import { getMembers } from "../api/member";
import { getTrainingClasses } from "../api/trainingApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/*
  Defensive Bookings list:
  - caches members/classes in sessionStorage to avoid re-fetching
  - logs mount count
  - uses skeleton instead of totally blank screen
  - removes Layout wrapper (assume router wraps with Layout)
*/

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [membersMap, setMembersMap] = useState({});
  const [classesMap, setClassesMap] = useState({});
  const [loading, setLoading] = useState(true);

  // debug mount counter
  const mountCount = useRef(0);
  mountCount.current += 1;
  console.log(`[BookingsList] mounted count: ${mountCount.current}`);

  // track first load to avoid double-fetch
  const firstLoaded = useRef(false);

  const navigate = useNavigate();

  // Avatar initials generator
  const getInitials = (name1, name2) => {
    const f = name1?.charAt(0)?.toUpperCase() || "";
    const l = name2?.charAt(0)?.toUpperCase() || "";
    return f + l;
  };

  // Badge for status
  const statusBadge = (status) => {
    const map = {
      "checked-in": "bg-green-100 text-green-700",
      confirmed: "bg-blue-100 text-blue-700",
      pending: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  useEffect(() => {
    // debug unmount
    return () => {
      console.log("[BookingsList] unmounted");
    };
  }, []);

  useEffect(() => {
    // Protect from accidental double-call (StrictMode dev double mount will still call but we'll short-circuit)
    if (firstLoaded.current) {
      console.log("[BookingsList] loadData skipped because already loaded this session");
      return;
    }
    loadData();
    // mark that we loaded once for this instance
    firstLoaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Try to reuse cached members & classes (sessionStorage) to avoid flashes
      let membersData = null;
      let classesData = null;

      try {
        const cachedMembers = sessionStorage.getItem("cached_members_v1");
        const cachedClasses = sessionStorage.getItem("cached_classes_v1");

        if (cachedMembers) {
          membersData = JSON.parse(cachedMembers);
        }
        if (cachedClasses) {
          classesData = JSON.parse(cachedClasses);
        }
      } catch (err) {
        // ignore parse errors
        console.warn("cache read failed", err);
      }

      // If either missing, fetch them; otherwise, fetch bookings only (fast)
      if (membersData && classesData) {
        // fetch only bookings
        const bRes = await getBookings();
        const memberMapObj = {};
        membersData.forEach((m) => (memberMapObj[m.id] = m));

        const classMapObj = {};
        classesData.forEach((c) => (classMapObj[c.id] = c));

        setMembersMap(memberMapObj);
        setClassesMap(classMapObj);
        setBookings(bRes.data || bRes);
      } else {
        // fetch all three in parallel
        const [bRes, mRes, cRes] = await Promise.all([
          getBookings(),
          getMembers(),
          getTrainingClasses(),
        ]);

        const membersArray = Array.isArray(mRes) ? mRes : (mRes.data ?? mRes);
        const classesArray = Array.isArray(cRes) ? cRes : (cRes.data ?? cRes);

        // cache them for subsequent mounts during the session
        try {
          sessionStorage.setItem("cached_members_v1", JSON.stringify(membersArray));
          sessionStorage.setItem("cached_classes_v1", JSON.stringify(classesArray));
        } catch (err) {
          console.warn("cache write failed", err);
        }

        const memberMapObj = {};
        membersArray.forEach((m) => (memberMapObj[m.id] = m));

        const classMapObj = {};
        classesArray.forEach((c) => (classMapObj[c.id] = c));

        setMembersMap(memberMapObj);
        setClassesMap(classMapObj);
        setBookings(bRes.data || bRes);
      }
    } catch (err) {
      console.error("loadData error", err);
      toast.error("Failed to load bookings");
    } finally {
      // small timeout to avoid flicker when UI updates very quickly
      setTimeout(() => setLoading(false), 80);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete booking?")) return;
    try {
      await deleteBooking(id);
      toast.success("Deleted successfully");
      // refresh list but keep cached members/classes
      loadData();
    } catch (err) {
      toast.error("Delete failed");
      console.error(err);
    }
  };

  // If still loading show small skeleton (avoid full blank)
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-semibold">Bookings Management</h1>
          <button className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium">+ New Booking</button>
        </div>

        <div className="bg-white shadow rounded-xl overflow-hidden p-6">
          {/* simple skeleton rows */}
          <div className="space-y-4">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
                </div>
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-semibold">Bookings Management</h1>
        <button
          onClick={() => navigate("/bookings/new")}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700"
        >
          + New Booking
        </button>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4">Session</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 w-32 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No bookings found
                </td>
              </tr>
            )}

            {bookings.map((b) => {
              const m = membersMap[b.memberId];
              const c = classesMap[b.trainingClassId];

              return (
                <tr key={b.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                        {getInitials(m?.firstname, m?.lastname)}
                      </div>

                      <div className="flex flex-col">
                        <span className="font-medium">
                          {m ? `${m.firstname} ${m.lastname}` : "Unknown"}
                        </span>
                        <span className="text-xs text-gray-500">ID: {m?.memberId || "N/A"}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{c?.className}</span>
                      <span className="text-xs text-gray-500">{c?.trainerName}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{b.date}</span>
                      <span className="text-xs text-gray-500">{b.time}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                      {c?.classType}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-medium">{(b.price || c?.price) + " AED"}</td>

                  <td className="px-6 py-4">{statusBadge(b.status)}</td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4">
                      <button className="text-gray-600 hover:text-gray-800" title="QR">
                        <i className="fa-solid fa-qrcode text-lg"></i>
                      </button>

                      <button
                        onClick={() => navigate(`/bookings/${b.id}/edit`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <i className="fa-solid fa-pen-to-square text-lg"></i>
                      </button>

                      <button
                        onClick={() => remove(b.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <i className="fa-solid fa-trash text-lg"></i>
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsList;
