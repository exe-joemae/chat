import React, { useState } from 'react';
import { auth } from '../api';

export default function Register({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const res = await auth.register({ username, password });
      onRegister(res.user, res.token);
    } catch (e) {
      setErr(e.response?.data?.error || 'Register failed');
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 className="text-lg font-semibold mb-3">Register</h2>
      <input className="w-full p-2 border rounded mb-2" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="w-full p-2 border rounded mb-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {err && <div className="text-red-500 mb-2">{err}</div>}
      <button className="w-full bg-green-600 text-white py-2 rounded">Register</button>
    </form>
  );
}
