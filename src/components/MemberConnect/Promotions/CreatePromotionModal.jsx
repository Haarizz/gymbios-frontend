import React, { useEffect, useState } from "react";
import { createPromotion, getPromotion, updatePromotion } from "../../../api/promotionApi";
import toast from "react-hot-toast";

const emptyForm = {
  promotionName: "",
  promotionType: "",
  description: "",
  startDate: "",
  endDate: "",
  category: "",
  promotionCode: "",

  discountType: "",
  discountValue: "",            // kept as string in UI, converted before send
  minimumPurchase: "",
  maximumDiscount: "",
  totalUsageLimit: "",
  usageLimitPerMember: "",

  targetAudience: "",
  distributionChannels: {
    website: false,
    mobileApp: false,
    email: false,
    sms: false,
    inPerson: false,
  },
  applicablePlans: {
    standardMonthly: false,
    premiumMonthly: false,
    standardAnnual: false,
    premiumAnnual: false,
  },

  priorityLevel: "",
  autoApplyAtCheckout: false,
  canBeCombined: false,
  publiclyVisible: false,
  termsAndConditions: "",
  tags: "",
  status: "Scheduled",
};

// Convert API date to yyyy-mm-dd (for <input type="date">)
function convertDate(d) {
  if (!d) return "";
  try {
    const dt = new Date(d);
    return dt.toISOString().split("T")[0];
  } catch {
    return "";
  }
}
// toISO: return yyyy-mm-dd (backend accepts this)
function toISO(yyyymmdd) {
  if (!yyyymmdd) return null;
  return yyyymmdd;
}

