// Fit original artwork; screenshot crops use a clipped viewport without changing pixels.
let gallerySequence=0;
export function mountGraphicGallery({host,controls,dialog,items,onCaption}){
 let index=0,expanded=false;
 const frame=document.createElement('figure');frame.className='graphic-frame';
 let image=null;
 host.append(frame);
 function button(text,label,action){const b=document.createElement('button');b.textContent=text;b.setAttribute('aria-label',label);b.onclick=action;controls.append(b);return b}
 const previous=button('←','Visuel précédent',()=>move(-1));
 const counter=document.createElement('span');counter.className='graphic-counter';counter.setAttribute('aria-live','polite');controls.append(counter);
 const next=button('→','Visuel suivant',()=>move(1));
 const enlarge=button('Voir en grand','Agrandir le visuel',()=>{expanded=!expanded;dialog.classList.toggle('gallery-expanded',expanded);enlarge.textContent=expanded?'Réduire le visuel':'Voir en grand';enlarge.setAttribute('aria-label',expanded?'Réduire le visuel':'Agrandir le visuel');enlarge.setAttribute('aria-pressed',String(expanded))});
 enlarge.setAttribute('aria-pressed','false');
 function update(){
  const item=items[index];
  // A fresh media node prevents the previous decoded image or SVG remaining visible.
  if(image){image.onload=null;image.onerror=null}
  frame.replaceChildren();
  image=document.createElement('img');image.className='graphic-image';image.alt=item.alt;
  image.onload=()=>{};
  image.onerror=()=>{frame.replaceChildren();const error=document.createElement('p');error.className='graphic-error';error.textContent='Ce visuel n’a pas pu être chargé.';frame.append(error)};
  image.src=item.src;
  if(item.crop){
   const c=item.crop,ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),art=document.createElementNS(ns,'image');
   svg.setAttribute('class','graphic-image');svg.setAttribute('viewBox',`${c.x} ${c.y} ${c.width} ${c.height}`);svg.setAttribute('role','img');svg.setAttribute('aria-label',item.alt);svg.style.overflow='hidden';
   art.setAttribute('width',c.sourceWidth);art.setAttribute('height',c.sourceHeight);art.setAttribute('href',item.src);svg.append(art);frame.append(svg);
  }else frame.append(image);
  counter.textContent=`${index+1} / ${items.length} · ${item.label}`;
  previous.disabled=index===0;next.disabled=index===items.length-1;previous.hidden=next.hidden=items.length===1;onCaption(item.caption||item.label);
 }
 function move(step){const target=Math.max(0,Math.min(items.length-1,index+step));if(target!==index){index=target;update()}}
 function keyboard(event){if(!dialog.open||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1)}}
 dialog.addEventListener('keydown',keyboard);update();
 return()=>{dialog.removeEventListener('keydown',keyboard);dialog.classList.remove('gallery-expanded');image.onload=image.onerror=null};
}
