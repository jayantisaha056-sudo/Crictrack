import React, { useState, useEffect } from 'react'

export default function MatchForm({ initial, teams, playersByTeam, onSave, onCancel }){
  const [form, setForm] = useState(initial || { date:'', teamA:'', teamB:'', scoreA:'', scoreB:'', oversA:'', oversB:'', notes:'', players:[] })

  useEffect(()=> setForm(initial || { date:'', teamA:'', teamB:'', scoreA:'', scoreB:'', oversA:'', oversB:'', notes:'', players:[] }), [initial])

  function togglePlayer(team, playerId){
    setForm(f=>{
      const exists = (f.players||[]).find(p=>p.team===team && p.playerId===playerId)
      if(exists) return {...f, players: f.players.filter(x=>!(x.team===team && x.playerId===playerId))}
      return {...f, players: [...(f.players||[]), {team, playerId, runs:0, balls:0, wickets:0, overs:0, catches:0}]}
    })
  }

  function updatePlayerStat(playerId, key, value){
    setForm(f=> ({...f, players: f.players.map(p=> p.playerId===playerId ? {...p, [key]: value} : p)}))
  }

  return (
    <form onSubmit={(e)=>{ e.preventDefault(); onSave(form) }} className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="p-2 border rounded" required/>
        <input placeholder="Team A" value={form.teamA} onChange={e=>setForm({...form,teamA:e.target.value})} className="p-2 border rounded" list="teams" required />
        <input placeholder="Team B" value={form.teamB} onChange={e=>setForm({...form,teamB:e.target.value})} className="p-2 border rounded" list="teams" required />
        <datalist id="teams">{teams.map(t=> <option key={t} value={t} />)}</datalist>

        <input placeholder="Score A" value={form.scoreA} onChange={e=>setForm({...form,scoreA:e.target.value})} className="p-2 border rounded" />
        <input placeholder="Overs A" value={form.oversA} onChange={e=>setForm({...form,oversA:e.target.value})} className="p-2 border rounded" />
        <input placeholder="Score B" value={form.scoreB} onChange={e=>setForm({...form,scoreB:e.target.value})} className="p-2 border rounded" />
        <input placeholder="Overs B" value={form.oversB} onChange={e=>setForm({...form,oversB:e.target.value})} className="p-2 border rounded" />

        <input placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="col-span-3 p-2 border rounded" />
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Player contributions</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[form.teamA, form.teamB].filter(Boolean).map(team=> (
            <div key={team} className="card">
              <div className="font-semibold mb-2">{team}</div>
              <div className="space-y-1 max-h-48 overflow-auto">
                {(playersByTeam[team]||[]).map(p=>{
                  const selected = (form.players||[]).find(x=>x.playerId===p.id && x.team===team)
                  return (
                    <div key={p.id} className="flex items-center gap-2">
                      <input type="checkbox" checked={!!selected} onChange={()=>togglePlayer(team,p.id)} />
                      <div className="flex-1">
                        <div className="font-medium">{p.name}</div>
                        {selected && (
                          <div className="grid grid-cols-5 gap-1 text-xs mt-1">
                            <input value={selected.runs} onChange={e=>updatePlayerStat(p.id,'runs',Number(e.target.value)||0)} className="p-1 border rounded" placeholder="R" />
                            <input value={selected.balls} onChange={e=>updatePlayerStat(p.id,'balls',Number(e.target.value)||0)} className="p-1 border rounded" placeholder="B" />
                            <input value={selected.wickets} onChange={e=>updatePlayerStat(p.id,'wickets',Number(e.target.value)||0)} className="p-1 border rounded" placeholder="W" />
                            <input value={selected.overs} onChange={e=>updatePlayerStat(p.id,'overs',e.target.value)} className="p-1 border rounded" placeholder="O" />
                            <input value={selected.catches} onChange={e=>updatePlayerStat(p.id,'catches',Number(e.target.value)||0)} className="p-1 border rounded" placeholder="C" />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
      </div>
    </form>
  )
        }
