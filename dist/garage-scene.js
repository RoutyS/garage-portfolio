import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {createNeighborhoodLife} from './neighborhood-life.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const outsideZones=new Set(['exterior','house','garden','street','bike','village']);
const views={
 street:{position:[38,30,52],target:[4,2,-4],label:'UNE ADRESSE POUR LES IDÉES',button:'La rue',outside:true},
 village:{position:[65,51,78],target:[4,1.5,-8],label:'LE QUARTIER DE RUTH',button:'Le village',outside:true},
 house:{position:[29,13,24],target:[14,3.5,-1.5],label:'LA MAISON',button:'Mon parcours',outside:true},
 bike:{position:[-15,4.6,15.2],target:[-9.1,1.3,10.25],label:'KAWASAKI NINJA',button:'La moto',outside:true},
 garden:{position:[26,13,20],target:[16,1.4,8],label:'LE PETIT JARDIN',button:'Le jardin',outside:true},
 overview:{position:[0,4.8,11.8],target:[0,2.2,-1],label:'BIENVENUE DANS L’ATELIER',button:'Le garage'},
 car:{position:[6.2,4.0,8.3],target:[0,1.4,.35],label:'MAZDA MX-5 NA',button:'La MX-5'},
 tools:{position:[-1.8,4.1,6.3],target:[-6.4,3.7,-.4],label:'LES ÉTAGÈRES & LES OUTILS',button:'Les outils'},
 desk:{position:[-3.6,3.6,-.6],target:[-4.65,2.25,-6.3],label:'LE BUREAU DES PROJETS',button:'Le bureau'},
 workbench:{position:[2.3,3.6,5.0],target:[6.1,2.4,.1],label:'LE POSTE DE TRAVAIL',button:'L’établi'},
 coffee:{position:[4.05,3.75,1.05],target:[6.05,2.46,-1.7],label:'UNE PAUSE À L’ATELIER',button:'Le café',hiddenNav:true},
 tires:{position:[-.8,4.5,3.0],target:[4.4,3.0,-5.85],label:'LE RANGEMENT DES PNEUS',button:'Les pneus'}
};

function mergeScene(root){
 root.updateMatrixWorld(true);const buckets=new Map(),group=new THREE.Group();
 root.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;const zone=o.name.split('_')[0],key=`${zone}|${o.material.uuid}`;
  if(!buckets.has(key))buckets.set(key,{zone,material:o.material,geometries:[]});let g=o.geometry.clone().applyMatrix4(o.matrixWorld);
  if(g.index){const u=g.toNonIndexed();g.dispose();g=u}for(const a of Object.keys(g.attributes))if(!['position','normal','uv'].includes(a))g.deleteAttribute(a);
  if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));buckets.get(key).geometries.push(g);
 });
 for(const b of buckets.values()){const g=mergeGeometries(b.geometries);b.geometries.forEach(x=>x.dispose());if(!g)continue;const mesh=new THREE.Mesh(g,b.material);mesh.name=b.zone;mesh.castShadow=!['room','lights','door','ceiling','street'].includes(b.zone);mesh.receiveShadow=b.zone!=='lights';group.add(mesh)}
 root.traverse(o=>o.geometry?.dispose());return group;
}

// Subtle material detail is generated locally; no external textures or trackers.
function grainTexture(seed){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(128,128);
 for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const c=217+(seed>>>27);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=c;pixels.data[i+3]=255}ctx.putImageData(pixels,0,0);
 const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(14,14);t.colorSpace=THREE.SRGBColorSpace;return t;
}

