// Native playback: no autoplay, and release the media when its project closes.
export function mountProjectVideo({host,controls,dialog,media,onCaption}){
 const frame=document.createElement('div');frame.className='project-video-frame';
 const video=document.createElement('video');video.className='project-video';video.controls=true;video.playsInline=true;video.preload='metadata';video.poster=media.poster;video.src=media.src;video.setAttribute('aria-label',media.title);
 const error=document.createElement('p');error.className='video-error';error.hidden=true;error.append('La vidéo ne peut pas être lue ici. ');
 const link=document.createElement('a');link.href=media.src;link.target='_blank';link.rel='noopener';link.textContent='Ouvrir la vidéo';error.append(link);
 const onError=()=>{error.hidden=false};video.addEventListener('error',onError);
 frame.append(video,error);host.append(frame);onCaption(media.caption);
 let expanded=false;
 const enlarge=document.createElement('button');enlarge.textContent='Voir en grand';enlarge.setAttribute('aria-pressed','false');enlarge.setAttribute('aria-label','Agrandir la vidéo');
 enlarge.onclick=()=>{expanded=!expanded;dialog.classList.toggle('gallery-expanded',expanded);enlarge.textContent=expanded?'Réduire la vidéo':'Voir en grand';enlarge.setAttribute('aria-label',expanded?'Réduire la vidéo':'Agrandir la vidéo');enlarge.setAttribute('aria-pressed',String(expanded))};controls.append(enlarge);
 const pauseHidden=()=>{if(document.hidden)video.pause()};document.addEventListener('visibilitychange',pauseHidden);
 return()=>{video.pause();video.removeEventListener('error',onError);document.removeEventListener('visibilitychange',pauseHidden);video.removeAttribute('src');video.load();dialog.classList.remove('gallery-expanded');enlarge.onclick=null};
}
