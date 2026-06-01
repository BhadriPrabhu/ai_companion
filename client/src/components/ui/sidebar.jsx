import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Sidebar = ({ currentChatId, onSelectChat }) => {
  const [chats, setChats] = useState([]);

  // Fetch all chats for the sidebar
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/chats`);
        setChats(response.data);
        
        // Auto-select the most recent chat if none is selected
        if (response.data.length > 0 && !currentChatId) {
          onSelectChat(response.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchChats();
  }, [currentChatId, onSelectChat]);

  const createNewChat = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/chats`, {
        title: "New Conversation"
      });
      setChats([response.data, ...chats]);
      onSelectChat(response.data.id);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  return (
    <div className="w-64 h-full bg-gray-900 text-white p-4 flex flex-col fixed left-0 top-0 z-50">
      <button 
        onClick={createNewChat}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl mb-6 transition-colors"
      >
        + New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-2">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Recent Chats</h3>
        {chats.map(chat => (
          <div 
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${currentChatId === chat.id ? 'bg-gray-800 border border-gray-700' : 'hover:bg-gray-800/50'}`}
          >
            <p className="text-sm truncate">{chat.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;