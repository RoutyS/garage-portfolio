// A self-contained intro: typewritten name, portrait reveal, then two opening panels.
(()=>{
 const welcome=document.getElementById('welcome-screen');
 if(!welcome)return;
 const enter=document.getElementById('welcome-enter');
 const surface=welcome.querySelector('.welcome-surface');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const timers=new Set();let leaving=false,opening=false,portraitAt=0;
 const later=(callback,delay)=>{const timer=setTimeout(()=>{timers.delete(timer);callback()},delay);timers.add(timer)};
 const clearTimers=()=>{timers.forEach(clearTimeout);timers.clear()};
 function reset(){
  clearTimers();leaving=false;opening=false;portraitAt=0;enter.disabled=false;
  welcome.querySelectorAll('.welcome-wing').forEach(wing=>wing.remove());
  welcome.classList.remove('is-running','is-portrait','is-opening');
 }
 function begin(){
  reset();
  if(reduced.matches){welcome.classList.add('is-portrait');return}
  // Reading a layout value restarts the typing when replaying the intro.
  void surface.offsetWidth;welcome.classList.add('is-running');
  later(showPortrait,3250);
  later(leave,7150);
 }
 function showPortrait(){portraitAt=performance.now();welcome.classList.add('is-portrait')}
 function split(){
  if(!welcome.open||opening)return;opening=true;
  for(const side of ['left','right']){
   const wing=document.createElement('div');wing.className=`welcome-wing welcome-wing-${side}`;
   wing.setAttribute('aria-hidden','true');wing.inert=true;
   const copy=surface.cloneNode(true);
   copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
   copy.querySelectorAll('[autofocus]').forEach(node=>node.removeAttribute('autofocus'));
   copy.querySelector('button').classList.add('welcome-enter-copy');
   wing.append(copy);welcome.append(wing);
  }
  welcome.focus({preventScroll:true});void welcome.offsetWidth;
  welcome.classList.add('is-opening');
  // A timeout also closes safely if a browser does not emit transitionend.
  later(()=>welcome.close(),1200);
 }
 function leave(){
  if(leaving||!welcome.open)return;leaving=true;clearTimers();enter.disabled=true;
  if(reduced.matches){welcome.close();return}
  if(!welcome.classList.contains('is-portrait'))showPortrait();
  // Finish the portrait reveal before splitting, including on an early click.
  later(split,Math.max(0,1350-(performance.now()-portraitAt)));
 }
 // Keep the native form available if this script or the 3D loader fails.
 if(welcome.open){welcome.close();welcome.showModal()}
 welcome.querySelector('form').addEventListener('submit',event=>{event.preventDefault();leave()});
 welcome.addEventListener('cancel',event=>{event.preventDefault();clearTimers();welcome.close()});
 welcome.addEventListener('close',()=>{
  if(welcome.open)return;
  reset();document.getElementById('stage')?.focus({preventScroll:true});
 });
 document.getElementById('welcome-reopen')?.addEventListener('click',()=>{
  if(!welcome.open){welcome.showModal();begin();enter.focus({preventScroll:true})}
 });
 reduced.addEventListener('change',()=>{
  if(!welcome.open)return;
  if(leaving){clearTimers();welcome.close()}else begin();
 });
 const portrait=document.getElementById('welcome-portrait');
 const initials=document.getElementById('welcome-initials');
 const revealPhoto=()=>{portrait.hidden=false;initials.hidden=true;welcome.classList.add('has-portrait')};
 portrait.addEventListener('load',revealPhoto);
 portrait.addEventListener('error',()=>{portrait.hidden=true;initials.hidden=false;welcome.classList.remove('has-portrait')});
 if(portrait.getAttribute('src')&&portrait.complete&&portrait.naturalWidth)revealPhoto();
 begin();
})();
