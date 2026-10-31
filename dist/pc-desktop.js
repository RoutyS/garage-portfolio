// The laptop opens a small, keyboard-accessible desktop around the project explorer.
const symbols = {
  folder: '<path d="M5 11a3 3 0 0 1 3-3h11l5 5h16a3 3 0 0 1 3 3v21a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z"/><path d="M5 19h38v18a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z"/>',
  game: '<path d="M14 16h20c5 0 9 18 7 21-3 4-9-5-12-5H19c-3 0-9 9-12 5-2-3 2-21 7-21Z"/><path d="M14 21v10m-5-5h10m12-3h.1m6 5h.1"/>',
  cube: '<path d="m24 5 17 10v19L24 44 7 34V15Z"/><path d="m7 15 17 10 17-10M24 25v19M16 10l17 10"/>',
  art: '<path d="M10 7h28v34H10Z"/><path d="m14 33 8-10 6 7 4-4 6 7M19 15h.1"/>',
  code: '<rect x="5" y="9" width="38" height="30" rx="4"/><path d="m18 20-5 5 5 5m12-10 5 5-5 5m-4-13-4 21"/>',
  person: '<rect x="8" y="5" width="32" height="38" rx="4"/><circle cx="24" cy="17" r="5"/><path d="M15 31c0-8 18-8 18 0M17 37h14"/>',
  start: '<path d="M8 8h13v13H8Zm19 0h13v13H27ZM8 27h13v13H8Zm19 0h13v13H27Z"/>',
  power: '<path d="M24 5v18m-9-12a16 16 0 1 0 18 0"/>',
};
const icon = (name) => `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${symbols[name]}</svg>`;
const folders = [
  ['all', 'Mes projets', 'folder'],
  ['game', 'Jeux & expériences', 'game'],
  ['3d', 'Créations 3D', 'cube'],
  ['design', '2D & graphisme', 'art'],
  ['code', 'Code & IA', 'code'],
];

