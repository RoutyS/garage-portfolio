import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {OrbitControls} from './vendor/OrbitControls.js';

const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.7,...extra});
const make=(geo,material,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;return o};
const box=(w,h,d,m,x,y,z)=>make(new THREE.BoxGeometry(w,h,d),m,x,y,z);
const button=(container,label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;container.append(b);return b};
function base(host,orthographic=false){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e6e2d9');
 const camera=orthographic?new THREE.OrthographicCamera(-6,6,5,-5,.1,100):new THREE.PerspectiveCamera(43,1,.1,100);
 const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;host.append(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xfff9ed,0xa3b4aa,2.5));const light=new THREE.DirectionalLight(0xffeed2,3);light.position.set(-5,10,6);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-15,right:15,top:15,bottom:-15,far:35});light.shadow.normalBias=.025;scene.add(light);
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);if(orthographic){const height=Math.max(10,11/(w/h));camera.left=-height*w/h/2;camera.right=height*w/h/2;camera.top=height/2;camera.bottom=-height/2}else camera.aspect=w/h;camera.updateProjectionMatrix()};const observer=new ResizeObserver(resize);observer.observe(host);resize();
 let dead=false,raf=0,last=performance.now();const run=fn=>{const tick=t=>{raf=requestAnimationFrame(tick);const dt=Math.min((t-last)/1000,.04);last=t;if(document.hidden)return;fn(dt,t/1000);renderer.render(scene,camera)};raf=requestAnimationFrame(tick)};
 const cleanup=()=>{dead=true;cancelAnimationFrame(raf);observer.disconnect();scene.traverse(o=>{o.geometry?.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m?.dispose())});renderer.dispose();renderer.forceContextLoss()};
 return{scene,camera,renderer,run,cleanup,isDead:()=>dead};
}
function hud(host,left,right){const h=document.createElement('div');h.className='game-hud';const a=document.createElement('span'),b=document.createElement('span');a.textContent=left;b.textContent=right;h.append(a,b);host.append(h);return[a,b]}
function help(host,text){const p=document.createElement('div');p.className='game-help';p.textContent=text;host.append(p);return p}

