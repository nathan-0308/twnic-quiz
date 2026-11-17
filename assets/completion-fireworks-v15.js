/* TWNIC v15: finite responsive completion fireworks. */
(()=>{
'use strict';
const app=document.getElementById('app'),screen=document.getElementById('completion-screen');
if(!app||!screen)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const colors=['#f45b12','#e91e63','#7c39e9','#007acb','#009eac','#55a42b','#e7a500'];
let frame=0,canvas=null,active=false;
function stop(){if(frame)cancelAnimationFrame(frame);frame=0;if(canvas)canvas.remove();canvas=null;}
function play(){
 stop();if(reduced.matches)return;
 const layer=document.createElement('canvas');layer.className='completion-fireworks';layer.setAttribute('aria-hidden','true');
 Object.assign(layer.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'1',display:'block'});
 const ctx=layer.getContext('2d');if(!ctx)return;canvas=layer;screen.appendChild(layer);
 const mobile=innerWidth<=600,compact=mobile||innerHeight<520,n=compact?42:64;
 const points=mobile?[[.12,.26],[.87,.22],[.11,.65],[.88,.69],[.22,.13],[.76,.85],[.13,.83],[.90,.38]]:[[.13,.26],[.82,.19],[.94,.44],[.20,.74],[.49,.17],[.79,.76],[.08,.48],[.60,.77],[.92,.25],[.34,.24]];
 const bursts=points.map(([x,y],i)=>({x,y,at:.33+i*(mobile?.37:.29),color:colors[i%colors.length],sparks:Array.from({length:n},(_,j)=>({angle:j/n*Math.PI*2+(Math.random()-.5)*.13,speed:.58+Math.random()*.52,life:1.25+Math.random()*.65,phase:Math.random()*6.28,weight:.65+Math.random()*1.25}))}));
 const begin=performance.now();let w=0,h=0,dpr=0;const duration=4.85;
 function draw(now){
  if(canvas!==layer||screen.hidden||!app.classList.contains('is-complete')||reduced.matches){stop();return;}
  const t=(now-begin)/1000;if(t>=duration){stop();return;}
  const nw=layer.clientWidth||innerWidth,nh=layer.clientHeight||innerHeight,nd=Math.min(devicePixelRatio||1,1.75);
  if(nw!==w||nh!==h||nd!==dpr){w=nw;h=nh;dpr=nd;layer.width=Math.round(w*dpr);layer.height=Math.round(h*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const base=Math.min(w,h)*(mobile?.205:.155);
  for(const b of bursts){
   const age=t-b.at,x=b.x*w,y=b.y*h;if(age<-.30||age>2.05)continue;
   if(age<0){const q=1+age/.30,yy=h+(y-h)*q;ctx.globalAlpha=.65*q;ctx.strokeStyle=b.color;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(x,yy+Math.min(h*.09,35));ctx.lineTo(x,yy);ctx.stroke();continue;}
   for(const p of b.sparks){
    if(age>p.life)continue;
    const radius=base*p.speed*(1-Math.exp(-3.3*age)),prev=Math.max(0,age-.10),old=base*p.speed*(1-Math.exp(-3.3*prev));
    const gravity=base*.27*age*age,oldGravity=base*.27*prev*prev,dx=Math.cos(p.angle),dy=Math.sin(p.angle),px=x+radius*dx,py=y+radius*dy+gravity;
    const fade=Math.pow(1-age/p.life,1.15),twinkle=.68+.32*Math.sin(age*22+p.phase);
    ctx.globalAlpha=Math.min(1,fade*(.8+.2*twinkle));ctx.strokeStyle=b.color;ctx.lineWidth=p.weight*(mobile?.85:1.15);ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(x+old*dx,y+old*dy+oldGravity);ctx.lineTo(px,py);ctx.stroke();
    if(age>.22){ctx.globalAlpha=fade*.7;ctx.fillStyle=b.color;ctx.fillRect(px-.75,py-.75,1.5,1.5);}
   }
  }
  // Remove spark trails around the heading, reward text and restart control.
  ctx.globalAlpha=1;const bounds=layer.getBoundingClientRect();
  for(const el of screen.querySelectorAll('.completion-heading,.completion-subtitle,.completion-restart')){
   const r=el.getBoundingClientRect();if(r.width&&r.height)ctx.clearRect(r.left-bounds.left-8,r.top-bounds.top-5,r.width+16,r.height+10);
  }
  frame=requestAnimationFrame(draw);
 }
 frame=requestAnimationFrame(draw);
}
function sync(){const visible=app.classList.contains('is-complete')&&!screen.hidden;if(visible&&!active){active=true;play();}else if(!visible&&active){active=false;stop();}}
const watch=new MutationObserver(sync);watch.observe(app,{attributes:true,attributeFilter:['class']});watch.observe(screen,{attributes:true,attributeFilter:['hidden']});
if(reduced.addEventListener)reduced.addEventListener('change',()=>{if(reduced.matches)stop();});
window.addEventListener('pagehide',()=>{stop();active=false;});window.addEventListener('pageshow',sync);sync();
})();