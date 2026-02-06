import React, { useState, useRef, useEffect } from 'react';
import { User, Message } from '../types';
import { ArrowLeft, Send, Paperclip, MoreVertical, Phone, Video, Download } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

interface ChatViewProps {
  user: User;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (userId: string, text: string, file?: { data: string; mimeType: string; name: string }) => void;
  onReceiveMessage: (userId: string, text: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ user, messages, onBack, onSendMessage, onReceiveMessage }) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<{ data: string; mimeType: string; name: string } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, selectedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setSelectedFile({
          data: base64Data,
          mimeType: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedFile)) return;

    const textToSend = inputText;
    const fileToSend = selectedFile;
    
    setInputText('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    onSendMessage(user.id, textToSend, fileToSend || undefined);
    setIsTyping(true);

    const responseText = await sendMessageToGemini(
      user.name,
      messages, 
      textToSend,
      fileToSend ? { data: fileToSend.data, mimeType: fileToSend.mimeType } : undefined
    );

    setIsTyping(false);
    onReceiveMessage(user.id, responseText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2]">
      {/* Header */}
      <div className="h-[60px] bg-[#008069] flex items-center px-2 shadow-sm shrink-0 z-10 text-white">
        <button onClick={onBack} className="p-2 mr-1 rounded-full hover:bg-white/10">
          <ArrowLeft size={24} />
        </button>
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        <div className="flex-1 min-w-0 cursor-pointer">
          <h2 className="font-semibold text-[16px] truncate leading-tight">{user.name}</h2>
          <p className="text-[13px] opacity-90 truncate font-light">{isTyping ? 'écrit...' : user.status}</p>
        </div>
        <div className="flex items-center gap-4 px-2">
            <Video size={22} className="opacity-80 cursor-not-allowed" />
            <Phone size={20} className="opacity-80 cursor-not-allowed" />
            <MoreVertical size={20} className="opacity-80 cursor-not-allowed" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-center opacity-100">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-center my-4">
            <span className="bg-[#e7fce3] text-black text-xs px-3 py-1.5 rounded-lg shadow-sm font-medium uppercase opacity-80">
              Aujourd'hui
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.senderId === 'me';
            return (
              <div
                key={msg.id}
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-[80%] md:max-w-[75%] rounded-lg p-2 shadow-sm text-[14.2px] leading-[19px] break-words
                    ${isMe ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}
                  `}
                >
                  {/* Attached File Preview & Download Link */}
                  {msg.file && (
                    <a 
                      href={`data:${msg.file.mimeType};base64,${msg.file.data}`}
                      download={msg.file.name}
                      className="block mb-2 rounded overflow-hidden border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                      title="Cliquer pour télécharger"
                    >
                        {msg.file.mimeType.startsWith('image/') ? (
                             <div className="relative">
                                <img src={`data:${msg.file.mimeType};base64,${msg.file.data}`} alt={msg.file.name} className="max-h-64 w-full object-cover bg-gray-200" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                                  {/* Optional: Add an icon overlay on hover if desired */}
                                </div>
                             </div>
                        ) : (
                            <div className="p-3 flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full shadow-sm shrink-0 text-[#008069]">
                                    <Download size={20} />
                                </div>
                                <div className="flex flex-col overflow-hidden min-w-0">
                                    <span className="text-sm font-medium truncate text-black">{msg.file.name}</span>
                                    <span className="text-[10px] text-gray-500 uppercase">
                                        {msg.file.mimeType.split('/')[1] || 'Fichier'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </a>
                  )}

                  <div className="pr-2 whitespace-pre-wrap text-black">{msg.text}</div>
                  <div className="flex justify-end mt-1 space-x-1 items-center">
                    <span className={`text-[11px] font-medium ${isMe ? 'text-[#0e5c4b]' : 'text-gray-500'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                        <span className="text-[#53bdeb] text-[14px]">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {isTyping && (
             <div className="flex w-full justify-start">
                 <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
                     <div className="flex space-x-1">
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></div>
                     </div>
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] p-2 flex items-end gap-2 shrink-0 min-h-[62px]">
        {/* File Preview */}
        {selectedFile && (
             <div className="absolute bottom-[70px] left-4 bg-white p-2 rounded-lg shadow-lg border border-gray-200 flex items-start gap-3 z-20">
                 <div className="bg-gray-100 rounded w-16 h-16 flex items-center justify-center overflow-hidden">
                    {selectedFile.mimeType.startsWith('image/') ? (
                        <img src={`data:${selectedFile.mimeType};base64,${selectedFile.data}`} className="w-full h-full object-cover" />
                    ) : (
                        <Paperclip className="text-gray-500"/>
                    )}
                 </div>
                 <div className="max-w-[200px]">
                     <p className="text-sm font-medium truncate text-black">{selectedFile.name}</p>
                     <button onClick={() => setSelectedFile(null)} className="text-red-500 text-xs mt-1 hover:underline">Supprimer</button>
                 </div>
             </div>
        )}

        <button 
            className="p-3 text-[#54656f] hover:bg-gray-200 rounded-full transition-colors"
            onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={24} />
        </button>
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileSelect} 
            accept="image/*,application/pdf"
        />

        <div className="flex-1 bg-white rounded-lg px-4 py-2 min-h-[42px] shadow-sm flex items-center">
            <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedFile ? "Ajouter une légende..." : "Tapez un message"}
            className="w-full bg-transparent outline-none text-black placeholder:text-gray-500"
            />
        </div>

        <button
          onClick={handleSend}
          disabled={!inputText.trim() && !selectedFile}
          className={`p-3 rounded-full transition-all duration-200 ${
            (inputText.trim() || selectedFile) 
              ? 'bg-[#008069] text-white hover:bg-[#006d59] shadow-md' 
              : 'text-[#54656f] cursor-default'
          }`}
        >
          <Send size={24} />
        </button>
      </div>
    </div>
  );
};

export default ChatView;