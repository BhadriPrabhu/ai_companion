import React, { useState } from 'react';
import { Activity, BarChart3, Users, MessageSquare, Search, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OverviewTab from '../components/ui/overviewTab';
import AnalyticsTab from '../components/ui/analyticsTab';
import UsersTab from '../components/ui/usersTab';
import ChatLogsTab from '../components/ui/chatLogsTab';


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Light Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col z-10 shadow-lg">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Zara Admin
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-teal-100 text-teal-800 font-semibold' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-medium'}`}
          >
            <Activity size={20} />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-teal-100 text-teal-800 font-semibold' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-medium'}`}
          >
            <BarChart3 size={20} />
            <span>Analytics & Stats</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${activeTab === 'users' ? 'bg-teal-100 text-teal-800 font-semibold' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-medium'}`}
          >
            <Users size={20} />
            <span>Users & Roles</span>
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${activeTab === 'chats' ? 'bg-teal-100 text-teal-800 font-semibold' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-medium'}`}
          >
            <MessageSquare size={20} />
            <span>Chat Logs</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-indigo-600 border border-gray-350/50 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors font-medium"
            onClick={() => navigate("/")}
          >
            <Bot size={24} />
            <span>Go to ChatBot</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-2xl font-bold text-slate-800 capitalize">
            {activeTab === 'chats' ? 'Chat Logs' : activeTab}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white w-64 transition-all text-sm text-slate-700"
            />
          </div>
        </header>

        {/* Dashboard Content Area */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'chats' && <ChatLogsTab />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;