export async function startNeighborhood({loader,openCatalog,openJourney,toast,toggleHelp,reduced}){
 const host=$('#stage');let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;host.append(renderer.domElement)}
 catch{$('#scene-loading').innerHTML='<p>Aperçu de l’atelier</p><small>La 3D est indisponible sur cet appareil.</small>';$('#enter-garage').hidden=true;$('#open-projects').hidden=false;return}
 const scene=new THREE.Scene();scene.background=new THREE.Color('#d7e5ef');scene.fog=new THREE.Fog('#d7e5ef',140,360);
 const camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,280);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false;controls.rotateSpeed=.45;controls.zoomSpeed=.7;
 const pmrem=new THREE.PMREMGenerator(renderer),env=new RoomEnvironment();const environment=pmrem.fromScene(env,.035);scene.environment=environment.texture;scene.environmentIntensity=.65;env.dispose();pmrem.dispose();
 const ambient=new THREE.HemisphereLight(0xe6f0ff,0x7c8170,1.25);scene.add(ambient);
 const sun=new THREE.DirectionalLight(0xffedd7,3.1);sun.position.set(-32,58,38);sun.target.position.set(4,0,-8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-64,right:64,top:66,bottom:-50,near:1,far:160});sun.shadow.bias=-.0002;sun.shadow.normalBias=.06;sun.shadow.radius=3;scene.add(sun,sun.target);
 const indoor=new THREE.DirectionalLight(0xf3f7ff,0);indoor.position.set(-3,6,7);indoor.target.position.set(0,0,-2);indoor.castShadow=true;indoor.shadow.mapSize.set(2048,2048);Object.assign(indoor.shadow.camera,{left:-10,right:10,top:9,bottom:-9,near:.2,far:35});indoor.shadow.bias=-.0002;indoor.shadow.normalBias=.03;scene.add(indoor,indoor.target);
 const ceilingLight=new THREE.PointLight(0xffe5c5,45,22,2);ceilingLight.position.set(0,5.9,-1.2);scene.add(ceilingLight);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshStandardMaterial({color:'#c0cbbd',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.31;ground.receiveShadow=true;scene.add(ground);
 let model;const movingParts={},nightSurfaces=[];
 try{const raw=(await loader.loadAsync('assets/garage.gltf')).scene;raw.updateMatrixWorld(true);
  const luminousMaterials=new Map();raw.traverse(o=>{if(o.isMesh&&/house_window_glazing|street_lamp_lens|village_window_lit|village_lamp_lens/.test(o.name)){const key=o.material.uuid;let m=luminousMaterials.get(key);if(!m){m=o.material.clone();luminousMaterials.set(key,m);nightSurfaces.push({material:m,color:m.color.clone(),metal:m.metalness});}o.material=m;}});
  // These pivots retain their own geometry; merging them would erase animation.
  for(const name of ['popup_left','popup_right','fan_rotor']){const part=raw.getObjectByName(name);if(!part)continue;scene.attach(part);movingParts[name]={root:part,closed:part.quaternion.clone()};part.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material.isMeshStandardMaterial)o.material.envMapIntensity=name.startsWith('popup')?1.15:.55}})}
  model=mergeScene(raw);scene.add(model)}catch(e){console.error(e);$('#scene-loading').innerHTML='<p>Aperçu de l’atelier</p><small>Le chargement 3D a échoué.</small>';renderer.dispose();renderer.domElement.remove();$('#enter-garage').hidden=true;$('#open-projects').hidden=false;return}
 const headlamps=[];
 for(const name of ['popup_left','popup_right']){const lens=movingParts[name]?.root.getObjectByName(name+'_lens');if(!lens?.isMesh)continue;lens.material=lens.material.clone();lens.material.emissive=new THREE.Color('#fff0d2');lens.material.emissiveIntensity=0;lens.geometry.computeBoundingBox();const center=lens.geometry.boundingBox.getCenter(new THREE.Vector3());const beam=new THREE.SpotLight(0xffedca,0,19,.34,.72,2);beam.visible=false;beam.castShadow=false;scene.add(beam,beam.target);headlamps.push({lens,center,beam,opacity:lens.material.opacity,transmission:lens.material.transmission??0})}
 const streetLamp=new THREE.PointLight(0xffd69b,0,20,2);streetLamp.position.set(24.38,6.7,15.5);scene.add(streetLamp);
 const porchLamp=new THREE.PointLight(0xffdcad,0,9,2);porchLamp.position.set(10.8,4.5,3.7);scene.add(porchLamp);
 const villageLamps=[[-27.78,4.84,11],[.22,4.84,-25],[33.22,4.84,-15]].map(p=>{const light=new THREE.PointLight(0xffd7a0,0,14,2);light.position.fromArray(p);scene.add(light);return light});
 const nightSky=new THREE.Group();scene.add(nightSky);nightSky.visible=false;
 const stars=[];for(let i=0;i<70;i++){const v=(i*1.61803398875)%1,w=(i*.754877666)%1;stars.push(-95+v*190,25+w*65,-60-(i%9)*9)}
 const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));nightSky.add(new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xdce6ff,size:.22,fog:false,depthWrite:false,transparent:true,opacity:.8})));
 const moon=new THREE.Mesh(new THREE.SphereGeometry(1.2,24,16),new THREE.MeshBasicMaterial({color:0xffebc9,fog:false}));moon.position.set(-11,31,-43);nightSky.add(moon);
 const bikeNightMaterials=[];for(const mesh of model.children)if(mesh.name==='bike'&&/bike_(headlight|taillight)_lens/.test(mesh.material.name)){mesh.material=mesh.material.clone();bikeNightMaterials.push({material:mesh.material,rear:mesh.material.name.includes('taillight')});}
 const bikeBeam=new THREE.SpotLight(0xffedca,0,17,.40,.80,2);bikeBeam.position.set(-8.781419,2.027354,12.112816);bikeBeam.target.position.set(-7.15,.12,22.4);scene.add(bikeBeam,bikeBeam.target);bikeBeam.visible=false;
 const portal=new THREE.Group();scene.add(portal);
 const portalMat=new THREE.MeshBasicMaterial({color:0xefa875,transparent:true,opacity:.88,toneMapped:false});
 for(const [x,y,w,h] of [[-7.12,3.42,.095,6.86],[7.12,3.42,.095,6.86],[0,6.84,14.34,.095],[0,.10,14.34,.07]]){
  const line=new THREE.Mesh(new THREE.BoxGeometry(w,h,.045),portalMat);line.position.set(x,y,6.99);portal.add(line);
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(w+.22,h+.22),new THREE.MeshBasicMaterial({color:0xf2ae7e,transparent:true,opacity:.12,depthWrite:false,toneMapped:false}));halo.position.set(x,y,6.97);portal.add(halo);
 }
 const garageBubble=$('#garage-bubble'),houseBubble=$('#house-bubble');
 const garageAnchor=new THREE.Vector3(-.7,8.3,6.9),houseAnchor=new THREE.Vector3(14.4,11.8,1);
 const gate=new THREE.Group();gate.name='rolling-gate';scene.add(gate);for(const mesh of [...model.children])if(mesh.name==='gate')gate.add(mesh);
 const grain=grainTexture(37);for(const mesh of model.children){const m=mesh.material;if(/asphalt|grass|workshop grey|limestone paving/i.test(m.name)){m.map=grain;m.needsUpdate=true}if(m.isMeshStandardMaterial)m.envMapIntensity=mesh.name==='car'?1.15:.55}
 // Local contact shadow keeps the larger car grounded even in the showroom view.
 const cv=document.createElement('canvas');cv.width=cv.height=128;const cx=cv.getContext('2d'),gradient=cx.createRadialGradient(64,64,12,64,64,64);gradient.addColorStop(0,'rgba(12,19,26,.70)');gradient.addColorStop(.55,'rgba(12,19,26,.32)');gradient.addColorStop(1,'rgba(12,19,26,0)');cx.fillStyle=gradient;cx.fillRect(0,0,128,128);const contact=new THREE.Mesh(new THREE.PlaneGeometry(7.0,10.2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.set(0,.104,.45);scene.add(contact);
 const a=-Math.PI/20,c=Math.cos(a),s=Math.sin(a);for(const x of [-1.092,1.092])for(const y of [-1.85,1.15]){const patch=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.8),contact.material);patch.rotation.x=-Math.PI/2;patch.position.set(1.33*(c*x-s*(y+.45)),.105,-(-.45+1.33*(s*x+c*(y+.45))));scene.add(patch)}

 const neighborhoodLife=createNeighborhoodLife(scene);
 let motionPaused=!!reduced,indoorTime=0,fanAngle=0,shadowElapsed=0,ambientTime=0,popupAmount=0,headlightModeMoving=false;const xAxis=new THREE.Vector3(1,0,0),zAxis=new THREE.Vector3(0,0,1),turn=new THREE.Quaternion();
 const animationButton=$('#scene-animation');
 function motionUI(){animationButton.textContent=motionPaused?'▶':'Ⅱ';animationButton.setAttribute('aria-pressed',String(motionPaused));animationButton.setAttribute('aria-label',motionPaused?'Reprendre les animations':'Mettre les animations en pause');animationButton.title=motionPaused?'Reprendre les animations':'Mettre les animations en pause'}
 animationButton.onclick=()=>{motionPaused=!motionPaused;motionUI()};motionUI();
 let view='street',portrait=innerWidth/innerHeight<.8,transition=null,gateAmount=0,gateTarget=0,night=false,active=true,baseDistance=1,orbitMin=.3;
 function preset(name){const v=views[name];if(!portrait)return v;if(name==='street')return {...v,position:[43,33,69],target:[6.5,2.4,0]};if(name==='village')return {...v,position:[85,66,121],target:[4,1.5,-9]};if(name==='desk')return {...v,position:[-4.3,3.4,2.2],target:[-4.65,2.1,-6.3]};if(name==='overview')return {...v,position:[0,4.3,13.1],target:[0,2.6,-1]};return v}
 function limits(){const d=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(d),outside=!!views[view].outside;baseDistance=d.length();orbitMin=outside?.45:Math.max(.3,s.phi-.16);controls.minPolarAngle=orbitMin;controls.maxPolarAngle=outside?1.35:Math.min(1.55,s.phi+.17);controls.minAzimuthAngle=s.theta-(outside?.5:.27);controls.maxAzimuthAngle=s.theta+(outside?.5:.27);controls.minDistance=d.length()*(outside?.66:.72);controls.maxDistance=d.length()*(outside?1.45:1.25)}
 function updateOrbit(){const d=camera.position.distanceTo(controls.target);controls.minPolarAngle=views[view].outside?orbitMin:Math.max(orbitMin,Math.acos(THREE.MathUtils.clamp((6.35-controls.target.y)/d,-1,1)));controls.update();if(!views[view].outside)camera.position.x=THREE.MathUtils.clamp(camera.position.x,-6.9,6.9);camera.lookAt(controls.target)}
 function updateLights(){const outside=!!views[view].outside;ambient.intensity=night?.18:outside?1.25:.95;sun.intensity=night?.12:outside?3.1:1;indoor.intensity=outside?(night?.12:.35):night?.55:2.4;ceilingLight.intensity=night?48:70;renderer.toneMappingExposure=night?.83:.95;scene.background.set(night?'#111b2b':'#d7e5ef');scene.fog.color.copy(scene.background);scene.environmentIntensity=night?.075:.65;ground.material.color.set(night?'#293644':'#c0cbbd');document.body.classList.toggle('night',night);neighborhoodLife.setNight(night);nightSky.visible=night&&outside;streetLamp.intensity=night&&outside?115:0;porchLamp.intensity=night&&outside?32:0;for(const lamp of villageLamps)lamp.intensity=night&&outside?60:0;for(const s of nightSurfaces){s.material.emissive.set('#ffd399');s.material.emissiveIntensity=night?.75:0;s.material.color.copy(night?new THREE.Color('#987b52'):s.color);s.material.metalness=night?.1:s.metal}for(const lamp of bikeNightMaterials){lamp.material.emissive.set(lamp.rear?'#f43122':'#fff0d0');lamp.material.emissiveIntensity=night?(lamp.rear?2:3.5):0}bikeBeam.visible=night&&outside;bikeBeam.intensity=night&&outside?95:0;for(const lamp of headlamps){lamp.lens.material.opacity=night?1:lamp.opacity;lamp.lens.material.transmission=night?.08:lamp.transmission;lamp.lens.material.emissiveIntensity=night?4.5:0;lamp.beam.visible=night;lamp.beam.intensity=night?95:0}renderer.shadowMap.needsUpdate=true}
 function syncUI(){const outside=!!views[view].outside;document.body.classList.toggle('outside',outside);document.body.classList.toggle('inside',!outside);$('#view-name').textContent=views[view].label;$('#enter-garage').hidden=!outside;$('#back-street').hidden=outside;$('#open-projects').hidden=outside;$('#exterior-caption').hidden=!outside;$('#interaction-hint').textContent=outside?'Glissez pour regarder autour · molette ou + / − pour zoomer':'Cliquez sur les objets · le PC vous ouvre les projets';const nav=$('.view-controls');nav.replaceChildren();for(const [key,v] of Object.entries(views)){if(!!v.outside!==outside||v.hiddenNav)continue;const b=document.createElement('button');b.textContent=v.button;b.dataset.view=key;b.classList.toggle('active',key===view);b.setAttribute('aria-pressed',String(key===view));b.onclick=()=>{go(key);if(key==='house')openJourney()};nav.append(b)}updateLights()}
 function exteriorVisibility(show){for(const mesh of model.children)if(outsideZones.has(mesh.name))mesh.visible=show;ground.visible=show}
 function go(name){if(!views[name])return;const v=preset(name),wasOutside=!!views[view].outside;view=name;gateTarget=v.outside?0:1;if(v.outside)exteriorVisibility(true);controls.enabled=false;transition={start:performance.now(),duration:reduced?1:wasOutside!==!!v.outside?2400:1300,from:camera.position.clone(),target:controls.target.clone(),to:new THREE.Vector3(...v.position),look:new THREE.Vector3(...v.target),delay:wasOutside&&!v.outside&&!reduced?400:0};$('#scene-tooltip').style.display='none';syncUI();toggleHelp(false);renderer.shadowMap.needsUpdate=true}
 garageBubble.onclick=()=>go('overview');houseBubble.onclick=()=>{go('house');openJourney()};
 $('#enter-garage').onclick=()=>go('overview');$('#back-street').onclick=()=>go('street');
 function zoom(factor){if(transition)return;const d=camera.position.clone().sub(controls.target),r=THREE.MathUtils.clamp(d.length()*factor,controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(d.setLength(r));updateOrbit()}
 $('#zoom-out').onclick=()=>zoom(1.16);$('#zoom-in').onclick=()=>zoom(1/1.16);
 $('#scene-theme').onclick=()=>{night=!night;headlightModeMoving=true;updateLights();$('#scene-theme').textContent=night?'☀':'☾';$('#scene-theme').setAttribute('aria-label',night?'Passer en ambiance de jour':'Passer en ambiance de nuit');$('#scene-theme').setAttribute('aria-pressed',String(night))};
 const initial=preset('street');camera.position.fromArray(initial.position);controls.target.fromArray(initial.target);controls.update();limits();syncUI();
 function resize(){const w=host.clientWidth,h=host.clientHeight,next=w/h<.8;camera.aspect=w/h;camera.fov=next?58:43;if(portrait!==next){portrait=next;const v=preset(view);transition=null;controls.enabled=true;camera.position.fromArray(v.position);controls.target.fromArray(v.target);limits();controls.update()}camera.updateProjectionMatrix();renderer.setSize(w,h)}new ResizeObserver(resize).observe(host);resize();
 const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),dot=$('#laptop-hotspot'),dotPoint=new THREE.Vector3(-4.65,2.9,-6.76);let down;
 const names={coffee:'Le coin café',fan:'Ventilateur',desk:'Bureau · Le PC des projets',bike:'Kawasaki Ninja',gate:'Mon portfolio · ouvrir le garage',exterior:'Mon portfolio · ouvrir le garage',house:'Mon parcours · formations & expériences',garden:'Le jardin',car:'Mazda MX-5 NA',tools:'Étagères & outils',supplies:'Bidons & matériel',tires:'Rangement des pneus',storage:'Rangement',workbench:'Établi',laptop:'PC portable · Mes projets',jack:'Cric de levage',lights:'LED hexagonales'};
 function hit(e){const r=host.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);return ray.intersectObjects([...model.children,...gate.children].filter(o=>o.visible&&(!o.parent||o.parent.visible)),false)[0]}
 function action(h){if(!h||transition)return;const zone=h.object.name;if(views[view].outside){if(['gate','exterior'].includes(zone))go('overview');else if(zone==='house'){go('house');openJourney()}else if(['garden','bike'].includes(zone))go(zone);return}if(zone==='laptop'){openCatalog();return}if(zone==='desk'){go('desk');return}if(zone==='lights'){$('#scene-theme').click();return}const name=['car','jack'].includes(zone)?'car':['tires','storage'].includes(zone)?'tires':zone==='coffee'?'coffee':zone==='workbench'?'workbench':['tools','supplies'].includes(zone)?(h.point.x<0?'tools':'workbench'):null;if(name)go(name)}
 renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];$('#interaction-hint').classList.add('quiet')});renderer.domElement.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<6)action(hit(e));down=null});renderer.domElement.addEventListener('pointercancel',()=>down=null);
 renderer.domElement.addEventListener('pointermove',e=>{if(e.buttons||transition)return;const h=hit(e),title=h&&names[h.object.name],tip=$('#scene-tooltip');tip.style.display=title?'block':'none';renderer.domElement.style.cursor=title?'pointer':'grab';if(title){tip.textContent=title;tip.style.left=`${Math.min(innerWidth-220,e.clientX+15)}px`;tip.style.top=`${Math.min(innerHeight-110,e.clientY+18)}px`}});renderer.domElement.addEventListener('pointerleave',()=>$('#scene-tooltip').style.display='none');
 host.addEventListener('keydown',e=>{if(e.code==='Home'){e.preventDefault();go('street')}if(['ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();const keys=Object.keys(views).filter(k=>!views[k].hiddenNav&&!!views[k].outside===!!views[view].outside),i=keys.indexOf(view);go(keys[(i+(e.code==='ArrowRight'?1:-1)+keys.length)%keys.length])}if(['Minus','NumpadSubtract','Equal','NumpadAdd'].includes(e.code)){e.preventDefault();zoom(['Minus','NumpadSubtract'].includes(e.code)?1.16:1/1.16)}});
 document.addEventListener('visibilitychange',()=>active=!document.hidden);host.classList.add('loaded');$('#scene-loading').remove();$('#enter-garage').disabled=false;renderer.shadowMap.needsUpdate=true;
 let previous=performance.now();
 function frame(t){requestAnimationFrame(frame);const dt=Math.min(.05,(t-previous)/1000);previous=t;if(!active)return;
  if(Math.abs(gateAmount-gateTarget)>.001){gateAmount=THREE.MathUtils.damp(gateAmount,gateTarget,reduced?1000:4.8,dt);gate.scale.y=Math.max(.002,1-gateAmount);gate.position.y=6.7*gateAmount;gate.visible=gateAmount<.998;renderer.shadowMap.needsUpdate=true}else{gateAmount=gateTarget;gate.visible=!gateTarget}
  if(transition){const x=THREE.MathUtils.clamp((t-transition.start-transition.delay)/transition.duration,0,1),ease=x*x*(3-2*x);camera.position.lerpVectors(transition.from,transition.to,ease);controls.target.lerpVectors(transition.target,transition.look,ease);camera.lookAt(controls.target);if(x===1){transition=null;limits();controls.enabled=true;updateOrbit();if(!views[view].outside)exteriorVisibility(false);renderer.shadowMap.needsUpdate=true}}else updateOrbit();
  const outside=!!views[view].outside,paused=motionPaused||!!document.querySelector('dialog[open]')||!!transition;
  neighborhoodLife.update(dt,{outside,paused});
  if(!paused){ambientTime+=dt;shadowElapsed+=dt;
   if(!outside){indoorTime+=dt;fanAngle=(fanAngle+dt*6)%(Math.PI*2);
    const fan=movingParts.fan_rotor;if(fan)fan.root.quaternion.copy(fan.closed).multiply(turn.setFromAxisAngle(zAxis,fanAngle));
   }
   if(shadowElapsed>.1){renderer.shadowMap.needsUpdate=true;shadowElapsed=0}
  }
  const phase=indoorTime%24;let automatic=phase<2?0:phase<3.1?(phase-2)/1.1:phase<8?1:phase<9.1?1-(phase-8)/1.1:0;automatic=automatic*automatic*(3-2*automatic);
  const popupTarget=night?1:automatic;
  if((!outside&&!paused)||headlightModeMoving){const next=reduced?popupTarget:THREE.MathUtils.damp(popupAmount,popupTarget,8,dt);if(Math.abs(next-popupAmount)>.0001)renderer.shadowMap.needsUpdate=true;popupAmount=next;if(Math.abs(popupAmount-popupTarget)<.002)headlightModeMoving=false;turn.setFromAxisAngle(xAxis,-Math.PI*30/180*popupAmount);for(const name of ['popup_left','popup_right']){const p=movingParts[name];if(p)p.root.quaternion.copy(p.closed).multiply(turn)}}
  if(night)for(const lamp of headlamps){lamp.beam.position.copy(lamp.lens.localToWorld(lamp.center.clone()));lamp.beam.position.add(new THREE.Vector3(-.045,0,.16));lamp.beam.target.position.copy(lamp.beam.position).add(new THREE.Vector3(-1.55,-1.6,9.8))}
  portal.visible=!!views[view].outside&&!transition;portalMat.opacity=motionPaused?.9:.76+Math.sin(ambientTime*1.8)*.18;
  const hidePlaces=!views[view].outside||view==='bike'||!!transition;garageBubble.hidden=houseBubble.hidden=hidePlaces;
  if(!hidePlaces){
   camera.updateMatrixWorld();
   const rect=host.getBoundingClientRect(),compact=rect.width<760;
   const points=[garageAnchor,houseAnchor].map(a=>a.clone().project(camera));
   const width=compact?154:202;
   const projected=points.map(p=>({x:(p.x*.5+.5)*rect.width,y:(-p.y*.5+.5)*rect.height,p}));
   const overlap=Math.abs(projected[0].x-projected[1].x)<width+16;
   [garageBubble,houseBubble].forEach((el,i)=>{
    const {x,y,p}=projected[i];
    el.hidden=p.z>1||p.z< -1||x<0||x>rect.width||y<0||y>rect.height;
    const left=THREE.MathUtils.clamp(x-width/2,8,Math.max(8,rect.width-width-8));
    const lift=overlap&&i===1?120:28;
    el.style.left=left+'px';el.style.top=(y-lift)+'px';
    el.style.setProperty('--anchor-x',(x-left)+'px');
    el.style.setProperty('--anchor-length',lift+'px');
   });
  }
  renderer.render(scene,camera);const d=camera.position.distanceTo(controls.target);$('#zoom-in').disabled=!!transition||d<=controls.minDistance+.04;$('#zoom-out').disabled=!!transition||d>=controls.maxDistance-.04;$('#enter-garage').disabled=!!transition;
  const v=dotPoint.clone().project(camera);dot.style.left=`${(v.x*.5+.5)*innerWidth}px`;dot.style.top=`${(-v.y*.5+.5)*innerHeight}px`;dot.hidden=!!views[view].outside||!!transition||v.z>1||Math.abs(v.x)>.94||Math.abs(v.y)>.85||['tools','tires','car'].includes(view);
 }requestAnimationFrame(frame);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.remove('loaded');dot.hidden=true;toast('Aperçu fixe activé. Les projets restent accessibles.');$('#open-projects').hidden=false});
}
