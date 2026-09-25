/* OYINKANSOLA — site interactions */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Header: shrink + dark-mode awareness ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav-links');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Gallery filter tabs ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const gItems = document.querySelectorAll('.g-item');
  
  // Check URL for filter parameter
  const urlParams = new URLSearchParams(window.location.search);
  const urlFilter = urlParams.get('filter');
  if (urlFilter) {
    filterBtns.forEach(b => b.classList.remove('active'));
    const targetBtn = document.querySelector(`.filter-btn[data-filter="${urlFilter}"]`);
    if (targetBtn) targetBtn.classList.add('active');
    gItems.forEach(item => {
      item.classList.toggle('hidden', urlFilter !== 'all' && !item.dataset.cat.includes(urlFilter));
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      gItems.forEach(item => {
        item.classList.toggle('hidden', f !== 'all' && !item.dataset.cat.includes(f));
      });
      // Update URL without reload
      if (f !== 'all') {
        window.history.replaceState({}, '', `${window.location.pathname}?filter=${f}`);
      } else {
        window.history.replaceState({}, '', window.location.pathname);
      }
    });
  });

  /* ---------- Lightbox (images & videos) ---------- */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <button class="lb-close" aria-label="Close">&times;</button>
    <button class="lb-nav prev" aria-label="Previous">&#10094;</button>
    <div class="lb-content"></div>
    <button class="lb-nav next" aria-label="Next">&#10095;</button>`;
  document.body.appendChild(lb);
  
  const lbContent = lb.querySelector('.lb-content');
  let lbIndex = 0;

  // Get all non-hidden gallery items that are not video-only placeholders
  const getVisibleItems = () => [...gItems].filter(i => !i.classList.contains('hidden'));
  
  const openLb = (index) => {
    const items = getVisibleItems();
    if (items.length === 0) return;
    lbIndex = (index + items.length) % items.length;
    const item = items[lbIndex];
    
    const isVideo = item.classList.contains('is-video') && item.dataset.video;
    
    if (isVideo) {
      lbContent.innerHTML = `
        <video controls autoplay playsinline style="max-width: min(88vw, 900px); max-height: 82vh; border-radius: 10px; box-shadow: var(--shadow);">
          <source src="${item.dataset.video}" type="video/mp4">
          Your browser does not support the video tag.
        </video>`;
    } else {
      const img = item.querySelector('img');
      lbContent.innerHTML = `<img src="${img.src}" alt="${img.alt}" style="max-width: min(88vw, 900px); max-height: 82vh; border-radius: 10px; box-shadow: var(--shadow);">`;
    }
    
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeLb = () => { lb.classList.remove('open'); document.body.style.overflow = ''; lbContent.innerHTML = ''; };

  const navigateLb = (delta) => {
    const items = getVisibleItems();
    if (items.length === 0) return;
    lbIndex = (lbIndex + delta + items.length) % items.length;
    openLb(lbIndex);
  };

  // Attach click handlers to gallery items
  gItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      if (item.classList.contains('hidden')) return;
      const items = getVisibleItems();
      const idx = items.indexOf(item);
      if (idx >= 0) openLb(idx);
    });
  });

  lb.querySelector('.lb-close').addEventListener('click', closeLb);
  lb.querySelector('.prev').addEventListener('click', e => { e.stopPropagation(); navigateLb(-1); });
  lb.querySelector('.next').addEventListener('click', e => { e.stopPropagation(); navigateLb(1); });
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') navigateLb(-1);
    if (e.key === 'ArrowRight') navigateLb(1);
  });

  /* ---------- Video boxes (play video on click) ---------- */
  document.querySelectorAll('.video-box').forEach(box => {
    const video = box.querySelector('video');
    const playBtn = box.querySelector('.play-btn');
    const note = box.querySelector('.video-note');
    
    if (video && playBtn) {
      // When video metadata loads, show video and hide poster
      video.addEventListener('loadedmetadata', () => {
        box.classList.add('video-loaded');
      });
      
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.paused) {
          video.play();
          box.classList.add('playing');
        } else {
          video.pause();
          box.classList.remove('playing');
        }
      });
      
      video.addEventListener('play', () => box.classList.add('playing'));
      video.addEventListener('pause', () => box.classList.remove('playing'));
      video.addEventListener('ended', () => box.classList.remove('playing'));
      
      // Click on video to pause/play
      video.addEventListener('click', () => {
        if (video.paused) video.play();
        else video.pause();
      });
    } else if (note) {
      // Fallback for placeholder video boxes
      box.addEventListener('click', () => {
        const original = note.textContent;
        note.textContent = 'Video drops here soon — check back shortly.';
        setTimeout(() => { note.textContent = original; }, 2600);
      });
    }
  });

  /* ---------- Footer year ---------- */
  const yr = document.querySelector('.year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- WhatsApp Form Submission ---------- */
  window.sendToWhatsApp = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const type = form.querySelector('#type').value;
    const message = form.querySelector('#message').value.trim();
    
    if (!name || !email || !message) {
      alert('Please fill in all required fields.');
      return;
    }
    
    const whatsappNumber = '2349013528664';
    const text = `*New Booking Inquiry*\n\n*Name:* ${name}\n*Email:* ${email}\n*Event Type:* ${type}\n*Details:* ${message}`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Optional: show thank you message
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Opening WhatsApp...';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2000);
  };
});