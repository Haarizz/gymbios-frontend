// src/components/Memberhub.jsx
import React, { useState } from "react";
import {
  Search,
  Calendar,
  Users,
  Trophy,
  Plus,
  BarChart3,
  CreditCard,
  MessageSquare,
  Clock,
  Bell,
  ShoppingBag,
  Flame,
  Award,
  TrendingUp,
  X,
  FileText,
  User,
  Zap,
  CheckCircle,
  Dumbbell,
  Heart,
  Share2,
  MoreHorizontal,
  Hand, // Replacing Hand wave emoji
  ChevronRight,
  Filter
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell
} from "recharts";

// --- Mock Data ---

const attendanceData = [
  { day: "Mon", val: 1 },
  { day: "Tue", val: 1 },
  { day: "Wed", val: 1 },
  { day: "Thu", val: 1 },
  { day: "Fri", val: 0 }, // Gray
  { day: "Sat", val: 1 },
  { day: "Sun", val: 1 },
];

const feedPosts = [
  {
    id: 1,
    initials: "AM",
    author: "Alex Martinez",
    time: "2h ago",
    badge: true,
    content: "Just completed my first 5K! Thanks to everyone for the motivation",
    likes: 23,
    comments: 5
  },
  {
    id: 2,
    initials: "EW",
    author: "Emma Wilson",
    time: "4h ago",
    content: "Who's joining the morning yoga class tomorrow? Looking for a workout buddy!",
    likes: 8,
    comments: 12
  },
  {
    id: 3,
    initials: "GF",
    author: "GymBios Fitness",
    time: "6h ago",
    content: "New high-intensity circuit training class starting next week! Limited spots available.",
    likes: 45,
    comments: 18
  }
];

const bookings = [
  {
    title: "HIIT Training",
    time: "Today at 6:00 PM",
    details: "with Mike Chen",
    icon: Users,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Personal Training",
    time: "Tomorrow at 10:00 AM",
    details: "with Lisa Park",
    icon: User,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Gym Floor Access",
    time: "Dec 20 at 7:00 AM - 9:00 AM",
    details: "",
    icon: Dumbbell,
    color: "bg-green-100 text-green-600",
  },
];

const notifications = [
  {
    title: "Class starts in 30 minutes",
    desc: "HIIT Training with Mike Chen",
    time: "30m ago",
    icon: Clock,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "New message from trainer",
    desc: "Great progress on your form!",
    time: "2h ago",
    icon: MessageSquare,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Streak milestone reached!",
    desc: "You've maintained a 12-day streak",
    time: "1d ago",
    icon: Award,
    color: "bg-yellow-100 text-yellow-600",
  },
];

const badges = [
  { name: "Early Bird", icon: Clock, color: "bg-cyan-50 text-cyan-600 border-cyan-100", iconColor: "text-cyan-600" },
  { name: "Streak Master", icon: Flame, color: "bg-orange-50 text-orange-600 border-orange-100", iconColor: "text-orange-500" },
  { name: "Class Regular", icon: Trophy, color: "bg-yellow-50 text-yellow-600 border-yellow-100", iconColor: "text-yellow-600" },
  { name: "Challenge Winner", icon: Award, color: "bg-green-50 text-green-600 border-green-100", iconColor: "text-green-600" },
];

const trendingChallenges = [
  { title: "December Fitness Sprint", participants: 156, isNew: true },
  { title: "Plank Master Challenge", participants: 89, isNew: false },
  { title: "Mindful Movement", participants: 67, isNew: false },
];

const myChallenges = [
  { title: "30-Day Push-up Challenge", daysLeft: "8 days left", progress: 75, participants: 234 },
  { title: "5K Running Goal", daysLeft: "15 days left", progress: 60, participants: 89 },
];

const shopItems = [
  { name: "Protein Shake", price: "AED 25", icon: Zap },
  { name: "Gym Towel", price: "AED 15", icon: ShoppingBag },
];

const thisMonthStats = [
  { label: "Workouts", value: "18" },
  { label: "Hours Trained", value: "24h" },
  { label: "Calories Burned", value: "3,240" },
  { label: "Streak", value: "12", icon: Flame, iconColor: "text-orange-500" },
];

// --- Components ---

