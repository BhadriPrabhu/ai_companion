import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import api from '../../api/api';
import { formatDate } from '../../utils/dateFormatter';

const UsersTab = () => {

  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const result = await api.get(`/admin/allChat`);
      setUsers(result.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-lg font-semibold text-slate-800">All Registered Users</h3>
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
            {users.length > 0 ? (
              <>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{user.name || "User"}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wider ${user.role === 'admin' ? 'bg-teal-100 text-teal-700 border border-teal-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(user.created_at || "", true)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-teal-600 transition-colors p-2 hover:bg-teal-50 rounded-lg">
                        <Settings size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                  No Users Found
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTab;