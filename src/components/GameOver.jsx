import Stickman from './Stickman.jsx';
export default function GameOver({onRetry,onMenu}){
  return <div className="overlay"><div className="panel"><h2>Oh no! Out of lives</h2><Stickman state="sad" size={140}/>
    <button className="btn big" onClick={onRetry}>Try again</button><button className="btn ghost" onClick={onMenu}>Main menu</button></div></div>;
}
