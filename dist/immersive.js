import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {startNeighborhood} from './garage-scene.js';
import {setupJourney} from './journey.js';
import {startRace,startGolf,startHouse} from './demos.js';
import {mountGraphicGallery} from './graphic-gallery.js';
import {mountProjectVideo} from './project-video.js';
import {setupComputer} from './pc-desktop.js?v=responsive-1';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader=new GLTFLoader();
const projects=await fetch('projects.json').then(r=>{if(!r.ok)throw Error('Catalogue indisponible');return r.json()}).catch(()=>[]);
const categoryNames={game:'Jeux & expériences','3d':'Création 3D',design:'2D & graphisme',simulation:'Code & simulations',ai:'Code & intelligence artificielle'};
const modelNames={'gyrace-monowheel':'Monoroue','gyrace-circuit':'Circuit','minigolf-terrain':'Terrain','minigolf-putter':'Putter','mathbutter-suzanne':'Suzanne','mathbutter-donut':'Donut','bones-human':'Personnage','bones-dragonfly':'Libellule','bones-bunny':'Lapin','bones-teddy':'Teddy','procedural-prefab':'Élément de construction','genetic-human':'Individu'};
Object.assign(modelNames,{'gyrace-spa':'Spa-Francorchamps','gyrace-le-mans':'Le Mans','gyrace-monaco':'Monaco','gyrace-ricardo-tormo':'Ricardo Tormo'});
const modelLabel=(p,m)=>p.modelLabels?.[m]||modelNames[m]||m;
const searchKey=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').replace(/[^a-z0-9]/g,'');
let activeProject=null,cleanMedia=()=>{},mediaGeneration=0,filter='playable',catalogPage=0;
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
function renderProjects(){
 const playable=p=>p.category==='game'&&(!!p.video||p.videoPending||p.externalVideo),q=searchKey($('#search').value);
 const all=projects.filter(p=>(filter==='all'||filter==='playable'&&playable(p)||p.category===filter||filter==='code'&&['ai','simulation'].includes(p.category))&&searchKey(p.name+' '+p.summary+' '+(p.context||'')+' '+p.tech.join(' ')).includes(q));
 const perPage=3,pages=Math.max(1,Math.ceil(all.length/perPage));catalogPage=Math.min(catalogPage,pages-1);const grid=$('#project-grid');grid.replaceChildren();grid.classList.toggle('playable-grid',filter==='playable');grid.classList.toggle('design-grid',filter==='design');grid.classList.toggle('model-grid',filter==='3d');
 all.slice(catalogPage*perPage,catalogPage*perPage+perPage).forEach(p=>{
  const card=el('button','project-card');card.dataset.project=p.id;card.setAttribute('aria-label',(p.videoPending?'Découvrir ':playable(p)?'Voir la vidéo de ':p.demo?'Essayer ':'Découvrir ')+p.name);const art=el('div','card-art');
  if(p.video||p.gallery?.length||p.demo||p.models.length){const img=el('img');img.src=p.video?.poster||p.gallery?.[0].src||(p.demo?'assets/previews/'+p.demo+'.jpg':'assets/thumbs/'+(p.defaultModel||p.models[0])+'.png');img.alt=p.video?.posterAlt||p.gallery?.[0].alt||(p.demo?'Aperçu de la démo '+p.name:'');img.loading='lazy';if(p.demo)art.classList.add('game-preview');if(p.video)art.classList.add('video-preview');if(p.gallery?.length)art.classList.add('graphic-preview');art.append(img)}else art.append(el('span','card-glyph',p.category==='ai'?'[ ↗ ]':p.category==='game'?'▷':'{ / }'));
  art.append(el('span','card-badge',p.videoPending?'VIDÉO À VENIR':p.video?(p.category==='game'?'PRÉSENTATION VIDÉO':'ANIMATION 3D'):p.gallery?.length?(p.category==='game'?'JEU · MODÈLES & INTERFACE':p.category==='simulation'?'SIMULATION':p.category==='3d'?'CRÉATION 3D':p.category==='ai'?'PRINCIPE DU PROJET':p.status==='Projet personnel'?'CRÉATION PERSONNELLE':'CRÉATION PROFESSIONNELLE'):playable(p)?'DÉMO JOUABLE':p.demo?'INTERACTIF':p.models.length?'MODÈLE 3D':'PROJET DOCUMENTÉ'));
  const copy=el('div','card-copy');copy.append(el('h3','',p.name),el('p','',p.context||(playable(p)?(p.demo==='race'?'Un circuit, une monoroue, à vous de jouer.':'Visez, dosez, et atteignez le drapeau.') :p.tech.slice(0,2).join(' / '))),el('span','card-action',p.videoPending?'Découvrir le projet ↗':p.video?'Voir la vidéo ▶':p.gallery?.length?'Voir les visuels ↗':playable(p)?'▶ Jouer maintenant':p.demo?'↻ Essayer':p.models.length?'Explorer en 3D ↗':'Découvrir ↗'));card.append(art,copy);grid.append(card);
 });
 $('.catalog-intro').textContent=filter==='playable'?'Les vidéos arrivent bientôt. Explorez les modèles et les visuels des jeux.':filter==='design'?'Identité visuelle, création personnelle et communication professionnelle.':`Jeux, 3D, graphisme et développement : explorez les ${projects.length} projets.`;
 $('#catalog-title span').textContent=' / '+projects.length;
 $('#empty').hidden=!!all.length;$('#result-count').textContent=all.length+' '+(filter==='playable'?'projets de jeux':'projets');$('#page-number').textContent=(catalogPage+1)+' / '+pages;$('#prev-page').disabled=catalogPage===0;$('#next-page').disabled=catalogPage===pages-1;
}
function openCatalog(){computer.open()}
$('#open-projects').onclick=openCatalog;$('#laptop-hotspot').onclick=openCatalog;
function turnCatalogPage(step){
 catalogPage+=step;renderProjects();
 const grid=$('#project-grid'),content=$('.pc-explorer-content');
 grid.scrollTop=0;
 if(content&&content.scrollHeight>content.clientHeight){
  const first=grid.querySelector('.project-card');
  first?.focus({preventScroll:true});
  first?.scrollIntoView({block:'start',behavior:'instant'});
 }
}
$('#search').oninput=()=>{catalogPage=0;renderProjects()};$('#prev-page').onclick=()=>turnCatalogPage(-1);$('#next-page').onclick=()=>turnCatalogPage(1);
document.addEventListener('click',e=>{const p=e.target.closest('[data-project]');if(p)openProject(p.dataset.project);const f=e.target.closest('[data-filter]');if(f){filter=f.dataset.filter;catalogPage=0;$$('.filters button').forEach(b=>b.classList.toggle('active',b===f));renderProjects()}});
const toggleHelp=show=>{$('#help-panel').hidden=!show;$('#scene-help').setAttribute('aria-expanded',String(show))};$('#scene-help').onclick=()=>toggleHelp($('#help-panel').hidden);$('#close-help').onclick=()=>toggleHelp(false);
$('#scene-fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{toast('Le plein écran n’est pas disponible dans ce navigateur.')}};
function createRenderer(host,alpha=true){const r=new THREE.WebGLRenderer({antialias:true,alpha,powerPreference:'high-performance'});r.setPixelRatio(Math.min(devicePixelRatio,1.6));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.03;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;host.append(r.domElement);return r}
function studio(scene){scene.add(new THREE.HemisphereLight(0xfff3d9,0xb4c6ba,2.1));const light=new THREE.DirectionalLight(0xfff0db,3.0);light.position.set(-3,8,6);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.5,far:35});light.shadow.bias=-.0003;light.shadow.normalBias=.025;scene.add(light);scene.add(new THREE.AmbientLight(0xc5cfdf,.35));return light}
function shadows(root){root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}})}
function disposeScene(scene){scene.traverse(o=>{o.geometry?.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!m)return;for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose()})})}

