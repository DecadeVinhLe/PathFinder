/* 3D hero: city, routes and moving vehicles (three.js r128) */
/* ---------- 3D hero: city, routes and moving vehicles (three.js r128) ---------- */
addEventListener('load',()=>{const cv=document.getElementById('hero3d');if(!cv||typeof THREE==='undefined'){if(cv)cv.style.display='none';return}
let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'low-power'})}catch(e){cv.style.display='none';return}
const hero=cv.parentElement,sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(42,1,.1,200),still=matchMedia('(prefers-reduced-motion:reduce)').matches;
R.setPixelRatio(Math.min(devicePixelRatio||1,1.75));sc.fog=new THREE.Fog(0x07101c,24,62);
sc.add(new THREE.AmbientLight(0x7a9cc8,.95));const dl=new THREE.DirectionalLight(0xffffff,.85);dl.position.set(8,14,6);sc.add(dl);
const city=new THREE.Group();sc.add(city);
const grid=new THREE.GridHelper(64,32,0x0B63CE,0x14396a);grid.material.transparent=true;grid.material.opacity=.5;city.add(grid);
const bm=new THREE.MeshStandardMaterial({color:0x14283f,roughness:.7,metalness:.2}),em=new THREE.LineBasicMaterial({color:0x2f7fe0,transparent:true,opacity:.45});
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
for(let i=-9;i<=9;i++)for(let j=-9;j<=9;j++){if(i%3===0||j%3===0||rnd()<.25)continue;const h=.6+Math.pow(rnd(),2)*5.5,w=.9+rnd()*.6,g=new THREE.BoxGeometry(w,h,w),m=new THREE.Mesh(g,bm);m.position.set(i*1.6,h/2,j*1.6);city.add(m);const e=new THREE.LineSegments(new THREE.EdgesGeometry(g),em);e.position.copy(m.position);city.add(e)}
const RT=[[-9.6,9.6,-4.8,4.8],[0,14.4,-9.6,0],[-14.4,-4.8,4.8,14.4],[-4.8,9.6,4.8,14.4],[-14.4,0,-14.4,-4.8]].map(([x0,x1,z0,z1])=>{const P=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]],L=[];let tot=0;P.forEach((p,i)=>{const q=P[(i+1)%4],d=Math.hypot(q[0]-p[0],q[1]-p[1]);L.push(d);tot+=d});
 const ln=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(P.map(p=>new THREE.Vector3(p[0],.04,p[1]))),new THREE.LineBasicMaterial({color:0xFFC72C,transparent:true,opacity:.75}));city.add(ln);return{P,L,tot}});
const at=(r,u)=>{let d=((u%1)+1)%1*r.tot,i=0;while(d>r.L[i]){d-=r.L[i];i++}const a=r.P[i],b=r.P[(i+1)%4],k=d/r.L[i];return{x:a[0]+(b[0]-a[0])*k,z:a[1]+(b[1]-a[1])*k,ry:Math.atan2(-(b[1]-a[1]),b[0]-a[0])}};
const cols=[0xFFC72C,0x5CA8FF,0xffffff],V=[];RT.forEach((r,ri)=>{for(let k=0;k<3;k++){const c=cols[(ri+k)%3],m=new THREE.Mesh(new THREE.BoxGeometry(.42,.18,.2),new THREE.MeshBasicMaterial({color:c}));city.add(m);V.push({m,r,u:k/3+ri*.13,s:(.012+.006*((ri+k)%3))*(k%2?-1:1)})}});
const rings=[[-9.6,-4.8],[4.8,-4.8],[0,0],[-4.8,9.6],[9.6,4.8]].map(p=>{const m=new THREE.Mesh(new THREE.RingGeometry(.3,.4,32),new THREE.MeshBasicMaterial({color:0xFFC72C,transparent:true,opacity:.8,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(p[0],.06,p[1]);city.add(m);return m});
let mx=0,my=0,tx=0,ty=0,vis=true,w=1,h=1;
const size=()=>{w=hero.clientWidth;h=hero.clientHeight;R.setSize(w,h,false);cam.aspect=w/h;if(w>900)cam.setViewOffset(w,h,-w*.2,0,w,h);else cam.clearViewOffset();cam.updateProjectionMatrix()};
size();if('ResizeObserver' in window)new ResizeObserver(()=>{size();frame(last)}).observe(hero);
hero.addEventListener('pointermove',e=>{const b=hero.getBoundingClientRect();tx=(e.clientX-b.left)/b.width-.5;ty=(e.clientY-b.top)/b.height-.5});
if('IntersectionObserver' in window)new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis&&!still)loop()}).observe(hero);
let last=0,raf=0;
function frame(ms){const t=ms/1000;mx+=(tx-mx)*.05;my+=(ty-my)*.05;const a=t*.05+mx*.6,y=Math.min(window.scrollY||0,500)*.012;
 cam.position.set(Math.sin(a)*19,9.5+y-my*3,Math.cos(a)*19);cam.lookAt(0,1,0);
 V.forEach(v=>{v.u+=v.s*(still?0:.016);const p=at(v.r,v.u);v.m.position.set(p.x,.14,p.z);v.m.rotation.y=p.ry});
 rings.forEach((r,i)=>{const k=((t*.6+i*.2)%1);r.scale.setScalar(1+k*2.2);r.material.opacity=.8*(1-k)});
 cv.style.opacity=Math.max(0,1-(window.scrollY||0)/(h*1.1));R.render(sc,cam)}
function loop(){cancelAnimationFrame(raf);const f=ms=>{if(!vis||document.hidden){return}last=ms;frame(ms);raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&vis&&!still)loop()});
frame(0);if(!still)loop()});
