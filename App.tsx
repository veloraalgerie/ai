import React, { useState } from 'react';
import UserList from './components/UserList';
import ChatView from './components/ChatView';
import { User, Message } from './types';

// Mock Data
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Marie (Assistante IA)',
    avatar: 'https://picsum.photos/200/200?random=1',
    status: 'En ligne',
    lastMessage: 'Bonjour ! Comment puis-je vous aider ?',
    lastMessageTime: '10:30'
  },
  {
    id: '2',
    name: 'Thomas (Tech)',
    avatar: 'https://picsum.photos/200/200?random=2',
    status: 'Au travail',
    lastMessage: 'Je peux analyser ton code si tu veux.',
    lastMessageTime: 'Hier'
  },
  {
    id: '3',
    name: 'Sophie (Design)',
    avatar: 'https://picsum.photos/200/200?random=3',
    status: 'Disponible',
    lastMessage: 'Envoie-moi le logo.',
    lastMessageTime: 'Lundi'
  },
  {
    id: '4',
    name: 'Groupe Projet',
    avatar: 'https://picsum.photos/200/200?random=4',
    status: 'Alex, Sarah, Toi...',
    lastMessage: 'Alex: On se voit à 14h ?',
    lastMessageTime: 'Mardi'
  }
];

const App: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [chatSessions, setChatSessions] = useState<Record<string, Message[]>>({});

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    // Initialize session if not exists
    if (!chatSessions[user.id]) {
      setChatSessions(prev => ({
        ...prev,
        [user.id]: []
      }));
    }
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  const handleSendMessage = (userId: string, text: string, file?: { data: string; mimeType: string; name: string }) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text,
      timestamp: new Date(),
      file
    };

    setChatSessions(prev => ({
      ...prev,
      [userId]: [...(prev[userId] || []), newMessage]
    }));
  };

  const handleReceiveMessage = (userId: string, text: string) => {
    const newMessage: Message = {
      id: (Date.now() + 1).toString(),
      senderId: userId,
      text,
      timestamp: new Date()
    };

    setChatSessions(prev => ({
      ...prev,
      [userId]: [...(prev[userId] || []), newMessage]
    }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#e5ddd5] py-0 sm:py-6 h-screen font-sans">
      {/* 
          Main Container: Fixed max-width to simulate a mobile app column.
          Always full height on mobile, slightly rounded and padded on desktop.
      */}
      <div className="w-full h-full sm:max-w-[420px] sm:h-[90vh] bg-white sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col relative border border-gray-200">
        
        {/* View Switching: Either List OR Chat. No split view. */}
        {!selectedUser ? (
           <div className="w-full h-full flex flex-col">
               <UserList users={MOCK_USERS} onSelectUser={handleSelectUser} />
           </div>
        ) : (
           <div className="w-full h-full flex flex-col">
            <ChatView 
              user={selectedUser} 
              messages={chatSessions[selectedUser.id] || []}
              onBack={handleBack}
              onSendMessage={handleSendMessage}
              onReceiveMessage={handleReceiveMessage}
            />
           </div>
        )}

      </div>
    </div>
  );
};

export default App;