export function startGolf(host,controls){
 const b=base(host,true),{scene,camera,renderer}=b;camera.position.set(7,10,9);camera.lookAt(0,0,0);
 const sage=mat('#99b28f'),deep=mat('#557665'),wood=mat('#cf9875'),ivory=mat('#f8efd9'),purple=mat('#8f7aa9');
 scene.add(box(5.3,.45,8.5,wood,0,-.28,0),box(4.9,.15,8.1,sage,0,-.02,0));
 for(const x of [-2.5,2.5])scene.add(box(.17,.28,8.3,ivory,x,.14,0));
 for(const z of [-4.05,4.05])scene.add(box(5.2,.28,.17,ivory,0,.14,z));
 const obstacles=[{x:-1.25,z:.2,w:2.3,d:.38},{x:1.15,z:-1.5,w:2.2,d:.38}];
 obstacles.forEach(o=>scene.add(box(o.w,.30,o.d,purple,o.x,.22,o.z)));
 const goal=new THREE.Vector3(-1.3,.085,-3.1);const cup=make(new THREE.CylinderGeometry(.25,.25,.025,24),mat('#34443a'),goal.x,.085,goal.z);scene.add(cup);
 const pole=make(new THREE.CylinderGeometry(.025,.025,1.25,8),ivory,goal.x+.1,.7,goal.z);scene.add(pole);
 const flag=make(new THREE.PlaneGeometry(.55,.32),mat('#d68163',{side:THREE.DoubleSide}),goal.x+.37,1.18,goal.z);scene.add(flag);
 const ball=make(new THREE.SphereGeometry(.13,16,12),mat('#fffaf0'),0,.21,3.0);scene.add(ball);
 const ring=make(new THREE.TorusGeometry(.24,.015,6,28),purple,0,.10,3);ring.rotation.x=-Math.PI/2;scene.add(ring);
 let velocity=new THREE.Vector2(),shots=0,won=false,dragging=false,aimAngle=0;const [count,status]=hud(host,'0 coup','Visez le drapeau');
 const instruction=help(host,'Tirez la balle vers l’arrière, puis relâchez. Ou visez avec les boutons.');
 const guide=new THREE.Line(new THREE.BufferGeometry().setFromPoints([ball.position,ball.position.clone().add(new THREE.Vector3(0,0,-1.5))]),new THREE.LineDashedMaterial({color:0x78648c,dashSize:.12,gapSize:.08}));guide.computeLineDistances();scene.add(guide);
 const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.21);
 function world(e){const r=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);return ray.ray.intersectPlane(plane,new THREE.Vector3())}
 function updateGuide(v){guide.geometry.dispose();guide.geometry=new THREE.BufferGeometry().setFromPoints([ball.position,ball.position.clone().add(new THREE.Vector3(v.x,0,v.y))]);guide.computeLineDistances()}
 function shoot(v){if(won||velocity.length()>.05)return;velocity.copy(v).clampLength(0,7);if(velocity.length()<.12)return;shots++;count.textContent=`${shots} coup${shots>1?'s':''}`;status.textContent='La balle roule…';guide.visible=false;ring.visible=false}
 renderer.domElement.addEventListener('pointerdown',e=>{if(won||velocity.length()>.05)return;const p=world(e);if(!p||p.distanceTo(ball.position)>.7)return;dragging=true;renderer.domElement.setPointerCapture(e.pointerId)});
 renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;const p=world(e);if(p)updateGuide(new THREE.Vector2(ball.position.x-p.x,ball.position.z-p.z).multiplyScalar(1.5).clampLength(0,3))});
 renderer.domElement.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const p=world(e);if(p)shoot(new THREE.Vector2(ball.position.x-p.x,ball.position.z-p.z).multiplyScalar(3))});
 renderer.domElement.addEventListener('pointercancel',()=>dragging=false);
 function reset(){shots=0;won=false;velocity.set(0,0);ball.position.set(0,.21,3);ball.visible=true;aimAngle=0;count.textContent='0 coup';status.textContent='Visez le drapeau';guide.visible=true;ring.visible=true;updateGuide(new THREE.Vector2(0,-1.5))}
 const aim=delta=>{if(velocity.length()>.05||won)return;aimAngle+=delta;updateGuide(new THREE.Vector2(Math.sin(aimAngle)*1.5,-Math.cos(aimAngle)*1.5))};
 button(controls,'← Viser',()=>aim(-.18));button(controls,'Jouer ⛳',()=>shoot(new THREE.Vector2(Math.sin(aimAngle)*4.5,-Math.cos(aimAngle)*4.5)));button(controls,'Viser →',()=>aim(.18));button(controls,'↻ Recommencer',reset);
 b.run(dt=>{
  if(velocity.length()>.015&&!won){
   const old=ball.position.clone();ball.position.x+=velocity.x*dt;ball.position.z+=velocity.y*dt;velocity.multiplyScalar(Math.exp(-.9*dt));
   if(Math.abs(ball.position.x)>2.27){ball.position.x=THREE.MathUtils.clamp(ball.position.x,-2.27,2.27);velocity.x*=-.75}
   if(Math.abs(ball.position.z)>3.8){ball.position.z=THREE.MathUtils.clamp(ball.position.z,-3.8,3.8);velocity.y*=-.75}
   obstacles.forEach(o=>{if(Math.abs(ball.position.x-o.x)<o.w/2+.13&&Math.abs(ball.position.z-o.z)<o.d/2+.13){if(Math.abs(old.z-o.z)>=o.d/2+.12){ball.position.z=old.z;velocity.y*=-.75}else{ball.position.x=old.x;velocity.x*=-.75}}});
   ball.rotation.x+=velocity.y*dt/.13;ball.rotation.z-=velocity.x*dt/.13;
   if(Math.hypot(ball.position.x-goal.x,ball.position.z-goal.z)<.22&&velocity.length()<3.5){won=true;ball.visible=false;velocity.set(0,0);status.textContent='Dans le trou ! 🎉';instruction.textContent=`Bien joué ! Parcours terminé en ${shots} coup${shots>1?'s':''}.`;guide.visible=false;ring.visible=false}
   else if(velocity.length()<.08){velocity.set(0,0);status.textContent='À vous de jouer';guide.visible=true;ring.visible=true;updateGuide(new THREE.Vector2(Math.sin(aimAngle)*1.5,-Math.cos(aimAngle)*1.5))}
  }
  ring.position.set(ball.position.x,.10,ball.position.z);
 });return b.cleanup;
}

