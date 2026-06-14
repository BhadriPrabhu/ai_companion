import React, { useEffect, useState } from 'react';
import { Users, MessageSquare, Activity, Settings, Zap, AlertCircle, Clock, ArrowDown, ArrowUp } from 'lucide-react';
import api from '../../api/api';

const OverviewTab = ({ setActiveTab }) => {

  const [apiStats, setApiStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, [])

  const fetchStats = async () => {
    try {
      const result = await api.get(`/admin/apiStats`);
      setApiStats(result.data?.data || {});
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }

  const stats = [
    {
      title: 'Total Users',
      value: apiStats?.total_users ?? 'NA',
      change: '+12%',
      icon: <Users size={20} className="text-teal-500" />
    },
    {
      title: 'Active Chat Sessions',
      value: apiStats?.active_chat_sessions ?? 'NA',
      change: '+5%',
      icon: <MessageSquare size={20} className="text-blue-500" />
    },
    {
      title: 'API Requests Today',
      value: apiStats?.total_requests ?? 'NA',
      change: '+18%',
      icon: <Activity size={20} className="text-amber-500" />
    },
    {
      title: 'Min Response Time',
      value: apiStats?.min_response_time_ms != null ? `${apiStats.min_response_time_ms}ms` : 'NA',
      change: '-2ms',
      icon: <ArrowDown size={20} className="text-emerald-500" />
    },
    {
      title: 'Avg Response Time',
      value: apiStats?.avg_response_time_ms != null ? `${apiStats.avg_response_time_ms}ms` : 'NA',
      change: '-0.1s',
      icon: <Zap size={20} className="text-indigo-500" />
    },
    {
      title: 'Max Response Time',
      value: apiStats?.max_response_time_ms != null ? `${apiStats.max_response_time_ms}ms` : 'NA',
      change: '-0.5s',
      icon: <ArrowUp size={20} className="text-orange-500" />
    },
    {
      title: 'Token Usage Today',
      value: apiStats?.tokens_used_today ?? 'NA',
      change: '+8%',
      icon: <Activity size={20} className="text-purple-500" />
    },
    {
      title: 'Error Rate',
      value: apiStats?.error_rate_percentage != null ? `${apiStats.error_rate_percentage}%` : 'NA',
      change: '-0.01%',
      icon: <AlertCircle size={20} className="text-rose-500" />
    },
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', joined: '2026-06-08' },
    { id: 2, name: 'Super Admin', email: 'admin@yourdomain.com', role: 'admin', joined: '2026-06-07' },
    { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: 'user', joined: '2026-06-05' },
    { id: 4, name: 'Mike Ross', email: 'mike@example.com', role: 'user', joined: '2026-06-04' },
  ];

  return (
    <>
      {/* Expanded Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-2 bg-slate-200 rounded-lg border border-slate-100">
              {stat.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <span className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-teal-500'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Health / Quick Trends Widget (Takes up 1/3 width) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-slate-400" /> System Health
        </h3>
        <div className="space-y-4 flex-1">

          <div className="p-2 rounded-xl border border-emerald-100 bg-emerald-50/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-emerald-800">Gemini API Status</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xs text-emerald-600 font-bold">Gemini API Latency - {apiStats.gemini_latency_time}ms</p>
            <p className="text-xs text-emerald-600">Operational • 99.9% Uptime</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">TTS Audio Latency</span>
              <span className="text-sm font-bold text-slate-800">{apiStats.tts_latency_time}ms</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-teal-500 h-1.5 rounded-full w-[24%]"></div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">Rhubarb Processing</span>
              <span className="text-sm font-bold text-slate-800">{apiStats.rhubarb_latency_time}ms</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full w-[10%]"></div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default OverviewTab;