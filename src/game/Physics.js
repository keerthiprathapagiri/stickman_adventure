export const C={G:1900,RUN:250,ACC:1800,FRIC:2200,JUMP:690,SPRING:1020,MAXFALL:1100,COYOTE:.1,BUFFER:.12};
export function applyPhysics(p,dt,inp){
  const dir=(inp.right?1:0)-(inp.left?1:0),a=p.onGround?C.ACC:C.ACC*.75;
  if(dir){p.vx+=dir*a*dt;p.face=dir}else{const f=C.FRIC*dt;p.vx=Math.abs(p.vx)<=f?0:p.vx-Math.sign(p.vx)*f}
  p.vx=Math.max(-C.RUN,Math.min(C.RUN,p.vx));
  p.coyote=p.onGround?C.COYOTE:p.coyote-dt;
  p.buffer=inp.jumpPressed?C.BUFFER:p.buffer-dt;
  let ev=null;
  if(p.buffer>0&&p.coyote>0){p.vy=-C.JUMP;p.coyote=0;p.buffer=0;p.jumping=true;p.onGround=false;ev='jump'}
  if(!inp.jump&&p.jumping&&p.vy<-260)p.vy=-260;
  if(p.vy>=0)p.jumping=false;
  p.vy=Math.min(p.vy+C.G*dt,C.MAXFALL);
  return ev;
}