export function startRace(host,controls){
 const b=base(host),{scene,camera,renderer}=b;scene.background=new THREE.Color('#dadfdb');camera.position.set(12,14,16);camera.lookAt(0,0,0);
 const green=mat('#a0b69c'),road=mat('#626779'),cream=mat('#f5e6c9'),peach=mat('#d88b69'),purple=mat('#9275b7');
 scene.add(box(29,.45,24,green,0,-.35,0));
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-7,0,4),new THREE.Vector3(-8,0,-3),new THREE.Vector3(-3,0,-7),new THREE.Vector3(4,0,-6),new THREE.Vector3(8,0,-1),new THREE.Vector3(7,0,5),new THREE.Vector3(1,0,7)],true,'catmullrom',.45);
 const points=curve.getSpacedPoints(180),positions=[],indices=[];
 function track(t,lane=0){t=((t%1)+1)%1;const p=curve.getPointAt(t),tangent=curve.getTangentAt(t).normalize();return{p:p.add(new THREE.Vector3(tangent.z,0,-tangent.x).multiplyScalar(lane)),tangent}}
 for(let i=0;i<=180;i++){const {p,tangent}=track(i/180);for(const side of [-1,1])positions.push(p.x+tangent.z*1.45*side,.02,p.z-tangent.x*1.45*side);if(i<180){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2)}}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();road.side=THREE.DoubleSide;scene.add(make(geometry,road));
 for(let i=0;i<100;i++){const {p,tangent}=track(i/100);const angle=Math.atan2(tangent.x,tangent.z);for(const side of [-1,1]){const curb=box(.2,.09,.55,i%2?peach:cream,p.x+tangent.z*1.5*side,.06,p.z-tangent.x*1.5*side);curb.rotation.y=angle;scene.add(curb)}if(i%4===0){const dash=box(.06,.015,.3,cream,p.x,.04,p.z);dash.rotation.y=angle;scene.add(dash)}}
 for(let i=0;i<14;i++){const x=Math.sin(i*2.4)*11,z=Math.cos(i*2.4)*9;const trunk=make(new THREE.CylinderGeometry(.1,.15,.7,6),mat('#b69b7c'),x,.35,z);const tree=make(new THREE.ConeGeometry(.65,1.5,7),mat(i%2?'#6c9580':'#91a77c'),x,1.25,z);scene.add(trunk,tree)}
 const player=new THREE.Group();scene.add(player);const fallback=make(new THREE.TorusGeometry(.4,.12,8,16),purple,0,.5,0);fallback.rotation.y=Math.PI/2;player.add(fallback);
 new GLTFLoader().load('assets/models/gyrace-monowheel.glb',g=>{if(b.isDead()){g.scene.traverse(o=>o.geometry?.dispose());return}player.remove(fallback);fallback.geometry.dispose();fallback.material.dispose();g.scene.scale.setScalar(.48);g.scene.traverse(o=>{if(o.isMesh)o.castShadow=true});player.add(g.scene)});
 const obstacles=[.17,.29,.43,.58,.71,.83].map((t,i)=>{const lane=(i%3-1)*.8,{p}=track(t,lane);const cone=make(new THREE.ConeGeometry(.28,.65,8),peach,p.x,.35,p.z);scene.add(cone);return{t,lane,hit:false}});
 const [score,status]=hud(host,'00.0 s','1 tour · évitez les cônes');const instruction=help(host,'Déplacement : ← → ou les boutons. La monoroue avance automatiquement.');
 let progress=0,lane=0,input=0,playing=false,finished=false,elapsed=0,collisions=0,flash=0;
 function reset(){progress=0;lane=0;elapsed=0;collisions=0;finished=false;playing=true;obstacles.forEach(o=>o.hit=false);status.textContent='1 tour · évitez les cônes';pause.textContent='Pause';start.remove()}
 const start=document.createElement('div');start.className='game-start';start.innerHTML='<h3>Un tour dans le garage.</h3><p style="font-size:12px">Prenez le guidon de la monoroue.</p>';button(start,'Démarrer la mini-course →',reset);host.append(start);
 const left=button(controls,'← Gauche',()=>lane=Math.max(-1,lane-.5));const pause=button(controls,'Démarrer',()=>{if(finished||progress===0){reset();return}playing=!playing;pause.textContent=playing?'Pause':'Reprendre'});const right=button(controls,'Droite →',()=>lane=Math.min(1,lane+.5));button(controls,'↻ Recommencer',reset);
 const down=e=>{if(e.code==='ArrowLeft'||e.code==='KeyA'||e.code==='KeyQ'){input=-1;e.preventDefault()}if(e.code==='ArrowRight'||e.code==='KeyD'){input=1;e.preventDefault()}};const up=e=>{if(['ArrowLeft','ArrowRight','KeyA','KeyQ','KeyD'].includes(e.code))input=0};window.addEventListener('keydown',down);window.addEventListener('keyup',up);const blur=()=>{input=0};window.addEventListener('blur',blur);
 b.run(dt=>{
  if(playing&&!finished){elapsed+=dt;progress+=dt*.044;lane=THREE.MathUtils.clamp(lane+input*dt*2.2,-1.05,1.05);flash=Math.max(0,flash-dt);for(const o of obstacles){if(!o.hit&&Math.abs(progress-o.t)<.012&&Math.abs(lane-o.lane)<.42){o.hit=true;collisions++;elapsed+=2;flash=.5;status.textContent=`${collisions} cône${collisions>1?'s':''} · +2 s`;}}
   if(progress>=1){progress=1;finished=true;playing=false;status.textContent='Tour terminé !';instruction.textContent=`Bravo ! ${elapsed.toFixed(1)} secondes, ${collisions} cône${collisions>1?'s':''} touché${collisions>1?'s':''}.`;pause.textContent='Rejouer'}score.textContent=`${elapsed.toFixed(1).padStart(4,'0')} s`;
  }
  const {p,tangent}=track(progress,lane);player.position.copy(p);player.rotation.y=Math.atan2(tangent.x,tangent.z);player.rotation.z=input*.12;player.visible=flash===0||Math.floor(flash*15)%2===0;
  if(progress>0&&!finished){const desired=p.clone().add(tangent.clone().multiplyScalar(-6)).add(new THREE.Vector3(0,5,0));camera.position.lerp(desired,1-Math.exp(-dt*2));camera.lookAt(p.clone().add(tangent.clone().multiplyScalar(3)))}
 });return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);b.cleanup()};
}

