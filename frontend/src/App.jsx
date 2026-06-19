import React, { useEffect, useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import RoomList from './pages/RoomList';
import Room from './pages/Room';
import { setToken } from './api';

export default function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('chat_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setTok] = useState(localStorage.getItem('chat_token') || null);
  const [currentRoom, setCurrentRoom] = useState(null);

  useEffect(() => {
    setToken(token);
    if (token) localStorage.setItem('chat_token', token);
    else localStorage.removeItem('chat_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('chat_user', JSON.stringify(user));
    else localStorage.removeItem('chat_user');
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Welcome</h1>
            <Login onLogin={(u, t) => { setUser(u); setTok(t); }} />
            <div className="my-4 border-t" />
            <Register onRegister={(u, t) => { setUser(u); setTok(t); }} />
          </div>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return <RoomList user={user} onEnter={(room) => setCurrentRoom(room)} onLogout={() => { setUser(null); setTok(null); }} />;
  }

  return <Room room={currentRoom} user={user} onLeave={() => setCurrentRoom(null)} />;
}
