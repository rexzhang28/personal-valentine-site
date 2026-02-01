// Updates countdown to Feb 14 2026 00:00 EST (UTC-5) and days together since 2024-11-01
(function(){
  const cdEl = document.getElementById('countdown');
  const togetherEl = document.getElementById('together');

  // Valentine's Day target: Feb 14 2026 00:00 EST -> UTC: 2026-02-14 05:00:00
  const targetUTC = Date.UTC(2026, 1, 14, 5, 0, 0);
  const startTogether = new Date(2024, 10, 1, 0, 0, 0); // Nov 1 2024 local

  function pad(n){ return n.toString().padStart(2,'0'); }

  function update(){
    const now = Date.now();
    // countdown
    let diff = targetUTC - now;
    if (diff < 0) diff = 0;
    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
    const mins = Math.floor((diff % (1000*60*60)) / (1000*60));
    const secs = Math.floor((diff % (1000*60)) / 1000);
    // show as Dd HH:MM:SS when more than 24h, else HH:MM:SS
    if (days > 0) {
      cdEl.textContent = `${days}d ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    } else {
      cdEl.textContent = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }

    // days together (countup)
    const diff2 = Date.now() - startTogether.getTime();
    const dTogether = Math.floor(diff2 / (1000*60*60*24));
    togetherEl.textContent = dTogether;
  }

  update();
  setInterval(update, 1000);
})();
