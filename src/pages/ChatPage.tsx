import { useEffect, useState } from "react";
import { Send, Users, MessageCircle, LogOut } from "lucide-react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

// Lista de usuarios simulados para el sidebar
const mockUsers = [
  { id: 1, name: "Alice", avatar: "https://i.pravatar.cc/150?img=1", online: true },
  { id: 2, name: "Bob", avatar: "https://i.pravatar.cc/150?img=2", online: false },
  { id: 3, name: "Charlie", avatar: "https://i.pravatar.cc/150?img=3", online: true },
  { id: 4, name: "David", avatar: "https://i.pravatar.cc/150?img=4", online: false },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
  const nickname = localStorage.getItem("nickname") || "Invitado";

  useEffect(() => {
    // Escucha historial enviado por el servidor al conectar
    socket.on("chatHistory", (hist) => setMessages(hist));

    // Escucha nuevos mensajes
    socket.on("receiveMessage", (msg) =>
      setMessages((prev) => [...prev, msg])
    );

    // Limpieza al desmontar
    return () => {
      socket.off("chatHistory");
      socket.off("receiveMessage");
    };
  }, []);

  const send = () => {
    if (!text.trim()) return;
    socket.emit("sendMessage", { sender: nickname, content: text });
    setText("");
  };

  const handleLogout = () => {
    localStorage.removeItem("nickname");
    window.location.reload();
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar izquierdo - Lista de usuarios */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header del sidebar */}
        <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold bg-gradient-to-br from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  {nickname[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-lg">{nickname}</p>
                <p className="text-xs text-cyan-100">Online</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Título de mensajes directos */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-600 flex items-center">
            <MessageCircle size={16} className="mr-2" />
            Direct Messages
          </h2>
        </div>

        {/* Lista de usuarios */}
        <div className="flex-1 overflow-y-auto">
          {mockUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`p-4 flex items-center space-x-3 cursor-pointer transition ${
                selectedUser.id === user.id
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {user.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de chat principal */}
      <div className="flex-1 flex flex-col">
        {/* Header del chat */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {selectedUser.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{selectedUser.name}</h2>
              <p className="text-xs text-gray-500">
                {selectedUser.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users size={20} className="text-gray-500" />
          </div>
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {messages.map((m, i) => {
            const isOwn = m.sender === nickname;
            return (
              <div
                key={i}
                className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-end space-x-2 max-w-md ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}>
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {m.sender[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm"
                          : "bg-white text-gray-900 rounded-bl-sm shadow"
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-semibold mb-1 text-gray-600">
                          {m.sender}
                        </p>
                      )}
                      <p className="text-sm break-words">{m.content}</p>
                    </div>
                    <p className={`text-xs text-gray-400 mt-1 ${isOwn ? "text-right" : "text-left"}`}>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input de mensaje */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 max-w-4xl mx-auto">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
            />
            <button
              onClick={send}
              disabled={!text.trim()}
              className={`p-3 rounded-full transition ${
                text.trim()
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}