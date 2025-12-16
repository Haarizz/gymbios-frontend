// src/components/AssetsTable.jsx
import React, { useState, useEffect, useRef } from "react";
import { Eye, Edit, Trash2, MoreVertical } from "lucide-react";

/**
 * AssetsTable
 * props:
 * - data: array of asset objects
 * - onView(asset)
 * - onEdit(asset)
 * - onMarkForDisposal(asset)
 * - onRevertDisposal(asset)
 * - onDelete(asset)
 */
export default function AssetsTable({
  data = [],
  onView = () => {},
  onEdit = () => {},
  onMarkForDisposal = () => {},
  onRevertDisposal = () => {},
  onDelete = () => {},
}) {
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpenMenuFor(null);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const toggleExpand = (assetId) => {
    setExpandedId((cur) => (cur === assetId ? null : assetId));
  };

  const safe = (v) => (v == null || v === "" ? "-" : v);

  return (
    <div className="bg-white rounded-lg border p-3" ref={containerRef}>
      <table className="min-w-full">
        <thead>
          <tr className="text-sm text-gray-600 border-b">
            <th className="py-3 text-left w-12"> </th>
            <th className="py-3 text-left">Asset Code</th>
            <th className="py-3 text-left">Asset & Model</th>
            <th className="py-3 text-left">Purchase Date</th>
            <th className="py-3 text-left">Cost</th>
            <th className="py-3 text-left">Current Location</th>
            <th className="py-3 text-left">Status</th>
            <th className="py-3 text-left">Current Value</th>
            <th className="py-3 text-left w-48">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-6 text-center text-gray-500">
                No assets to display.
              </td>
            </tr>
          ) : (
            data.map((a) => {
              // defensive defaults
              const id = a?.id ?? "__no_id__";
              const isExpanded = expandedId === id;
              const statusStr = String(a?.status || "").toLowerCase();
              const isDisposed = statusStr === "disposed";

              return (
                <React.Fragment key={id}>
                  <tr
                    className={`text-sm hover:bg-gray-50 cursor-pointer ${isExpanded ? "bg-gray-50" : ""}`}
                    onClick={(e) => {
                      const tag = e.target.tagName.toLowerCase();
                      if (["button", "svg", "path", "input"].includes(tag)) return;
                      toggleExpand(id);
                    }}
                  >
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        aria-label={`select ${id}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>

                    <td className="py-3 px-3 font-medium">{safe(a?.id)}</td>

                    <td className="py-3 px-3">
                      <div className="font-medium">{safe(a?.name)}</div>
                      <div className="text-xs text-gray-500">{safe(a?.model)}</div>
                    </td>

                    <td className="py-3 px-3">{safe(a?.purchaseDate)}</td>
                    <td className="py-3 px-3">{safe(a?.cost)}</td>
                    <td className="py-3 px-3 text-gray-600">{safe(a?.location)}</td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isDisposed
                            ? "bg-rose-100 text-rose-700"
                            : (a?.status || "").toLowerCase().includes("in use")
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {a?.status || "-"}
                      </span>
                    </td>

                    <td className="py-3 px-3">{safe(a?.currentValue)}</td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 justify-end relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            try { onView(a); } catch (err) { console.error(err); }
                          }}
                          className="p-1 rounded hover:bg-gray-100"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            try { onEdit(a); } catch (err) { console.error(err); }
                          }}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            try { onDelete(a); } catch (err) { console.error(err); }
                          }}
                          className="p-1 rounded hover:bg-gray-100 text-rose-600"
                          title="Delete"
                          aria-label={`Delete ${id}`}
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuFor(openMenuFor === id ? null : id);
                            }}
                            className="p-1 rounded hover:bg-gray-100"
                            title="More"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {openMenuFor === id && (
                            <div
                              className="absolute right-0 mt-2 w-52 bg-white border rounded shadow-lg z-50"
                              role="menu"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ul className="divide-y">
                                <li>
                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">View History</button>
                                </li>
                                <li>
                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">QR Scan</button>
                                </li>
                                <li>
                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Transfer Asset</button>
                                </li>
                                <li>
                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Schedule Maintenance</button>
                                </li>

                                {!isDisposed ? (
                                  <li>
                                    <button
                                      onClick={() => {
                                        setOpenMenuFor(null);
                                        try { onMarkForDisposal(a); } catch (err) { console.error(err); }
                                      }}
                                      className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-gray-50"
                                    >
                                      Mark for Disposal
                                    </button>
                                  </li>
                                ) : (
                                  <li>
                                    <button
                                      onClick={() => {
                                        setOpenMenuFor(null);
                                        try { onRevertDisposal(a); } catch (err) { console.error(err); }
                                      }}
                                      className="w-full text-left px-3 py-2 text-sm text-emerald-700 hover:bg-gray-50"
                                    >
                                      Revert Disposal
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={9} className="bg-gray-50 px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white border rounded p-4">
                            <div className="text-sm font-medium mb-3">Warranty & Maintenance</div>
                            <div className="text-xs text-gray-500 mb-2">Warranty Expiry:</div>
                            <div className="font-medium">{safe(a?.warrantyExpiry)}</div>
                            <div className="text-xs text-gray-500 mt-3">Next Maintenance:</div>
                            <div className="font-medium">{safe(a?.maintenanceDate || a?.nextMaintenance || "N/A")}</div>
                            <div className="text-xs text-gray-500 mt-3">Condition:</div>
                            <div className="inline-flex items-center gap-2">
                              <div className="font-medium">{safe(a?.condition)}</div>
                            </div>
                          </div>

                          <div className="bg-white border rounded p-4">
                            <div className="text-sm font-medium mb-3">Financial Details</div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <div>Purchase Price:</div>
                              <div className="font-medium">{safe(a?.cost)}</div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                              <div>Current Value:</div>
                              <div className="font-medium">{safe(a?.currentValue)}</div>
                            </div>
                          </div>

                          <div className="bg-white border rounded p-4">
                            <div className="text-sm font-medium mb-3">Usage & Performance</div>
                            <div className="text-xs text-gray-500">Serial Number:</div>
                            <div className="font-medium">{safe(a?.serial)}</div>
                            <div className="text-xs text-gray-500 mt-3">Vendor:</div>
                            <div className="font-medium">{safe(a?.vendor)}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}