import React, { useEffect, useState } from 'react';
import { rooms, setToken } from '../api';

export default function RoomList({ user, onEnter, onLogout }) {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [joinPwd, setJoinPwd] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    try {
      const res = await rooms.list();
      setList(res.rooms);
    } catch (e) {
      console.error(e);
    }
  }

  async function createRoom(e) {
    e.preventDefault();
    try {
      await rooms.create({ name, password: password || null });
      setName(''); setPassword('');
      fetchList();
    } catch (e) {
      setErr(e.response?.data?.error || 'create failed');
    }
  }

  async function joinRoom(room) {
    setErr('');
    if (room.locked) {
      setSelectedRoom(room);
      return;
    }
    try {
      const res = await rooms.join(room.id, {});
      onEnter(res.room);
    } catch (e) {
      setErr(e.response?.data?.error || 'join failed');
    }
  }

  async function confirmJoin() {
    try {
      const res = await rooms.join(selectedRoom.id, { password: joinPwd });
      setJoinPwd('');
      setSelectedRoom(null);
      onEnter(res.room);
    } catch (e) {
      setErr(e.response?.data?.error || 'invalid password');
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Rooms</h1>
          <div>
            <span className="mr-4">Hello, <strong>{user.username}</strong></span>
            <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => { setToken(null); onLogout(); }}>Logout</button>
          </div>
        </header>

        <section className="mb-6">
          <form className="flex gap-2" onSubmit={createRoom}>
            <input className="flex-1 p-2 border rounded" placeholder="Room name" value={name} onChange={e => setName(e.target.value)} />
            <input className="w-48 p-2 border rounded" placeholder="Password (optional)" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="px-4 bg-indigo-600 text-white rounded">Create</button>
          </form>
          {err && <div className="text-red-500 mt-2">{err}</div>}
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.map(r => (
              <div key={r.id} className="p-4 bg-white rounded shadow flex items-center justify-between">
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-sm text-slate-500">{r.locked ? 'Locked' : 'Open'}</div>
                </div>
                <div>
                  <button className="px-3 py-1 bg-emerald-500 text-white rounded" onClick={() => joinRoom(r)}>Enter</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedRoom && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2">Enter password for {selectedRoom.name}</h3>
              <input className="w-full p-2 border rounded mb-3" type="password" value={joinPwd} onChange={e => setJoinPwd(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button className="px-3 py-1" onClick={() => setSelectedRoom(null)}>Cancel</button>
                <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={confirmJoin}>Join</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
