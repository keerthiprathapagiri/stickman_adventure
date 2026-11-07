export class Particles{
  constructor(){this.a=[]}
  emit(x,y,n,o={}){for(let i=0;i<n;i++)this.a.push({x,y,vx:(Math.random()-.5)*(o.sp||140)+(o.vx||0),vy:(Math.random()-.5)*(o.sp||140)-(o.up||0),life:o.life||.6,max:o.life||.6,r:(o.r||3)*(.6+Math.random()*.7),c:o.c||'#fff',g:o.g??320,glow:o.glow})}
  update(dt){for(const p of this.a){p.life-=dt;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt}this.a=this.a.filter(p=>p.life>0)}
  draw(X){for(const p of this.a){X.globalAlpha=Math.max(0,p.life/p.max);X.fillStyle=p.c;if(p.glow){X.shadowColor=p.c;X.shadowBlur=8}X.beginPath();X.arc(p.x,p.y,p.r,0,7);X.fill()}X.globalAlpha=1;X.shadowBlur=0}
}
