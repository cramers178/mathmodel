import { io } from 'socket.io-client';

// Use the current host's IP instead of hardcoded localhost
// You can set VITE_BACKEND_URL in Vercel environment variables to point to the central server
const URL = import.meta.env.VITE_BACKEND_URL || (process.env.NODE_ENV === 'production' ? undefined : `http://${window.location.hostname}:4000`);

export const socket = io(URL, {
  autoConnect: false
});