export default function Memberhub() {
  const [isFabOpen, setIsFabOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-800 pb-20 relative">
      
      {/* 1. Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0F5156] rounded-lg flex items-center justify-center">
            <Dumbbell className="text-white" size={16} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 leading-none">GymBios</h1>
            <span className="text-[10px] text-gray-500 font-medium block mt-0.5">Business Operating System</span>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-12 relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search classes, trainers, challenges..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5156]/10 transition-all placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div className="w-8 h-8 bg-[#0F5156] rounded-full flex items-center justify-center text-white font-semibold text-xs cursor-pointer shadow-sm hover:opacity-90 transition-opacity">
            SJ
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 space-y-6">
        
        {/* 2. Welcome Banner */}
        <div className="bg-[#5CB85C] rounded-2xl p-8 text-white flex justify-between items-center shadow-md relative overflow-hidden">
           {/* Background decorative gradient matching screenshot */}
           <div className="absolute inset-0 bg-gradient-to-r from-[#4CAE4C] to-[#5CB85C]"></div>
           
           <div className="relative z-10 space-y-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Welcome back to the future of wellness service industry, Sarah Johnson 
              <Hand size={24} className="text-yellow-300 animate-pulse" />
            </h1>
            <div className="flex flex-wrap gap-3">
              <span className="bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                <Calendar size={16} /> Yoga – Today 5PM
              </span>
              <span className="bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                <Trophy size={16} /> 2 Ongoing
              </span>
              <span className="bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                <CreditCard size={16} /> Valid until Nov 30
              </span>
            </div>
          </div>
          
          <div className="hidden md:flex flex-col items-center justify-center relative z-10 pr-8">
            <div className="text-5xl font-bold opacity-20 absolute -top-4 right-0">12</div>
            <div className="text-3xl font-bold">12</div>
            <div className="text-[10px] font-medium opacity-90 uppercase tracking-wide">Day Streak</div>
          </div>
        </div>

        {/* 3. Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <QuickActionCard icon={Calendar} label="Book a Session / Training Stream" color="bg-blue-500" iconColor="text-white" />
          <QuickActionCard icon={Users} label="Join Scheduled Class" color="bg-green-500" iconColor="text-white" />
          <QuickActionCard icon={Trophy} label="Add a Challenge" color="bg-orange-500" iconColor="text-white" />
          <QuickActionCard icon={Plus} label="Create a Post" color="bg-purple-500" iconColor="text-white" />
          <QuickActionCard icon={BarChart3} label="My Stats" color="bg-indigo-500" iconColor="text-white" />
          <QuickActionCard icon={CreditCard} label="Membership & Renewal" color="bg-teal-500" iconColor="text-white" />
        </div>

        {/* 4. Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEFT & CENTER COLUMNS (Feed + Bookings + Notifications + Badges) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Community Feed */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-700">
                  <Users size={20} className="text-gray-500" /> Community Feed
                </h2>
                <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#0F5156] border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus size={14} /> Create Post
                </button>
              </div>

              <div className="space-y-8">
                {feedPosts.map((post) => (
                  <div key={post.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                             {post.initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                               <span className="font-bold text-gray-800 text-sm">{post.author}</span>
                               <span className="text-xs text-gray-400">{post.time}</span>
                               {post.badge && <Award size={14} className="text-yellow-500" />}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{post.content}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-6 mt-3 ml-13 pl-12">
                      <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors">
                        <Heart size={14} /> {post.likes}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageSquare size={14} /> {post.comments}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-green-500 transition-colors">
                        <Share2 size={14} /> Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-700">
                  <Calendar size={20} className="text-gray-500" /> Upcoming Bookings
                </h2>
                <button className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded hover:bg-gray-100 transition-colors">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {bookings.map((booking, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#F8F9FA] rounded-xl gap-4 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${booking.color}`}>
                        <booking.icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">{booking.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {booking.time} <span className="text-gray-400 mx-1">•</span> {booking.details}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 shadow-sm transition-all">
                        Cancel
                      </button>
                      <button className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 shadow-sm transition-all">
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-700 mb-6">
                <Bell size={20} className="text-gray-500" /> Recent Notifications
              </h2>
              <div className="space-y-5">
                {notifications.map((notif, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${notif.color}`}>
                      <notif.icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{notif.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{notif.desc}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges & Achievements */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-700 mb-6">
                <Award size={20} className="text-gray-500" /> Badges & Achievements
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge, i) => (
                  <div key={i} className={`p-4 rounded-xl flex flex-col items-center text-center gap-2 border ${badge.color} bg-opacity-40 hover:bg-opacity-60 transition-colors cursor-pointer`}>
                    <div className="mb-1">
                      <badge.icon size={24} className={badge.iconColor} />
                    </div>
                    <div className="text-xs font-bold text-gray-800">{badge.name}</div>
                    <CheckCircle size={12} className="text-green-600 mt-1" />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Sidebar Widgets) */}
          <div className="space-y-6">
            
            {/* Trending Challenges */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-700 mb-4">
                <Trophy size={18} className="text-gray-500" /> Trending Challenges
              </h2>
              <div className="space-y-4">
                {trendingChallenges.map((challenge, i) => (
                   <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-gray-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-sm text-gray-800 pr-4">{challenge.title}</h3>
                        {challenge.isNew && <span className="bg-[#0F5156] text-white text-[10px] px-1.5 py-0.5 rounded font-medium">New</span>}
                      </div>
                      <p className="text-xs text-gray-500 mb-4">{challenge.participants} participants</p>
                      <button className="w-full py-2 bg-[#0F5156] text-white text-xs font-bold rounded hover:bg-[#0b3d41] transition-colors">
                        Join
                      </button>
                   </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded hover:bg-gray-50 transition-colors">
                View All Challenges
              </button>
            </div>

            {/* My Challenges */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-700 mb-6">
                <Trophy size={18} className="text-gray-500" /> My Challenges
              </h2>
              <div className="space-y-6">
                {myChallenges.map((challenge, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-700">{challenge.title}</span>
                      <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                        {challenge.daysLeft}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                      <div 
                        className="bg-[#0F5156] h-2 rounded-full" 
                        style={{ width: `${challenge.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>{challenge.progress}% complete</span>
                      <span>{challenge.participants} participants</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Class Attendance Overview */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-700 mb-6">
                <BarChart3 size={18} className="text-gray-500" /> Class Attendance Overview
              </h2>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#6B7280' }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#6B7280' }} 
                      domain={[0, 1.2]}
                      ticks={[0, 0.25, 0.5, 0.75, 1]}
                    />
                    <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.val > 0 ? "#4CAE4C" : "#E5E7EB"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Shop & Add-ons */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-700 mb-4">
                  <ShoppingBag size={18} className="text-gray-500" /> Shop & Add-ons
                </h2>
                <div className="space-y-3">
                  {shopItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <item.icon size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-800">{item.name}</div>
                          <div className="text-[10px] text-gray-500 font-medium">{item.price}</div>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-[10px] font-bold border border-gray-200 rounded hover:bg-gray-50 transition-colors text-gray-600">
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button className="w-full mt-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded hover:bg-gray-50 transition-colors">
                View All Products
              </button>
            </div>

            {/* This Month Stats */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-700 mb-6">
                <TrendingUp size={18} className="text-gray-500" /> This Month
              </h2>
              <div className="space-y-5">
                {thisMonthStats.map((stat, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-500 font-medium">{stat.label}</span>
                    <span className="font-bold text-gray-800 flex items-center gap-1">
                      {stat.value}
                      {stat.icon && <stat.icon size={14} className={stat.iconColor} />}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* 5. Floating Action Button (Fixed, NO BLUR) */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end space-y-3 z-50">
        {isFabOpen && (
          <div className="flex flex-col items-end space-y-3 mb-2 animate-in slide-in-from-bottom-5 duration-200 fade-in">
            <button className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0F5156]">Book Session</span>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-[#0F5156] group-hover:text-white transition-colors">
                <FileText size={16} />
              </div>
            </button>
            
            <button className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0F5156]">Add Challenge</span>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-[#0F5156] group-hover:text-white transition-colors">
                <Trophy size={16} />
              </div>
            </button>

            <button className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0F5156]">Create Post</span>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-[#0F5156] group-hover:text-white transition-colors">
                <Plus size={16} />
              </div>
            </button>
          </div>
        )}
        
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 ${isFabOpen ? 'bg-gray-800 rotate-45' : 'bg-[#5CB85C] hover:bg-[#4CAE4C]'}`}
        >
          <Plus size={28} className="text-white" />
        </button>
      </div>

    </div>
  );
}

// --- Sub-components ---

function QuickActionCard({ icon: Icon, label, color, iconColor }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all cursor-pointer min-h-[160px] group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${color}`}>
         <Icon size={28} className={iconColor} />
      </div>
      <span className="font-semibold text-gray-700 text-sm text-center leading-tight">
        {label}
      </span>
    </div>
  );
}