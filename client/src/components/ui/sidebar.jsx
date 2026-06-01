import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Check, X } from 'lucide-react';

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
    e.stopPropagation(); // Prevents chat selection when clicking edit
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
      
      // Update local state
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
      
      // If the deleted chat was the active one, switch to the next available one
      if (currentChatId === chatId) {
        onSelectChat(updatedChats.length > 0 ? updatedChats[0].id : null);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
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

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Recent Chats</h3>
        
        {chats.map(chat => (
          <div 
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${currentChatId === chat.id ? 'bg-gray-800 border border-gray-700' : 'hover:bg-gray-800/50'}`}
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
                  className="flex-1 min-w-0 bg-gray-700 text-sm text-white px-2 py-1 rounded outline-none border border-indigo-500"
                />
                <button onClick={(e) => handleEditSave(e, chat.id)} className="text-green-400 hover:text-green-300">
                  <Check size={16} />
                </button>
                <button onClick={handleEditCancel} className="text-gray-400 hover:text-gray-300">
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
                    className="text-gray-400 hover:text-indigo-400 transition-colors"
                    title="Edit Title"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, chat.id)} 
                    className="text-gray-400 hover:text-red-400 transition-colors"
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
          <p className="text-xs text-gray-500 italic text-center mt-4">No recent chats.</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;