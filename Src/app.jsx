import React, { useEffect, useState } from 'react'
import { loadData, saveData } from './utils/storage'
import MatchForm from './components/MatchForm'
import PlayerManager from './components/PlayerManager'
import ChartsPanel from './components/ChartsPanel'

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8) }

export default function App(){
  const stored = loadData()
  const [matches, setMatches] = useState(stored.matches || [])
  const [teams, setTeams] = useState(stored.teams || [])
  const [playersByTeam, setPlayersByTeam] = useState(stored.playersByTeam || {})
  const [editingMatch, setEditingMatch] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(()=>{ saveData({ matches, teams, playersByTeam }) }, [matches, teams, playersByTeam])

  function addOrUpdateMatch(m){
    if(!m.id){ m.id = uid() }
    setMatches(existing=>{
      const found = existing.find(x=>x.id===m.id)
      if(found) return existing.map(x=> x.id===m.id? m : x)
      return [m, ...existing]
    })
    if(!teams.includes(m.teamA)) setTeams(t=>[...t,m.teamA])
    if(!teams.includes(m.teamB)) setTeams(t=>[...t,m.teamB])
    setShowForm(false)
  }

  function deleteMatch(id){ if(!confirm('Delete match?')) return; setMatches(m=>m.filter(x=>x.id!==id)) }

  function addPlayer(team, name){
    const newPlayer = { id: uid(), name }
    setPlayersByTeam(prev=> ({ ...prev, [team]: [...(prev[team]||[]), newPlayer] }))
    if(!teams.includes(team)) setTeams(t=>[...t,team])
  }

  function openEdit(m){ setEditingMatch(m); setShowForm(true) }

  function exportData(){ const blob = new Blob([JSON.stringify({matches,teams,playersByTeam},null,2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='cricktrack-data.json'; a.click(); URL.revokeObjectURL(url) }

  function importJSON(e){ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const d=JSON.parse(r.result); if(d.matches) setMatches(d.matches); if(d.teams) setTeams(d.teams); if(d.playersByTeam) setPlayersByTeam(d.playersByTeam); alert('Imported') }catch(err){ alert('Invalid JSON') } }; r.readAsText(f) }

  const allPlayers = Object.values(playersByTeam).flat()

  const playerAggregates = {}
  matches.forEach(m=> (m.players||[]).forEach(p=>{ const key=p.playerId; playerAggregates[key] = playerAggregates[key] || { runs:0, balls:0, wickets:0, catches:0, name: (allPlayers.find(x=>x.id===key)||{}).name || 'Unknown' }; playerAggregates[key].runs += Number(p.runs||0); playerAggregates[key].balls += Number(p.balls||0); playerAggregates[key].wickets += Number(p.wickets||0); playerAggregates[key].catches += Number(p.catches||0) }))

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">CrickTrack</h1>
            <div className="text-sm text-gray-600">Matches · Player stats · Charts</div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>{ setEditingMatch(null); setShowForm(true) }} className="px-3 py-2 bg-indigo-600 text-white rounded">New match</button>
            <label className="px-3 py-2 border rounded cursor-pointer"><input type="file" accept="application/json" onChange={importJSON} className="hidden" />Import</label>
            <button onClick={exportData} className="px-3 py-2 border rounded">Export</button>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            {showForm && (
              <div className="card">
                <MatchForm initial={editingMatch} teams={teams} playersByTeam={playersByTeam} onSave={addOrUpdateMatch} onCancel={()=>setShowForm(false)} />
              </div>
            )}

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Matches</div>
                <div className="text-sm text-gray-500">{matches.length} total</div>
              </div>
              <div className="space-y-2 max-h-96 overflow-auto">
                {matches.map(m=> (
                  <div key={m.id} className="p-3 border rounded flex justify-between items-start">
                    <div>
                      <div className="font-medium">{m.date} — {m.teamA} {m.scoreA || '-'} vs {m.teamB} {m.scoreB || '-'}</div>
                      <div className="text-sm text-gray-600">{m.notes}</div>
                      <div className="text-xs text-gray-500 mt-1">Players: {(m.players||[]).map(p=> (allPlayers.find(x=>x.id===p.playerId)||{}).name || p.playerId).join(', ')}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={()=>openEdit(m)} className="text-xs border px-2 py-1 rounded">Edit</button>
                      <button onClick={()=>deleteMatch(m.id)} className="text-xs border px-2 py-1 rounded">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="font-semibold mb-2">Player aggregates</div>
              <div className="overflow-auto max-h-56">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-600"><tr><th>Player</th><th>R</th><th>B</th><th>W</th><th>C</th></tr></thead>
                  <tbody>
                    {Object.entries(playerAggregates).map(([id,agg])=> (
                      <tr key={id} className="border-t"><td>{agg.name}</td><td>{agg.runs}</td><td>{agg.balls}</td><td>{agg.wickets}</td><td>{agg.catches}</td></tr>
                    ))}
                    {Object.keys(playerAggregates).length===0 && <tr><td colSpan={5} className="text-gray-500">No player stats yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <aside className="space-y-4">
            <PlayerManager playersByTeam={playersByTeam} onAddPlayer={addPlayer} />

            <ChartsPanel matches={matches} players={allPlayers} />

            <div className="card">
              <div className="font-semibold mb-2">Teams</div>
              <div className="text-sm text-gray-600">{teams.join(', ') || 'No teams'}</div>
            </div>
          </aside>
        </div>

        <footer className="text-sm text-gray-600 mt-6">Made with ❤️ — data stored locally. Want an APK or PWA bundle? I can add manifest & service worker next.</footer>
      </div>
    </div>
  )
}
