import {useState} from 'react';import Stickman from './Stickman.jsx';
const CYCLE=['idle','coin','jump','win'];
export function Settings({set,tog,onClose}){
  return <div className="overlay"><div className="panel"><h2>Settings</h2>
    <button className="btn" onClick={()=>tog('sfx')}>Sound effects: {set.sfx?'On':'Off'}</button>
    <button className="btn" onClick={()=>tog('music')}>Music: {set.music?'On':'Off'}</button>
    <button className="btn ghost" onClick={onClose}>Back</button></div></div>;
}
export default function MainMenu({onPlay,onLevels,set,tog}){
  const [open,setOpen]=useState(false);
  return <div className="menu">
    <div className="menu-sky">{Array.from({length:6},(_,i)=><i key={i} className="cloud" style={{top:`${8+i*11}%`,animationDuration:`${40+i*9}s`,animationDelay:`${-i*7}s`,transform:`scale(${.6+i*.15})`}}/>)}
      {Array.from({length:40},(_,i)=><b key={i} className="star" style={{left:`${(i*37)%100}%`,top:`${(i*53)%60}%`,animationDelay:`${(i%7)*.4}s`}}/>)}</div>
    <h1 className="title" aria-label="Stickman Adventure">{'STICKMAN'.split('').map((l,i)=><span key={i} style={{animationDelay:`${i*.1}s`}}>{l}</span>)}<small>Adventure</small></h1>
    <Stickman size={190} cycle={CYCLE}/>
    <div className="menu-btns"><button className="btn big" onClick={onPlay}>Play</button><button className="btn" onClick={onLevels}>Levels</button><button className="btn" onClick={()=>setOpen(true)}>Settings</button></div>
    <p className="hint">A/D or arrows to move · Space to jump · Esc to pause</p>
    {open&&<Settings set={set} tog={tog} onClose={()=>setOpen(false)}/>}
  </div>;
}
