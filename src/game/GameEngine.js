import {LEVELS} from './Levels.js';import {Player} from './Player.js';import {applyPhysics,C} from './Physics.js';
import {moveAndCollide,hit} from './Collision.js';import {Camera} from './Camera.js';import {Particles} from './Particles.js';import {Sound} from './Sound.js';
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),css=a=>`rgb(${a.map(Math.round)})`,rgba=(a,al)=>`rgba(${a.map(Math.round)},${al})`;
const flat=t=>({sky1:rgb(t.sky[0]),sky2:rgb(t.sky[1]),far:rgb(t.far),near:rgb(t.near),p1:rgb(t.plat[0]),p2:rgb(t.plat[1]),glow:rgb(t.glow),acc:rgb(t.accent),stars:[t.stars]});
const KEYS={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump'};
export class GameEngine{
  constructor(cv,cb,level){
    this.cv=cv;this.X=cv.getContext('2d');this.cb=cb;this.cam=new Camera();this.fx=new Particles();this.keys={};this.jp=false;this.paused=false;this.time=0;this.last=0;this.timers=[];this.trail=[];
    const R=Math.random;
    this.stars=Array.from({length:90},()=>({x:R()*800,y:R()*320,r:R()*1.6+.4,p:R()*6}));
    this.bits=Array.from({length:28},()=>({x:R()*860,y:R()*450,p:R()*6}));
    this.clouds=Array.from({length:7},(_,i)=>({x:i*170,y:30+R()*150,s:.6+R()*.8}));
    this.player=new Player();
    this.kd=e=>{if(e.code==='Escape'){this.cb.onPause();return}const k=KEYS[e.code];if(!k)return;e.preventDefault();if(k==='jump'&&!this.keys.jump)this.jp=true;this.keys[k]=true};
    this.ku=e=>{const k=KEYS[e.code];if(k)this.keys[k]=false};
    addEventListener('keydown',this.kd);addEventListener('keyup',this.ku);
    this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(cv);this.resize();
    this.load(level,true);this.raf=requestAnimationFrame(this.loop);
  }
  resize(){const d=Math.min(2,devicePixelRatio||1);this.cv.width=this.cv.clientWidth*d;this.cv.height=this.cv.clientHeight*d}
  setKey(k,v){if(k==='jump'&&v&&!this.keys.jump)this.jp=true;this.keys[k]=v}
  destroy(){cancelAnimationFrame(this.raf);removeEventListener('keydown',this.kd);removeEventListener('keyup',this.ku);this.ro.disconnect();this.timers.forEach(clearTimeout)}
  load(i,instant){
    const L=LEVELS[i];this.idx=i;this.L=L;this.tgt=flat(L.theme);if(instant||!this.cur)this.cur=flat(L.theme);
    this.plats=L.plats.map(s=>({...s,ox:s.x,oy:s.y,t:0,ddx:0,ddy:0,st:0,tm:0,gone:false}));
    this.coins=L.coins.map(c=>({...c,got:false}));this.hidden=L.hidden.map(c=>({...c,got:false}));
    this.springs=L.springs.map(s=>({...s,sq:0}));this.cps=L.cps.map(c=>({...c,on:false}));
    this.spawn={...L.start};this.lives=3;this.won=false;this.hudT=0;this.trail=[];this.timers.forEach(clearTimeout);this.timers=[];this.paused=false;
    this.player.reset(this.spawn.x,this.spawn.y);this.cam.x=0;this.cam.y=0;this.emitHud();
  }
  count(a){return a.filter(c=>c.got).length}
  emitHud(){this.cb.onHud({level:this.idx+1,name:this.L.name,coins:this.count(this.coins),total:this.coins.length,gem:this.hidden.some(h=>h.got),progress:Math.max(0,Math.min(1,this.player.x/this.L.gate.x)),lives:this.lives})}
  loop=t=>{const dt=Math.min(.033,(t-this.last)/1000||0);this.last=t;if(!this.paused)this.update(dt);this.render();this.raf=requestAnimationFrame(this.loop)};
  hurt(){
    const p=this.player;this.lives--;Sound.play('hurt');this.cam.shake(9);this.fx.emit(p.x+10,p.y+20,16,{c:'#ff6b81',glow:1,up:120});
    if(this.lives<=0){this.emitHud();this.cb.onOver();return}
    p.reset(this.spawn.x,this.spawn.y);p.hurtT=1.6;p.hurtFace=.8;this.emitHud();
  }
  win(){
    const p=this.player;this.won=true;p.win=true;p.vx=0;Sound.play('win');
    for(let i=0;i<5;i++)this.timers.push(setTimeout(()=>this.fx.emit(p.x+10,p.y-20,40,{sp:500,up:260,life:1.4,r:4,c:['#ffd84d','#ff6b81','#6ec6ff','#7dffb2','#c79bff'][i]}),i*220));
    const got=this.count(this.coins),gem=this.hidden.some(h=>h.got),r=got/this.coins.length,stars=1+(r>=.6?1:0)+(r>=1&&gem?1:0);
    this.timers.push(setTimeout(()=>this.cb.onWin({stars,coins:got,total:this.coins.length,gem}),2000));
  }
  update(dt){
    const p=this.player,c=this.cur,k=1-Math.exp(-2.2*dt);this.time+=dt;
    for(const key in c)c[key]=c[key].map((v,i)=>v+(this.tgt[key][i]-v)*k);
    for(const s of this.plats){
      if(s.k==='m'){s.t+=dt;const nx=s.ox+Math.sin(s.t*s.sp)*s.ax,ny=s.oy+Math.sin(s.t*s.sp)*s.ay;s.ddx=nx-s.x;s.ddy=ny-s.y;s.x=nx;s.y=ny}
      else if(s.k==='v'){if(s.st===1){s.tm-=dt;if(s.tm<=0){s.gone=true;s.st=2;s.tm=2.2}}else if(s.st===2){s.tm-=dt;if(s.tm<=0){s.gone=false;s.st=0}}}
    }
    if(p.onGround&&p.ground?.k==='m'){p.x+=p.ground.ddx;p.y+=p.ground.ddy}
    const inp=this.won?{}:{...this.keys,jumpPressed:this.jp};this.jp=false;
    const ev=applyPhysics(p,dt,inp);
    if(ev==='jump'){Sound.play('jump');this.fx.emit(p.x+10,p.y+44,8,{sp:90,up:30,life:.45,c:'rgba(255,255,255,.8)',g:-20})}
    const wasG=p.onGround,pvy=p.vy;
    moveAndCollide(p,dt,this.plats.filter(s=>!s.gone));
    p.x=Math.max(0,Math.min(this.L.len-p.w,p.x));
    if(!wasG&&p.onGround&&pvy>300){p.landT=.2;Sound.play('land');this.cam.shake(pvy>800?7:2);this.fx.emit(p.x+10,p.y+44,pvy>800?18:9,{sp:200,up:50,life:.5,c:'rgba(255,255,255,.85)',g:80})}
    if(p.onGround&&p.ground?.k==='v'&&p.ground.st===0){p.ground.st=1;p.ground.tm=.7}
    p.landT-=dt;p.coinT-=dt;p.hurtT-=dt;p.hurtFace-=dt;p.t+=dt;p.updateState();
    const body={x:p.x+3,y:p.y+4,w:p.w-6,h:p.h-4};
    for(const s of this.springs)if(hit(p,{x:s.x,y:s.y-14,w:30,h:14})&&p.vy>=0){p.vy=-C.SPRING;p.onGround=false;p.jumping=false;s.sq=.25;Sound.play('spring');this.cam.shake(3);this.fx.emit(s.x+15,s.y-10,12,{sp:200,up:80,c:'#ffe27a',glow:1})}
    for(const s of this.springs)s.sq-=dt;
    if(p.hurtT<=0&&!this.won)for(const s of this.L.spikes)if(hit(body,{x:s.x+4,y:s.y-14,w:s.w-8,h:14}))this.hurt();
    if(this.lives>0&&p.y>700&&!this.won)this.hurt();
    const pcx=p.x+p.w/2,pcy=p.y+p.h/2;
    for(const [arr,r,pts] of [[this.coins,26,6],[this.hidden,34,24]])for(const o of arr)if(!o.got&&Math.hypot(o.x-pcx,o.y-pcy)<r){o.got=true;p.coinT=.5;Sound.play('coin');this.fx.emit(o.x,o.y,pts,{sp:240,life:.7,r:3,c:'#ffd84d',glow:1,g:0});this.emitHud()}
    for(const cpt of this.cps)if(!cpt.on&&Math.abs(cpt.x-pcx)<26&&Math.abs(cpt.y-60-pcy)<80){cpt.on=true;this.spawn={x:cpt.x-10,y:cpt.y-60};Sound.play('coin');this.fx.emit(cpt.x,cpt.y-60,18,{sp:260,c:'#7dffb2',glow:1,g:0,life:.8})}
    const gt=this.L.gate;if(!this.won&&hit(p,{x:gt.x-20,y:gt.y-110,w:50,h:110}))this.win();
    if(!p.onGround&&!this.won){this.trail.push({x:pcx,y:pcy,l:.28})}
    for(const q of this.trail)q.l-=dt;this.trail=this.trail.filter(q=>q.l>0);
    this.cam.follow(p,dt,800,this.cv.height/(this.cv.width/800),this.L.len);this.fx.update(dt);
    this.hudT+=dt;if(this.hudT>.1){this.hudT=0;this.emitHud()}
  }
  render(){
    const X=this.X,s=this.cv.width/800,H=this.cv.height/s,c=this.cur,t=this.time,cam=this.cam,cx=cam.x,cy=cam.y;
    X.setTransform(s,0,0,s,0,0);
    let g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,css(c.sky1));g.addColorStop(1,css(c.sky2));X.fillStyle=g;X.fillRect(0,0,800,H);
    for(const st of this.stars){X.fillStyle=rgba(c.acc,c.stars[0]*(.55+.45*Math.sin(t*2+st.p)));X.beginPath();X.arc(st.x,st.y,st.r,0,7);X.fill()}
    g=X.createRadialGradient(650,110,0,650,110,210);g.addColorStop(0,rgba(c.acc,.9));g.addColorStop(.25,rgba(c.glow,.35));g.addColorStop(1,rgba(c.glow,0));X.fillStyle=g;X.fillRect(0,0,800,H);
    for(const cl of this.clouds){const x=(((cl.x-cx*.1+t*8*cl.s)%1100)+1100)%1100-150;X.fillStyle=rgba(c.acc,.5);X.beginPath();for(const[dx,dy,r]of[[0,0,22],[26,-10,28],[56,0,22],[28,6,26]])X.arc(x+dx*cl.s,cl.y+dy*cl.s-cy*.05,r*cl.s,0,7);X.fill()}
    const ridge=(col,par,base,amp,fr,ph)=>{X.fillStyle=col;X.beginPath();X.moveTo(0,H);for(let x=0;x<=820;x+=20){const w=x+cx*par;X.lineTo(x,base-cy*.1-amp*(.6+.4*Math.sin(w*fr+ph))-amp*.5*Math.sin(w*fr*2.3+ph*2))}X.lineTo(820,H);X.fill()};
    ridge(rgba(c.far,.85),.2,H-150,110,.006,1);ridge(css(c.near),.4,H-70,70,.01,4);
    for(const b of this.bits){const x=(((b.x-cx*.5+Math.sin(t+b.p)*20)%860)+860)%860,y=b.y+Math.sin(t*.8+b.p)*14;X.fillStyle=rgba(c.acc,.55+.4*Math.sin(t*3+b.p));X.shadowColor=css(c.glow);X.shadowBlur=8;X.beginPath();X.arc(x,y%H,1.8,0,7);X.fill()}
    X.shadowBlur=0;
    X.save();X.translate(-cam.ox,-cam.oy);const vx0=cx-60,vx1=cx+860,style=this.L.theme.style;
    for(const q of this.trail){X.fillStyle=rgba(c.acc,q.l*1.2);X.beginPath();X.arc(q.x,q.y,10*q.l/.28+2,0,7);X.fill()}
    for(const pl of this.plats)if(pl.x<vx1&&pl.x+pl.w>vx0)this.plat(X,pl,c,style,t);
    X.fillStyle='#e8ecff';X.strokeStyle='#1b2340';X.lineWidth=2;
    for(const sk of this.L.spikes){for(let x=sk.x;x<sk.x+sk.w-1;x+=16){X.beginPath();X.moveTo(x,sk.y);X.lineTo(x+8,sk.y-18);X.lineTo(x+16,sk.y);X.closePath();X.fill();X.stroke()}}
    for(const sp of this.springs){const h=14*(1-Math.max(0,sp.sq)*2.2);X.strokeStyle='#1b2340';X.lineWidth=3;X.beginPath();X.moveTo(sp.x+6,sp.y);for(let i=0;i<5;i++)X.lineTo(sp.x+(i%2?24:6),sp.y-h*(i+1)/5);X.stroke();X.fillStyle='#ff4d6d';X.beginPath();X.roundRect(sp.x-2,sp.y-h-6,34,7,4);X.fill();X.stroke()}
    for(const cp of this.cps){X.strokeStyle='#1b2340';X.lineWidth=3;X.beginPath();X.moveTo(cp.x,cp.y);X.lineTo(cp.x,cp.y-60);X.stroke();X.fillStyle=cp.on?'#4ade80':'#f1f5f9';X.shadowColor=cp.on?'#4ade80':'transparent';X.shadowBlur=cp.on?14:0;X.beginPath();X.moveTo(cp.x,cp.y-60);X.lineTo(cp.x+26+Math.sin(t*5)*2,cp.y-52);X.lineTo(cp.x,cp.y-42);X.fill();X.shadowBlur=0}
    X.shadowColor='#ffd84d';X.shadowBlur=10;
    this.coins.forEach((o,i)=>{if(o.got)return;const w=Math.abs(Math.cos(t*3+i*.5))*8+1.5;X.fillStyle='#ffd84d';X.strokeStyle='#d99a00';X.lineWidth=2;X.beginPath();X.ellipse(o.x,o.y+Math.sin(t*3+i)*2,w,9,0,0,7);X.fill();X.stroke()});
    for(const o of this.hidden){if(o.got)continue;X.fillStyle='#ff7bd5';X.shadowColor='#ff7bd5';X.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5+t*2,r=(i%2?7:16)*(1+.1*Math.sin(t*5));X.lineTo(o.x+Math.cos(a)*r,o.y+Math.sin(a)*r)}X.closePath();X.fill()}
    X.shadowBlur=0;
    const gt=this.L.gate;X.fillStyle='#1b2340';X.fillRect(gt.x-22,gt.y-120,10,120);X.fillRect(gt.x+22,gt.y-120,10,120);
    g=X.createLinearGradient(0,gt.y-110,0,gt.y);g.addColorStop(0,rgba(c.acc,.9));g.addColorStop(1,rgba(c.glow,.1));X.fillStyle=g;X.shadowColor=css(c.glow);X.shadowBlur=24;X.fillRect(gt.x-12,gt.y-110,34,110);X.shadowBlur=0;
    for(let i=0;i<8;i++){X.fillStyle=(i+Math.floor(t*2))%2?'#1b2340':'#fff';X.fillRect(gt.x-22+(i%4)*13,gt.y-134+Math.floor(i/4)*13,13,13)}
    const p=this.player;if(p.hurtT<=0||Math.floor(t*20)%2){X.fillStyle='rgba(0,0,0,.2)';X.beginPath();X.ellipse(p.x+10,p.ground?p.ground.y+3:p.y+p.h,12,3,0,0,7);if(p.ground)X.fill();p.draw(X)}
    this.fx.draw(X);X.restore();
    g=X.createRadialGradient(400,H/2,H*.5,400,H/2,520);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(10,0,30,.28)');X.fillStyle=g;X.fillRect(0,0,800,H);
  }
  plat(X,s,c,style,t){
    if(s.gone)return;X.globalAlpha=s.st===1?.45+.4*Math.abs(Math.sin(t*28)):1;
    X.fillStyle='rgba(0,0,0,.18)';X.beginPath();X.roundRect(s.x+3,s.y+7,s.w,s.h,10);X.fill();
    const g=X.createLinearGradient(0,s.y,0,s.y+Math.min(s.h,60));g.addColorStop(0,css(c.p1));g.addColorStop(1,css(c.p2));
    X.fillStyle=g;X.beginPath();X.roundRect(s.x,s.y,s.w,s.h,10);X.fill();
    X.save();X.clip();const h=Math.min(s.h,30);X.fillStyle='rgba(255,255,255,.2)';X.strokeStyle='rgba(255,255,255,.22)';X.lineWidth=2;
    if(style===0){for(let x=s.x+10;x<s.x+s.w;x+=34){X.beginPath();X.arc(x,s.y+h*.6,9,0,7);X.fill()}}
    else if(style===1){for(let x=s.x-30;x<s.x+s.w;x+=24){X.beginPath();X.moveTo(x,s.y);X.lineTo(x+12,s.y);X.lineTo(x-4,s.y+h);X.lineTo(x-16,s.y+h);X.fill()}}
    else if(style===2){X.fillStyle='rgba(190,255,200,.4)';X.fillRect(s.x,s.y,s.w,7);for(let x=s.x+6;x<s.x+s.w;x+=14){X.beginPath();X.moveTo(x,s.y+7);X.lineTo(x+3,s.y+14);X.lineTo(x+6,s.y+7);X.fill()}}
    else if(style===3){X.strokeStyle=rgba(c.glow,.35);for(let x=s.x+12;x<s.x+s.w;x+=24){X.beginPath();X.moveTo(x,s.y);X.lineTo(x,s.y+h);X.stroke()}}
    else{X.strokeStyle='rgba(0,0,0,.14)';for(let x=s.x+10;x<s.x+s.w;x+=36){X.beginPath();X.moveTo(x,s.y+2);X.lineTo(x+8,s.y+12);X.lineTo(x+2,s.y+h);X.stroke()}}
    X.restore();
    X.shadowColor=css(c.glow);X.shadowBlur=12;X.strokeStyle=rgba(c.glow,.95);X.lineWidth=2.5;X.beginPath();X.moveTo(s.x+9,s.y+1.5);X.lineTo(s.x+s.w-9,s.y+1.5);X.stroke();X.shadowBlur=0;
    if(s.k==='m'){X.fillStyle='rgba(255,255,255,.85)';for(const x of[s.x+10,s.x+s.w-10]){X.beginPath();X.arc(x,s.y+9,2.5,0,7);X.fill()}}
    X.globalAlpha=1;
  }
}
