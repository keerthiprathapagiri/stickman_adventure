import {useEffect,useRef,useState} from 'react';
import {GameEngine} from './game/GameEngine.js';import {LEVELS} from './game/Levels.js';import {Sound} from './game/Sound.js';
import MainMenu from './components/MainMenu.jsx';import LevelSelection from './components/LevelSelection.jsx';import GameHUD from './components/GameHUD.jsx';
import PauseMenu from './components/PauseMenu.jsx';import VictoryScreen from './components/VictoryScreen.jsx';import GameOver from './components/GameOver.jsx';
const load=()=>{try{const s=JSON.parse(localStorage.getItem('stickman-save'));if(s?.stars?.length===5)return s}catch{}return{stars:[0,0,0,0,0]}};
export default function App(){
  const [screen,setScreen]=useState('menu'),[lv,setLv]=useState(0),[hud,setHud]=useState(null),[res,setRes]=useState(null),[save,setSave]=useState(load),[set,setSet]=useState({sfx:true,music:true}),[wipe,setWipe]=useState(0);
  const cv=useRef(),eng=useRef(),lvRef=useRef(0);
  const inGame=['play','pause','victory','over'].includes(screen);
  useEffect(()=>{if(!inGame)return;
    const e=new GameEngine(cv.current,{onHud:setHud,onOver:()=>setScreen('over'),onPause:()=>setScreen(s=>s==='play'?'pause':s==='pause'?'play':s),
      onWin:r=>{const i=lvRef.current;setSave(sv=>{const stars=[...sv.stars];stars[i]=Math.max(stars[i],r.stars);const n={stars};try{localStorage.setItem('stickman-save',JSON.stringify(n))}catch{}return n});setRes(r);setScreen('victory')}},lvRef.current);
    eng.current=e;return()=>{e.destroy();eng.current=null}},[inGame]);
  useEffect(()=>{if(eng.current)eng.current.paused=screen!=='play'},[screen]);
  const start=i=>{lvRef.current=i;setLv(i);Sound.startMusic();eng.current?.load(i);setScreen('play');setWipe(w=>w+1)};
  const tog=k=>{const v=!set[k];setSet({...set,[k]:v});Sound.set(k,v)};
  const menu=()=>setScreen('menu'),first=Math.max(0,save.stars.findIndex(s=>!s)),cont=save.stars.every(s=>s)?0:first;
  const tk=(k,v)=>e=>{e.preventDefault();eng.current?.setKey(k,v)};
  const tb=(k,label,cls)=><button className={'tbtn '+cls} onPointerDown={tk(k,true)} onPointerUp={tk(k,false)} onPointerLeave={tk(k,false)} onPointerCancel={tk(k,false)} onContextMenu={e=>e.preventDefault()}>{label}</button>;
  return <div className="app">
    {inGame&&<div className="stage"><canvas ref={cv} className="cv"/>
      {hud&&<GameHUD hud={hud} onPause={()=>setScreen('pause')}/>}
      <div className="touch"><div>{tb('left','◀','')}{tb('right','▶','')}</div>{tb('jump','JUMP','jump')}</div>
      {screen==='pause'&&<PauseMenu set={set} tog={tog} onResume={()=>setScreen('play')} onRestart={()=>start(lv)} onMenu={menu}/>}
      {screen==='victory'&&res&&<VictoryScreen res={res} last={lv>=LEVELS.length-1} onNext={()=>start(lv+1)} onRetry={()=>start(lv)} onMenu={menu}/>}
      {screen==='over'&&<GameOver onRetry={()=>start(lv)} onMenu={menu}/>}
      {wipe>0&&<div key={wipe} className="wipe"/>}</div>}
    {screen==='menu'&&<MainMenu set={set} tog={tog} onPlay={()=>start(cont)} onLevels={()=>setScreen('levels')}/>}
    {screen==='levels'&&<LevelSelection save={save} onPick={start} onBack={menu}/>}
  </div>;
}
