export class Camera{
  constructor(){this.x=0;this.y=0;this.sh=0}
  follow(p,dt,vw,vh,len){
    const tx=Math.max(0,Math.min(len-vw,p.x+p.w/2-vw/2+p.face*60)),ty=Math.max(-260,Math.min(0,p.y-vh*.55)),k=1-Math.exp(-6*dt);
    this.x+=(tx-this.x)*k;this.y+=(ty-this.y)*k;this.sh*=Math.exp(-9*dt);
  }
  shake(m){this.sh=Math.max(this.sh,m)}
  get ox(){return this.x+(Math.random()-.5)*this.sh}
  get oy(){return this.y+(Math.random()-.5)*this.sh}
}
