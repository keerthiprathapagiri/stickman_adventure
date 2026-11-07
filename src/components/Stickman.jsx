import {useEffect,useRef} from 'react';import {drawStickman} from '../game/Player.js';
export default function Stickman({state='idle',size=160,cycle}){
  const ref=useRef(),st=useRef(state);st.current=state;
  useEffect(()=>{const cv=ref.current,X=cv.getContext('2d');let raf,t=0,last=performance.now();
    const loop=n=>{t+=(n-last)/1000;last=n;X.setTransform(1,0,0,1,0,0);X.clearRect(0,0,cv.width,cv.height);const s=cv.width/100;X.scale(s,s);
      const cur=cycle?cycle[Math.floor(t/2.2)%cycle.length]:st.current;X.translate(50,86);X.scale(1.45,1.45);
      drawStickman(X,0,0,cur,t,1);raf=requestAnimationFrame(loop)};
    raf=requestAnimationFrame(loop);return()=>cancelAnimationFrame(raf)},[cycle]);
  return <canvas ref={ref} width={size*2} height={size*2} style={{width:size,height:size}} aria-hidden="true"/>;
}
