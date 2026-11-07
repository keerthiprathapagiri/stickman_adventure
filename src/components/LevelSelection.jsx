import {LEVELS} from '../game/Levels.js';
export default function LevelSelection({save,onPick,onBack}){
  return <div className="menu levels"><h2 className="h2">Choose a level</h2>
    <div className="grid">{LEVELS.map((L,i)=>{const open=i===0||save.stars[i-1]>0,t=L.theme;
      return <button key={i} disabled={!open} className={'card'+(open?'':' locked')} onClick={()=>onPick(i)} style={{background:`linear-gradient(160deg,${t.sky[0]},${t.sky[1]})`,'--pl':t.plat[0]}}>
        <span className="num">{open?i+1:'🔒'}</span><strong>{L.name}</strong><em>{L.blurb}</em>
        <span className="stars">{[0,1,2].map(s=><i key={s} className={s<save.stars[i]?'on':''}>★</i>)}</span></button>})}</div>
    <button className="btn" onClick={onBack}>Back</button></div>;
}
