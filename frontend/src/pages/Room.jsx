import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function Room({ room, user, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);
  const listRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem('chat_token');
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', { roomId: room.id });
    });

    socket.on('history', (msgs) => {
      setMessages(msgs);
      scrollBottom();
    });

    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
      scrollBottom();
    });

    socket.on('disconnect', () => {});

    return () => {
      socket.emit('leave', { roomId: room.id });
      socket.disconnect();
    };
  }, [room.id]);

  function scrollBottom() {
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }

  function send() {
    if (!text.trim()) return;
    socketRef.current.emit('message', { roomId: room.id, body: text });
    setText('');
  }

  return (
    <div className="min-h-screen p-6 bg-slate-100">
      <div className="max-w-4xl mx-auto bg-white rounded shadow">
        <header className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">{room.name}</h2>
            <div className="text-sm text-slate-500">You are: {user.username}</div>
          </div>
          <div>
            <button className="px-3 py-1 bg-gray-200 rounded mr-2" onClick={onLeave}>Back</button>
          </div>
        </header>

        <div className="p-4 h-[60vh] overflow-auto" ref={listRef}>
          {messages.map((m) => (
            <div key={m.id} className="mb-3">
              <div className="text-sm text-slate-500">{m.username} • <span className="text-xs">{new Date(m.created_at).toLocaleString()}</span></div>
              <div className="mt-1 p-3 bg-indigo-50 rounded">{m.body}</div>
            </div>
          ))}
        </div>

        <footer className="p-4 border-t flex gap-2">
          <input className="flex-1 p-2 border rounded" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} />
          <button className="px-4 bg-indigo-600 text-white rounded" onClick={send}>Send</button>
        </footer>
      </div>
    </div>
  );
}
