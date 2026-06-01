import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Check, X, Plus } from 'lucide-react';

const Sidebar = ({ currentChatId, onSelectChat }) => {
  const [chats, setChats] = useState([]);
  
  // State for editing
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/chats`);
        setChats(response.data);
        
        if (response.data.length > 0 && !currentChatId) {
          onSelectChat(response.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchChats();
  }, [currentChatId, onSelectChat]);

  // Focus input automatically when editing starts
  useEffect(() => {
    if (editingChatId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingChatId]);

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

  const handleEditStart = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditCancel = (e) => {
    e.stopPropagation();
    setEditingChatId(null);
    setEditTitle("");
  };

  const handleEditSave = async (e, chatId) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      handleEditCancel(e);
      return;
    }

    try {
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_API_URL}/api/chats/${chatId}`, {
        title: editTitle.trim()
      });
      
      setChats(chats.map(chat => chat.id === chatId ? response.data : chat));
      setEditingChatId(null);
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
  };

  const handleDelete = async (e, chatId) => {
    e.stopPropagation();
    const isConfirmed = window.confirm("Are you sure you want to delete this chat?");
    if (!isConfirmed) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_API_URL}/api/chats/${chatId}`);
      
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      
      if (currentChatId === chatId) {
        onSelectChat(updatedChats.length > 0 ? updatedChats[0].id : null);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  return (
    <div className="w-64 h-full bg-white/60 backdrop-blur-md border-r border-white/60 shadow-xl text-gray-800 p-4 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300">
      
      <button 
        onClick={createNewChat}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl mb-6 flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all border border-indigo-700"
      >
        <Plus size={18} />
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Recent Chats</h3>
        
        {chats.map(chat => (
          <div 
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
              currentChatId === chat.id 
                ? 'bg-white/90 border-gray-200/80 shadow-sm text-indigo-700 font-medium' 
                : 'border-transparent hover:bg-white/50 hover:border-gray-200/50 text-gray-700'
            }`}
          >
            {editingChatId === chat.id ? (
              // Edit Mode UI
              <div className="flex items-center w-full gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEditSave(e, chat.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 min-w-0 bg-white text-sm text-gray-800 px-2 py-1 rounded-md outline-none border border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
                />
                <button onClick={(e) => handleEditSave(e, chat.id)} className="text-green-600 hover:text-green-700 transition-colors">
                  <Check size={16} />
                </button>
                <button onClick={handleEditCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ) : (
              // Normal View Mode UI
              <>
                <p className="text-sm truncate flex-1 pr-2">{chat.title}</p>
                
                {/* Action buttons appear on group hover */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleEditStart(e, chat)} 
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Edit Title"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, chat.id)} 
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete Chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {chats.length === 0 && (
          <p className="text-xs text-gray-400 italic text-center mt-6">No recent chats.</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;