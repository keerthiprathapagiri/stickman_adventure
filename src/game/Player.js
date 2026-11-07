export const PW=20,PH=44;
const D='#1b2340';
export class Player{
  constructor(x=0,y=0){this.reset(x,y)}
  reset(x,y){Object.assign(this,{x,y,w:PW,h:PH,vx:0,vy:0,onGround:false,ground:null,face:1,coyote:0,buffer:0,jumping:false,landT:0,coinT:0,hurtT:0,hurtFace:0,state:'idle',t:0,win:false})}
  updateState(){this.state=this.win?'win':this.hurtFace>0?'hurt':this.coinT>0?'coin':this.landT>0?'land':!this.onGround?(this.vy<0?'jump':'fall'):Math.abs(this.vx)>20?'run':'idle'}
  draw(X){drawStickman(X,this.x+this.w/2,this.y+this.h,this.state,this.t,this.face)}
}
export function drawStickman(X,cx,fy,st,t,face=1){
  X.save();X.translate(cx,fy);
  let sx=1,sy=1,by=0;
  if(st==='land'){sx=1.15;sy=.82}else if(st==='jump'){sx=.92;sy=1.08}else if(st==='win')by=-Math.abs(Math.sin(t*8))*14;else if(st==='idle')sy=1+Math.sin(t*3)*.015;
  X.scale(face*sx*.8,sy*.8);X.translate(0,by);X.lineCap=X.lineJoin='round';
  const sw=Math.sin(t*16),cs=Math.cos(t*16);
  const limb=(...pts)=>{X.beginPath();pts.forEach((q,i)=>i?X.lineTo(q[0],q[1]):X.moveTo(q[0],q[1]));for(const[w,c]of[[8,D],[4.5,'#fff']]){X.lineWidth=w;X.strokeStyle=c;X.stroke()}};
  const hip=[0,-24],sh=[0,-36];
  for(const s of[-1,1]){let f=[s*5,0];
    if(st==='run')f=[s*sw*13,-Math.max(0,-s*cs)*9];else if(st==='jump')f=[s*7+(s>0?6:0),-8-(s>0?10:0)];else if(st==='fall')f=[s*11,-3];else if(st==='land')f=[s*12,0];else if(st==='win')f=[s*6,0];
    limb(hip,[f[0]/2+4,(hip[1]+f[1])/2],f)}
  limb(sh,hip);
  for(const s of[-1,1]){let h=[s*10,-20+Math.sin(t*3+s)*1.5];
    if(st==='run')h=[-s*sw*13,-26];else if(st==='jump')h=[s*11,-46];else if(st==='fall')h=[s*14,-46+Math.sin(t*25+s)*4];else if(st==='land')h=[s*15,-24];else if(st==='coin')h=s>0?[8,-50]:[-9,-22];else if(st==='hurt')h=[s*13,-30+Math.sin(t*12+s)*5];else if(st==='win')h=[s*13,-50+Math.sin(t*12+s)*5];else if(st==='sad')h=[s*5,-12];
    limb(sh,[(sh[0]+h[0])/2+s*2,(sh[1]+h[1])/2+3],h)}
  X.save();X.translate(0,-48);if(st==='hurt')X.rotate(Math.sin(t*10)*.2);if(st==='sad')X.rotate(.18);
  X.shadowColor='#9be7ff';X.shadowBlur=14;
  const gr=X.createRadialGradient(-4,-4,2,0,0,13);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#d8ecff');
  X.fillStyle=gr;X.beginPath();X.arc(0,0,12,0,7);X.fill();X.shadowBlur=0;X.lineWidth=3;X.strokeStyle=D;X.stroke();
  X.fillStyle='rgba(255,255,255,.9)';X.beginPath();X.ellipse(-5,-6,3,1.8,-.6,0,7);X.fill();
  face_(X,st,t);X.restore();X.restore();
}
function face_(X,st,t){
  X.strokeStyle=D;X.fillStyle=D;X.lineWidth=2;
  const dot=(x,y,r)=>{X.beginPath();X.arc(x,y,r,0,7);X.fill()},ln=(a,b,c,d)=>{X.beginPath();X.moveTo(a,b);X.lineTo(c,d);X.stroke()},arc=(x,y,r,a,b)=>{X.beginPath();X.arc(x,y,r,a,b);X.stroke()};
  const cheeks=()=>{X.fillStyle='rgba(255,120,150,.55)';dot(-8,3,2.4);dot(8,3,2.4);X.fillStyle=D};
  for(const s of[-1,1]){const x=s*4.8;
    if(st==='idle'){if(t%3.5<.12)ln(x-2,-2,x+2,-2);else dot(x,-2,2.2)}
    else if(st==='run'){X.beginPath();X.ellipse(x,-2,2.8,1.6,0,0,7);X.fill();ln(x-3,-5.5,x+3,-5.5)}
    else if(st==='jump'){dot(x,-2,2);ln(s*8,-8,s*2.5,-4.8)}
    else if(st==='fall'){X.fillStyle='#fff';X.beginPath();X.arc(x,-2,3.6,0,7);X.fill();X.stroke();X.fillStyle=D;dot(x,-2,1.2);ln(x-3,-8,x+3,-9)}
    else if(st==='land'){X.beginPath();X.moveTo(x+2.5*s,-5);X.lineTo(x-2.5*s,-2);X.lineTo(x+2.5*s,1);X.stroke()}
    else if(st==='coin'||st==='win')arc(x,-1,2.4,Math.PI,2*Math.PI);
    else if(st==='hurt'){ln(x-2,-4,x+2,0);ln(x+2,-4,x-2,0)}
    else if(st==='sad'){dot(x,-1,1.8);ln(s*7,-5,s*2.5,-8)}
  }
  if(st==='idle'){arc(0,2,5,.2,Math.PI-.2);cheeks()}
  else if(st==='run')ln(-2,6,2,6);
  else if(st==='jump')arc(0,8,4,Math.PI+.4,2*Math.PI-.4);
  else if(st==='fall'){X.beginPath();X.ellipse(0,7,2.8,3.8,0,0,7);X.fill()}
  else if(st==='land'){X.beginPath();X.moveTo(-5,6);for(let i=1;i<=5;i++)X.lineTo(-5+i*2,6+(i%2?-2:2));X.stroke()}
  else if(st==='coin'||st==='win'){X.beginPath();X.arc(0,2,st==='win'?7:5.5,0,Math.PI);X.closePath();X.fill();X.fillStyle='#ff6b81';X.beginPath();X.ellipse(0,st==='win'?7.5:5.5,3,1.6,0,0,7);X.fill();X.fillStyle=D;cheeks()}
  else if(st==='hurt'){X.beginPath();for(let x=-5;x<=5;x++)X.lineTo(x,7+Math.sin(x*1.5+t*12)*1.8);X.stroke();for(let i=0;i<3;i++){const a=t*6+i*2.1;X.fillStyle='#ffd84d';dot(Math.cos(a)*18,-16+Math.sin(a)*5,2.5)}}
  else if(st==='sad'){arc(0,9,4.5,Math.PI+.3,2*Math.PI-.3);X.fillStyle='#6ec6ff';dot(-6.5,4+((t*2)%1)*5,1.6)}
}
