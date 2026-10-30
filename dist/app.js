import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {startRace,startGolf,startHouse} from './demos.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader=new GLTFLoader();
const projects=await fetch('./projects.json').then(r=>{if(!r.ok)throw Error('Catalogue indisponible');return r.json()}).catch(()=>[]);
let filter='all', expanded=false, activeProject=null, cleanMedia=()=>{}, mediaGeneration=0;
const categoryNames={game:'Jeux & expériences','3d':'Création 3D',simulation:'Code & simulations',ai:'Code & intelligence artificielle'};
const shortCategories={game:'GAME DEV','3d':'CRÉATION 3D',simulation:'CODE & SIMULATION',ai:'CODE & IA'};
const modelNames={'gyrace-monowheel':'Monoroue','gyrace-circuit':'Circuit','minigolf-terrain':'Terrain','minigolf-putter':'Putter','mathbutter-suzanne':'Suzanne','mathbutter-donut':'Donut','bones-human':'Personnage','bones-dragonfly':'Libellule','bones-bunny':'Lapin','bones-teddy':'Teddy','procedural-prefab':'Élément de construction','genetic-human':'Individu'};
const colors=['#e4ddea','#dfe7d9','#ebdfd2','#dee5e1','#e8dfd9','#e5dfea'];
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text)x.textContent=text;return x}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}

function abstractArt(p){
  const wrap=el('div','abstract-art');
  // These are visual identities for source-only projects, never claimed as screenshots.
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"><g fill="none" stroke="#8c809a" stroke-width="1" opacity=".35"><path d="M40 170 L130 80 L250 150 L340 55 M40 170 L245 195 L340 55 M130 80 L245 195 M130 80 L340 55"/>${[[40,170],[130,80],[250,150],[340,55],[245,195]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#8c809a"/>`).join('')}<circle cx="200" cy="115" r="65"/><ellipse cx="200" cy="115" rx="105" ry="40" transform="rotate(-30 200 115)"/></g></svg>`;
  wrap.innerHTML=svg;
  const label=el('span','abstract-label',p.category==='ai'?'LEARN / ITERATE':p.category==='game'?'PLAY / EXPERIMENT':'BUILD / EXPLORE');wrap.append(label);return wrap;
}
function renderProjects(){
 const query=$('#search').value.trim().toLocaleLowerCase('fr');
 const matches=projects.filter(p=>(filter==='all'||p.category===filter||(filter==='code'&&['ai','simulation'].includes(p.category)))&&`${p.name} ${p.summary} ${p.tech.join(' ')}`.toLocaleLowerCase('fr').includes(query));
 const visible=expanded||filter!=='all'||query?matches:matches.slice(0,6);
 const grid=$('#project-grid');grid.replaceChildren();
 visible.forEach((p,i)=>{
  const card=el('button','project-card');card.dataset.project=p.id;card.setAttribute('aria-label',`Découvrir ${p.name}`);
  const art=el('div','card-art');art.style.setProperty('--card-bg',colors[projects.indexOf(p)%colors.length]);
  if(p.models.length){const img=el('img');img.src=`assets/thumbs/${p.models[0]}.png`;img.alt=`Modèle de présentation issu de ${p.name}`;img.loading='lazy';art.append(img)}else art.append(abstractArt(p));
  art.append(el('span','card-index',String(p.index+1).padStart(2,'0')));
  art.append(el('span','card-type',p.demo?'MINI-DÉMO INTERACTIVE':p.models.length?'MODÈLE 3D À EXPLORER':'CARNET DE PROJET'));
  art.append(el('span','card-open','↗'));
  const meta=el('div','card-meta');meta.append(el('h3','',p.name),el('span','card-category',shortCategories[p.category]));
  const tech=el('div','card-tech');p.tech.slice(0,3).forEach(t=>tech.append(el('span','',t)));
  card.append(art,meta,el('p','card-description',p.summary),tech);grid.append(card);
 });
 $('#empty').hidden=matches.length>0;$('#show-all').hidden=expanded||filter!=='all'||!!query||matches.length<=6;
 $('#result-count').textContent=`${matches.length} projets trouvés, ${visible.length} affichés.`;
}
function setFilter(value,scroll=false){filter=value;expanded=true;$$('.filters button').forEach(b=>b.classList.toggle('active',b.dataset.filter===value));renderProjects();if(scroll)$('#projects').scrollIntoView({behavior:reduced?'instant':'smooth'})}
document.addEventListener('click',e=>{const p=e.target.closest('[data-project]');if(p)openProject(p.dataset.project);const f=e.target.closest('[data-filter]');if(f)setFilter(f.dataset.filter,!!f.closest('.hotspots'))});
$('#search').addEventListener('input',renderProjects);$('#show-all').addEventListener('click',()=>{expanded=true;renderProjects()});renderProjects();

