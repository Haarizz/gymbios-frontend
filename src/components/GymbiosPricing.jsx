import React, { useState } from "react";
import { 
  Check, Phone, Mail, MessageSquare, ArrowRight, Shield, 
  Smartphone, Globe, Users, BarChart3, Headphones, 
  Zap, Star, CheckCircle, ArrowLeft, MapPin, Settings, Target, X, Loader2
} from "lucide-react";

// --- IMPORT API FUNCTION ---
import { submitOnboarding } from "../api/GymBiosApi";

// --- MAIN WRAPPER COMPONENT ---
export default function GymBiosPricingApp() {
  const [view, setView] = useState("pricing"); // 'pricing' | 'onboarding'

  return (
    <>
      {view === "pricing" ? (
        <PricingView onStartTrial={() => setView("onboarding")} />
      ) : (
        <OnboardingFlow onBackToPricing={() => setView("pricing")} />
      )}
    </>
  );
}

// ============================================================================
// 1. PRICING VIEW
// ============================================================================
function PricingView({ onStartTrial }) {
  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="max-w-7xl mx-auto pt-16 pb-12 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
          <div className="bg-[#0F5156] p-1 rounded-full"><Zap size={12} className="text-white" /></div>
          <span className="text-sm font-medium text-gray-600">GymBios • Business Operating System for Fitness</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          Simple, scalable pricing for <br />
          <span className="text-[#0F5156]">modern fitness businesses</span>
        </h1>
        
        <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-10">
          Choose the plan that matches your stage — from single-site gyms to enterprise fitness brands with multiple locations.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {["No setup fees for most gyms", "Free guided onboarding", "Cancel or upgrade as you grow", "Secure & cloud-hosted"].map((feat, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              <CheckCircle size={14} className="text-emerald-500" />
              {feat}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button onClick={onStartTrial} className="bg-[#0F5156] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0b3d41] transition flex items-center gap-2">
            Start Free Trial <ArrowRight size={18} />
          </button>
          <button className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
            Talk to Sales
          </button>
        </div>
      </div>

      {/* --- PRICING CARDS --- */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* ESSENTIALS */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition relative flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Essentials</h3>
            <div className="mb-1"><span className="text-3xl font-bold text-slate-900">AED 960</span><span className="text-gray-500 font-medium"> / year</span></div>
            <p className="text-xs text-gray-400 mb-6">Billed annually • 1 location</p>
            <p className="text-sm font-semibold text-gray-700 mb-2">Start strong with core automation</p>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">Ideal for independent gyms and studios getting started with GymBios.</p>
            <div className="space-y-3 mb-8 flex-1">
              {["Member onboarding & profiles", "Scheduling & bookings", "Billing and payments", "POS & basic inventory", "Financial snapshots & reports", "Basic marketing & CRM", "Access control integration", "Standard support"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-600"><CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" /><span>{item}</span></div>
              ))}
            </div>
            <button onClick={onStartTrial} className="w-full py-3 rounded-lg border-2 border-slate-800 text-slate-800 font-bold hover:bg-slate-50 transition">Start with Essentials</button>
          </div>

          {/* STANDARD */}
          <div className="bg-white rounded-2xl p-8 border-2 border-[#0F5156] shadow-lg relative flex flex-col transform scale-105 z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0F5156] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Star size={10} fill="white" /> Most Popular</div>
            <div className="absolute top-6 right-6 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-wider">Growth-ready</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Standard</h3>
            <div className="mb-1"><span className="text-3xl font-bold text-slate-900">AED 2,940</span><span className="text-gray-500 font-medium"> / year</span></div>
            <p className="text-xs text-gray-400 mb-6">Billed annually • 1 location</p>
            <p className="text-sm font-semibold text-gray-700 mb-2">Best balance of growth & control</p>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">Perfect for growing gyms that need multi-branch control and smart budgeting.</p>
            <div className="space-y-3 mb-8 flex-1">
              {["Everything in Essentials", "White-labelled GymBios app", "Workforce & shift management", "Budget Intelligence (Financial control)", "Multi-Branch & franchise management", "Equipment & maintenance management", "Member Experience Tracker", "Service & plans portfolio control", "Priority support"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-600"><CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" /><span>{item}</span></div>
              ))}
            </div>
            <button onClick={onStartTrial} className="w-full py-3 rounded-lg bg-[#0F5156] text-white font-bold hover:bg-[#0b3d41] transition">Choose Standard</button>
          </div>

          {/* PROFESSIONAL */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition relative flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Professional</h3>
            <div className="mb-1"><span className="text-3xl font-bold text-slate-900">AED 4,670</span><span className="text-gray-500 font-medium"> / year</span></div>
            <p className="text-xs text-gray-400 mb-6">Billed annually • 1 location</p>
            <p className="text-sm font-semibold text-gray-700 mb-2">Deep Intelligence for serious scale</p>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">Advanced analytics, growth tools, and automation for high-performance fitness brands.</p>
            <div className="space-y-3 mb-8 flex-1">
              {["Everything in Standard", "Revenue-optimized payment flows", "Advanced BI dashboards & analytics", "Marketing & sales growth toolkit", "Automation for daily operations", "Member retention & personalization", "Upsell-ready premium add-ons", "Account manager support"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-600"><CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" /><span>{item}</span></div>
              ))}
            </div>
            <button onClick={onStartTrial} className="w-full py-3 rounded-lg border-2 border-slate-800 text-slate-800 font-bold hover:bg-slate-50 transition">Go Professional</button>
          </div>

        </div>
      </div>

      {/* --- ENTERPRISE SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="bg-[#FFFBEB] border border-[#FCD34D] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-[#FEF3C7] text-[#D97706] text-xs font-bold px-3 py-1 rounded-full mb-4 border border-[#FDE68A]"><Star size={12} fill="#D97706" /> Enterprise • Custom rollouts</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>
            <p className="text-sm text-slate-600 mb-6 max-w-2xl">Designed for chains, franchises & large fitness ecosystems. Partner with GymBios to build a connected fitness business operating system.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {["Everything in Professional", "Computer Vision & biometric AI integration", "AI-driven revenue & churn intelligence", "Wearables, e-commerce & partner ecosystem integrations"].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle size={16} className="text-[#D97706]" /> {feat}</div>
              ))}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-medium text-slate-500 mb-2 text-center md:text-right">Custom enterprise pricing</p>
            <button className="bg-[#F59E0B] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#D97706] transition flex items-center gap-2 shadow-sm">Talk to Sales <ArrowRight size={18} /></button>
          </div>
        </div>
      </div>

      {/* --- COMPARISON TABLE --- */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold text-slate-800">Quick comparison</h2>
          <span className="text-xs text-gray-400">A high-level view of what changes as you scale</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr><th className="px-6 py-4 font-medium w-1/3">Capability</th><th className="px-6 py-4 font-medium">Essentials</th><th className="px-6 py-4 font-medium">Standard</th><th className="px-6 py-4 font-medium">Professional</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="px-6 py-4 text-gray-600">Multi-branch & franchise control</td><td className="px-6 py-4 text-gray-400">—</td><td className="px-6 py-4 text-emerald-600 font-medium flex items-center gap-1"><CheckCircle size={14}/> Included</td><td className="px-6 py-4 text-emerald-600 font-medium flex items-center gap-1"><CheckCircle size={14}/> Included</td></tr>
              <tr><td className="px-6 py-4 text-gray-600">Advanced BI & Intelligence</td><td className="px-6 py-4 text-gray-400">—</td><td className="px-6 py-4 text-gray-800">Limited</td><td className="px-6 py-4 text-gray-800 font-bold">Full</td></tr>
              <tr><td className="px-6 py-4 text-gray-600">Workforce & performance management</td><td className="px-6 py-4 text-gray-800">Basic</td><td className="px-6 py-4 text-gray-800">Advanced</td><td className="px-6 py-4 text-gray-800">Advanced + AI insights</td></tr>
              <tr><td className="px-6 py-4 text-gray-600">Marketing & revenue growth tools</td><td className="px-6 py-4 text-gray-800">Basic campaigns</td><td className="px-6 py-4 text-gray-800">Enhanced</td><td className="px-6 py-4 text-gray-800">Full suite</td></tr>
              <tr><td className="px-6 py-4 text-gray-600">Automation & workflows</td><td className="px-6 py-4 text-gray-800">Core workflows</td><td className="px-6 py-4 text-gray-800">Extended</td><td className="px-6 py-4 text-gray-800">Advanced automation</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- FEATURES GRID --- */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="mb-10"><h2 className="text-2xl font-bold text-slate-800 mb-2">Built for real-world gym operations</h2><p className="text-gray-500 max-w-2xl">GymBios is more than a membership system — it's a full business operating system for fitness brands.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon={Users} title="Member Lifecycle Intelligence" desc="Track the full member journey from lead to loyal customer with smart engagement triggers and workflows." />
          <FeatureCard icon={BarChart3} title="Business Command Center" desc="Single dashboard for revenue, attendance, utilization, and performance across locations and teams." />
          <FeatureCard icon={Shield} title="Secure & Compliant" desc="Enterprise-grade security, role-based access, and activity logs keep your business and members protected." />
          <FeatureCard icon={Smartphone} title="Mobile-First Experience" desc="Operators, trainers, and members get a seamless experience across web and mobile — anywhere, anytime." />
          <FeatureCard icon={Globe} title="Multi-Branch Ready" desc="Built for single gyms to multi-country franchises with unified reporting and centralized control." />
          <FeatureCard icon={Headphones} title="Human + Tech Support" desc="Onboarding assistance, training, and responsive support from people who understand fitness businesses." />
        </div>
      </div>

      {/* --- FAQ --- */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Frequently asked questions</h2>
        <p className="text-gray-500 mb-8">If you have more questions, our team is happy to walk you through the best fit for your gym.</p>
        <div className="space-y-4">
          <FaqItem question="Is there a setup or onboarding fee?" answer="For most gyms, onboarding is included in the subscription. For complex multi-branch rollouts, we'll quote a one-time onboarding project if needed." />
          <FaqItem question="Can I migrate from my existing system?" answer="Yes. We support guided data migration for members, plans, payments, and more. Our team will help you structure the import." />
          <FaqItem question="Is GymBios suitable for multi-branch or franchise setups?" answer="Absolutely. Standard, Professional, and Enterprise plans are designed with multi-location control and intelligence in mind." />
          <FaqItem question="Can I upgrade between plans later?" answer="Yes, you can upgrade at any time as your business grows. We'll pro-rate and align your billing cycle." />
          <FaqItem question="Do you offer support and training?" answer="All plans include support. Higher tiers include priority support, training sessions, and a dedicated success manager on Enterprise." />
        </div>
      </div>

      {/* --- CONTACT & FOOTER CTA --- */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Talk to a GymBios specialist</h3>
          <p className="text-sm text-gray-500 mb-6">Not sure which plan fits you best? Share your current setup and growth goals — we'll recommend the right starting point.</p>
          <div className="space-y-3 max-w-2xl">
            <ContactRow icon={Phone} text="Call Sales: +971 525 135 865" />
            <ContactRow icon={Mail} text="sales@gymbios.com" />
            <ContactRow icon={MessageSquare} text="Talk to us on live chat" />
          </div>
          <p className="text-[10px] text-gray-400 mt-6">Average onboarding time for a single-location gym is 5–10 working days.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-[#2D7A7B] rounded-2xl p-10 text-center text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-3">Ready to make GymBios your gym's operating system?</h2>
          <p className="text-emerald-100 mb-8 max-w-2xl mx-auto text-sm">Start with a plan that fits today — and upgrade as your business grows.</p>
          <div className="flex justify-center gap-4">
            <button onClick={onStartTrial} className="bg-white text-[#0F5156] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition flex items-center gap-2">Start Free Trial <ArrowRight size={18} /></button>
            <button className="bg-transparent border border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white/10 transition">Book a Product Walkthrough</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. ONBOARDING FLOW
// ============================================================================
function OnboardingFlow({ onBackToPricing }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [submitting, setSubmitting] = useState(false);
  
  // State handles all fields shown in screenshots
  const [formData, setFormData] = useState({
    // Step 1
    businessName: "",
    yearsInBusiness: "",
    branches: "",
    businessType: [],
    
    // Step 2
    location: { country: "", state: "", city: "", memberCount: "", staffCount: "", address: "" },
    
    // Step 3
    services: [],
    software: "",
    reasons: [],
    
    // Step 4
    goals: [],
    contact: { name: "", email: "", phone: "", whatsapp: "", notes: "" }
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => {
    if (step === 1) onBackToPricing();
    else setStep(prev => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    if (submitting) return; // Prevent double click
    setSubmitting(true);
    
    try {
      console.log("Submitting Onboarding Data:", formData);
      await submitOnboarding(formData);
      alert("Onboarding submitted successfully! Welcome to GymBios.");
      onBackToPricing();
    } catch (error) {
      console.error("Submission Error", error);
      // Display the specific error message from the API logic
      alert(`Submission failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-800">
      
      {/* --- SIDEBAR --- */}
      <div className="w-[300px] bg-slate-50 border-r border-gray-200 flex flex-col shrink-0 h-screen sticky top-0">
        
        {/* Sidebar Header */}
        <div className="p-8 pb-0">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#0F5156] rounded-lg flex items-center justify-center text-white"><Zap size={16} /></div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">GymBios</h3>
              <p className="text-[10px] text-gray-500">Business onboarding</p>
            </div>
          </div>

          <div className="mb-12">
            <div className="inline-flex items-center gap-1.5 bg-[#0F5156] text-white text-[11px] font-bold px-3 py-1.5 rounded-md shadow-sm">
              <CheckCircle size={12} /> Trial plan selected
            </div>
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="px-8 space-y-8 relative flex-1">
          {/* Vertical connector line */}
          <div className="absolute left-[47px] top-2 bottom-20 w-[2px] bg-gray-200 -z-10"></div>

          <StepIndicator 
            current={step} stepNum={1} icon={<BarChart3 size={16}/>}
            title="Business basics" desc="Tell us about your fitness business" 
          />
          <StepIndicator 
            current={step} stepNum={2} icon={<MapPin size={16}/>}
            title="Location & scale" desc="Where you operate and team size" 
          />
          <StepIndicator 
            current={step} stepNum={3} icon={<Settings size={16}/>}
            title="Services & system" desc="What you offer and current software" 
          />
          <StepIndicator 
            current={step} stepNum={4} icon={<Target size={16}/>}
            title="Goals & contact" desc="Your objectives and how to reach you" 
          />
        </div>

        {/* Sidebar Footer (Progress) */}
        <div className="p-8 mt-auto border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
            <span>Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-[#0F5156] h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header (Mobile close or utility) */}
        <div className="h-16 flex items-center justify-end px-8 shrink-0">
           <button onClick={onBackToPricing} className="text-gray-400 hover:text-gray-600 transition"><X size={24} /></button>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-12 pb-24">
            
            {/* Render Active Step */}
            {step === 1 && <Step1_BusinessBasics data={formData} update={setFormData} />}
            {step === 2 && <Step2_LocationScale data={formData} update={setFormData} />}
            {step === 3 && <Step3_ServicesSystem data={formData} update={setFormData} />}
            {step === 4 && <Step4_GoalsContact data={formData} update={setFormData} />}
            
          </div>
        </div>

        {/* Floating Bottom Bar (Sticky) */}
        <div className="bg-white border-t border-gray-200 py-4 px-12 shrink-0">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            
            {/* Left Button */}
            <button onClick={prevStep} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition">
               <ArrowLeft size={16} /> {step === 1 ? "Exit onboarding" : "Back"}
            </button>

            <div className="flex items-center gap-6">
              <p className="text-xs text-gray-400 hidden sm:flex items-center gap-1">Your data is secure and private</p>
              <button 
                onClick={step === totalSteps ? handleComplete : nextStep} 
                disabled={submitting}
                className={`bg-[#0F5156] text-white px-8 py-2.5 rounded-lg font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-900/10 ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#0b3d41]'}`}
              >
                {submitting ? (
                  <>Processing <Loader2 size={18} className="animate-spin"/></>
                ) : (
                  <>
                    {step === totalSteps ? "Complete onboarding" : "Continue"} 
                    {step === totalSteps ? <Check size={18} /> : <ArrowRight size={18} />}
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- ONBOARDING STEPS ---

function Step1_BusinessBasics({ data, update }) {
  const businessTypes = [
    "Gym / Fitness Center", "CrossFit Box", 
    "Personal Training Studio", "Strength & Conditioning Center",
    "Functional Fitness Studio", "Wellness Center", 
    "Yoga Studio", "Pilates Studio",
    "Meditation / Mindfulness Studio", "Rehab / Physiotherapy Center", 
    "Spa & Therapy Center", "MMA Club",
    "Boxing Gym", "Muay Thai Center", 
    "Karate Dojo", "Taekwondo Academy",
    "Jiu-Jitsu Academy (BJJ)", "Kickboxing Studio"
  ];

  const toggle = (opt) => {
    const prev = data.businessType;
    const next = prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt];
    update({ ...data, businessType: next });
  };

  const handleChange = (field, val) => update({ ...data, [field]: val });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Business basics</h2>
      <p className="text-gray-500 mb-8">Tell us about your fitness business</p>
      
      {/* Row 1: Business Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Business name</label>
        <input 
          type="text" 
          placeholder="Eg. EMMA Fitness Club" 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none transition" 
          value={data.businessName} 
          onChange={e => handleChange("businessName", e.target.value)} 
        />
      </div>

      {/* Row 2: Years & Branches */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Years in business</label>
          <select 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none bg-white transition text-gray-600"
            value={data.yearsInBusiness}
            onChange={e => handleChange("yearsInBusiness", e.target.value)}
          >
            <option value="" disabled>Select years in business</option>
            <option value="<1">Less than 1 year</option>
            <option value="1-3">1 - 3 years</option>
            <option value="3-5">3 - 5 years</option>
            <option value="5+">5+ years</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of branches</label>
          <input 
            type="text" 
            placeholder="Eg. 1, 3, 5+" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none transition" 
            value={data.branches} 
            onChange={e => handleChange("branches", e.target.value)} 
          />
        </div>
      </div>

      {/* Row 3: Business Type Grid */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">Business type <span className="text-gray-400 font-normal">(select all that apply)</span></label>
        <div className="grid grid-cols-2 gap-3">
          {businessTypes.map((opt) => (
            <button 
              key={opt} 
              onClick={() => toggle(opt)}
              className={`p-3.5 rounded-lg border text-left text-sm transition ${
                data.businessType.includes(opt) 
                ? "border-[#0F5156] bg-emerald-50 text-[#0F5156] font-medium shadow-sm" 
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2_LocationScale({ data, update }) {
  const handleChange = (field, val) => {
    update({ ...data, location: { ...data.location, [field]: val } });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Location & scale</h2>
      <p className="text-gray-500 mb-8">Where you operate and team size</p>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <input type="text" placeholder="Eg. United Arab Emirates" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none transition" value={data.location.country} onChange={e => handleChange("country", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State / Province / Emirate</label>
          <input type="text" placeholder="Eg. Dubai" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none transition" value={data.location.state} onChange={e => handleChange("state", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City / Area</label>
          <input type="text" placeholder="Eg. Al Qusais" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none transition" value={data.location.city} onChange={e => handleChange("city", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Approx. member count</label>
          <input type="text" placeholder="Eg. 150 active members" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none transition" value={data.location.memberCount} onChange={e => handleChange("memberCount", e.target.value)} />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Approx. staff / trainers</label>
        <input type="text" placeholder="Eg. 6 trainers + 2 reception" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none transition" value={data.location.staffCount} onChange={e => handleChange("staffCount", e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full address</label>
        <textarea rows={3} placeholder="Building, street, landmark, etc." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none resize-none transition" value={data.location.address} onChange={e => handleChange("address", e.target.value)} />
      </div>
    </div>
  );
}

function Step3_ServicesSystem({ data, update }) {
  const facilities = [
    "Gym floor access", "Group classes", "Personal training", "CrossFit / functional training",
    "Martial arts / combat sports", "Yoga / Pilates", "Kids training", "Swimming pool",
    "Sauna / steam", "Café / juice bar", "Supplement store", "Merchandise store"
  ];
  const reasons = [
    "Currently not using any software", "Existing software is too complex",
    "Existing software is too expensive", "Billing / payments issues",
    "No automation or workflows", "No multi-branch support",
    "Weak reporting / analytics", "Want AI & smart intelligence"
  ];

  const toggle = (arrKey, val) => {
    const prev = data[arrKey];
    const next = prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val];
    update({ ...data, [arrKey]: next });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Services & system</h2>
      <p className="text-gray-500 mb-8">What you offer and current software</p>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">Services & facilities <span className="text-gray-400 font-normal">(select all that apply)</span></label>
        <div className="grid grid-cols-2 gap-3">
          {facilities.map(f => (
            <button key={f} onClick={() => toggle("services", f)} className={`p-3.5 rounded-lg border text-sm text-left transition ${data.services.includes(f) ? "border-[#0F5156] bg-emerald-50 text-[#0F5156] font-medium shadow-sm" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Are you using any software today?</label>
        <input type="text" placeholder="Eg. No / Yes, using XYZ" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none transition" value={data.software} onChange={e => update({...data, software: e.target.value})} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Why are you looking for GymBios? <span className="text-gray-400 font-normal">(select all that apply)</span></label>
        <div className="grid grid-cols-2 gap-3">
          {reasons.map(r => (
            <button key={r} onClick={() => toggle("reasons", r)} className={`p-3.5 rounded-lg border text-sm text-left transition ${data.reasons.includes(r) ? "border-[#0F5156] bg-emerald-50 text-[#0F5156] font-medium shadow-sm" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4_GoalsContact({ data, update }) {
  const goals = [
    "Increase member retention", "Automate daily operations", "Improve financial control",
    "Scale to more branches", "Implement access control", "Improve member experience",
    "Grow revenue", "Reduce manual work / spreadsheets"
  ];

  const toggle = (val) => {
    const prev = data.goals;
    const next = prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val];
    update({ ...data, goals: next });
  };

  const handleContact = (field, val) => {
    update({ ...data, contact: { ...data.contact, [field]: val } });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Goals & contact</h2>
      <p className="text-gray-500 mb-8">Your objectives and how to reach you</p>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">What are your main goals with GymBios? <span className="text-gray-400 font-normal">(select all that apply)</span></label>
        <div className="grid grid-cols-2 gap-3">
          {goals.map(g => (
            <button key={g} onClick={() => toggle(g)} className={`p-3.5 rounded-lg border text-sm text-left transition ${data.goals.includes(g) ? "border-[#0F5156] bg-emerald-50 text-[#0F5156] font-medium shadow-sm" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact person name</label>
          <input type="text" placeholder="Owner / Manager name" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none transition" value={data.contact.name} onChange={e => handleContact("name", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact email</label>
          <input type="email" placeholder="name@business.com" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none transition" value={data.contact.email} onChange={e => handleContact("email", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
          <input type="text" placeholder="Primary contact number" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none transition" value={data.contact.phone} onChange={e => handleContact("phone", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp <span className="text-gray-400 font-normal">(optional)</span></label>
          <input type="text" placeholder="For faster coordination" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none transition" value={data.contact.whatsapp} onChange={e => handleContact("whatsapp", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Anything else we should know?</label>
        <textarea rows={3} placeholder="Eg. Planned new branches, special requirements, access control hardware, etc." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5156] focus:border-[#0F5156] outline-none resize-none transition" value={data.contact.notes} onChange={e => handleContact("notes", e.target.value)} />
      </div>
    </div>
  );
}

// --- HELPER COMPONENT FOR SIDEBAR ---
function StepIndicator({ current, stepNum, title, desc, icon }) {
  const active = current === stepNum;
  const completed = current > stepNum;
  const isPending = current < stepNum;

  return (
    <div className={`flex items-start gap-4 relative z-10 transition-all duration-300`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
        active 
        ? "bg-[#0F5156] border-[#0F5156] text-white shadow-lg shadow-emerald-100" 
        : completed 
          ? "bg-[#0F5156] border-[#0F5156] text-white" 
          : "bg-white border-gray-200 text-gray-400"
      }`}>
        {completed ? <Check size={20} /> : icon || <span className="font-bold text-sm">{stepNum}</span>}
      </div>
      <div className={`pt-1 ${isPending ? "opacity-60" : "opacity-100"}`}>
        <div className={`text-xs font-bold mb-0.5 uppercase tracking-wider ${active ? "text-[#0F5156]" : "text-gray-400"}`}>Step {stepNum}</div>
        <div className={`font-bold text-sm leading-tight mb-1 ${active || completed ? "text-slate-900" : "text-gray-500"}`}>{title}</div>
        <div className="text-[11px] text-gray-400 leading-tight max-w-[150px]">{desc}</div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS FOR PRICING VIEW ---
function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="w-10 h-10 bg-[#0F5156] rounded-lg flex items-center justify-center text-white mb-4"><Icon size={20} /></div>
      <h4 className="font-bold text-slate-800 mb-2">{title}</h4>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function FaqItem({ question, answer }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h4 className="font-semibold text-slate-800 mb-1 flex items-start gap-2"><CheckCircle size={18} className="text-[#0F5156] mt-0.5 shrink-0" /> {question}</h4>
      <p className="text-sm text-gray-500 pl-7">{answer}</p>
    </div>
  );
}

function ContactRow({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition cursor-pointer">
      <Icon size={18} className="text-gray-500" />
      <span className="text-sm font-medium text-gray-700">{text}</span>
    </div>
  );
}