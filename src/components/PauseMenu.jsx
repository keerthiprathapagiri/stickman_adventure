export default function PauseMenu({onResume,onRestart,onMenu,set,tog}){
  return <div className="overlay"><div className="panel"><h2>Paused</h2>
    <button className="btn big" onClick={onResume}>Resume</button><button className="btn" onClick={onRestart}>Restart</button>
    <button className="btn" onClick={()=>tog('sfx')}>Sound: {set.sfx?'On':'Off'}</button><button className="btn" onClick={()=>tog('music')}>Music: {set.music?'On':'Off'}</button>
    <button className="btn ghost" onClick={onMenu}>Main menu</button></div></div>;
}
