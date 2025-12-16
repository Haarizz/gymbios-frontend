// src/pages/automations/components/CreateAutomationModal.jsx
import React, { useEffect, useState } from "react";
import { createAutomation, listTemplates } from "../../../api/automationsApi";
// Assuming lucide-react or similar for icons to match the UI.
import {
    CreditCard, Users, Dumbbell, Cake, Mail, MessageSquare, Phone, Bell, Clock, ListPlus,
} from 'lucide-react'; 

// Helper component for Trigger card icons/layout
const TriggerIcon = ({ id, label }) => {
    let Icon;
    let tag = '';
    let tagBg = 'bg-gray-200';
    let tagText = 'text-gray-700';
    
    // Assign icons and tags based on IDs to match the screenshot layout
    switch (id) {
        case "MEMBERSHIP_EXPIRY": Icon = CreditCard; tag = 'Membership'; break;
        case "NEW_MEMBER_SIGNUP": Icon = Users; tag = 'Membership'; break;
        case "MISSED_WORKOUT": Icon = Dumbbell; tag = 'Engagement'; break;
        case "MEMBER_BIRTHDAY": Icon = Cake; tag = 'Birthday'; break;
        case "PAYMENT_FAILED": Icon = CreditCard; tag = 'Financial'; tagBg = 'bg-red-100'; tagText = 'text-red-700'; break;
        default: Icon = Clock;
    }
    
    return (
        <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Icon size={24} />
            </div>
            {tag && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagBg} ${tagText}`}>
                    {tag}
                </span>
            )}
        </div>
    );
};

// Helper component for Action button icons/layout
const ActionIcon = ({ id }) => {
    let Icon;
    switch (id) {
        case "SEND_EMAIL": Icon = Mail; break;
        case "SEND_SMS": Icon = MessageSquare; break;
        case "SEND_WHATSAPP": Icon = Phone; break;
        case "PUSH_NOTIFICATION": Icon = Bell; break;
        case "IN_APP": Icon = Bell; break; // Reusing Bell as a placeholder for In-App
        case "CREATE_TASK": Icon = ListPlus; break;
        default: Icon = Clock;
    }
    return <Icon size={24} className="mb-2 text-gray-700" />;
};


const TRIGGERS = [
  { id: "MEMBERSHIP_EXPIRY", label: "Membership Expiry", desc: "membership is about to expire" },
  { id: "NEW_MEMBER_SIGNUP", label: "New Member Signup", desc: "when a new member joins" },
  { id: "MISSED_WORKOUT", label: "Missed Workout", desc: "when member misses scheduled workouts" },
  { id: "MEMBER_BIRTHDAY", label: "Member Birthday", desc: "on member's birthday" },
  { id: "PAYMENT_FAILED", label: "Payment Failed", desc: "on payment failure" }
];

const ACTIONS = [
  { id: "SEND_EMAIL", label: "Send Email" },
  { id: "SEND_SMS", label: "Send SMS" },
  { id: "SEND_WHATSAPP", label: "Send WhatsApp" },
  { id: "PUSH_NOTIFICATION", label: "Push Notification" },
  { id: "IN_APP", label: "In-App Notification" },
  { id: "CREATE_TASK", label: "Create Task" }
];

export default function CreateAutomationModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("ONCE_PER_MEMBER");
  const [trigger, setTrigger] = useState(null);
  const [actions, setActions] = useState([]);
  const [templateId, setTemplateId] = useState(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [templates, setTemplates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Determine if content fields should be visible (if an action requires content)
  const isContentAction = actions.some(id => 
      id === 'SEND_EMAIL' || id === 'SEND_SMS' || id === 'SEND_WHATSAPP' || id === 'PUSH_NOTIFICATION' || id === 'IN_APP'
  );

  useEffect(() => {
    listTemplates().then(t => setTemplates(t || [])).catch(()=>setTemplates([]));
  }, []);

  function toggleAction(id) {
    setActions(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  async function handleSubmit() {
    setError("");
    if (!name) { setError("Workflow Name is required"); return; }
    if (!trigger) { setError("Select a trigger"); return; }
    if (!actions.length) { setError("Select at least one action"); return; }
    // Basic validation for content if a communication action is selected
    if (isContentAction && !content) { setError("Message content is required for selected actions"); return; }


    const payload = {
      name,
      description,
      trigger,
      actions,
      templateId: templateId || undefined,
      subject,
      content,
      frequency,
      active: true
    };

    try {
      setSubmitting(true);
      await createAutomation(payload);
      setSubmitting(false);
      onClose?.();
    } catch (e) {
      setSubmitting(false);
      setError("Failed to create automation. Please try again.");
      console.error(e);
    }
  }
    
  // Helper to check if Next button should be disabled for current step based on required fields
  const isNextDisabled = () => {
    switch(step) {
      case 1:
        return !name;
      case 2:
        return !trigger;
      case 3:
        return !actions.length;
      default:
        return false;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose?.()} />
      {/* Increased max-w-2xl to max-w-lg for a slightly narrower modal that matches the screenshot */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow-2xl p-6 overflow-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h3 className="text-xl font-medium text-gray-800">Create Automation Workflow</h3>
          <button onClick={() => onClose?.()} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="py-6 flex justify-between items-center gap-2">
          {[1,2,3,4].map(s => (
                <React.Fragment key={s}>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-semibold ${s <= step ? "bg-emerald-600" : "bg-gray-300"}`}>
                        {s}
                    </div>
                    {s < 4 && <div className={`flex-1 h-0.5 ${s < step ? "bg-emerald-600" : "bg-gray-300"}`}/>}
                </React.Fragment>
          ))}
        </div>
        
        {/* Step Content */}
        <div className="min-h-[300px] pt-2 pb-6">
            <p className="text-gray-500 mb-6">Set up an automated workflow to engage with your members</p>

            {step === 1 && (
              <div>
                <h4 className="text-lg font-semibold mb-1">Step 1: Basic Information</h4>
                <p className="text-gray-500 mb-4">Give your automation a name and description.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block">Workflow Name</label>
                    <input value={name} onChange={e=>setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Enter workflow name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block">Description</label>
                    <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Describe what this automation does" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block">Frequency</label>
                    <select value={frequency} onChange={e=>setFrequency(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-emerald-500 focus:border-emerald-500">
                      <option value="ONCE_PER_MEMBER">Once per member</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h4 className="text-lg font-semibold mb-1">Step 2: Select Trigger</h4>
                <p className="text-gray-500 mb-4">Choose what event will start this automation</p>
                <div className="grid grid-cols-2 gap-4">
                  {TRIGGERS.map(t => (
                    <div key={t.id} onClick={()=>setTrigger(t.id)} className={`p-4 border rounded-lg cursor-pointer transition-all ${trigger===t.id ? "border-emerald-600 ring-2 ring-emerald-100 bg-emerald-50" : "hover:border-gray-400 bg-white"}`}>
                          <TriggerIcon id={t.id} label={t.label} />
                      <div className="font-medium text-gray-800">{t.label}</div>
                      <div className="text-xs text-gray-500 mt-1">Trigger when {t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h4 className="text-lg font-semibold mb-1">Step 3: Define Action</h4>
                <p className="text-gray-500 mb-4">Choose what happens when the trigger fires</p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {ACTIONS.map(a => (
                    <button key={a.id} type="button" onClick={()=>toggleAction(a.id)}
                      className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${actions.includes(a.id) ? "border-emerald-600 ring-2 ring-emerald-100 bg-emerald-50" : "hover:border-gray-400 bg-white"}`}>
                        <ActionIcon id={a.id} />
                      <div className="text-sm font-medium text-gray-800 mt-1">{a.label}</div>
                    </button>
                  ))}
                </div>

                {isContentAction && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block">Choose Template (optional)</label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-emerald-500 focus:border-emerald-500" value={templateId || ""} onChange={e=>setTemplateId(e.target.value || null)}>
                      <option value="">-- choose template --</option>
                      {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block">Subject</label>
                    <input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Message subject (for email/whatsapp)" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block">Content</label>
                    <textarea value={content} onChange={e=>setContent(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Message content" rows={5}/>
                  </div>
                </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <h4 className="text-lg font-semibold mb-1">Step 4: Review & Save</h4>
                <p className="text-gray-500 mb-4">Review your automation workflow before saving</p>
                <div className="bg-gray-50 p-4 rounded-lg border space-y-3 text-sm text-gray-800">
                  {/* Finding the full labels for Trigger and Actions */}
                  <ReviewItem label="Workflow Name" value={name || '—'} />
                  <ReviewItem label="Description" value={description || '—'} />
                  <ReviewItem 
                      label="Trigger" 
                      value={TRIGGERS.find(t=>t.id===trigger)?.label || '—'} 
                  />
                  <ReviewItem 
                      label="Action" 
                      value={actions.map(id => ACTIONS.find(a=>a.id===id)?.label).join(" / ") || '—'} 
                  />
                  <ReviewItem 
                      label="Frequency" 
                      value={frequency.replace(/_/g, ' ').toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ') || '—'} 
                  />
                  {isContentAction && (
                    <>
                      <ReviewItem 
                          label="Template" 
                          value={templates.find(t=>t.id===templateId)?.title || '—'} 
                      />
                      <ReviewItem label="Subject" value={subject || '—'} />
                      <ReviewItem label="Content" value={content || '—'} isPreFormatted={true} />
                    </>
                  )}
                </div>
              </div>
            )}
        </div>
        
        {/* Footer */}
        {error && <div className="text-red-600 font-medium text-center mt-3">{error}</div>}

        <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-200">
          <div>
            <button disabled={step === 1} onClick={() => setStep(s => Math.max(1, s - 1))} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Previous
            </button>
            <button onClick={() => onClose?.()} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 ml-2 transition-colors">
                Cancel
            </button>
          </div>

          <div>
            {step < 4 ? (
              <button 
                  disabled={isNextDisabled()}
                  onClick={() => setStep(s => Math.min(4, s + 1))} 
                  className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${isNextDisabled() ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                Next
              </button>
            ) : (
              <button 
                  disabled={submitting} 
                  onClick={handleSubmit} 
                  className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${submitting ? 'bg-emerald-400 cursor-wait' : 'bg-emerald-700 hover:bg-emerald-800'}`}
              >
                {submitting ? "Saving..." : "Save Automation"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for Step 4 review section
const ReviewItem = ({ label, value, isPreFormatted = false }) => (
    <div className="flex items-start">
        <div className="w-1/3 font-medium text-gray-900">{label}</div>
        <div className="w-2/3">
            {isPreFormatted ? (
                <div className="whitespace-pre-wrap">{value}</div>
            ) : (
                <div className="capitalize">{value}</div>
            )}
        </div>
    </div>
);