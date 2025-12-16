// src/components/MemberExperienceTracker.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { 
  Search, Download, Plus, CheckCircle, MessageSquare, 
  Star, ThumbsUp, BarChart2, Activity, Bell, AlertTriangle,
  User, ChevronDown, Eye, Smile, Meh, Frown, X, Send,
  FileText, Share2
} from 'lucide-react';

// API Imports
import { getMembers } from '../api/member'; 
import { getSessions, createSession } from '../api/memberExperience';

// --- Helper Components ---

const StarRating = ({ rating, max = 5, size = 16, color = "text-yellow-400", interactive = false, onRate }) => {
  return (
    <div className="flex gap-1">
      {[...Array(max)].map((_, i) => (
        <Star 
          key={i} 
          size={size} 
          className={`${i < rating ? `${color} fill-current` : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`} 
          onClick={interactive && onRate ? () => onRate(i + 1) : undefined}
        />
      ))}
    </div>
  );
};

const formatDate = (dateString, type = 'time') => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';

  if (type === 'time') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  if (type === 'short-datetime') {
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  }
  if (type === 'long-datetime') {
    return `December ${d.getDate()}th, ${d.getFullYear()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  }
  return d.toDateString();
};

export default function MemberExperienceTracker() {
  const [memberList, setMemberList] = useState([]);
  const [feedbackSessions, setFeedbackSessions] = useState([]);
  
  const [selectedMemberForCheckin, setSelectedMemberForCheckin] = useState(null);
  const [selectedFeedbackDetail, setSelectedFeedbackDetail] = useState(null); 
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('check-in'); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [feedbackForm, setFeedbackForm] = useState({
    overall: 0,
    intensity: 3,
    trainerRating: 0,
    facilityRating: 0,
    equipmentRating: 0,
    recommend: '',
    difficulty: 'Just Right',
    pace: 'Just Right',
    bestAspects: [],
    improvements: [],
    comments: '',
    suggestions: '',
    energy: 'Medium - Feeling good',
    returnLikelihood: 5,
    trainerRecommend: ''
  });

  // Calculate Stats
  const stats = useMemo(() => {
    const total = feedbackSessions.length;
    const flaggedCount = feedbackSessions.filter(s => s.flagged).length;
    const avgSat = total > 0 ? (feedbackSessions.reduce((acc, s) => acc + (s.overall || 0), 0) / total).toFixed(1) : 0;
    
    return {
      todaysFeedback: feedbackSessions.filter(s => new Date(s.sessionTime).toDateString() === new Date().toDateString()).length,
      totalResponses: total,
      avgSatisfaction: avgSat,
      recommendationRate: total > 0 ? Math.round((feedbackSessions.filter(s => (s.recommend || '').toLowerCase().includes('yes')).length / total) * 100) : 0,
      responseRate: 100.0,
      sessionsToday: memberList.length, 
      followUps: feedbackSessions.filter(s => s.needsFollowUp).length,
      flagged: flaggedCount,
    };
  }, [feedbackSessions, memberList]);

  // Initial Data Load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const members = await getMembers();
      const sessions = await getSessions();
      
      // Map API members to UI structure
      const processedMembers = (members || []).map((m, i) => ({
        ...m,
        workoutType: m.membership_plan || 'General Workout',
        trainer: 'Staff',
        duration: 45,
        calories: 300 + (i * 10),
        avgHR: 120 + (i * 2),
        time: new Date().toISOString()
      }));

      setMemberList(processedMembers);
      
      // Map API sessions to UI structure
      const processedSessions = (sessions || []).map(s => ({
        ...s,
        feedback: {
          overall: s.overall,
          intensity: s.intensity,
          recommend: s.recommend,
          returnScore: s.returnLikelihood,
          energy: s.energy,
          difficulty: s.difficulty,
          pace: s.pace,
          equipment: s.equipmentRating,
          facility: s.facilityRating,
          bestAspects: s.bestAspects ? s.bestAspects.split(',') : [],
          improvements: s.improvements ? s.improvements.split(',') : [],
          notes: s.comments,
          suggestions: s.suggestions
        }
      }));

      setFeedbackSessions(processedSessions);

      if (processedMembers.length > 0 && !selectedMemberForCheckin) {
        setSelectedMemberForCheckin(processedMembers[0]);
      }
    } catch (e) {
      console.error("Data load failed", e);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredMembers = useMemo(() => {
    if (!query) return memberList;
    const q = query.toLowerCase();
    return memberList.filter(m =>
      ((m.firstname || '') + ' ' + (m.lastname || '')).toLowerCase().includes(q) ||
      (m.memberId || '').toLowerCase().includes(q) ||
      (m.workoutType || '').toLowerCase().includes(q)
    );
  }, [memberList, query]);

  // Handlers
  const handleInputChange = (field, value) => {
    setFeedbackForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field, item) => {
    setFeedbackForm(prev => {
      const list = prev[field];
      if (list.includes(item)) return { ...prev, [field]: list.filter(i => i !== item) };
      return { ...prev, [field]: [...list, item] };
    });
  };

  const handleSubmit = async () => {
    if (!selectedMemberForCheckin) return;
    setSubmitting(true);

    const payload = {
      memberId: selectedMemberForCheckin.memberId,
      memberName: `${selectedMemberForCheckin.firstname} ${selectedMemberForCheckin.lastname}`,
      memberCode: selectedMemberForCheckin.memberId,
      workoutType: selectedMemberForCheckin.workoutType,
      trainer: selectedMemberForCheckin.trainer,
      sessionTime: new Date().toISOString(),
      duration: selectedMemberForCheckin.duration,
      calories: selectedMemberForCheckin.calories,
      avgHR: selectedMemberForCheckin.avgHR,
      
      overall: feedbackForm.overall,
      intensity: feedbackForm.intensity,
      trainerRating: feedbackForm.trainerRating,
      facilityRating: feedbackForm.facilityRating,
      equipmentRating: feedbackForm.equipmentRating,
      recommend: feedbackForm.recommend,
      difficulty: feedbackForm.difficulty,
      pace: feedbackForm.pace,
      bestAspects: feedbackForm.bestAspects.join(','),
      improvements: feedbackForm.improvements.join(','),
      comments: feedbackForm.comments,
      suggestions: feedbackForm.suggestions,
      energy: feedbackForm.energy,
      returnLikelihood: feedbackForm.returnLikelihood,
      trainerRecommend: feedbackForm.trainerRecommend,
    };

    try {
      await createSession(payload);
      alert("Feedback Submitted Successfully!");
      
      // Reset Form
      setFeedbackForm({
        overall: 0, intensity: 3, trainerRating: 0, facilityRating: 0, equipmentRating: 0,
        recommend: '', difficulty: 'Just Right', pace: 'Just Right',
        bestAspects: [], improvements: [], comments: '', suggestions: '',
        energy: 'Medium - Feeling good', returnLikelihood: 5, trainerRecommend: ''
      });
      
      await loadData(); // Refresh list from DB
      setActiveTab('feedback'); 
    } catch (err) {
      console.error(err);
      alert("Error saving feedback");
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDER FUNCTIONS (Fixed Refresh Issue) ---

  const renderCheckInFormTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[750px]">
      {/* Left Panel: Member List */}
      <div className="col-span-1 flex flex-col h-full">
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Select Workout Session</div>
          <div className="text-xs text-gray-500 mb-4">Choose a member currently active</div>
          {/* Plain Div for Search - No Form */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search members..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading members...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No members found.</div>
          ) : (
            filteredMembers.map((m) => (
              <div
                key={m.id}
                className={`border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-all ${
                  selectedMemberForCheckin?.id === m.id 
                    ? 'ring-1 ring-teal-500 border-teal-500 bg-white shadow-sm' 
                    : 'bg-white border-gray-200'
                }`}
                onClick={() => setSelectedMemberForCheckin(m)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                      {(m.firstname || 'U').charAt(0)}{(m.lastname || '').charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{m.firstname} {m.lastname}</div>
                      <div className="text-xs text-gray-500">{m.memberId}</div>
                    </div>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    {m.workoutType}
                  </span>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs text-gray-600">
                  <div className="flex justify-between pr-4">
                      <span className="text-gray-500">Trainer</span>
                      <span className="font-medium text-gray-900">{m.trainer}</span>
                  </div>
                  <div className="flex justify-between pl-2">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium text-gray-900">{m.duration} mins</span>
                  </div>
                   <div className="flex justify-between pr-4">
                      <span className="text-gray-500">Time</span>
                      <span className="font-medium text-gray-900">{formatDate(m.time, 'time')}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-around">
                  <div className="text-center">
                      <div className="text-[10px] text-gray-400 mb-0.5">Calories</div>
                      <div className="text-sm font-bold text-orange-500">{m.calories}</div>
                  </div>
                  <div className="text-center">
                      <div className="text-[10px] text-gray-400 mb-0.5">Avg HR</div>
                      <div className="text-sm font-bold text-red-500">{m.avgHR} bpm</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Feedback Form */}
      <div className="col-span-2 h-full flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {!selectedMemberForCheckin ? (
           <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <CheckCircle size={48} className="text-gray-300 mb-4" />
              <div className="text-lg font-medium text-gray-600">No Member Selected</div>
              <p className="text-sm text-gray-500 mt-2">Select a member from the list to begin.</p>
           </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800">Workout Feedback</h2>
                <p className="text-sm text-gray-500 mt-1">Providing feedback for {selectedMemberForCheckin.firstname}'s session</p>
              </div>

              {/* Form Content */}
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overall Satisfaction</label>
                  <p className="text-xs text-gray-500 mb-2">How satisfied was the member with their workout?</p>
                  <StarRating 
                    rating={feedbackForm.overall} 
                    size={24} 
                    interactive 
                    onRate={(val) => handleInputChange('overall', val)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workout Intensity</label>
                  <p className="text-xs text-gray-500 mb-3">How intense was the workout? (1 = Too Easy, 5 = Very Challenging)</p>
                  <div className="relative pt-1 pb-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={feedbackForm.intensity} 
                      onChange={(e) => handleInputChange('intensity', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-teal-700"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>Too Easy</span>
                      <span className="text-gray-600">Perfect</span>
                      <span>Very Hard</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trainer Rating</label>
                    <p className="text-xs text-gray-500 mb-2">Rate {selectedMemberForCheckin.trainer.split(' ')[0]}'s performance</p>
                    <StarRating rating={feedbackForm.trainerRating} size={20} interactive onRate={(v) => handleInputChange('trainerRating', v)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facility Rating</label>
                    <p className="text-xs text-gray-500 mb-2">Rate the cleanliness and environment</p>
                    <StarRating rating={feedbackForm.facilityRating} size={20} interactive onRate={(v) => handleInputChange('facilityRating', v)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Quality</label>
                    <p className="text-xs text-gray-500 mb-2">Rate the equipment condition</p>
                    <StarRating rating={feedbackForm.equipmentRating} size={20} interactive onRate={(v) => handleInputChange('equipmentRating', v)} />
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Would you recommend this workout?</label>
                  <div className="space-y-2">
                    {['Yes, definitely', 'Maybe, with improvements', 'No, not recommended'].map(opt => (
                      <div className="flex items-center" key={opt}>
                        <input 
                          type="radio" 
                          name="recommend" 
                          className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 cursor-pointer"
                          checked={feedbackForm.recommend === opt}
                          onChange={() => handleInputChange('recommend', opt)}
                        />
                        <span className="ml-2 text-sm text-gray-700">{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Difficulty Level</label>
                      <div className="space-y-2">
                        {['Too Easy', 'Just Right', 'Too Hard'].map(opt => (
                          <div className="flex items-center" key={opt}>
                            <input 
                              type="radio" 
                              name="difficulty"
                              className="w-4 h-4 text-teal-600 cursor-pointer" 
                              checked={feedbackForm.difficulty === opt}
                              onChange={() => handleInputChange('difficulty', opt)}
                            />
                            <span className="ml-2 text-sm text-gray-600">{opt}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Pace Rating</label>
                      <div className="space-y-2">
                        {['Too Slow', 'Just Right', 'Too Fast'].map(opt => (
                          <div className="flex items-center" key={opt}>
                            <input 
                              type="radio" 
                              name="pace"
                              className="w-4 h-4 text-teal-600 cursor-pointer" 
                              checked={feedbackForm.pace === opt}
                              onChange={() => handleInputChange('pace', opt)}
                            />
                            <span className="ml-2 text-sm text-gray-600">{opt}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-3">What were the best aspects? (Select all that apply)</label>
                   <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      {['Music', 'Variety', 'Energy', 'Challenge', 'Instruction', 'Community'].map((item) => (
                        <div key={item} className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer" 
                            checked={feedbackForm.bestAspects.includes(item)}
                            onChange={() => handleCheckboxChange('bestAspects', item)}
                          />
                          <span className="ml-2 text-sm text-gray-600">{item}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-3">Areas for improvement (Select all that apply)</label>
                   <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      {['Timing', 'Temperature', 'Equipment', 'Noise', 'Space', 'Cleanliness'].map((item) => (
                        <div key={item} className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer" 
                            checked={feedbackForm.improvements.includes(item)}
                            onChange={() => handleCheckboxChange('improvements', item)}
                          />
                          <span className="ml-2 text-sm text-gray-600">{item}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Additional Comments</label>
                   <p className="text-xs text-gray-500 mb-2">Share any specific feedback about the workout</p>
                   <textarea 
                     rows={3} 
                     placeholder="Tell us about your experience..." 
                     className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500" 
                     value={feedbackForm.comments}
                     onChange={(e) => handleInputChange('comments', e.target.value)}
                   />
                </div>

                {/* Energy & Return Likelihood */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Energy Level After Workout</label>
                  <div className="space-y-2">
                    {['Low - Feeling tired', 'Medium - Feeling good', 'High - Feeling energized'].map(opt => (
                      <div className="flex items-center" key={opt}>
                        <input 
                          type="radio" 
                          name="energy"
                          className="w-4 h-4 text-teal-600 cursor-pointer" 
                          checked={feedbackForm.energy === opt}
                          onChange={() => handleInputChange('energy', opt)}
                        />
                        <span className="ml-2 text-sm text-gray-600">{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Likelihood to Return (1-10)</label>
                  <p className="text-xs text-gray-500 mb-4">How likely is the member to book this type of workout again?</p>
                  <div className="relative pb-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={feedbackForm.returnLikelihood} 
                      onChange={(e) => handleInputChange('returnLikelihood', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-teal-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Very Unlikely</span>
                      <span className="text-gray-800 font-medium">{feedbackForm.returnLikelihood}</span>
                      <span>Very Likely</span>
                    </div>
                  </div>
                </div>

                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Would recommend this trainer?</label>
                  <div className="space-y-2">
                    {['Yes, definitely', 'Neutral', 'No, wouldn\'t recommend'].map(opt => (
                      <div className="flex items-center" key={opt}>
                        <input 
                          type="radio" 
                          name="trainerRecommend"
                          className="w-4 h-4 text-teal-600 cursor-pointer" 
                          checked={feedbackForm.trainerRecommend === opt}
                          onChange={() => handleInputChange('trainerRecommend', opt)}
                        />
                        <span className="ml-2 text-sm text-gray-600">{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3 sticky bottom-0 z-10">
               <button 
                 type="button" 
                 onClick={() => setSelectedMemberForCheckin(null)} 
                 className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm transition-colors"
               >
                 <X size={16} /> Cancel
               </button>
               <button 
                 type="button" 
                 onClick={handleSubmit} 
                 disabled={submitting}
                 className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-700 rounded-md hover:bg-teal-800 shadow-sm transition-colors disabled:opacity-50"
               >
                 <Send size={16} /> {submitting ? "Submitting..." : "Submit Feedback"}
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderFeedbackTab = () => {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input placeholder="Search feedback..." className="w-full pl-9 pr-4 py-2 text-sm border-none bg-transparent focus:ring-0 outline-none" />
          </div>
          <div className="flex gap-3">
             <button type="button" className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50">Today <ChevronDown size={14}/></button>
             <button type="button" className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50">All Trainers <ChevronDown size={14}/></button>
             <button type="button" className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50">All Types <ChevronDown size={14}/></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {feedbackSessions.length === 0 ? <div className="col-span-3 text-center text-gray-500 py-10">No feedback recorded yet.</div> :
           feedbackSessions.map(s => (
            <div 
              key={s.id} 
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedFeedbackDetail(s)} 
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                    ${s.feedback?.overall <= 2 ? 'bg-orange-100 text-orange-600' : 
                      s.feedback?.overall >= 5 ? 'bg-green-100 text-green-600' : 
                      'bg-yellow-100 text-yellow-600'}`}>
                    {s.feedback?.overall <= 2 ? <Meh size={22}/> : <Smile size={22}/>}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{s.memberName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{formatDate(s.sessionTime, 'short-datetime')}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                   {s.flagged && (
                     <span 
                       className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-[10px] font-medium px-2 py-0.5 rounded border border-red-100"
                     >
                        <AlertTriangle size={10} /> Flagged
                     </span>
                   )}
                   {(s.needsFollowUp || s.feedback) && (
                     <button 
                       type="button"
                       onClick={(e) => { e.stopPropagation(); setSelectedFeedbackDetail(s); }}
                       className="inline-flex items-center gap-1 bg-white text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded border border-gray-200 hover:bg-gray-50"
                     >
                       <Bell size={10} /> Follow-up
                     </button>
                   )}
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <span className="block text-gray-400 mb-1">Workout</span>
                  <span className="font-medium text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                    {s.workoutType}
                  </span>
                </div>
                <div className="text-right"><span className="block text-gray-400 mb-1">Trainer</span><span className="font-medium text-gray-700">{s.trainer}</span></div>
              </div>
              <div className="space-y-2 mb-5">
                 <div className="flex justify-between items-center"><span className="text-xs font-medium text-gray-600">Overall</span><StarRating rating={s.feedback?.overall ?? 0} size={14} /></div>
                 <div className="flex justify-between items-center"><span className="text-xs font-medium text-gray-600">Intensity</span>
                   <div className="flex gap-1">{[...Array(5)].map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full ${i < (s.feedback?.intensity || 0) ? 'bg-orange-400' : 'bg-gray-200'}`}></div>))}</div>
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-0 border-t border-b border-gray-50 divide-x divide-gray-50 mb-4 py-2">
                  <div className="text-center px-1"><div className="text-[10px] text-gray-400 uppercase font-medium mb-1">Recommend</div><div className={`text-xs font-bold ${(s.feedback?.recommend || '').toLowerCase().includes('yes') ? 'text-green-600' : 'text-orange-500'}`}>{s.feedback?.recommend ?? 'N/A'}</div></div>
                  <div className="text-center px-1"><div className="text-[10px] text-gray-400 uppercase font-medium mb-1">Return</div><div className="text-xs font-bold text-blue-600">{s.feedback?.returnScore ?? 'N/A'}/10</div></div>
                  <div className="text-center px-1"><div className="text-[10px] text-gray-400 uppercase font-medium mb-1">Energy</div><div className={`text-xs font-bold ${(s.feedback?.energy || '').includes('High') ? 'text-green-600' : (s.feedback?.energy || '').includes('Low') ? 'text-red-500' : 'text-orange-500'}`}>{s.feedback?.energy ?? 'N/A'}</div></div>
              </div>
              {s.feedback?.notes && <div className="text-xs text-gray-600 italic leading-relaxed">"{s.feedback.notes}"</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: 'Total Feedback', val: stats.totalResponses, sub: 'All time', col: 'text-green-600' },
           { label: 'Avg Satisfaction', val: stats.avgSatisfaction, sub: 'Average Score', col: 'text-green-600' },
           { label: 'Response Rate', val: `${stats.responseRate}%`, sub: 'Active', col: 'text-green-600' },
           { label: 'Flagged Issues', val: stats.flagged, sub: 'Need Attention', col: 'text-gray-500' }
         ].map((item, i) => (
           <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 font-medium mb-2">{item.label}</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{item.val}</div>
              <div className={`text-xs font-medium ${item.col}`}>{item.sub}</div>
           </div>
         ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-medium text-gray-700 mb-6">Satisfaction Trends</h3>
          <div className="space-y-5">
             {[
               { name: 'Personal Training', stars: 5, count: 1 },
               { name: 'Group Class', stars: 4, count: 1 },
               { name: 'Strength', stars: 3, count: 1 },
               { name: 'Cardio', stars: 0, count: 0, disabled: true }
             ].map((row, i) => (
               <div key={i} className={`flex items-center justify-between ${row.disabled ? 'opacity-30' : ''}`}>
                  <span className="text-sm font-semibold text-gray-700 w-36">{row.name}</span>
                  <div className="flex-1 flex justify-center"><StarRating rating={row.stars} color={row.disabled ? "text-gray-300" : "text-yellow-400"} /></div>
                  <span className="text-xs text-gray-400 font-medium w-8 text-right">({row.count})</span>
               </div>
             ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-medium text-gray-700 mb-6">Common Feedback Themes</h3>
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-green-600 mb-4">Most Appreciated Aspects</h4>
            <div className="space-y-3">
              {[
                  { l: 'Instruction', v: 90, c: 1 }, { l: 'Energy', v: 100, c: 2 }, 
                  { l: 'Challenge', v: 95, c: 2 }, { l: 'Music', v: 80, c: 1 }, { l: 'Variety', v: 85, c: 1 }
              ].map((x, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                      <span className="w-24 font-medium text-gray-600">{x.l}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{width: `${x.v}%`}}></div></div>
                      <span className="w-4 text-right text-gray-400">{x.c}</span>
                  </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-red-600 mb-4">Areas for Improvement</h4>
            <div className="space-y-3">
              {[
                  { l: 'Equipment', v: 30, c: 1 }, { l: 'Temperature', v: 20, c: 1 }, 
                  { l: 'Timing', v: 60, c: 2 }, { l: 'Space', v: 40, c: 2 }, { l: 'Noise', v: 0, c: 0 }
              ].map((x, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                      <span className="w-24 font-medium text-gray-600">{x.l}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{width: `${x.v}%`}}></div></div>
                      <span className="w-4 text-right text-gray-400">{x.c}</span>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSessionsTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">Active & Recent Sessions</h3>
        <p className="text-xs text-gray-500 mt-1">Monitor ongoing and recently completed workout sessions</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white">
            <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100">
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4">Workout Type</th>
              <th className="px-6 py-4">Trainer</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Feedback</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {feedbackSessions.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">{s.memberName.split(' ').map(n=>n[0]).join('')}</div>
                      <div><div className="font-medium text-gray-900 text-sm">{s.memberName}</div><div className="text-xs text-gray-500">{s.memberCode}</div></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">{s.workoutType}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{s.trainer}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(s.sessionTime, 'time')}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{s.duration} mins</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{s.status}</span>
                </td>
                <td className="px-6 py-4">
                   {s.feedback ? <span className="inline-flex items-center gap-1.5 text-green-700 text-xs font-medium bg-green-50 px-2.5 py-0.5 rounded border border-green-100"><CheckCircle size={12}/> Completed</span> : <span className="text-gray-400 text-xs">N/A</span>}
                </td>
                <td className="px-6 py-4 text-center"><button type="button" className="text-gray-500 hover:text-gray-800 p-1" onClick={() => setSelectedFeedbackDetail(s)}><Eye size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // --- INTERNAL COMPONENTS: Feedback Detail Panel ---
  const FeedbackDetailPanel = ({ data, onClose }) => {
    if (!data) return null;
    return (
      <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-xl font-bold text-gray-900">{data.memberName}</div>
              <div className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-200">
                {data.feedback?.overall}/5 Stars
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Feedback submitted on {formatDate(data.sessionTime, 'long-datetime')}
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Workout Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Workout Type</div>
              <div className="text-sm font-medium text-gray-900">{data.workoutType}</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Ratings & Scores</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600">Overall Satisfaction</span>
                  <span className="font-bold text-gray-900">{data.feedback?.overall}/5</span>
                </div>
                <StarRating rating={data.feedback?.overall || 0} size={14} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600">Workout Intensity</span>
                  <span className="font-bold text-gray-900">{data.feedback?.intensity}/5</span>
                </div>
                <div className="flex gap-1">{[...Array(5)].map((_, i) => (<div key={i} className={`h-2 w-full rounded-full ${i < (data.feedback?.intensity || 0) ? 'bg-orange-400' : 'bg-gray-200'}`}></div>))}</div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600">Equipment Quality</span>
                  <span className="font-bold text-gray-900">{data.feedback?.equipment}/5</span>
                </div>
                <StarRating rating={data.feedback?.equipment || 0} size={14} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600">Facility Rating</span>
                  <span className="font-bold text-gray-900">{data.feedback?.facility}/5</span>
                </div>
                <StarRating rating={data.feedback?.facility || 0} size={14} />
              </div>
            </div>
            <div className="mt-6">
               <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600">Likelihood to Return</span>
                  <span className="font-bold text-gray-900">{data.feedback?.returnScore}/10</span>
               </div>
               <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${((data.feedback?.returnScore || 0) / 10) * 100}%` }}></div>
               </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Experience Assessment</h3>
            <div className="grid grid-cols-3 gap-4">
               <div>
                  <div className="text-xs text-gray-500 mb-1">Recommend Workout</div>
                  <span className="inline-block bg-orange-100 text-orange-700 text-[10px] font-semibold px-2 py-1 rounded">
                    {data.feedback?.recommend || 'N/A'}
                  </span>
               </div>
               <div>
                  <div className="text-xs text-gray-500 mb-1">Difficulty Level</div>
                  <span className="inline-block bg-yellow-100 text-yellow-700 text-[10px] font-semibold px-2 py-1 rounded">
                    {data.feedback?.difficulty || 'N/A'}
                  </span>
               </div>
               <div>
                  <div className="text-xs text-gray-500 mb-1">Pace Rating</div>
                  <span className="inline-block bg-yellow-100 text-yellow-700 text-[10px] font-semibold px-2 py-1 rounded">
                    {data.feedback?.pace || 'N/A'}
                  </span>
               </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-1">Energy After Workout</div>
              <span className="inline-block bg-red-100 text-red-700 text-[10px] font-semibold px-2 py-1 rounded">
                {data.feedback?.energy || 'N/A'}
              </span>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
             <h3 className="text-sm font-semibold text-gray-800 mb-4">Feedback Categories</h3>
             <div className="mb-4">
               <div className="text-xs text-gray-500 mb-2">Best Aspects</div>
               <div className="flex flex-wrap gap-2">
                 {data.feedback?.bestAspects?.map(aspect => (
                   <span key={aspect} className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 text-[10px] font-medium px-2 py-1 rounded-md">
                     <ThumbsUp size={10} /> {aspect}
                   </span>
                 ))}
               </div>
             </div>
             <div>
               <div className="text-xs text-gray-500 mb-2">Areas for Improvement</div>
               <div className="flex flex-wrap gap-2">
                 {data.feedback?.improvements?.map(item => (
                   <span key={item} className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 text-[10px] font-medium px-2 py-1 rounded-md">
                     <AlertTriangle size={10} /> {item}
                   </span>
                 ))}
               </div>
             </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Comments & Suggestions</h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Comments</div>
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 border border-gray-100 italic">
                  "{data.feedback?.notes || ''}"
                </div>
              </div>
              {data.feedback?.suggestions && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Suggestions</div>
                  <div className="bg-blue-50 p-3 rounded-md text-sm text-gray-700 border border-blue-100 italic">
                    "{data.feedback?.suggestions}"
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="pb-6">
             <h3 className="text-sm font-semibold text-gray-800 mb-4">Staff Actions</h3>
             <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Follow-up Required</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${data.flags?.needsFollowUp ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                    {data.flags?.needsFollowUp ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Flagged for Review</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${data.flags?.flagged ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                    {data.flags?.flagged ? 'Yes' : 'No'}
                  </span>
                </div>
             </div>
             <div className="grid grid-cols-3 gap-2">
               <button type="button" className="flex items-center justify-center gap-1.5 bg-teal-700 text-white text-xs font-medium py-2 rounded hover:bg-teal-800 transition">
                 <FileText size={14} /> Add Notes
               </button>
               <button type="button" className="flex items-center justify-center gap-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium py-2 rounded hover:bg-gray-50 transition">
                 <Bell size={14} /> Schedule Follow-up
               </button>
               <button type="button" className="flex items-center justify-center gap-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium py-2 rounded hover:bg-gray-50 transition">
                 <Share2 size={14} /> Share with Trainer
               </button>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800 relative">
      
      {/* Detail Slide-Over Overlay */}
      {selectedFeedbackDetail && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSelectedFeedbackDetail(null)}
          ></div>
          <FeedbackDetailPanel 
            data={selectedFeedbackDetail} 
            onClose={() => setSelectedFeedbackDetail(null)} 
          />
        </>
      )}

      {/* Top Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Experience Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Capture member feedback and track satisfaction after workout sessions</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-xs font-semibold shadow-sm transition">
            <Search size={14} /> Member Lookup
          </button>
          <button type="button" className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-xs font-semibold shadow-sm transition">
            <Download size={14} /> Export Data
          </button>
          <button type="button" className="flex items-center gap-2 bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 text-xs font-semibold shadow-sm transition">
            <Plus size={14} /> New Check-in
          </button>
        </div>
      </header>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start"><div className="text-xs font-medium text-gray-500">Today's Feedback</div><CheckCircle size={18} className="text-green-600" /></div>
          <div className="text-2xl font-bold text-gray-900">{stats.todaysFeedback}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start"><div className="text-xs font-medium text-gray-500">Total Responses</div><MessageSquare size={18} className="text-blue-500" /></div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalResponses}</div>
        </div>
        <div className="col-span-2 md:col-span-2 xl:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start"><div className="text-xs font-medium text-gray-500">Avg Satisfaction</div><Star size={16} className="text-yellow-400 fill-current" /></div>
          <div className="flex items-baseline gap-2"><div className="text-2xl font-bold text-green-600">{stats.avgSatisfaction}</div><StarRating rating={Math.round(stats.avgSatisfaction)} size={14} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start"><div className="text-xs font-medium text-gray-500 w-24 leading-tight">Recommendation Rate</div><ThumbsUp size={18} className="text-purple-500" /></div>
          <div className="text-xl font-bold text-purple-600">{stats.recommendationRate}%</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start"><div className="text-xs font-medium text-gray-500">Response Rate</div><BarChart2 size={18} className="text-blue-500" /></div>
          <div className="text-xl font-bold text-blue-600">{stats.responseRate}%</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start"><div className="text-xs font-medium text-gray-500">Sessions Today</div><Activity size={18} className="text-orange-500" /></div>
          <div className="text-2xl font-bold text-orange-600">{stats.sessionsToday}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start"><div className="text-xs font-medium text-gray-500">Follow-ups</div><Bell size={18} className="text-yellow-600" /></div>
          <div className="text-2xl font-bold text-yellow-600">{stats.followUps}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start"><div className="text-xs font-medium text-gray-500">Flagged</div><AlertTriangle size={18} className="text-red-500" /></div>
          <div className="text-2xl font-bold text-red-600">{stats.flagged}</div>
        </div>
      </div>

      {/* Navigation Tabs - Segmented Style */}
      <div className="bg-gray-200/50 p-1 rounded-lg inline-flex w-full mb-8">
        {[
          { id: 'check-in', label: 'Check-in Form' },
          { id: 'feedback', label: 'Recent Feedback' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'active', label: 'Active Sessions' },
        ].map(tab => (
           <button
             key={tab.id}
             type="button"
             onClick={() => setActiveTab(tab.id)}
             className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
               activeTab === tab.id 
                 ? 'bg-white text-gray-900 shadow-sm' 
                 : 'text-gray-500 hover:text-gray-700'
             }`}
           >
             {tab.label}
           </button>
        ))}
      </div>

      {/* Main Content Area - Render Functions avoid Remounts */}
      <div className="min-h-[500px]">
         {activeTab === 'check-in' && renderCheckInFormTab()}
         {activeTab === 'feedback' && renderFeedbackTab()}
         {activeTab === 'analytics' && renderAnalyticsTab()}
         {activeTab === 'active' && renderActiveSessionsTab()}
      </div>
    </div>
  );
}