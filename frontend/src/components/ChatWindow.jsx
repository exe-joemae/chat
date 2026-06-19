import React from 'react';

export default function ChatWindow({ messages }) {
  return (
    <div>
      {messages.map(m => (
        <div key={m.id} className="mb-2">
          <div className="text-xs text-slate-500">{m.username} • {new Date(m.created_at).toLocaleTimeString()}</div>
          <div className="p-2 bg-white rounded shadow-sm">{m.body}</div>
        </div>
      ))}
    </div>
  );
}
