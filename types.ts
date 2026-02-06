export interface User {
  id: string;
  name: string;
  avatar: string;
  status: string; // e.g., "En ligne", "Occupé"
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface Message {
  id: string;
  senderId: string; // 'me' or user.id
  text: string;
  timestamp: Date;
  file?: {
    data: string; // base64
    mimeType: string;
    name: string;
  };
}

export interface ChatSession {
  userId: string;
  messages: Message[];
}