export function startHouse(host,controls,{reduced}){
 const b=base(host,true),{scene,camera,renderer}=b;camera.position.set(8,9,10);camera.lookAt(0,.7,0);
 const orbit=new OrbitControls(camera,renderer.domElement);orbit.target.set(0,.7,0);orbit.enableDamping=true;orbit.enablePan=false;orbit.minZoom=.65;orbit.maxZoom=1.8;orbit.autoRotate=!reduced;orbit.autoRotateSpeed=.5;
 const cream=mat('#eee4cd'),sage=mat('#9db6a5'),peach=mat('#d6967c'),purple=mat('#9b8eb0');let house=new THREE.Group();scene.add(house);let seed=1;const [label,status]=hud(host,'MAISON 001','4 pièces');
 function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
 let count=0;function generate(){count++;scene.remove(house);house.traverse(o=>o.geometry?.dispose());house=new THREE.Group();scene.add(house);const cols=2+Math.floor(random()*2),rows=2+Math.floor(random()*2);status.textContent=`${cols*rows} pièces`;label.textContent=`MAISON ${String(count).padStart(3,'0')}`;
  for(let x=0;x<cols;x++)for(let z=0;z<rows;z++){const px=(x-(cols-1)/2)*2.1,pz=(z-(rows-1)/2)*2.1;house.add(box(2,.12,2,random()>.5?sage:cream,px,.1,pz));house.add(box(2,.9,.1,random()>.5?cream:peach,px,.6,pz-.99));house.add(box(.1,.9,2,cream,px-.99,.6,pz));const type=random();if(type>.55){house.add(box(.7,.4,1.1,purple,px,.36,pz),box(.6,.12,.3,cream,px,.63,pz-.3))}else{house.add(box(.8,.1,.65,peach,px,.6,pz));for(const dx of [-.3,.3])house.add(box(.08,.45,.08,cream,px+dx,.33,pz))}}
  house.add(box(cols*2.1+.4,.25,rows*2.1+.4,peach,0,-.13,0));
 }generate();help(host,'Des pièces, des murs et du mobilier assemblés à chaque génération.');button(controls,'↻ Générer une autre maison',generate);button(controls,'⟳ Rotation',()=>orbit.autoRotate=!orbit.autoRotate);b.run(()=>orbit.update());return()=>{orbit.dispose();b.cleanup();cream.dispose();sage.dispose();peach.dispose();purple.dispose()};
}
