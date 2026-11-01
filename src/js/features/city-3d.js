/* Home page 3D band: a low-poly city with bus lines and moving buses (three.js r128 from the CDN).
   Sits below the hero. If three.js or WebGL is unavailable the whole band hides itself. */
Object.assign(K.en,{c3_t:'How the network fits together',c3_p:'A simplified 3D view of bus lines crossing the city. Move your pointer over it to tilt the view.',c3_n:'Sample network, not to scale',c3_r:'Route'});
Object.assign(K.vi,{c3_t:'Mạng lưới kết nối thế nào',c3_p:'Góc nhìn 3D đơn giản về các tuyến xe buýt đi qua thành phố. Di chuột lên khung để nghiêng góc nhìn.',c3_n:'Mạng mẫu, không theo tỷ lệ',c3_r:'Tuyến'});
(function(){
  const band=document.getElementById('c3band'),box=document.getElementById('c3');
  if(!band||!box)return;
  const off=()=>{band.hidden=true};
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  function start(){
    if(!window.THREE){off();return}
    const T=THREE;
    let renderer;
    try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})}catch(e){off();return}
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
    box.prepend(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden','true');

    const scene=new T.Scene(),cam=new T.PerspectiveCamera(38,1,.1,100);
    const N=10,CELL=1.6,EXT=N*CELL,W=k=>(k-N/2)*CELL;      /* road line k -> world coordinate */
    const dark=()=>document.documentElement.dataset.theme==='dark';
    const PAL={light:{ground:0xdce6f2,b1:0xffffff,b2:0xc3d3ea,b3:0x9fb7dc,grid:0x7f92b3},dark:{ground:0x0c2140,b1:0x1a3d73,b2:0x14305c,b3:0x0f2650,grid:0x3c79cf}};
    const mats={ground:new T.MeshLambertMaterial(),b1:new T.MeshLambertMaterial(),b2:new T.MeshLambertMaterial(),b3:new T.MeshLambertMaterial()};
    const gridMat=new T.LineBasicMaterial({transparent:true,opacity:.35});
    function theme(){const p=dark()?PAL.dark:PAL.light;for(const k in mats)mats[k].color.setHex(p[k]);gridMat.color.setHex(p.grid)}

    scene.add(new T.HemisphereLight(0xffffff,0x6f86ad,.95));
    const sun=new T.DirectionalLight(0xffffff,.8);sun.position.set(8,14,6);scene.add(sun);

    const world=new T.Group();scene.add(world);
    const ground=new T.Mesh(new T.BoxGeometry(EXT+2,.2,EXT+2),mats.ground);ground.position.y=-.1;world.add(ground);
    const grid=new T.GridHelper(EXT,N,0x000000,0x000000);grid.material=gridMat;grid.position.y=.01;world.add(grid);

    /* city blocks: taller near the middle, seeded so it looks the same every visit */
    let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
    const mk=['b1','b2','b3'];
    for(let i=0;i<N;i++)for(let j=0;j<N;j++){
      const cx=W(i)+CELL/2,cz=W(j)+CELL/2,d=Math.hypot(cx,cz)/(EXT*.7);
      const h=.25+rnd()*.8+Math.max(0,1-d)*2.2,w=CELL-.55-rnd()*.25,dd=CELL-.55-rnd()*.25;
      const m=new T.Mesh(new T.BoxGeometry(w,h,dd),mats[mk[(rnd()*3)|0]]);
      m.position.set(cx,h/2,cz);world.add(m);
    }

    /* bus lines follow the roads between blocks; colours come from the app's ROUTES data when present */
    const cols=(typeof ROUTES!=='undefined'&&ROUTES.length?ROUTES.map(r=>r.color):[]).concat(['#c2410c','#0ea5e9','#16a34a','#a855f7']);
    const names=(typeof ROUTES!=='undefined'&&ROUTES.length?ROUTES.map(r=>r.id):[]).concat(['05','19','52','56']);
    const LINES=[[[0,3],[6,3],[6,8],[10,8]],[[2,0],[2,5],[8,5],[8,10]],[[0,7],[4,7],[4,2],[10,2]],[[5,0],[5,10]]];
    const buses=[],rings=[],legend=[];
    LINES.forEach((pts,li)=>{
      const col=new T.Color(cols[li]),V=pts.map(p=>new T.Vector3(W(p[0]),.09,W(p[1])));
      const path=new T.CurvePath();for(let i=0;i<V.length-1;i++)path.add(new T.LineCurve3(V[i],V[i+1]));
      const tube=new T.Mesh(new T.TubeGeometry(path,160,.07,6,false),new T.MeshBasicMaterial({color:col}));world.add(tube);
      V.forEach((v,i)=>{
        const stop=new T.Mesh(new T.CylinderGeometry(.16,.16,.1,20),new T.MeshLambertMaterial({color:0xffffff}));stop.position.copy(v);world.add(stop);
        if(i===0||i===V.length-1){const r=new T.Mesh(new T.RingGeometry(.22,.3,28),new T.MeshBasicMaterial({color:col,transparent:true,opacity:.8,side:T.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.set(v.x,.16,v.z);world.add(r);rings.push(r)}
      });
      for(let b=0;b<3;b++){
        const g=new T.Group(),body=new T.Mesh(new T.BoxGeometry(.62,.26,.28),new T.MeshLambertMaterial({color:col}));body.position.y=.2;
        const roof=new T.Mesh(new T.BoxGeometry(.5,.05,.22),new T.MeshLambertMaterial({color:0xffffff}));roof.position.y=.35;g.add(body,roof);world.add(g);
        buses.push({g,path,t:(b/3+li*.13)%1,v:.012+li*.002});
      }
      legend.push(`<span class="c3-chip"><i style="background:${cols[li]}"></i>${t('c3_r')} ${names[li]}</span>`);
    });
    const leg=box.querySelector('.c3-leg');if(leg)leg.innerHTML=legend.join('');

    /* camera orbit with gentle pointer tilt */
    let ang=.8,tiltX=0,tiltY=0,tx=0,ty=0,run=false,last=0;
    box.addEventListener('pointermove',e=>{const r=box.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5});
    box.addEventListener('pointerleave',()=>{tx=0;ty=0});
    function size(){const w=box.clientWidth,h=box.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
    function frame(now){
      if(run)requestAnimationFrame(frame);
      const dt=Math.min((now-last)/1000||0,.05);last=now;
      if(!reduce){ang+=dt*.06;buses.forEach(b=>{b.t=(b.t+b.v*dt*3)%1});const k=1+Math.sin(now/500)*.12;rings.forEach(r=>r.scale.setScalar(k))}
      tiltX+=(tx-tiltX)*.06;tiltY+=(ty-tiltY)*.06;
      buses.forEach(b=>{const p=b.path.getPointAt(b.t),q=b.path.getPointAt(Math.min(b.t+.004,.9999));b.g.position.set(p.x,0,p.z);b.g.lookAt(q.x,0,q.z);b.g.rotateY(-Math.PI/2)});
      const a=ang+tiltX*.9,R=19-Math.abs(tiltY)*2;
      cam.position.set(Math.cos(a)*R,12.5+tiltY*5,Math.sin(a)*R);cam.lookAt(0,.6,0);
      renderer.render(scene,cam);
    }
    function go(){if(run)return;run=true;last=performance.now();requestAnimationFrame(frame)}
    function stop(){run=false}
    new ResizeObserver(()=>{size();if(!run)frame(performance.now())}).observe(box);
    new MutationObserver(()=>{theme();if(!run)frame(performance.now())}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    theme();size();frame(performance.now());
    if(!reduce){
      let vis=false,tab=!document.hidden;const upd=()=>(vis&&tab)?go():stop();
      new IntersectionObserver(e=>{vis=e[0].isIntersecting;upd()},{threshold:.05}).observe(box);
      document.addEventListener('visibilitychange',()=>{tab=!document.hidden;upd()});
    }
  }

  try{
    if(window.THREE)start();
    else{const el=document.getElementById('three-cdn');
      if(!el){off();return}
      el.addEventListener('load',()=>{try{start()}catch(e){off()}});el.addEventListener('error',off);setTimeout(()=>{if(!window.THREE)off()},10000)}
  }catch(e){off()}
})();
