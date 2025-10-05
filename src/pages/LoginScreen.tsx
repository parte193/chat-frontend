import { useState } from "react";
import { Rocket, Lock, User } from "lucide-react";

interface LoginScreenProps {
  onJoin: (nickname: string) => void;
}

export default function LoginScreen({ onJoin }: LoginScreenProps) {
  const [nickname, setNickname] = useState("");

  const handleJoin = () => {
    if (nickname.trim()) {
      onJoin(nickname.trim());
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Lado izquierdo - Imagen y branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 items-center justify-center p-12">
        {/* Partículas decorativas */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-cyan-500 rounded-full opacity-10 blur-3xl -top-20 -left-20 animate-pulse"></div>
          <div
            className="absolute w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl -bottom-20 -right-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Contenido */}
        <div className="relative z-10 text-center">
          <img
            src="/login.png"
            alt="SDH Inc. Chat"
            className="w-full max-w-60 mx-auto drop-shadow-2xl"
          />
          <div className="mt-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Bienvenido a SDH Chat
            </h2>
            <p className="text-cyan-300 text-lg">
              Innovative Tech Solutions • Comunicación en tiempo real
            </p>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 text-white">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg transform hover:scale-110 transition-transform">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-semibold">Seguro</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg transform hover:scale-110 transition-transform">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-semibold">Rápido</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg transform hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-semibold">Intuitivo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario flotante */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 relative">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-72 h-72 bg-cyan-200 rounded-full opacity-20 blur-3xl top-10 right-10"></div>
          <div className="absolute w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl bottom-10 left-10"></div>
        </div>

        {/* Card flotante */}
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white backdrop-blur-lg bg-opacity-95 shadow-2xl rounded-3xl p-10 border border-gray-200">
            {/* Logo móvil */}
            <div className="lg:hidden mb-8 text-center">
              <img
                src="/login.png"
                alt="Login"
                className="w-40 mx-auto mb-4 rounded-3xl shadow-2xl ring-4 ring-cyan-500 ring-opacity-30"
              />
            </div>

            {/* Encabezado */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
                Iniciar Sesión
              </h1>
              <p className="text-gray-500 text-center">
                Ingresa tu alias para comenzar a chatear
              </p>
            </div>

            {/* Formulario */}
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="nickname"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Alias / Nickname
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nickname"
                    type="text"
                    placeholder="Ej: Captain Coder"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleJoin}
                disabled={!nickname.trim()}
                className={`w-full py-3 rounded-xl font-semibold transition-all transform ${
                  nickname.trim()
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {nickname.trim() ? (
                  <span className="flex items-center justify-center">
                    <Rocket className="w-5 h-5 mr-2" />
                    Ingresar al Chat
                  </span>
                ) : (
                  "Ingresa un alias"
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                SDH Inc. • Innovative Tech Solutions
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Powered by InstantConnect
              </p>
            </div>
          </div>

          {/* Elemento decorativo */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full opacity-20 blur-2xl -z-10"></div>
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full opacity-20 blur-2xl -z-10"></div>
        </div>
      </div>
    </div>
  );
}
