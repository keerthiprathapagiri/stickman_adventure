import Stickman from './Stickman.jsx';
export default function VictoryScreen({res,last,onNext,onRetry,onMenu}){
  return <div className="overlay win"><div className="confetti">{Array.from({length:40},(_,i)=><i key={i} style={{left:`${(i*29)%100}%`,animationDelay:`${(i%9)*.25}s`,background:['#ffd84d','#ff6b81','#6ec6ff','#7dffb2','#c79bff'][i%5]}}/>)}</div>
    <div className="panel"><h2>Level complete!</h2><Stickman state="win" size={140}/>
      <div className="stars big">{[0,1,2].map(s=><i key={s} className={s<res.stars?'on':''} style={{animationDelay:`${s*.3}s`}}>★</i>)}</div>
      <p>🪙 {res.coins}/{res.total} coins {res.gem?'· 💎 secret gem found':'· 💎 gem still hidden'}</p>
      <button className="btn big" onClick={last?onMenu:onNext}>{last?'Back to menu':'Next level'}</button>
      <button className="btn" onClick={onRetry}>Play again</button>{!last&&<button className="btn ghost" onClick={onMenu}>Main menu</button>}</div></div>;
}