const openJourney=setupJourney();
const computer=setupComputer({projectCount:projects.length,openJourney,openFolder:category=>{filter=category;catalogPage=0;$('#search').value='';$$('.filters button').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));renderProjects()}});
startNeighborhood({loader,openCatalog,openJourney,toast,toggleHelp,reduced});

// Project media controllers retained from the first version; the garage is the sole page.
function prepareMedia(){$('#project-dialog').classList.remove('model-view');mediaGeneration++;cleanMedia();cleanMedia=()=>{};$('#detail-stage').replaceChildren();$('#viewer-controls').replaceChildren();return mediaGeneration}
function setCaption(text){$('#media-caption').textContent=text}
function control(label,fn,active=false){const b=el('button',active?'active':'',label);b.onclick=()=>fn(b);$('#viewer-controls').append(b);return b}
function setActiveTab(mode){$$('.viewer-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode))}
async function showModel(p,model=p.defaultModel||p.models[0]){
 const gen=prepareMedia();setActiveTab('model');$('#project-dialog').classList.add('model-view');const host=$('#detail-stage');const circuit=!!p.circuitModels?.includes(model);setCaption(p.modelDescriptions?.[model]||(circuit?`${modelLabel(p,model)} · tracé Blender original, matériau neutre · glissez pour tourner, pincez pour zoomer.`:'Géométrie issue de l’archive · matériaux de présentation · glissez pour tourner, pincez pour zoomer.'));
 if(p.models.length>1){const label=el('label','model-picker','Modèle '),select=el('select');select.setAttribute('aria-label','Choisir le modèle 3D');p.models.forEach(m=>{const option=el('option','',modelLabel(p,m));option.value=m;option.selected=m===model;select.append(option)});select.onchange=()=>showModel(p,select.value);label.append(select);$('#viewer-controls').append(label)}
 let renderer;try{renderer=createRenderer(host)}catch(e){const img=el('img');img.src=`assets/thumbs/${model}.png`;img.alt=modelLabel(p,model);host.append(img);setCaption('Aperçu du modèle · WebGL indisponible sur cet appareil.');return}
 const scene=new THREE.Scene();studio(scene);const camera=new THREE.PerspectiveCamera(36,1,.01,100);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.autoRotate=!reduced;controls.autoRotateSpeed=.8;controls.minDistance=1.5;controls.maxDistance=12;
 let raf=0,root,mixer,clips=[],animationPlaying=!reduced,dead=false,radius=1;const clock=new THREE.Clock();const fitDistance=()=>{const vertical=THREE.MathUtils.degToRad(camera.fov)/2,horizontal=Math.atan(Math.tan(vertical)*camera.aspect);return radius/Math.sin(Math.min(vertical,horizontal))*1.12};const resize=()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};const observer=new ResizeObserver(resize);observer.observe(host);resize();
 cleanMedia=()=>{dead=true;cancelAnimationFrame(raf);observer.disconnect();controls.dispose();if(mixer){mixer.stopAllAction();mixer.uncacheRoot(root)}disposeScene(scene);renderer.dispose();renderer.forceContextLoss();$('#project-dialog').classList.remove('gallery-expanded')};
 const loading=el('div','scene-loading','Chargement du modèle…');host.append(loading);
 try{const gltf=await loader.loadAsync(`assets/models/${model}.glb`);root=gltf.scene;clips=gltf.animations;if(dead||gen!==mediaGeneration){disposeScene(root);return}shadows(root);scene.add(root);loading.remove();const animationBounds=p.modelBounds?.[model];const bounds=animationBounds?new THREE.Box3(new THREE.Vector3(...animationBounds.min),new THREE.Vector3(...animationBounds.max)):new THREE.Box3().setFromObject(root),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());radius=Math.max(size.length()/2,.01);controls.target.copy(center);const distance=fitDistance();controls.minDistance=radius*.2;controls.maxDistance=distance*3;camera.near=radius*.001;camera.far=distance*12;camera.updateProjectionMatrix();camera.position.copy(center).add(new THREE.Vector3(.7,circuit?1.3:.7,1).normalize().multiplyScalar(distance));controls.update();controls.saveState();if(clips.length){mixer=new THREE.AnimationMixer(root);mixer.clipAction(clips[0]).play();mixer.update(0);controls.autoRotate=false}
 }catch(e){if(!dead){loading.textContent='Ce modèle n’a pas pu être chargé.';console.error(e)}return}
 let wire=false;control('◈ Maillage',b=>{wire=!wire;root.traverse(o=>{if(o.isMesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.wireframe=wire)});b.classList.toggle('active',wire)});
 const rotate=control('⟳ Rotation',b=>{controls.autoRotate=!controls.autoRotate;b.classList.toggle('active',controls.autoRotate)},controls.autoRotate);
 if(mixer){control(animationPlaying?'Ⅱ Animation':'▶ Animation',b=>{animationPlaying=!animationPlaying;b.textContent=animationPlaying?'Ⅱ Animation':'▶ Animation';b.classList.toggle('active',animationPlaying)},animationPlaying);control('↺ Début',()=>{mixer.setTime(0)});if(clips.length>1){const select=el('select');select.className='clip-picker';select.setAttribute('aria-label','Choisir l’animation');clips.forEach((clip,i)=>{const option=el('option','',clip.name||`Animation ${i+1}`);option.value=i;select.append(option)});select.onchange=()=>{mixer.stopAllAction();mixer.clipAction(clips[Number(select.value)]).reset().play();mixer.update(0)};$('#viewer-controls').append(select)}}
 if(circuit)control('↓ Dessus',()=>{controls.autoRotate=false;rotate.classList.remove('active');camera.position.copy(controls.target).add(new THREE.Vector3(0,fitDistance(),.0001));controls.update()});
 control('⤾ Recentrer',()=>controls.reset());
 control('Agrandir',b=>{const expanded=$('#project-dialog').classList.toggle('gallery-expanded');b.textContent=expanded?'Réduire':'Agrandir';b.setAttribute('aria-pressed',String(expanded))}).setAttribute('aria-pressed','false');
 const animate=()=>{raf=requestAnimationFrame(animate);const delta=Math.min(clock.getDelta(),.05);if(document.hidden)return;if(mixer&&animationPlaying)mixer.update(delta);controls.update();renderer.render(scene,camera)};animate();
}
function showNotes(p){prepareMedia();setActiveTab('notes');const w=el('div','viewer-placeholder');w.append(el('div','large-glyph',p.category==='design'?'◈':p.category==='ai'?'[ ↗ ]':p.category==='game'?'▷':'{ / }'),el('h3','',p.status),el('p','',p.note||'Une exploration à travers ses sources, ses outils et ses intentions.'));
 const ul=el('ul','source-list');p.files.forEach(f=>ul.append(el('li','',`↳ ${f}`)));w.append(ul);$('#detail-stage').append(w);setCaption(p.notesCaption||(p.category==='game'&&!p.demo?'Aucun enregistrement de gameplay original disponible dans cette archive.':'Présentation documentée à partir des fichiers du projet.'));
}
function showDemo(p){const gen=prepareMedia();setActiveTab('demo');const host=$('#detail-stage');setCaption(p.demo==='house'?'Illustration interactive du principe de génération · créée pour ce portfolio.':'Mini-démo web adaptée pour le portfolio · ce n’est pas une capture du jeu original.');try{cleanMedia=({race:startRace,golf:startGolf,house:startHouse}[p.demo])(host,$('#viewer-controls'),{reduced,onMessage:toast})}catch(e){console.error(e);showNotes(p);setCaption('La mini-démo est indisponible sur cet appareil. Consultez le modèle ou les détails.')}}
function showGallery(p){prepareMedia();setActiveTab('gallery');cleanMedia=mountGraphicGallery({host:$('#detail-stage'),controls:$('#viewer-controls'),dialog:$('#project-dialog'),items:p.gallery,onCaption:setCaption})}
function showExternalVideo(p){prepareMedia();setActiveTab('video');const panel=el('div','viewer-placeholder');const img=el('img','external-video-preview');img.src=p.gallery[0].src;img.alt=p.gallery[0].alt;const link=el('a','external-video-link','▶ Voir la vidéo sur LinkedIn');link.href=p.externalUrl;link.target='_blank';link.rel='noopener noreferrer';panel.append(img,link);$('#detail-stage').append(panel);setCaption('Démonstration originale publiée par Ruth · lecture sur LinkedIn.');}
function showPendingVideo(p){prepareMedia();setActiveTab('video');const panel=el('div','viewer-placeholder');panel.append(el('div','large-glyph','▷'),el('h3','','Vidéo non disponible pour le moment'),el('p','','La vidéo de ce projet sera ajoutée prochainement. Les modèles 3D et les visuels restent accessibles dans les onglets ci-dessus.'));$('#detail-stage').append(panel);setCaption('Vidéo à venir.');}
function showVideo(p){prepareMedia();setActiveTab('video');cleanMedia=mountProjectVideo({host:$('#detail-stage'),controls:$('#viewer-controls'),dialog:$('#project-dialog'),media:p.video,onCaption:setCaption})}
function openProject(id){const p=projects.find(p=>p.id===id);if(!p)return;activeProject=p;$('#project-dialog').classList.toggle('gallery-project',!!p.gallery?.length);$('#detail-title').textContent=p.name;$('#detail-category').textContent=`${String(p.index+1).padStart(2,'0')} / ${categoryNames[p.category]}`;$('#detail-context').textContent=p.context||'';$('#detail-context').hidden=!p.context;$('#detail-summary').textContent=p.summary;$('#detail-tech').replaceChildren(...p.tech.map(t=>el('span','',t)));$('#detail-note').textContent=p.note;$('#detail-source').textContent=p.archive;$('.detail-source>span').textContent=p.sourceLabel||(p.video?'VIDÉO FOURNIE':p.gallery?.length?'FICHIERS FOURNIS':'ARCHIVE DU PROJET');const tabs=$('#viewer-tabs');tabs.replaceChildren();
 const tab=(mode,label,fn)=>{const b=el('button','',label);b.dataset.mode=mode;b.onclick=fn;tabs.append(b)};
 if(p.externalVideo)tab('video','▷ Vidéo LinkedIn',()=>showExternalVideo(p));if(p.videoPending)tab('video','▷ Vidéo à venir',()=>showPendingVideo(p));if(p.video)tab('video',p.category==='game'?'▷ Présentation vidéo':'▷ Animation 3D',()=>showVideo(p));if(p.gallery?.length)tab('gallery',`◈ Visuels (${p.gallery.length})`,()=>showGallery(p));if(p.models.length)tab('model','◈ Modèles 3D',()=>showModel(p));if(p.demo)tab('demo',p.demo==='house'?'↻ Générer une maison':'▷ Jouer à la mini-démo',()=>showDemo(p));tab('notes','Détails du projet',()=>showNotes(p));
 if(!$('#project-dialog').open){$('#project-dialog').showModal();document.body.classList.add('modal-open')}
 if(p.externalVideo)showExternalVideo(p);else if(p.videoPending)showPendingVideo(p);else if(p.video)showVideo(p);else if(p.gallery?.length)showGallery(p);else if(p.demo)showDemo(p);else if(p.models.length)showModel(p);else showNotes(p);$('#project-dialog').scrollTop=0;
}
function closeProject(){$('#project-dialog').close()}
$('#close-modal').onclick=closeProject;$('#project-dialog').addEventListener('close',()=>{prepareMedia();document.body.classList.remove('modal-open')});
$('#project-dialog').addEventListener('click',e=>{if(e.target===$('#project-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeProject()}});
$('#prev-project').onclick=()=>openProject(projects[(projects.indexOf(activeProject)-1+projects.length)%projects.length].id);$('#next-project').onclick=()=>openProject(projects[(projects.indexOf(activeProject)+1)%projects.length].id);

