export const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function moveAndCollide(p,dt,solids){
  p.x+=p.vx*dt;
  for(const s of solids)if(hit(p,s)){if(p.vx>0)p.x=s.x-p.w;else if(p.vx<0)p.x=s.x+s.w;p.vx=0}
  const prevBottom=p.y+p.h,prevTop=p.y;p.y+=p.vy*dt;p.onGround=false;p.ground=null;
  for(const s of solids)if(hit(p,s)){
    if(p.vy>=0&&prevBottom<=s.y+8){p.y=s.y-p.h;p.vy=0;p.onGround=true;p.ground=s}
    else if(p.vy<0&&prevTop>=s.y+s.h-8){p.y=s.y+s.h;p.vy=0}
    else p.x+=(p.x+p.w/2<s.x+s.w/2?-1:1)*2;
  }
}
