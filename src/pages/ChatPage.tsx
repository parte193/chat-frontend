import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Users,
  MessageCircle,
  LogOut,
  Bell,
  Hash,
  Plus,
  X,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import io from "socket.io-client";

const socket = io("http://localhost:4000", {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

interface Space {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  isDefault: boolean;
}

interface Message {
  sender: string;
  content: string;
  timestamp: string;
  space?: string;
  type: "space" | "dm";
  receiver?: string;
  image?: {
    data: string;
    contentType: string;
    filename: string;
  };
  isNew?: boolean;
}

interface ConnectedUser {
  socketId?: string;
  nickname: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [currentSpace, setCurrentSpace] = useState("general");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [allUsers, setAllUsers] = useState<ConnectedUser[]>([]);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
  const [newMessageSender, setNewMessageSender] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceDesc, setNewSpaceDesc] = useState("");
  const [isDM, setIsDM] = useState(false);
  const [dmWith, setDmWith] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [unreadDMs, setUnreadDMs] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nickname = localStorage.getItem("nickname") || "Invitado";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar espacios desde la API
  const loadSpaces = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/spaces");
      const data = await response.json();
      setSpaces(data);
      console.log("📂 Espacios cargados:", data.length);
    } catch (error) {
      console.error("Error cargando espacios:", error);
    }
  };

  useEffect(() => {
    loadSpaces();
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("nickname")) {
      navigate("/");
      return;
    }

    console.log("🔌 Iniciando conexión al servidor...");

    socket.on("connect", () => {
      console.log("✅ Conectado al servidor:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Desconectado del servidor");
      setIsConnected(false);
      setHasJoined(false);
    });

    socket.on("allUsers", (users: ConnectedUser[]) => {
      console.log("🌐 Todos los usuarios conectados:", users);
      setAllUsers(users);
    });

    socket.on("spaceUsers", (users: ConnectedUser[]) => {
      console.log("👥 Usuarios en el espacio:", users);
      setConnectedUsers(users);
    });

    socket.on("chatHistory", (hist) => {
      console.log(`📦 Historial de espacio recibido: ${hist.length} mensajes`);
      const messagesWithTimestamp = hist.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
        isNew: false,
      }));
      setMessages(messagesWithTimestamp);
    });

    socket.on("dmHistory", (hist) => {
      console.log(`📦 Historial DM recibido: ${hist.length} mensajes`);
      const messagesWithTimestamp = hist.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
        isNew: false,
      }));
      setMessages(messagesWithTimestamp);
    });

    socket.on("receiveMessage", (msg) => {
      console.log("📨 Nuevo mensaje en espacio:", msg);
      handleNewMessage(msg);
    });

    socket.on("receiveDM", (msg) => {
      console.log("💬 Nuevo mensaje DM:", msg);
      handleNewMessage(msg);
    });

    socket.on("newDMNotification", ({ from }) => {
      setUnreadDMs((prev) => ({ ...prev, [from]: true }));
      setNewMessageSender(from);
      setShowNewMessageAlert(true);
      setTimeout(() => setShowNewMessageAlert(false), 3000);
    });

    socket.on("userJoined", ({ nickname: joinedUser }) => {
      console.log(`✅ ${joinedUser} se unió`);
    });

    socket.on("userLeft", ({ nickname: leftUser }) => {
      console.log(`❌ ${leftUser} salió`);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("spaceUsers");
      socket.off("allUsers");
      socket.off("chatHistory");
      socket.off("dmHistory");
      socket.off("receiveMessage");
      socket.off("receiveDM");
      socket.off("newDMNotification");
      socket.off("userJoined");
      socket.off("userLeft");
    };
  }, [navigate, nickname]);

  const handleNewMessage = (msg: any) => {
    const messageWithTimestamp = {
      ...msg,
      timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
      isNew: msg.sender !== nickname,
    };

    setMessages((prev) => [...prev, messageWithTimestamp]);

    if (msg.sender !== nickname) {
      setNewMessageSender(msg.sender);
      setShowNewMessageAlert(true);
      setTimeout(() => setShowNewMessageAlert(false), 3000);
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.timestamp === messageWithTimestamp.timestamp &&
            m.sender === msg.sender
              ? { ...m, isNew: false }
              : m
          )
        );
      }, 2000);
    }
  };

  useEffect(() => {
    if (isConnected && !hasJoined && !isDM) {
      console.log(`🚪 Uniéndose al espacio: ${currentSpace} como ${nickname}`);
      socket.emit("join", { nickname, space: currentSpace });
      setHasJoined(true);
    }
  }, [isConnected, hasJoined, currentSpace, nickname, isDM]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen no debe superar 2MB");
      return;
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes");
      return;
    }

    setSelectedImage(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const send = async () => {
    if (!text.trim() && !selectedImage) return;

    let imageData = undefined;

    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        imageData = {
          data: base64,
          contentType: selectedImage.type,
          filename: selectedImage.name,
          size: selectedImage.size,
        };

        socket.emit("sendMessage", {
          sender: nickname,
          content: text.trim(),
          image: imageData,
        });

        setText("");
        setSelectedImage(null);
        setImagePreview("");
      };
      reader.readAsDataURL(selectedImage);
    } else {
      socket.emit("sendMessage", {
        sender: nickname,
        content: text.trim(),
      });
      setText("");
    }
  };

  const changeSpace = (spaceId: string) => {
    if (spaceId === currentSpace) return;

    console.log(`🔄 Cambiando a espacio ${spaceId}`);
    setCurrentSpace(spaceId);
    setMessages([]);
    setConnectedUsers([]);
    setIsDM(false);
    setDmWith("");
    socket.emit("changeSpace", { space: spaceId });
  };

  const createSpace = async () => {
    if (!newSpaceName.trim()) return;

    try {
      const response = await fetch("http://localhost:4000/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSpaceName.trim(),
          description: newSpaceDesc.trim(),
          createdBy: nickname,
        }),
      });

      if (response.ok) {
        const newSpace = await response.json();
        console.log("✅ Espacio creado:", newSpace);
        await loadSpaces();
        setShowCreateSpace(false);
        setNewSpaceName("");
        setNewSpaceDesc("");
        changeSpace(newSpace.name);
      } else {
        const error = await response.json();
        alert(error.error || "Error al crear espacio");
      }
    } catch (error) {
      console.error("Error creando espacio:", error);
      alert("Error al crear espacio");
    }
  };

  const startDM = (userNickname: string) => {
    if (userNickname === nickname) return;

    console.log(`💬 Iniciando DM con ${userNickname}`);
    setIsDM(true);
    setDmWith(userNickname);
    setMessages([]); // 🔹 limpia el historial anterior
    socket.emit("startDM", { receiver: userNickname });
  };

  const closeDM = () => {
    console.log("🔙 Cerrando DM");
    setIsDM(false);
    setDmWith("");
    setMessages([]); // 🔹 limpia el historial DM
    socket.emit("closeDM", { space: currentSpace });
  };

  const handleLogout = () => {
    localStorage.removeItem("nickname");
    socket.disconnect();
    navigate("/");
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    const timeStr = date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) {
      return timeStr;
    } else {
      const dateStr = date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `${dateStr} ${timeStr}`;
    }
  };

  const currentSpaceInfo = spaces.find((s) => s.name === currentSpace);

  return (
    <div className="h-screen flex bg-gray-100">
      {showNewMessageAlert && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3">
            <Bell className="w-6 h-6 animate-pulse" />
            <div>
              <p className="font-bold">NUEVO MENSAJE</p>
              <p className="text-sm">de {newMessageSender}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear espacio */}
      {showCreateSpace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Crear Espacio</h3>
              <button
                onClick={() => setShowCreateSpace(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  placeholder="Ej: Proyecto X"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={newSpaceDesc}
                  onChange={(e) => setNewSpaceDesc(e.target.value)}
                  placeholder="Breve descripción..."
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={createSpace}
                disabled={!newSpaceName.trim()}
                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Espacio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
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
                <div
                  className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isConnected
                      ? "bg-green-500 bg-opacity-80"
                      : "bg-red-500 bg-opacity-80"
                  }`}
                >
                  {isConnected ? "Conectado" : "Desconectado"}
                </div>
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

        {/* Espacios */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-600 flex items-center">
              <Hash size={16} className="mr-2" />
              Espacios
            </h2>
            <button
              onClick={() => setShowCreateSpace(true)}
              className="p-1 hover:bg-gray-100 rounded transition"
              title="Crear espacio"
            >
              <Plus size={18} className="text-cyan-600" />
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {spaces.map((space) => (
              <button
                key={space._id}
                onClick={() => changeSpace(space.name)}
                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${
                  currentSpace === space.name && !isDM
                    ? "bg-blue-50 border-l-4 border-blue-500 font-semibold"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Hash size={14} />
                  <span className="text-sm truncate">{space.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mensajes Directos */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-600 flex items-center mb-3">
            <MessageCircle size={16} className="mr-2" />
            Mensajes Directos
          </h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {allUsers
              .filter((u) => u.nickname !== nickname)
              .map((user) => (
                <button
                  key={user.nickname}
                  onClick={() => startDM(user.nickname)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center space-x-2 ${
                    isDM && dmWith === user.nickname
                      ? "bg-blue-50 border-l-4 border-blue-500 font-semibold"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: unreadDMs[user.nickname]
                        ? "red"
                        : "green",
                    }}
                  ></div>
                  <span className="text-sm">{user.nickname}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Usuarios en espacio actual */}
        {!isDM && (
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-600 flex items-center mb-3">
              <Users size={16} className="mr-2" />
              En este espacio ({connectedUsers.length})
            </h2>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {connectedUsers.map((user, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span
                    className={
                      user.nickname === nickname
                        ? "font-semibold text-cyan-600"
                        : "text-gray-700"
                    }
                  >
                    {user.nickname} {user.nickname === nickname && "(tú)"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            {isDM && (
              <button
                onClick={closeDM}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
            )}
            <div
              className={`w-10 h-10 ${
                isDM ? "bg-purple-500" : "bg-cyan-500"
              } rounded-lg flex items-center justify-center text-white text-xl`}
            >
              {isDM ? "💬" : "#"}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {isDM
                  ? `Chat con ${dmWith}`
                  : currentSpaceInfo?.name || currentSpace}
              </h2>
              <p className="text-xs text-gray-500">
                {isDM ? "Mensaje directo" : `${connectedUsers.length} usuarios`}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {messages.length} mensajes
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>
                {isDM
                  ? "Inicia la conversación"
                  : "No hay mensajes. ¡Sé el primero en escribir!"}
              </p>
            </div>
          )}

          {messages.map((m, i) => {
            const isOwn = m.sender === nickname;
            return (
              <div
                key={i}
                className={`flex mb-4 ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-end space-x-2 max-w-md ${
                    isOwn ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {m.sender[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div
                      className={`px-4 py-2 rounded-2xl relative ${
                        isOwn
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm"
                          : "bg-white text-gray-900 rounded-bl-sm shadow"
                      }`}
                    >
                      {m.isNew && !isOwn && (
                        <div className="absolute -top-2 -right-2">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                            NUEVO
                          </span>
                        </div>
                      )}

                      {!isOwn && (
                        <p
                          className={`text-xs font-semibold mb-1 ${
                            isOwn ? "text-cyan-100" : "text-cyan-600"
                          }`}
                        >
                          {m.sender}
                          {m.isNew && (
                            <span className="ml-2 text-red-500 font-bold">
                              • NUEVO MENSAJE
                            </span>
                          )}
                        </p>
                      )}

                      {m.image && (
                        <img
                          src={m.image.data}
                          alt={m.image.filename}
                          className="rounded-lg mb-2 max-w-xs"
                        />
                      )}

                      {m.content && (
                        <p className="text-sm break-words">{m.content}</p>
                      )}
                    </div>
                    <p
                      className={`text-xs text-gray-400 mt-1 ${
                        isOwn ? "text-right" : "text-left"
                      }`}
                    >
                      {formatDateTime(m.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          {imagePreview && (
            <div className="mb-2 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 rounded-lg"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview("");
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div className="flex items-center space-x-3 max-w-4xl mx-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 hover:bg-gray-100 rounded-full transition"
              title="Adjuntar imagen"
            >
              <ImageIcon size={20} className="text-gray-500" />
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={
                isDM
                  ? `Mensaje a ${dmWith}...`
                  : `Mensaje en ${currentSpaceInfo?.name || currentSpace}...`
              }
              className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
            />
            <button
              onClick={send}
              disabled={!text.trim() && !selectedImage}
              className={`p-3 rounded-full transition ${
                text.trim() || selectedImage
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