export function setupComputer({openFolder, openJourney, projectCount}) {
  const dialog = document.getElementById('catalog-dialog');
  const originalContent = [...dialog.children];
  const closeFolderButton = document.getElementById('close-catalog');
  closeFolderButton.remove();
  closeFolderButton.className = 'pc-window-close';
  closeFolderButton.setAttribute('aria-label', 'Fermer la fenêtre des projets');
  closeFolderButton.title = 'Fermer la fenêtre';
  dialog.setAttribute('aria-labelledby', 'computer-title');
  dialog.classList.add('pc-desktop');
  dialog.innerHTML = `
    <div class="pc-camera" aria-hidden="true"><i></i></div>
    <div class="pc-screen">
      <div class="pc-menubar"><span id="computer-title"><b>ruth<span>OS</span></b><span class="pc-menubar-label">Mon espace créatif</span></span><button class="pc-exit" data-pc-exit>↗ <span>Retour au garage</span></button></div>
      <div class="pc-workspace">
        <div class="pc-wallpaper" aria-hidden="true"><div class="pc-orbit"></div><div class="pc-wordmark">ruth<span>.</span><small>LE GARAGE CRÉATIF</small></div><span class="pc-wallpaper-caption">Un bureau ouvert sur mes idées.</span></div>
        <nav class="pc-shortcuts" aria-label="Dossiers du bureau">
          ${folders.map(([key, label, symbol]) => `<button class="pc-shortcut pc-icon-${symbol}" data-pc-folder="${key}"><span class="pc-icon">${icon(symbol)}</span><span>${label}</span></button>`).join('')}
          <button class="pc-shortcut pc-icon-person" data-pc-journey><span class="pc-icon">${icon('person')}</span><span>Mon parcours</span></button>
        </nav>
        <div class="pc-welcome-note"><span class="pc-note-pin" aria-hidden="true"></span><span class="pc-note-label">À EXPLORER</span><p>Bienvenue<br>sur mon bureau.</p><span>${projectCount} projets, des idées<br>et un peu de moi.</span><small>Un clic sur un dossier suffit.</small></div>
        <section class="pc-explorer" aria-labelledby="catalog-title" hidden>
          <div class="pc-titlebar"><span class="pc-window-name">${icon('folder')}<span id="pc-window-label" tabindex="-1">Mes projets</span></span><div class="pc-window-controls"><button id="pc-minimize" aria-label="Réduire la fenêtre des projets" title="Réduire">−</button><button id="pc-maximize" aria-label="Agrandir la fenêtre des projets" aria-pressed="false" title="Agrandir">□</button></div></div>
          <div class="pc-address"><button id="pc-home" aria-label="Revenir au bureau" title="Bureau">⌂</button><span>Bureau</span><span aria-hidden="true">›</span><strong id="pc-folder-label">Mes projets</strong></div>
          <div class="pc-explorer-content"></div>
        </section>
        <div class="pc-start-menu" id="pc-start-menu" hidden><div class="pc-menu-profile"><span>r.</span><div><strong>Ruth Suliman</strong><small>Création 3D · Jeux · Design</small></div></div><p>MES RACCOURCIS</p>${folders.map(([key, label, symbol]) => `<button data-pc-folder="${key}">${icon(symbol)}<span>${label}</span><span aria-hidden="true">↗</span></button>`).join('')}<button data-pc-journey>${icon('person')}<span>Mon parcours</span><span aria-hidden="true">↗</span></button><button class="pc-menu-exit" data-pc-exit>${icon('power')}<span>Retour au garage</span></button></div>
      </div>
      <div class="pc-taskbar"><button id="pc-start" class="pc-start" aria-label="Ouvrir les raccourcis du PC" aria-expanded="false" aria-controls="pc-start-menu">${icon('start')}<span>Bureau</span></button><span class="pc-taskbar-divider" aria-hidden="true"></span><button id="pc-task-projects" class="pc-task" aria-label="Ouvrir la fenêtre des projets" aria-pressed="false">${icon('folder')}<span>Mes projets</span></button><button class="pc-task pc-task-journey" data-pc-journey aria-label="Ouvrir mon parcours">${icon('person')}</button><div class="pc-tray"><span class="pc-session"><i aria-hidden="true"></i>Ruth</span><time id="pc-clock"></time></div></div>
    </div>
    <div class="pc-monitor-chin" aria-hidden="true"><span>ruth.</span><i></i></div>`;

  const $ = selector => dialog.querySelector(selector);
  const explorer = $('.pc-explorer');
  const task = $('#pc-task-projects');
  const menu = $('#pc-start-menu');
  const start = $('#pc-start');
  const maximize = $('#pc-maximize');
  $('.pc-window-controls').append(closeFolderButton);
  $('.pc-explorer-content').append(...originalContent);
  let clockTimer, lastFolder = 'all', hasFolder = false, returnFocus;

  function clock() {
    const now = new Date();
    const element = $('#pc-clock');
    element.dateTime = now.toISOString();
    element.innerHTML = `<b>${now.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</b><span>${now.toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit', year:'numeric'})}</span>`;
  }
  function setMenu(open) {
    menu.hidden = !open;
    start.setAttribute('aria-expanded', String(open));
  }
  function hideFolder(close = false) {
    explorer.hidden = true;
    if (close) hasFolder = false;
    task.classList.toggle('is-running', hasFolder);
    task.setAttribute('aria-pressed', 'false');
    task.setAttribute('aria-label', hasFolder ? 'Restaurer la fenêtre des projets' : 'Ouvrir la fenêtre des projets');
    task.focus({preventScroll:true});
  }
  function setFolderLabel(key) {
    lastFolder = key;
    const label = folders.find(folder => folder[0] === key)?.[1] || (key === 'playable' ? 'Vidéos' : 'Mes projets');
    $('#pc-window-label').textContent = label;
    $('#pc-folder-label').textContent = label;
  }
  function showFolder(key = lastFolder, reset = true) {
    setFolderLabel(key);
    explorer.hidden = false;
    if (reset || !hasFolder) {
      openFolder(key);
      $('.pc-explorer-content').scrollTop = 0;
    }
    hasFolder = true;
    task.classList.add('is-running');
    task.setAttribute('aria-pressed', 'true');
    task.setAttribute('aria-label', 'Réduire la fenêtre des projets');
    setMenu(false);
    // Keep the software keyboard closed until the visitor chooses to search.
    if (matchMedia('(pointer: fine)').matches) $('#search').focus({preventScroll:true});
    else $('#pc-window-label').focus({preventScroll:true});
  }
  function closeComputer() { dialog.close(); }

  dialog.addEventListener('click', event => {
    const filter = event.target.closest('[data-filter]');
    if (filter) setFolderLabel(filter.dataset.filter);
    const folder = event.target.closest('[data-pc-folder]');
    if (folder) showFolder(folder.dataset.pcFolder);
    else if (event.target.closest('[data-pc-journey]')) { setMenu(false); openJourney(); }
    else if (event.target.closest('[data-pc-exit]')) closeComputer();
    else if (!menu.contains(event.target) && !start.contains(event.target)) setMenu(false);
  });
  start.addEventListener('click', () => setMenu(menu.hidden));
  task.addEventListener('click', () => explorer.hidden ? showFolder(lastFolder, false) : hideFolder());
  $('#pc-minimize').addEventListener('click', () => hideFolder());
  $('#pc-home').addEventListener('click', () => hideFolder());
  closeFolderButton.addEventListener('click', () => hideFolder(true));
  maximize.addEventListener('click', () => {
    const expanded = explorer.classList.toggle('is-maximized');
    maximize.setAttribute('aria-pressed', String(expanded));
    maximize.setAttribute('aria-label', expanded ? 'Restaurer la taille de la fenêtre' : 'Agrandir la fenêtre des projets');
    maximize.title = expanded ? 'Restaurer' : 'Agrandir';
  });
  dialog.addEventListener('cancel', event => {
    if (!menu.hidden) { event.preventDefault(); setMenu(false); start.focus(); }
    else if (!explorer.hidden) { event.preventDefault(); hideFolder(); }
  });
  dialog.addEventListener('close', () => {
    clearInterval(clockTimer);
    setMenu(false);
    if (returnFocus?.isConnected && returnFocus.getClientRects().length) returnFocus.focus({preventScroll:true});
    else document.getElementById('stage')?.focus({preventScroll:true});
  });
  function open() {
    if (dialog.open) return;
    returnFocus = document.activeElement;
    explorer.hidden = true;
    hasFolder = false;
    task.classList.remove('is-running');
    task.setAttribute('aria-pressed', 'false');
    task.setAttribute('aria-label', 'Ouvrir la fenêtre des projets');
    dialog.showModal();
    clock();
    clearInterval(clockTimer);
    clockTimer = setInterval(clock, 30000);
    $('[data-pc-folder="all"]').focus({preventScroll:true});
  }
  // The first visit enters the PC as soon as the introduction finishes.
  const welcome = document.getElementById('welcome-screen');
  if (welcome?.open) {
    const enter = () => { if (!welcome.open) { welcome.removeEventListener('close', enter); open(); } };
    welcome.addEventListener('close', enter);
  } else queueMicrotask(open);
  return {open};
}
