let ctx,timer=0,step=0;const on={sfx:true,music:true};
const ac=()=>{ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();ctx.resume?.();return ctx};
function beep(f,d,type='square',v=.07,to=f,delay=0){
  const c=ac(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;
  o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(to,t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.02);
}
export const Sound={
  set(k,v){on[k]=v;if(k==='music')v?this.startMusic():this.stopMusic()},
  play(n){if(!on.sfx)return;try{({
    jump:()=>beep(300,.15,'square',.06,650),land:()=>beep(130,.09,'sine',.12,60),
    coin:()=>{beep(880,.08,'square',.05);beep(1320,.14,'square',.05,1320,.07)},
    spring:()=>beep(200,.3,'sine',.14,900),hurt:()=>beep(320,.4,'sawtooth',.08,70),
    win:()=>[523,659,784,1047].forEach((f,i)=>beep(f,.25,'triangle',.1,f,i*.13))})[n]?.()}catch{}},
  startMusic(){if(timer||!on.music)return;const N=[262,330,392,523,392,330,294,349,440,587,440,349];
    timer=setInterval(()=>{try{const m=Math.floor(step/12)%2?1.125:1;beep(N[step%12]*m,.34,'triangle',.04);if(step%4===0)beep(N[step%12]/2*m,.6,'sine',.05);step++}catch{}},260)},
  stopMusic(){clearInterval(timer);timer=0}
};
