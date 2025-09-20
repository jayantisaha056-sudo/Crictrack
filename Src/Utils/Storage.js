export function loadData(){
  try{ return JSON.parse(localStorage.getItem('cricktrack_v2')||'{}') }catch(e){ return {} }
}
export function saveData(data){ localStorage.setItem('cricktrack_v2', JSON.stringify(data)) }