function createRenderer(host,alpha=true){const r=new THREE.WebGLRenderer({antialias:true,alpha,powerPreference:'high-performance'});r.setPixelRatio(Math.min(devicePixelRatio,1.75));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.1;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;host.append(r.domElement);return r}
function studio(scene){scene.add(new THREE.HemisphereLight(0xfff8eb,0xb5c1bd,2.3));const light=new THREE.DirectionalLight(0xfff0de,3.1);light.position.set(7,13,9);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:45});light.shadow.normalBias=.025;light.shadow.bias=-.0001;scene.add(light);const fill=new THREE.DirectionalLight(0xe0e7ff,1.0);fill.position.set(-8,6,-3);scene.add(fill);return light}
function shadows(root){root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}})}
function disposeScene(scene){scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const list=Array.isArray(o.material)?o.material:[o.material];list.forEach(m=>{for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose()})}})}

async function initGarage(){
 const host=$('#stage');let renderer;
 try{renderer=createRenderer(host)}catch(e){$('#scene-loading').textContent='Aperçu fixe · les projets restent accessibles ci-dessous';return}
 const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-12,12,9,-9,.1,150);camera.position.set(18,19,24);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.55,-.2);controls.enableDamping=true;controls.enablePan=false;controls.minPolarAngle=.4;controls.maxPolarAngle=1.38;controls.minAzimuthAngle=-.45;controls.maxAzimuthAngle=1.38;controls.minZoom=.7;controls.maxZoom=1.7;controls.enableZoom=false;controls.update();controls.saveState();
 const key=studio(scene);let garage;
 try{garage=(await loader.loadAsync('assets/garage.glb')).scene;shadows(garage);scene.add(garage);host.classList.add('loaded');$('#scene-loading').remove()}
 catch(e){console.error('Garage loading',e);$('#scene-loading').textContent='Aperçu fixe · la 3D est momentanément indisponible';renderer.dispose();renderer.domElement.remove();return}
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(35,35),new THREE.ShadowMaterial({color:0x776356,opacity:.13}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.78;shadow.receiveShadow=true;scene.add(shadow);
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight,a=w/h;const vertical=Math.max(16.4,20/a);camera.left=-vertical*a/2;camera.right=vertical*a/2;camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();renderer.setSize(w,h)};new ResizeObserver(resize).observe(host);resize();
 const anchors=$$('.hotspot').map(button=>{const [x,y,z]=button.dataset.point.split(',').map(Number);return{button,point:new THREE.Vector3(x,z,-y)}});
 let onscreen=true;new IntersectionObserver(([entry])=>onscreen=entry.isIntersecting,{rootMargin:'100px'}).observe(host);
 function frame(){requestAnimationFrame(frame);if(!onscreen||document.hidden)return;controls.update();renderer.render(scene,camera);anchors.forEach(({button,point})=>{const v=point.clone().project(camera);button.style.left=`${(v.x*.5+.5)*host.clientWidth}px`;button.style.top=`${(-v.y*.5+.5)*host.clientHeight-20}px`})}frame();
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
 function picked(e){const r=host.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObject(garage,true)[0]?.object}
 function projectForObject(o){if(!o)return null;const match=o.name.match(/^project_(\d+)/);if(match)return projects.find(p=>p.index===Number(match[1]));if(o.name.startsWith('featured_gyrace'))return projects.find(p=>p.id==='gy-race');if(o.name.startsWith('featured_mathbutter'))return projects.find(p=>p.id==='mathbutter');if(o.name.startsWith('Arcade'))return projects.find(p=>p.id==='minigolfvr');return null}
 renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
 renderer.domElement.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<6){const p=projectForObject(picked(e));if(p)openProject(p.id)}down=null});
 renderer.domElement.addEventListener('pointermove',e=>{if(e.buttons)return;const p=projectForObject(picked(e));const tip=$('#scene-tooltip');tip.style.display=p?'block':'none';renderer.domElement.style.cursor=p?'pointer':'grab';if(p){tip.textContent=p.name;const r=host.getBoundingClientRect();tip.style.left=`${Math.min(e.clientX-r.left+12,r.width-200)}px`;tip.style.top=`${e.clientY-r.top+15}px`}});
 renderer.domElement.addEventListener('pointerleave',()=>$('#scene-tooltip').style.display='none');
 $('#scene-reset').onclick=()=>{controls.reset();toast('Retour à la vue de l’atelier')};
 let night=false;$('#scene-theme').onclick=()=>{night=!night;document.body.classList.toggle('evening',night);key.color.set(night?0xd6c1ff:0xfff0de);key.intensity=night?1.6:3.1;renderer.toneMappingExposure=night?.75:1.1;$('#scene-theme').textContent=night?'☀':'☾';$('#scene-theme').setAttribute('aria-label',night?'Passer en ambiance de jour':'Passer en ambiance du soir')};
 $('#scene-labels').onclick=()=>{const hidden=$('#hotspots').classList.toggle('hidden');$('#scene-labels').setAttribute('aria-pressed',String(!hidden))};
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.remove('loaded');toast('Affichage fixe activé. Les projets restent accessibles.')});
}
initGarage();

