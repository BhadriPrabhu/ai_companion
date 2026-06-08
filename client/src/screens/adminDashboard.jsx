import React, { useState } from 'react';
import { 
  Users, MessageSquare, Activity, Settings, Search, LogOut, 
  BarChart3, Clock, TrendingUp, Eye 
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // --- MOCK DATA ---
  const stats = [
    { title: 'Total Users', value: '1,248', icon: <Users size={24} className="text-indigo-500" /> },
    { title: 'Active Chat Sessions', value: '342', icon: <MessageSquare size={24} className="text-blue-500" /> },
    { title: 'API Requests Today', value: '8,439', icon: <Activity size={24} className="text-green-500" /> },
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', joined: '2026-06-08' },
    { id: 2, name: 'Super Admin', email: 'admin@yourdomain.com', role: 'admin', joined: '2026-06-07' },
    { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: 'user', joined: '2026-06-05' },
  ];

  const analyticsData = {
    avgResponseTime: '1.2s',
    totalInteractions: '45,912',
    topAnimations: [
      { name: 'Talking (Default)', usage: 85, color: 'bg-indigo-500' },
      { name: 'Happy / Smiling', usage: 62, color: 'bg-green-500' },
      { name: 'Thinking', usage: 45, color: 'bg-yellow-500' },
      { name: 'Laughing', usage: 28, color: 'bg-pink-500' },
      { name: 'Sad / Confused', usage: 12, color: 'bg-red-500' },
    ]
  };

  const chatLogs = [
    { id: 'chat-101', user: 'Guest', messages: 14, time: '2 mins ago', sentiment: 'Positive' },
    { id: 'chat-102', user: 'John Doe', messages: 8, time: '15 mins ago', sentiment: 'Neutral' },
    { id: 'chat-103', user: 'Jane Smith', messages: 32, time: '1 hour ago', sentiment: 'Positive' },
  ];

  // --- TAB RENDERERS ---
  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Recent Users</h3>
          <button onClick={() => setActiveTab('users')} className="text-sm text-indigo-600 font-medium hover:text-indigo-800">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">{user.joined}</td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                      <Settings size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-indigo-500"/> Avatar Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-600 font-medium">Avg. AI Response Time</span>
              <span className="text-xl font-bold text-green-600">{analyticsData.avgResponseTime}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-600 font-medium">Total AI Interactions</span>
              <span className="text-xl font-bold text-indigo-600">{analyticsData.totalInteractions}</span>
            </div>
          </div>
        </div>

        {/* Animation Usage Chart (Built with Tailwind) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-500"/> Top Animations Triggered
          </h3>
          <div className="space-y-4">
            {analyticsData.topAnimations.map((anim, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{anim.name}</span>
                  <span className="text-gray-500">{anim.usage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={`${anim.color} h-2.5 rounded-full`} style={{ width: `${anim.usage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderChatLogs = () => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Recent AI Conversations</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {chatLogs.map((log, idx) => (
          <div key={idx} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <MessageSquare size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{log.user}</p>
                <p className="text-sm text-gray-500">{log.messages} messages • {log.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                log.sentiment === 'Positive' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {log.sentiment}
              </span>
              <button className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-800 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                <Eye size={16} /> View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Zara Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}
          >
            <Activity size={20} />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}
          >
            <BarChart3 size={20} />
            <span>Analytics & Stats</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}
          >
            <Users size={20} />
            <span>Users & Roles</span>
          </button>
          <button 
            onClick={() => setActiveTab('chats')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'chats' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}
          >
            <MessageSquare size={20} />
            <span>Chat Logs</span>
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Exit Admin</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            {activeTab === 'chats' ? 'Chat Logs' : activeTab}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64 transition-shadow"
            />
          </div>
        </header>

        {/* Dashboard Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'users' && renderOverview() /* Reusing overview table for users tab as placeholder */}
            {activeTab === 'chats' && renderChatLogs()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;