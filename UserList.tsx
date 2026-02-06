import React from 'react';
import { User } from '../types';
import { MessageSquare } from 'lucide-react';

interface UserListProps {
  users: User[];
  onSelectUser: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onSelectUser }) => {
  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="h-[60px] bg-[#008069] flex items-center justify-between px-4 shrink-0 shadow-md z-10">
        <h1 className="text-white font-bold text-lg tracking-wide">WhatsChat AI</h1>
        <div className="flex gap-4 text-white opacity-80">
          <MessageSquare size={20} />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-100"
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="ml-4 flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h2 className="text-black font-semibold truncate text-[16px]">
                  {user.name}
                </h2>
                {user.lastMessageTime && (
                  <span className="text-xs text-black shrink-0 font-medium">
                    {user.lastMessageTime}
                  </span>
                )}
              </div>
              <div className="flex items-center text-black text-[14px] truncate opacity-80">
                <span className="truncate">{user.lastMessage || "Appuyez pour discuter"}</span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Footer info */}
        <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center">
            <p>Vos messages personnels sont chiffrés de bout en bout (simulé).</p>
        </div>
      </div>
    </div>
  );
};

export default UserList;