export default function CreatePromotionModal({
  mode = "create",
  promotionId = null,
  onClose,
  onSaved,
}) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(emptyForm);
  const [activeTab, setActiveTab] = useState("Basic Info");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const data = await getPromotion(promotionId);

        setForm({
          ...emptyForm,
          promotionName: data.promotionName || "",
          promotionType: data.promotionType || "",
          description: data.description || "",
          startDate: convertDate(data.startDate),
          endDate: convertDate(data.endDate),
          category: data.category || "",
          promotionCode: data.promotionCode || "",
          discountType: data.discountType || "",
          discountValue: data.discountValue != null ? String(data.discountValue) : "",
          minimumPurchase: data.minimumPurchase != null ? String(data.minimumPurchase) : "",
          maximumDiscount: data.maximumDiscount != null ? String(data.maximumDiscount) : "",
          totalUsageLimit: data.totalUsageLimit != null ? String(data.totalUsageLimit) : "",
          usageLimitPerMember: data.usageLimitPerMember != null ? String(data.usageLimitPerMember) : "",
          targetAudience: data.targetAudience || "",
          distributionChannels: {
            website: data.distributionChannels?.includes("Website"),
            mobileApp: data.distributionChannels?.includes("Mobile App"),
            email: data.distributionChannels?.includes("Email"),
            sms: data.distributionChannels?.includes("SMS"),
            inPerson: data.distributionChannels?.includes("In-Person"),
          },
          applicablePlans: {
            standardMonthly: data.applicablePlans?.includes("Standard Monthly"),
            premiumMonthly: data.applicablePlans?.includes("Premium Monthly"),
            standardAnnual: data.applicablePlans?.includes("Standard Annual"),
            premiumAnnual: data.applicablePlans?.includes("Premium Annual"),
          },
          priorityLevel: data.priorityLevel || "",
          autoApplyAtCheckout: data.autoApplyAtCheckout || false,
          canBeCombined: data.canBeCombined || false,
          publiclyVisible: data.publiclyVisible || false,
          termsAndConditions: data.termsAndConditions || "",
          tags: data.tags?.join(", ") || "",
          status: data.status || "Scheduled",
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load promotion");
        onClose();
      }
    })();
  }, [isEdit, promotionId]); // added dependencies

  const updateField = (e) => {
    const { name, value, type } = e.target;
    // allow multi-word text for text/textarea; for number inputs we still keep string but restrict input via type="number"
    setForm((f) => ({ ...f, [name]: value }));
  };

  const updateCheckbox = (group, field, value) => {
    setForm((f) => ({
      ...f,
      [group]: { ...f[group], [field]: value },
    }));
  };

  const sanitizeNumber = (val) => {
    if (val === "" || val == null) return null;
    const n = Number(String(val).replace(/[^\d.-]/g, ""));
    return Number.isNaN(n) ? null : n;
  };

  const savePromotion = async (action) => {
    setSaving(true);

    const payload = {
      ...form,
      // convert date and numeric fields properly
      startDate: toISO(form.startDate),
      endDate: toISO(form.endDate),
      discountValue: sanitizeNumber(form.discountValue),
      minimumPurchase: sanitizeNumber(form.minimumPurchase),
      maximumDiscount: sanitizeNumber(form.maximumDiscount),
      totalUsageLimit: sanitizeNumber(form.totalUsageLimit),
      usageLimitPerMember: sanitizeNumber(form.usageLimitPerMember),
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      distributionChannels: Object.entries(form.distributionChannels)
        .filter(([, v]) => v)
        .map(([k]) =>
          ({
            website: "Website",
            mobileApp: "Mobile App",
            email: "Email",
            sms: "SMS",
            inPerson: "In-Person",
          }[k])
        ),
      applicablePlans: Object.entries(form.applicablePlans)
        .filter(([, v]) => v)
        .map(([k]) =>
          ({
            standardMonthly: "Standard Monthly",
            premiumMonthly: "Premium Monthly",
            standardAnnual: "Standard Annual",
            premiumAnnual: "Premium Annual",
          }[k])
        ),
      status: action === "draft" ? "Draft" : form.status,
    };

    try {
      if (isEdit) await updatePromotion(promotionId, payload);
      else await createPromotion(payload);

      toast.success(isEdit ? "Updated" : "Created");
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const Label = ({ children }) => (
    <label className="text-xs text-gray-600 font-medium">{children}</label>
  );

  const Input = ({ name, value, placeholder, onChange, type = "text" }) => (
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 border rounded-lg bg-gray-50 mt-1 text-sm focus:border-teal-500 focus:ring-teal-500"
    />
  );

  const Select = ({ name, value, onChange, children }) => (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border rounded-lg bg-gray-50 mt-1 text-sm focus:border-teal-500 focus:ring-teal-500"
    >
      {children}
    </select>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        {/* header */}
        <div className="px-6 pt-6 pb-4 border-b flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Promotion" : "Create New Promotion"}
            </h2>
            <p className="text-xs text-gray-500 mt-1">Design and configure a new promotional campaign</p>
          </div>
          <button className="text-xl text-gray-500 hover:text-gray-800" onClick={onClose}>×</button>
        </div>

        {/* tabs */}
        <div className="px-6 py-4 border-b">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            {["Basic Info", "Discount", "Targeting", "Settings"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                  activeTab === t
                    ? "bg-white shadow-sm text-teal-600 border border-gray-200"
                    : "text-gray-600 hover:text-teal-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-6 max-h-[470px] overflow-y-auto">
          {activeTab === "Basic Info" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Promotion Name</Label>
                <Input name="promotionName" placeholder="Enter promotion name" value={form.promotionName} onChange={updateField} />
              </div>

              <div>
                <Label>Promotion Type</Label>
                <Select name="promotionType" value={form.promotionType} onChange={updateField}>
                  <option value="">Select type</option>
                  <option value="Combo">Combo</option>
                  <option value="Seasonal">Seasonal</option>
                  <option value="Loyalty">Loyalty</option>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label>Description</Label>
                <textarea name="description" value={form.description} onChange={updateField} placeholder="Describe your promotion"
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 mt-1 text-sm min-h-[90px] focus:border-teal-500 focus:ring-teal-500" />
              </div>

              <div>
                <Label>Start Date</Label>
                <Input name="startDate" type="date" value={form.startDate} onChange={updateField} />
              </div>

              <div>
                <Label>End Date</Label>
                <Input name="endDate" type="date" value={form.endDate} onChange={updateField} />
              </div>

              <div>
                <Label>Category</Label>
                <Select name="category" value={form.category} onChange={updateField}>
                  <option value="">Select category</option>
                  <option value="Membership">Membership</option>
                  <option value="Product">Product</option>
                </Select>
              </div>

              <div>
                <Label>Promotion Code (Optional)</Label>
                <Input name="promotionCode" placeholder="e.g., NEWYEAR2024" value={form.promotionCode} onChange={updateField} />
              </div>
            </div>
          )}

          {activeTab === "Discount" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <Select name="discountType" value={form.discountType} onChange={updateField}>
                  <option value="">Select type</option>
                  <option value="Percentage">Percentage</option>
                  <option value="FixedAmount">Fixed Amount</option>
                  <option value="BOGO">Buy One Get One</option>
                </Select>
              </div>

              <div>
                <Label>Discount Value</Label>
                {/* numeric input, but kept as string in state; sanitized before sending */}
                <Input name="discountValue" type="number" placeholder="Enter value" value={form.discountValue} onChange={updateField} />
              </div>

              <div>
                <Label>Minimum Purchase (AED)</Label>
                <Input name="minimumPurchase" type="number" placeholder="Optional" value={form.minimumPurchase} onChange={updateField} />
              </div>

              <div>
                <Label>Maximum Discount (AED)</Label>
                <Input name="maximumDiscount" type="number" placeholder="Optional" value={form.maximumDiscount} onChange={updateField} />
              </div>

              <div>
                <Label>Total Usage Limit</Label>
                <Input name="totalUsageLimit" type="number" placeholder="Leave empty for unlimited" value={form.totalUsageLimit} onChange={updateField} />
              </div>

              <div>
                <Label>Usage Limit Per Member</Label>
                <Input name="usageLimitPerMember" type="number" placeholder="Leave empty for unlimited" value={form.usageLimitPerMember} onChange={updateField} />
              </div>
            </div>
          )}

          {activeTab === "Targeting" && (
            <div className="space-y-4">
              <div>
                <Label>Target Audience</Label>
                <Select name="targetAudience" value={form.targetAudience} onChange={updateField}>
                  <option value="">Select</option>
                  <option value="All">All</option>
                  <option value="NewMembers">New Members</option>
                  <option value="VIP">VIP</option>
                </Select>
              </div>

              <div>
                <Label>Distribution Channels</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  {[
                    ["website", "Website"],
                    ["mobileApp", "Mobile App"],
                    ["email", "Email"],
                    ["sms", "SMS"],
                    ["inPerson", "In-Person"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input type="checkbox" checked={form.distributionChannels[key]} onChange={(e) => updateCheckbox("distributionChannels", key, e.target.checked)} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Applicable Plans</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  {[
                    ["standardMonthly", "Standard Monthly"],
                    ["premiumMonthly", "Premium Monthly"],
                    ["standardAnnual", "Standard Annual"],
                    ["premiumAnnual", "Premium Annual"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input type="checkbox" checked={form.applicablePlans[key]} onChange={(e) => updateCheckbox("applicablePlans", key, e.target.checked)} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Settings" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Priority Level</Label>
                  <Select name="priorityLevel" value={form.priorityLevel} onChange={updateField}>
                    <option value="">Select priority</option>
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </Select>
                </div>

                <div className="space-y-2 text-sm pt-2">
                  <label className="flex gap-2 items-center">
                    <input type="checkbox" checked={form.autoApplyAtCheckout} onChange={(e) => setForm({ ...form, autoApplyAtCheckout: e.target.checked })} />
                    Auto-apply at checkout
                  </label>

                  <label className="flex gap-2 items-center">
                    <input type="checkbox" checked={form.canBeCombined} onChange={(e) => setForm({ ...form, canBeCombined: e.target.checked })} />
                    Can be combined with other promotions
                  </label>

                  <label className="flex gap-2 items-center">
                    <input type="checkbox" checked={form.publiclyVisible} onChange={(e) => setForm({ ...form, publiclyVisible: e.target.checked })} />
                    Publicly visible
                  </label>
                </div>
              </div>

              <div>
                <Label>Terms & Conditions</Label>
                <textarea name="termsAndConditions" value={form.termsAndConditions} onChange={updateField} placeholder="Enter terms and conditions" className="w-full px-4 py-3 border rounded-lg bg-gray-50 mt-1 text-sm min-h-[100px]" />
              </div>

              <div>
                <Label>Tags (comma separated)</Label>
                <Input name="tags" placeholder="e.g., summer, fitness, sale" value={form.tags} onChange={updateField} />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">Cancel</button>
          <button onClick={() => savePromotion("draft")} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">Save as Draft</button>
          <button onClick={() => savePromotion("publish")} disabled={saving} className={`px-6 py-2 rounded-lg text-white font-medium ${saving ? "bg-teal-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"}`}>
            {saving ? "Saving..." : isEdit ? "Update Promotion" : "Create Promotion"}
          </button>
        </div>
      </div>
    </div>
  );
}
