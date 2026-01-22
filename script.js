(() => {
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('a[data-nav]').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === path) a.classList.add('active');
  });

  // reveal on scroll
  const els = [...document.querySelectorAll('.reveal')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('show');
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));

  // loader overlay
  const loader = document.getElementById('yt-loader');
  const bus = loader ? loader.querySelector('.bus') : null;
  function showLoader(msg){
    if(!loader) return;
    const t = loader.querySelector('[data-loader-title]');
    const s = loader.querySelector('[data-loader-sub]');
    if (t) t.textContent = msg || 'جاري تحميل البيانات...';
    if (s) s.textContent = 'قد يستغرق التحميل ثوانٍ حسب سرعة الإنترنت.';
    loader.hidden = false;
    if (bus) bus.classList.add('animate');
  }
  function hideLoader(){
    if(!loader) return;
    loader.hidden = true;
    if (bus) bus.classList.remove('animate');
  }

  // show loader on internal navigation and key actions (opt-in)
  document.querySelectorAll('a[data-loader]').forEach(a => {
    a.addEventListener('click', (e) => {
      // allow new tab
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = a.getAttribute('href');
      if (!href) return;
      showLoader(a.getAttribute('data-loader') || 'جاري التحميل...');
      // for external destinations, let it navigate after a short delay (better UX)
      setTimeout(() => { window.location.href = href; }, 650);
      e.preventDefault();
    });
  });

  // expose helper
  
})();


// Simple Loader (no bus)
(function(){
  const overlay = document.createElement('div');
  overlay.className = 'yt-loader-overlay';
  overlay.innerHTML = `
    <div class="yt-loader" role="status" aria-live="polite">
      <div class="yt-spinner" aria-hidden="true"></div>
      <div>
        <div class="yt-loader-title">جاري التحميل…</div>
        <div class="yt-loader-sub">قد يستغرق الأمر ثوانٍ قليلة.</div>
      </div>
    </div>`;
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(overlay));

  window.YTLoader = {
    show: (msg) => {
      const title = overlay.querySelector('.yt-loader-title');
      if (title && msg) title.textContent = msg;
      overlay.classList.add('show');
    },
    hide: () => overlay.classList.remove('show')
  };
})();


// Nav autoplay: highlight each item every 3 seconds, scroll it into view, loop back to start.
(function(){
  const nav = document.querySelector('.nav');
  if(!nav) return;

  const items = Array.from(nav.querySelectorAll('a[data-nav]'));
  if(items.length <= 1) return;

  // Make nav draggable (mouse)
  let isDown=false, startX=0, startScroll=0, paused=false;

  const pauseFor = (ms=1200) => { paused=true; setTimeout(()=>paused=false, ms); };

  nav.style.cursor = 'grab';
  nav.addEventListener('mousedown', (e) => {
    isDown=true; paused=true;
    nav.style.cursor='grabbing';
    startX=e.pageX; startScroll=nav.scrollLeft;
  });
  window.addEventListener('mouseup', () => {
    if(!isDown) return;
    isDown=false;
    nav.style.cursor='grab';
    pauseFor(1200);
  });
  window.addEventListener('mousemove', (e) => {
    if(!isDown) return;
    e.preventDefault();
    const walk=(e.pageX-startX)*1.2;
    nav.scrollLeft = startScroll - walk;
  });

  nav.addEventListener('mouseenter', ()=>paused=true);
  nav.addEventListener('mouseleave', ()=>pauseFor(600));

  const centerItem = (el) => {
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const delta = (elRect.left - navRect.left) - (navRect.width/2 - elRect.width/2);
    nav.scrollTo({ left: nav.scrollLeft + delta, behavior: 'smooth' });
  };

  // Start index: current active if exists, else 0
  let idx = items.findIndex(a => a.classList.contains('active'));
  if(idx < 0) idx = 0;

  const setActive = (i) => {
    items.forEach(a => a.classList.remove('active'));
    const el = items[i];
    el.classList.add('active');
    centerItem(el);
  };

  // If page-highlight logic sets active by pathname, keep it but also allow autoplay to continue.
  setTimeout(()=>setActive(idx), 250);

  setInterval(() => {
    if(paused) return;
    idx = (idx + 1) % items.length; // loop back to first
    setActive(idx);
  }, 3000);
})();
