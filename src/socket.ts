import { io } from "socket.io-client";

const socket = io("https://chat-backend-ug0t.onrender.com");
export default socket;