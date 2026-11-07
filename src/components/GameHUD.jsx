import {memo} from 'react';
export default memo(function GameHUD({hud,onPause}){
  return <div className="hud"><div className="chip"><b>Level {hud.level}</b> {hud.name}</div>
    <div className="chip coin">🪙 {hud.coins}/{hud.total}{hud.gem&&' 💎'}</div>
    <div className="chip">{[0,1,2].map(i=><span key={i} style={{opacity:i<hud.lives?1:.25}}>❤️</span>)}</div>
    <div className="prog"><i style={{width:`${hud.progress*100}%`}}/></div>
    <button className="pause" onClick={onPause} aria-label="Pause">❚❚</button></div>;
});
