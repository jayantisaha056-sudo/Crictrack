import React, { useState } from 'react'

export default function PlayerManager({ playersByTeam, onAddPlayer }){
  const [team, setTeam] = useState('')
  const [name, setName] = useState('')

  function add(){ if(!team||!name) return; onAddPlayer(team, name); setName('') }

  return (
    <div className="card">
      <div className="font-semibold mb-2">Players</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <input placeholder="Team" value={team} onChange={e=>setTeam(e.target.value)} className="p-2 border rounded" />
        <input placeholder="Player name" value={name} onChange={e=>setName(e.target.value)} className="p-2 border rounded" />
        <button onClick={add} className="px-3 py-2 bg-green-600 text-white rounded">Add</button>
      </div>

      <div className="space-y-2 max-h-48 overflow-auto">
        {Object.entries(playersByTeam).map(([t, arr])=> (
          <div key={t}>
            <div className="font-medium">{t}</div>
            <div className="text-sm text-gray-600">{arr.map(p=>p.name).join(', ') || 'No players'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
