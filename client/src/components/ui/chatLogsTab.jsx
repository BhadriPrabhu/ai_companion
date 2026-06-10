import React from 'react';
import { MessageSquare, Eye } from 'lucide-react';

const ChatLogsTab = () => {
  const chatLogs = [
    { id: 'chat-101', user: 'Guest', messages: 14, time: '2 mins ago', sentiment: 'Positive' },
    { id: 'chat-102', user: 'John Doe', messages: 8, time: '15 mins ago', sentiment: 'Neutral' },
    { id: 'chat-103', user: 'Jane Smith', messages: 32, time: '1 hour ago', sentiment: 'Positive' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Recent AI Conversations</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {chatLogs.map((log, idx) => (
          <div key={idx} className="px-4 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg border border-teal-100">
                <MessageSquare size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{log.user}</p>
                <p className="text-sm text-slate-500">{log.messages} messages • {log.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${log.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                {log.sentiment}
              </span>
              <button className="flex items-center gap-1 text-sm text-teal-600 font-medium hover:text-teal-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors hover:bg-slate-50">
                <Eye size={16} /> View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatLogsTab;