import { io } from 'socket.io-client';

// Use the current host's IP instead of hardcoded localhost
const URL = process.env.NODE_ENV === 'production' ? undefined : `http://${window.location.hostname}:4000`;

export const socket = io(URL, {
  autoConnect: false
});
