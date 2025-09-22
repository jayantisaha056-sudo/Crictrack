import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, ResponsiveContainer } from 'recharts'

export default function ChartsPanel({ matches, players }){
  const runsData = matches.slice().reverse().map(m=>({ date: m.date, [m.teamA]: Number(m.scoreA)||0, [m.teamB]: Number(m.scoreB)||0 }))

  const playerMap = {}
  matches.forEach(m=> (m.players||[]).forEach(p=>{ playerMap[p.playerId] = (playerMap[p.playerId]||0) + (Number(p.runs)||0) }))
  const topScorers = Object.entries(playerMap).map(([id,r])=> ({ id, runs: r, name: (players.find(x=>x.id===id)||{}).name || 'Unknown' })).sort((a,b)=>b.runs-a.runs).slice(0,8)

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="font-semibold mb-2">Runs over time</div>
        <div style={{width:'100%', height:220}}>
          <ResponsiveContainer>
            <LineChart data={runsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              {Object.keys(runsData.reduce((acc, row)=> (Object.keys(row).forEach(k=>{ if(k!=='date') acc[k]=true }), acc), {})).slice(0,3).map((team,i)=> (
                <Line key={team} type="monotone" dataKey={team} stroke={`#${(Math.abs(team.length*123+i*57)%0xFFFFFF).toString(16).padStart(6,'0')}`} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="font-semibold mb-2">Top scorers</div>
        <div style={{width:'100%', height:220}}>
          <ResponsiveContainer>
            <BarChart data={topScorers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="runs" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