function prepareMedia(){mediaGeneration++;cleanMedia();cleanMedia=()=>{};$('#detail-stage').replaceChildren();$('#viewer-controls').replaceChildren();return mediaGeneration}
function setCaption(text){$('#media-caption').textContent=text}
function control(label,fn,active=false){const b=el('button',active?'active':'',label);b.onclick=()=>fn(b);$('#viewer-controls').append(b);return b}
function setActiveTab(mode){$$('.viewer-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode))}
async function showModel(p,model=p.models[0]){
 const gen=prepareMedia();setActiveTab('model');const host=$('#detail-stage');setCaption('Géométrie issue de l’archive · matériaux pastel de présentation · glissez pour tourner, pincez pour zoomer.');
 let renderer;try{renderer=createRenderer(host)}catch(e){const img=el('img');img.src=`assets/thumbs/${model}.png`;img.alt=modelNames[model];host.append(img);setCaption('Aperçu du modèle · WebGL indisponible sur cet appareil.');return}
 const scene=new THREE.Scene();studio(scene);const camera=new THREE.PerspectiveCamera(36,1,.01,100);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.autoRotate=!reduced;controls.autoRotateSpeed=.8;controls.minDistance=1.5;controls.maxDistance=12;
 let raf=0,root,dead=false;const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};const observer=new ResizeObserver(resize);observer.observe(host);resize();
 cleanMedia=()=>{dead=true;cancelAnimationFrame(raf);observer.disconnect();controls.dispose();disposeScene(scene);renderer.dispose();renderer.forceContextLoss()};
 const loading=el('div','scene-loading','Chargement du modèle…');host.append(loading);
 try{root=(await loader.loadAsync(`assets/models/${model}.glb`)).scene;if(dead||gen!==mediaGeneration){disposeScene(root);return}shadows(root);scene.add(root);loading.remove();const bounds=new THREE.Box3().setFromObject(root),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());controls.target.copy(center);const distance=Math.max(...size.toArray())*2.0;camera.position.copy(center).add(new THREE.Vector3(distance*.85,distance*.65,distance));controls.update();controls.saveState();
 }catch(e){if(!dead){loading.textContent='Ce modèle n’a pas pu être chargé.';console.error(e)}return}
 let wire=false;control('◈ Maillage',b=>{wire=!wire;root.traverse(o=>{if(o.isMesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.wireframe=wire)});b.classList.toggle('active',wire)});
 control('⟳ Rotation',b=>{controls.autoRotate=!controls.autoRotate;b.classList.toggle('active',controls.autoRotate)},controls.autoRotate);
 control('⤾ Recentrer',()=>controls.reset());
 if(p.models.length>1)p.models.forEach(m=>control(modelNames[m],()=>showModel(p,m),model===m));
 const animate=()=>{raf=requestAnimationFrame(animate);if(document.hidden)return;controls.update();renderer.render(scene,camera)};animate();
}
function showNotes(p){prepareMedia();setActiveTab('notes');const w=el('div','viewer-placeholder');w.append(el('div','large-glyph',p.category==='ai'?'[ ↗ ]':p.category==='game'?'▷':'{ / }'),el('h3','',p.status),el('p','',p.models.length?'Les modèles présentés proviennent des ressources du projet. Le portfolio utilise une palette de présentation commune.':'Une exploration à travers ses sources, ses outils et ses intentions.'));
 const ul=el('ul','source-list');p.files.forEach(f=>ul.append(el('li','',`↳ ${f}`)));w.append(ul);$('#detail-stage').append(w);setCaption(p.category==='game'&&!p.demo?'Aucun enregistrement de gameplay original disponible dans cette archive.':'Présentation documentée à partir des fichiers du projet.');
}
function showDemo(p){const gen=prepareMedia();setActiveTab('demo');const host=$('#detail-stage');setCaption(p.demo==='house'?'Illustration interactive du principe de génération · créée pour ce portfolio.':'Mini-démo web adaptée pour le portfolio · ce n’est pas une capture du jeu original.');try{cleanMedia=({race:startRace,golf:startGolf,house:startHouse}[p.demo])(host,$('#viewer-controls'),{reduced,onMessage:toast})}catch(e){console.error(e);showNotes(p);setCaption('La mini-démo est indisponible sur cet appareil. Consultez le modèle ou les détails.')}}
function openProject(id){const p=projects.find(p=>p.id===id);if(!p)return;activeProject=p;$('#detail-title').textContent=p.name;$('#detail-category').textContent=`${String(p.index+1).padStart(2,'0')} / ${categoryNames[p.category]}`;$('#detail-summary').textContent=p.summary;$('#detail-tech').replaceChildren(...p.tech.map(t=>el('span','',t)));$('#detail-note').textContent=p.note;$('#detail-source').textContent=p.archive;const tabs=$('#viewer-tabs');tabs.replaceChildren();
 const tab=(mode,label,fn)=>{const b=el('button','',label);b.dataset.mode=mode;b.onclick=fn;tabs.append(b)};
 if(p.models.length)tab('model','◈ Modèles 3D',()=>showModel(p));if(p.demo)tab('demo',p.demo==='house'?'↻ Générer une maison':'▷ Jouer à la mini-démo',()=>showDemo(p));tab('notes','Détails du projet',()=>showNotes(p));
 if(!$('#project-dialog').open){$('#project-dialog').showModal();document.body.classList.add('modal-open')}
 if(p.models.length)showModel(p);else showNotes(p);$('#project-dialog').scrollTop=0;
}
function closeProject(){$('#project-dialog').close()}
$('#close-modal').onclick=closeProject;$('#project-dialog').addEventListener('close',()=>{prepareMedia();document.body.classList.remove('modal-open')});
$('#project-dialog').addEventListener('click',e=>{if(e.target===$('#project-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeProject()}});
$('#prev-project').onclick=()=>openProject(projects[(projects.indexOf(activeProject)-1+projects.length)%projects.length].id);$('#next-project').onclick=()=>openProject(projects[(projects.indexOf(activeProject)+1)%projects.length].id);

