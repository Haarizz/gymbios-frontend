// src/pages/ServicePortfolio.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, Maximize2, QrCode, UserPlus, ThumbsUp, 
  Check, Clock, MapPin, Calendar, Users, ChevronRight, 
  Dumbbell, Activity, Heart, Star, Eye, X, Phone, Mail,
  User, CreditCard, FileText, AlertCircle, MessageSquare, ArrowLeft, Loader2
} from 'lucide-react';

// API Imports
import { listStreams } from '../api/TrainingStreamsApi';
import { getStaff } from '../api/staff';
import { getTrainingClasses } from '../api/trainingApi';
import { getMembers, getMember, updateMember } from '../api/member';
import { createInterest, getInterests } from '../api/intrest'; // Updated Import

export default function ServicePortfolio() {
  const [activeTab, setActiveTab] = useState('membership'); 
  const [modalState, setModalState] = useState({ type: null, plan: null }); 
  
  // State for dynamic data
  const [trainingStreamsData, setTrainingStreamsData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [classesData, setClassesData] = useState([]);
  const [membersList, setMembersList] = useState([]); 
  const [loading, setLoading] = useState(true);

  // State to track interests (list of class/stream names the user is interested in)
  const [interestedItems, setInterestedItems] = useState([]);

  const navigate = useNavigate();

  const openModal = (type, plan) => setModalState({ type, plan });
  const closeModal = () => setModalState({ type: null, plan: null });

  // Fetch Data on Mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [streams, staff, classes, members, interests] = await Promise.all([
          listStreams(),
          getStaff(),
          getTrainingClasses(),
          getMembers(),
          getInterests() // Fetch existing interests from DB
        ]);
        
        setTrainingStreamsData(Array.isArray(streams) ? streams : (streams.data || []));
        setStaffData(Array.isArray(staff) ? staff : (staff.data || []));
        setClassesData(Array.isArray(classes) ? classes : (classes.data || []));
        setMembersList(Array.isArray(members) ? members : (members.data || []));
        
        // Populate local state with names of things user is interested in
        if (Array.isArray(interests)) {
            setInterestedItems(interests.map(i => i.interestName));
        }
        
      } catch (error) {
        console.error("Failed to load service portfolio data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- Static Membership Data ---
  const membershipPlans = [
    {
      id: 1,
      name: 'Basic Fitness',
      duration: '1 Month',
      price: '199',
      oldPrice: '249',
      discount: '20% OFF',
      members: '2,450+',
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      features: [
        'Gym Access (6 AM - 10 PM)',
        'Cardio & Weight Training Area',
        'Locker Room Access',
        'Basic Equipment Usage',
        'Monthly Fitness Assessment'
      ]
    },
    {
      id: 2,
      name: 'Premium Lifestyle',
      duration: '3 Months',
      price: '499',
      oldPrice: '699',
      members: '1,850+',
      tag: 'Most Popular',
      subTag: 'Best Value',
      color: 'bg-purple-600',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      features: [
        '24/7 Gym Access',
        'All Group Classes',
        'Sauna & Steam Room',
        'Guest Pass (2/month)',
        'Nutrition Consultation',
        'Personal Training Session (1/month)'
      ]
    },
    {
      id: 3,
      name: 'Elite Performance',
      duration: '6 Months',
      price: '899',
      oldPrice: '1,199',
      discount: '25% OFF',
      members: '750+',
      color: 'bg-yellow-600',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      features: [
        'Everything in Premium',
        'VIP Locker Room',
        'Priority Class Booking',
        'Unlimited Guest Passes',
        'Weekly Personal Training',
        'Meal Plan & Supplements'
      ]
    },
    {
      id: 4,
      name: 'Annual Champion',
      duration: '12 Months',
      price: '1,599',
      oldPrice: '2,399',
      discount: '33% OFF',
      members: '450+',
      color: 'bg-green-600',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
      features: [
        'Everything in Elite',
        'Dedicated Trainer Assignment',
        'Customized Workout Plans',
        'Body Composition Analysis',
        'Recovery & Wellness Services',
        'Competition Prep Support'
      ]
    }
  ];

  // --- Render Functions ---

  const renderMembershipPlans = () => (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-800">Choose Your Perfect Plan</h2>
        <p className="text-sm text-gray-500 mt-2">Start your fitness journey with our flexible membership options designed for every lifestyle and budget</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {membershipPlans.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${plan.id === 2 ? 'ring-2 ring-purple-500 transform scale-105 z-10' : ''}`}
          >
            <div className={`${plan.color} p-6 text-white text-center relative h-48 flex flex-col justify-center`}>
              {plan.tag && (
                <div className="absolute top-0 right-0 bg-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                  {plan.tag}
                  {plan.subTag && <span className="block font-normal opacity-90">{plan.subTag}</span>}
                </div>
              )}
              {plan.discount && (
                <div className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                  {plan.discount}
                </div>
              )}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="text-xs opacity-90 mt-1">{plan.duration}</p>
              
              <div className="mt-4">
                <div className="text-3xl font-bold">{plan.price} AED</div>
                <div className="text-xs opacity-75 line-through">{plan.oldPrice} AED</div>
                <div className="text-[10px] mt-2 opacity-80">{plan.members} Members</div>
              </div>
            </div>

            <div className="p-6 flex-1 bg-white">
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-xs text-gray-600">
                    <Check size={14} className={`mr-2 mt-0.5 shrink-0 ${plan.textColor}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
              <button 
                onClick={() => openModal('action', plan)}
                className="w-full bg-teal-700 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-teal-800 mb-3 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={16} /> Choose Plan
              </button>
              <button 
                onClick={() => openModal('details', plan)}
                className="w-full bg-white border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={16} /> View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrainingStreams = () => (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-800">Specialized Training Programs</h2>
        <p className="text-sm text-gray-500 mt-2">Work with our certified trainers in specialized programs designed to help you achieve specific fitness goals</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading training streams...</div>
      ) : trainingStreamsData.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No training streams available.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trainingStreamsData.map((stream) => (
            <div 
              key={stream.id} 
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{stream.title}</h3>
                  <p className="text-sm text-gray-500">{stream.description || 'Customized fitness coaching'}</p>
                </div>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">{stream.difficulty || 'All Levels'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-blue-50/30 p-4 rounded-xl mb-6">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Per Session</div>
                  <div className="text-lg font-bold text-blue-600">150 AED<span className="text-sm font-normal text-gray-500">/session</span></div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Package Deal</div>
                  <div className="text-lg font-bold text-green-600">1,200 AED<span className="text-sm font-normal text-gray-500">/10 sessions</span></div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">What's Included:</h4>
                <div className="grid grid-cols-2 gap-y-2">
                  {[ 'Customized workout plans', 'Progress tracking', 'Nutrition guidance', 'Flexible scheduling' ].map((item, i) => (
                    <div key={i} className="flex items-center text-xs text-gray-600">
                      <CheckCircleIcon size={12} className="text-green-500 mr-2" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                <div className="flex items-center gap-1"><Clock size={14}/> {stream.duration || '60 min'}</div>
                <div className="flex items-center gap-1"><Clock size={14}/> {stream.time || 'Flexible'}</div>
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Our Expert Trainers:</h4>
                <div className="space-y-3">
                  {staffData.slice(0, 3).map((trainer, i) => (
                    <div key={trainer.id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                          {(trainer.firstname || 'T').charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{trainer.firstname} {trainer.lastname}</div>
                          <div className="text-[10px] text-gray-500">{trainer.role || 'Trainer'}</div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">{trainer.department || 'Fitness'}</span>
                    </div>
                  ))}
                  {staffData.length === 0 && <div className="text-xs text-gray-400 italic">No trainers available.</div>}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate('/training-streams')}
                  className="bg-teal-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-teal-800 transition"
                >
                  Book Session
                </button>
                <button className="bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Learn More</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderClasses = () => (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-800">Group Class Schedule</h2>
        <p className="text-sm text-gray-500 mt-2">Join our energizing group classes designed for all fitness levels</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading scheduled classes...</div>
      ) : classesData.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No classes scheduled.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classesData.map((cls) => {
             const name = cls.className || cls.class_name || 'Class Name';
             const trainerName = cls.trainer || 'Instructor';
             const startTime = cls.startTime || cls.start_time || '00:00';
             const endTime = cls.endTime || cls.end_time || '00:00';
             const type = (cls.classType || cls.class_type || 'General');
             const location = cls.location || 'Studio';
             const capacity = cls.capacity || 20;
             const enrolled = cls.enrolled || Math.floor(Math.random() * capacity); 
             const dayName = cls.date ? new Date(cls.date).toLocaleDateString('en-US', { weekday: 'short' }) : 'Daily';

             // Check if user has expressed interest in this class
             const isInterested = interestedItems.includes(name);

             let levelColor = 'bg-blue-100 text-blue-700';
             const typeLower = type.toLowerCase();
             if (typeLower.includes('begin')) levelColor = 'bg-green-100 text-green-700';
             else if (typeLower.includes('adv')) levelColor = 'bg-red-100 text-red-700';
             else if (typeLower.includes('int')) levelColor = 'bg-yellow-100 text-yellow-700';

             return (
              <div 
                key={cls.id} 
                className={`bg-white rounded-xl p-5 shadow-sm border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${isInterested ? 'border-purple-300 ring-1 ring-purple-200' : 'border-gray-100'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <UserIcon size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">with {trainerName}</span>
                    </div>
                  </div>
                  <span className={`${levelColor} text-[10px] font-bold px-2 py-1 rounded`}>{type}</span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 mb-5">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock size={14} className="text-gray-400" /> {startTime} - {endTime}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin size={14} className="text-gray-400" /> {location}
                  </div>
                </div>

                <div className="flex gap-2 mb-5">
                  <span className="text-xs text-gray-500 py-1">Class Day:</span>
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-medium px-2 py-1 rounded border border-blue-100">{dayName}</span>
                </div>

                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Enrollment:</span>
                    <span className="font-bold text-gray-700">{enrolled}/{capacity} spots</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-700 rounded-full" style={{ width: `${(enrolled / capacity) * 100}%` }}></div>
                  </div>
                </div>

                {isInterested ? (
                  <button disabled className="bg-purple-100 text-purple-700 w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 cursor-default">
                    <Check size={16} /> Interest Registered
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/classes')}
                    className="bg-teal-700 text-white w-full py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Reserve Spot
                  </button>
                )}
              </div>
             );
          })}
        </div>
      )}
    </div>
  );

  // --- Modals ---

  // 1. "I'm Interested" Modal
  const InterestedModal = () => {
    const [selectedMember, setSelectedMember] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        interest: '',
        message: ''
    });

    const handleMemberSelect = (e) => {
        const memberId = e.target.value;
        if (!memberId) {
            setSelectedMember(null);
            setFormData(prev => ({ ...prev, name: '', email: '', phone: '' }));
            return;
        }

        const member = membersList.find(m => m.id.toString() === memberId);
        if (member) {
            setSelectedMember(member);
            setFormData(prev => ({
                ...prev,
                name: `${member.firstname} ${member.lastname}`,
                email: member.email,
                phone: member.phone
            }));
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
      if(!formData.name || !formData.interest) return;
      setSubmitting(true);
      try {
        // Create Interest in Backend
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          interest: formData.interest, 
          message: formData.message
        };
        
        await createInterest(payload);
        
        // Update Local State for UI Feedback
        setInterestedItems(prev => [...prev, formData.interest]);
        
        alert("Thank you! We have registered your interest.");
        closeModal();
      } catch (err) {
        console.error("Failed to submit interest", err);
        alert("Failed to submit interest. Please try again.");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-purple-50">
            <div>
              <h3 className="font-bold text-lg text-purple-800 flex items-center gap-2">
                <ThumbsUp size={18}/> Express Interest
              </h3>
              <p className="text-xs text-purple-600">Let us know what you're interested in!</p>
            </div>
            <button onClick={closeModal}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto">
             
             <div>
               <label className="text-xs font-semibold text-gray-700 block mb-1">Select Member (Optional)</label>
               <select 
                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none bg-white"
                 onChange={handleMemberSelect}
               >
                 <option value="">-- Guest / New Lead --</option>
                 {membersList.map(m => (
                   <option key={m.id} value={m.id}>
                      {m.firstname} {m.lastname} ({m.memberId || 'ID N/A'})
                   </option>
                 ))}
               </select>
               <p className="text-[10px] text-gray-400 mt-1">Selecting a member will auto-fill their details.</p>
             </div>

             <div className="grid grid-cols-1 gap-3">
               <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none" 
                  />
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none" 
                    />
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+971..." 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none" 
                    />
                 </div>
               </div>
             </div>

             <div>
               <label className="text-xs font-semibold text-gray-700 block mb-1">I'm Interested In</label>
               <select 
                 name="interest"
                 onChange={handleInputChange}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none bg-white"
               >
                 <option value="">Select a class...</option>
                 {classesData.map(c => {
                   const className = c.class_name || c.className || c.name || 'Unnamed Class';
                   return (
                     <option key={c.id} value={className}>{className}</option>
                   );
                 })}
               </select>
             </div>

             <div>
               <label className="text-xs font-semibold text-gray-700 block mb-1">Additional Notes</label>
               <textarea 
                 rows={3} 
                 name="message"
                 onChange={handleInputChange}
                 placeholder="Any specific goals or questions?" 
                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none resize-none"
               ></textarea>
             </div>

          </div>

          <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
            <button onClick={closeModal} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50">Cancel</button>
            <button 
              onClick={handleSubmit}
              disabled={submitting || !formData.name || !formData.interest}
              className="px-5 py-2 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14}/>}
              Submit Interest
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 2. Action Modal
  const ActionModal = ({ plan }) => {
    const [view, setView] = useState('choose'); 
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [updating, setUpdating] = useState(false);

    const handleApplyPlan = async () => {
      if (!selectedMemberId) return;
      setUpdating(true);
      try {
        const memberData = await getMember(selectedMemberId);
        
        // Update member plan logic
        const updatedMember = {
          ...memberData,
          membership_plan: plan.name 
        };

        await updateMember(selectedMemberId, updatedMember);
        
        alert(`Successfully updated plan to ${plan.name}`);
        closeModal();
      } catch (err) {
        console.error("Update failed", err);
        alert("Failed to update member plan. Please try again.");
      } finally {
        setUpdating(false);
      }
    };

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
        
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {view === 'choose' ? `Choose ${plan.name}` : `Assign ${plan.name}`}
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            {view === 'choose' ? 'Select how you want to proceed with this membership plan' : 'Select a member to apply this plan to'}
          </p>

          <div className="bg-blue-600 text-white p-5 rounded-xl mb-6 flex justify-between items-center shadow-md">
             <div>
                <div className="font-bold text-lg">{plan.name}</div>
                <div className="text-2xl font-bold mt-1">{plan.price} AED <span className="text-sm font-normal opacity-80">for {plan.duration}</span></div>
             </div>
             <div className="text-right text-xs opacity-90 font-medium">
                <Users size={16} className="ml-auto mb-1 opacity-75"/>
                {plan.members} Members
             </div>
          </div>

          {view === 'choose' ? (
            <div className="space-y-4">
               <div className="text-sm font-semibold text-gray-800">Choose Your Action:</div>
               
               <div className="border border-gray-200 rounded-xl p-4 hover:border-teal-500 transition-colors cursor-pointer group">
                 <div className="font-semibold text-gray-800 text-sm mb-1">I'm an Existing Member</div>
                 <p className="text-xs text-gray-500 mb-3">Add this plan to your current membership or upgrade your existing plan</p>
                 <button 
                   onClick={() => setView('select-member')}
                   className="bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 group-hover:bg-teal-800 transition"
                 >
                   <UserPlus size={14} /> Add to My Account
                 </button>
               </div>

               <div className="border border-gray-200 rounded-xl p-4 hover:border-teal-500 transition-colors cursor-pointer group">
                 <div className="font-semibold text-gray-800 text-sm mb-1">I'm a New Member</div>
                 <p className="text-xs text-gray-500 mb-3">Start your fitness journey by completing our quick on-boarding process</p>
                 <button 
                   onClick={() => navigate('/addmembers')} 
                   className="bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 group-hover:bg-teal-800 transition"
                 >
                   <UserPlus size={14} /> Register as New Member
                 </button>
               </div>

               <div className="mt-4 pt-4 border-t border-gray-100">
                 <div className="font-semibold text-gray-800 text-sm mb-2">I Have Questions</div>
                 <p className="text-xs text-gray-500 mb-3">Get in touch with our team to learn more about this plan</p>
                 <div className="flex gap-2">
                   <button className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50"><Mail size={14}/> Send Inquiry</button>
                   <button className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50"><Phone size={14}/> Call Us</button>
                 </div>
               </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button onClick={() => setView('choose')} className="flex items-center text-xs text-gray-500 hover:text-teal-700 mb-2">
                <ArrowLeft size={12} className="mr-1"/> Back to options
              </button>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">Select Account</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                  <option value="">-- Choose Member --</option>
                  {membersList.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.firstname} {m.lastname} ({m.memberId || 'ID N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-xs text-yellow-800">
                <div className="font-bold flex items-center gap-1 mb-1"><AlertCircle size={12}/> Confirm Change</div>
                This will update the selected member's current plan to <strong>{plan.name}</strong> immediately.
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleApplyPlan}
                  disabled={!selectedMemberId || updating}
                  className="w-full bg-teal-700 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-teal-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {updating ? <Loader2 size={16} className="animate-spin"/> : <Check size={16}/>}
                  Confirm Update
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    );
  };

  // 3. Details Modal
  const DetailsModal = ({ plan }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 pb-0 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <p className="text-xs text-gray-500 mt-1">Complete details about this membership plan</p>
          </div>
          {plan.discount && <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">{plan.discount}</span>}
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 flex justify-between items-center">
             <div>
               <div className="text-xs text-gray-500 mb-1">Plan Price</div>
               <div className="flex items-baseline gap-2">
                 <span className="text-2xl font-bold text-teal-700">{plan.price} AED</span>
                 <span className="text-sm text-gray-400 line-through">{plan.oldPrice} AED</span>
               </div>
               <div className="text-xs text-gray-500 mt-1">Duration: {plan.duration}</div>
             </div>
             <div className="text-right">
                <div className="text-[10px] text-gray-400">Members</div>
                <div className="text-sm font-bold text-teal-700">{plan.members} Members</div>
             </div>
          </div>

          <h4 className="text-sm font-bold text-gray-900 mb-4">Plan Features & Benefits</h4>
          <div className="space-y-3 mb-6">
            {plan.features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full p-0.5 bg-green-100 text-green-600">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-sm text-gray-600">{f}</span>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-xs text-yellow-800 space-y-1">
            <div className="font-bold mb-1">Important Notes:</div>
            <p>• All prices are in AED and inclusive of VAT</p>
            <p>• Membership starts from the date of registration</p>
            <p>• No refunds on early cancellation</p>
            <p>• Photo ID required for registration</p>
            <p>• Terms and conditions apply</p>
          </div>

          <div className="flex justify-between items-center mt-6 text-xs text-gray-500">
             <div className="flex items-center gap-1"><Phone size={12}/> +971 50 123 4567</div>
             <div className="flex items-center gap-1"><Mail size={12}/> info@gymbios.com</div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-3 bg-white sticky bottom-0">
          <button onClick={() => openModal('action', plan)} className="flex-1 bg-teal-700 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-teal-800 flex items-center justify-center gap-2">
            <CreditCard size={16} /> Choose This Plan
          </button>
          <button onClick={closeModal} className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // 4. Registration Modal
  const RegistrationModal = ({ plan }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-teal-700 mb-1">
              <UserPlus size={18} />
              <h3 className="font-bold text-lg">Member Registration Request</h3>
            </div>
            <p className="text-xs text-gray-500">Step 1 of 2 - Draft Registration</p>
          </div>
          <button onClick={closeModal}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-teal-800 text-white rounded-xl p-4 flex justify-between items-center">
             <div>
               <div className="font-bold text-lg">{plan.name}</div>
               <div className="text-xs opacity-80">{plan.duration}</div>
               <div className="flex gap-2 mt-2">
                 <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] flex items-center gap-1"><Check size={10}/> Gym Access (6 AM - 10 PM)</span>
                 <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] flex items-center gap-1"><Check size={10}/> Cardio Area</span>
               </div>
             </div>
             <div className="text-right">
               <div className="text-xl font-bold">AED {plan.price}</div>
               <div className="text-[10px] opacity-75">Total Amount</div>
             </div>
          </div>
          {/* ... Fields ... */}
          <div>
            <h4 className="text-sm font-bold text-teal-800 flex items-center gap-2 mb-4"><User size={16}/> Identity & Registration</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="text-xs font-semibold text-gray-700 block mb-1">Member ID</label>
                <input type="text" value="Auto-generated" disabled className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-400 italic" />
              </div>
              <div className="col-span-1">
                <label className="text-xs font-semibold text-gray-700 block mb-1">National ID *</label>
                <input type="text" placeholder="ID Number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0">
          <button onClick={closeModal} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition">Cancel</button>
          <button className="px-6 py-2.5 rounded-lg bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition flex items-center gap-2">
            <FileText size={14} /> Request for On-board
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800 relative">
      
      {/* Modals Overlay Logic */}
      {modalState.type === 'details' && <DetailsModal plan={modalState.plan} />}
      {modalState.type === 'action' && <ActionModal plan={modalState.plan} />}
      {modalState.type === 'register' && <RegistrationModal plan={modalState.plan} />}
      {modalState.type === 'interested' && <InterestedModal />}

      {/* Top Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Portfolio</h1>
            <p className="text-sm text-gray-500 mt-1">Discover our comprehensive fitness plans, training programs, and group classes</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 text-xs font-medium shadow-sm transition">
              <QrCode size={14} /> QR Code
            </button>
            <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 text-xs font-medium shadow-sm transition">
              <Download size={14} /> Export PDF
            </button>
            <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 text-xs font-medium shadow-sm transition">
              <Maximize2 size={14} /> Full Screen
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => openModal('interested')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-purple-700 flex items-center gap-2 transition"
          >
            <ThumbsUp size={16} /> I'm Interested
          </button>
          <button 
            onClick={() => navigate('/addmembers')} 
            className="bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-teal-800 flex items-center gap-2 transition"
          >
            <UserPlus size={16} /> Member On-board
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-full shadow-sm border border-gray-200 inline-flex">
            {[
              { id: 'membership', label: 'Membership Plans & Pricing', icon: Heart },
              { id: 'training', label: 'Training Streams', icon: Dumbbell },
              { id: 'classes', label: 'Scheduled Classes', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gray-50 text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full max-w-[1600px] mx-auto min-h-[500px]">
        {activeTab === 'membership' && renderMembershipPlans()}
        {activeTab === 'training' && renderTrainingStreams()}
        {activeTab === 'classes' && renderClasses()}
      </div>

    </div>
  );
}

// Mini Helpers
const CheckCircleIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const UserIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);