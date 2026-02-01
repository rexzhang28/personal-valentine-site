const yesBtn = document.getElementById("yesBtn");
const noBtn  = document.getElementById("noBtn");
const msg    = document.getElementById("message");
const playArea = document.getElementById("playArea");

let yesScale = 1;
let lastMoveTime = 0;

// Small helper: keep values inside a range
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function moveNoButton(e) {
  const area = playArea.getBoundingClientRect();
  const btn  = noBtn.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();
  const cursor = e && (e.clientX || e.touches) ? {
    x: e.touches ? e.touches[0].clientX : e.clientX,
    y: e.touches ? e.touches[0].clientY : e.clientY
  } : null;

  const padding = 10;

  const maxX = area.width  - btn.width  - padding;
  const maxY = area.height - btn.height - padding;

  // If your play area is too small, just bail
  if (maxX <= padding || maxY <= padding) return;

  // pick a position that doesn't collide with the YES area and keeps distance from cursor
  let x, y;
  const minDist = Math.min(area.width, area.height) * 0.36; // increased minimum distance from cursor
  const yesRightRel = Math.max(0, yesRect.right - area.left);
  const yesLeftRel = Math.max(0, yesRect.left - area.left);

  // try more times to find a spot far from cursor/YES
  for (let i = 0; i < 48; i++) {
    x = clamp(Math.random() * maxX, padding, maxX);
    y = clamp(Math.random() * maxY, padding, maxY);

    // avoid overlapping yes: ensure x is not inside yes horizontal band
    const overlapX = x + btn.width > yesLeftRel && x < yesRightRel;
    if (overlapX) continue;

    // if we have cursor info, ensure distance from it
    if (cursor) {
      const relX = cursor.x - area.left;
      const relY = cursor.y - area.top;
      const dx = relX - (x + btn.width / 2);
      const dy = relY - (y + btn.height / 2);
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < minDist) continue;
    }

    // found a suitable spot
    break;
  }

  // Make movement smooth and faster when the cursor is near
  noBtn.style.right = "auto";
  // compute distance to cursor (if any) to pick duration: closer -> faster
  let dur = 340 + Math.floor(Math.random() * 120); // default 340-460ms
  if (cursor) {
    const relX = cursor.x - area.left;
    const relY = cursor.y - area.top;
    const cx = x + btn.width / 2;
    const cy = y + btn.height / 2;
    const dx = relX - cx;
    const dy = relY - cy;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const maxRange = Math.max(area.width, area.height);
    const ratio = clamp(dist / maxRange, 0, 1);
    // map ratio to duration (closer => shorter duration)
    const minDur = 120; // very quick
    const maxDur = 420;
    dur = Math.round(minDur + ratio * (maxDur - minDur));
  }
  const easing = 'cubic-bezier(.22,1,.36,1)';
  noBtn.style.transition = `left ${dur}ms ${easing}, top ${dur}ms ${easing}, transform 140ms ease`;
  // set target position (no instant teleport)
  noBtn.style.left = `${x}px`;
  noBtn.style.top  = `${y}px`;
  noBtn.style.transform = "none";

  lastMoveTime = Date.now();

  // Grow Yes a bit each attempt
  yesScale = Math.min(yesScale + 0.10, 1.9);
  yesBtn.style.transform = `translateY(-50%) scale(${yesScale})`;
}

// Place NO initially to the right-center so it doesn't overlap YES on load
function setInitialNoPosition(){
  if (!playArea || !noBtn) return;
  const area = playArea.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();
  const padding = 10;
  // place near 62% of the play area width (closer to center)
  const centerPct = 0.62;
  const x = clamp(Math.round(area.width * centerPct - btn.width / 2), padding, area.width - btn.width - padding);
  const y = (area.height - btn.height) / 2;
  noBtn.style.transition = "none";
  noBtn.style.right = "auto";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.transform = "none";
  // re-enable transition shortly after positioning
  setTimeout(() => {
    noBtn.style.transition = "left 260ms cubic-bezier(.22,1,.36,1), top 260ms cubic-bezier(.22,1,.36,1), transform 120ms ease";
  }, 50);
}

window.addEventListener('load', setInitialNoPosition);

// Desktop hover
noBtn.addEventListener("mouseenter", moveNoButton);
// If they click it anyway — prevent default and move before click can register
noBtn.addEventListener("click", (e) => { e.preventDefault(); moveNoButton(e); });

// Mobile touch
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNoButton(e);
}, { passive: false });

// Make NO react proactively when cursor gets close to it (more impossible to click)
playArea.addEventListener('mousemove', (e) => {
  const now = Date.now();
  if (now - lastMoveTime < 100) return; // throttle
  const area = playArea.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();
  const relX = e.clientX - area.left;
  const relY = e.clientY - area.top;
  const bx = btn.left - area.left + btn.width / 2;
  const by = btn.top - area.top + btn.height / 2;
  const dx = relX - bx;
  const dy = relY - by;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const trigger = Math.max(area.width, area.height) * 0.06; // trigger distance (even closer required)
  if (dist < trigger) moveNoButton(e);
});

yesBtn.addEventListener("click", () => {
  msg.hidden = false;
  msg.textContent = "Correct answer 😌💖";

  // Confetti
  if (typeof confetti === "function") {
    confetti({ particleCount: 160, spread: 85, origin: { y: 0.65 } });
    setTimeout(() => confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 } }), 250);

    // light shower for ~1s
    const end = Date.now() + 950;
    (function frame() {
      confetti({
        particleCount: 6,
        spread: 70,
        startVelocity: 22,
        scalar: 0.9
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  // Lock UI
  yesBtn.disabled = true;
  noBtn.disabled = true;
  noBtn.style.display = "none";

  // Redirect to poem page
  setTimeout(() => {
    window.location.href = "poem.html";
  }, 1200);
});