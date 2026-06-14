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
    { title: 'Total Users', value: '1,248', change: '+12%', icon: <Users size={20} className="text-teal-500" /> },
    { title: 'Active Chat Sessions', value: '342', change: '+5%', icon: <MessageSquare size={20} className="text-blue-500" /> },
    { title: 'API Requests Today', value: apiStats?.total_requests || 'NA', change: '+18%', icon: <Activity size={20} className="text-amber-500" /> },
    { title: 'Min Response Time', value: apiStats?.min_response_time_ms ? `${apiStats.min_response_time_ms}ms` : 'NA', change: '-2ms', icon: <ArrowDown size={20} className="text-emerald-500" /> },
    { title: 'Avg Response Time', value: apiStats?.avg_response_time_ms ? `${apiStats.avg_response_time_ms}ms` : 'NA', change: '-0.1s', icon: <Zap size={20} className="text-indigo-500" /> },
    { title: 'Max Response Time', value: apiStats?.max_response_time_ms ? `${apiStats.max_response_time_ms}ms` : 'NA', change: '-0.5s', icon: <ArrowUp size={20} className="text-orange-500" /> },
    { title: 'Token Usage Today', value: '1.2M', change: '+8%', icon: <Activity size={20} className="text-purple-500" /> },
    { title: 'Error Rate', value: '0.04%', change: '-0.01%', icon: <AlertCircle size={20} className="text-rose-500" /> },
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users Table (Takes up 2/3 width on large screens) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-800">Recent Users</h3>
            <button onClick={() => setActiveTab('users')} className="text-sm text-teal-600 font-medium hover:text-teal-700 transition-colors bg-teal-50 px-3 py-1.5 rounded-lg">View All</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-slate-500 text-sm border-b border-slate-100">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wider ${user.role === 'admin' ? 'bg-teal-100 text-teal-700 border border-teal-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{user.joined}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-teal-600 transition-colors p-2 hover:bg-teal-50 rounded-lg">
                        <Settings size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              <p className="text-xs text-emerald-600">Operational • 99.9% Uptime</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">TTS Audio Latency</span>
                <span className="text-sm font-bold text-slate-800">240ms</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-teal-500 h-1.5 rounded-full w-[24%]"></div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">Rhubarb Processing</span>
                <span className="text-sm font-bold text-slate-800">85ms</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full w-[10%]"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default OverviewTab;