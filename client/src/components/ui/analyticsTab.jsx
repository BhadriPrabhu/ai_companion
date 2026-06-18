import React, { useEffect, useState } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import api from '../../api/api';

const AnalyticsTab = () => {

  const [analyticsData, setAnalyticsData] = useState({
    avgResponseTime: 0,
    totalInteractions: 0,
    topAnimations: [
      { name: 'Talking (Default)', usage: 85, color: 'bg-teal-500' },
      { name: 'Happy / Smiling', usage: 62, color: 'bg-blue-500' },
      { name: 'Thinking', usage: 45, color: 'bg-amber-500' },
      { name: 'Laughing', usage: 28, color: 'bg-rose-500' },
      { name: 'Sad / Confused', usage: 12, color: 'bg-slate-500' },
    ]
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.get("/admin/avatarStats");
        const response_time = msres(result.data.data.response_time)
        setAnalyticsData({ ...analyticsData, avgResponseTime: response_time, totalInteractions: result.data.data.interact_count });
      } catch (error) {
        console.log("Failed to load avatarStats: ", error);
      }
    }
    fetchData();
  }, []);

  // const analyticsData = {
  //   avgResponseTime: '1.2s',
  //   totalInteractions: '45,912',
  //   topAnimations: [
  //     { name: 'Talking (Default)', usage: 85, color: 'bg-teal-500' },
  //     { name: 'Happy / Smiling', usage: 62, color: 'bg-blue-500' },
  //     { name: 'Thinking', usage: 45, color: 'bg-amber-500' },
  //     { name: 'Laughing', usage: 28, color: 'bg-rose-500' },
  //     { name: 'Sad / Confused', usage: 12, color: 'bg-slate-500' },
  //   ]
  // };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-teal-500" /> Avatar Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-600 font-medium">Avg. AI Response Time</span>
              <span className="text-xl font-bold text-teal-600">{analyticsData.avgResponseTime}ms</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-600 font-medium">Total AI Interactions</span>
              <span className="text-xl font-bold text-blue-600">{analyticsData.totalInteractions}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-amber-500" /> Top Animations Triggered
          </h3>
          <div className="space-y-4">
            {analyticsData.topAnimations.map((anim, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{anim.name}</span>
                  <span className="text-slate-500">{anim.usage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className={`${anim.color} h-2 rounded-full`} style={{ width: `${anim.usage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;