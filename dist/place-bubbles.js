const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

// Keep the pair readable, but place it above the buildings rather than above
// an unrelated corner of the scene. Null targets are outside the visible scene.
export function placeBubblePair(targets, layout) {
  const visible = targets.filter(Boolean);
  if (!visible.length) return null;
  const center = visible.reduce((sum, p) => sum + p.x, 0) / visible.length;
  const topTarget = Math.min(...visible.map(p => p.y));
  const left = clamp(center - layout.navWidth / 2, 12, layout.width - layout.navWidth - 12);
  // A short landscape screen has room between the signature and the toolbar.
  // Use that empty area instead of covering the buildings with the clouds.
  if (layout.headerRects?.length && topTarget < layout.minTop + layout.navHeight + 28
      && 12 + layout.navHeight + 20 < topTarget) {
    const candidates = [left, ...layout.headerRects.flatMap(r => [r.right + 12, r.left - layout.navWidth - 12])]
      .filter(x => x >= 12 && x + layout.navWidth <= layout.width - 12)
      .sort((a, b) => Math.abs(a - left) - Math.abs(b - left));
    for (const x of candidates) {
      if (layout.headerRects.every(r => x + layout.navWidth <= r.left - 8 || x >= r.right + 8
          || 12 + layout.navHeight <= r.top - 8 || 12 >= r.bottom + 8)) return {left:x, top:12};
    }
  }
  return {
    left,
    top: clamp(topTarget - layout.navHeight - 60,
      layout.minTop, Math.max(layout.minTop, layout.maxBottom - layout.navHeight))
  };
}

// The final small circle lands on the projected landmark, never on a clamped
// screen edge or on a fixed decorative point below the cloud.
export function thoughtCircles(start, target, scale = 1) {
  if (!target || target.y < start.y + 12) return [];
  const distance = Math.hypot(target.x - start.x, target.y - start.y);
  const count = distance < 38 ? 2 : clamp(Math.ceil(distance / 24), 3, 5);
  const large = Math.min(9 * scale, distance / (count - 1) * .45);
  const small = Math.min(3 * scale, large * .4);
  return Array.from({length: count}, (_, i) => {
    const t = i / (count - 1);
    return {x: start.x + (target.x - start.x) * t,
      y: start.y + (target.y - start.y) * t, r: large + (small - large) * t};
  });
}

export function createPlaceBubbles(nav, host) {
  const buttons = [...nav.querySelectorAll('.cloud-bubble')];
  const trails = buttons.map(button => button.querySelector('.cloud-thought-trail'));
  const dots = trails.map(trail => [...trail.children]);
  const toolbar = document.querySelector('.top-controls');
  const identity = document.querySelector('.identity');
  const hud = document.querySelector('.bottom-hud');
  let layout = null;
  const observer = new ResizeObserver(() => { layout = null; });
  for (const element of [nav, host, toolbar, hud, identity]) observer.observe(element);

  return function update(targets = [], visible = false) {
    if (!visible || !targets.some(Boolean)) {
      trails.forEach(trail => trail.setAttribute('hidden', ''));
      nav.classList.remove('is-anchored');
      return;
    }
    if (!layout) {
      layout = {width: host.clientWidth, navWidth: nav.offsetWidth, navHeight: nav.offsetHeight,
        minTop: toolbar.offsetTop + toolbar.offsetHeight + 14, maxBottom: hud.offsetTop - 16,
        headerRects: [toolbar, identity].map(element => ({left:element.offsetLeft, top:element.offsetTop,
          right:element.offsetLeft + element.offsetWidth, bottom:element.offsetTop + element.offsetHeight})),
        cards: buttons.map(button => ({left: button.offsetLeft, top: button.offsetTop,
          width: button.offsetWidth, height: button.offsetHeight}))};
    }
    const position = placeBubblePair(targets, layout);
    nav.style.setProperty('--place-left', `${position.left.toFixed(2)}px`);
    nav.style.setProperty('--place-top', `${position.top.toFixed(2)}px`);
    nav.classList.add('is-anchored');
    targets.forEach((target, i) => {
      const card = layout.cards[i];
      // Do not draw through another cloud when a close view hides a landmark.
      const covered = target && layout.cards.some(c => target.x >= position.left + c.left - 8
        && target.x <= position.left + c.left + c.width + 8
        && target.y >= position.top + c.top - 8 && target.y <= position.top + c.top + c.height + 8);
      const end = target && {x: target.x - position.left - card.left,
        y: target.y - position.top - card.top};
      const start = {x: clamp(end?.x ?? card.width / 2, card.width * .22, card.width * .78),
        y: card.height * .94 + 8};
      const circles = covered ? [] : thoughtCircles(start, end, card.width < 180 ? .8 : 1);
      trails[i].toggleAttribute('hidden', !circles.length);
      dots[i].forEach((dot, j) => {
        dot.style.display = j < circles.length ? '' : 'none';
        if (j >= circles.length) return;
        const p = circles[j];
        dot.setAttribute('cx', p.x.toFixed(2));
        dot.setAttribute('cy', p.y.toFixed(2));
        dot.setAttribute('r', p.r.toFixed(2));
      });
    });
  };
}
