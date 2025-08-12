// script.js
document.addEventListener('DOMContentLoaded', ()=> {
  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    themeToggle.textContent = document.body.classList.contains('light') ? '🌞' : '🌙';
  });

  // Mobile menu
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  menuToggle.addEventListener('click', () => mainNav.classList.toggle('open'));

  // Projects data (populate manually from resume projects)
  const projects = [
    {
      title: "LaunchGood",
      desc: "Fundraising platform — Node.js, NestJS, Postgres, Redis, Stripe",
      url: "https://launchgood.com/",
    },
    {
      title: "SaveStrike",
      desc: "Wishlist & cashback app — Ruby on Rails, React",
      url: "https://play.google.com/store/apps/details?id=com.finstreet.savestrike.save_strike",
    },
    {
      title: "Concave POS",
      desc: "Cloud POS with multi-tenant architecture — React, Node, Azure",
      url: "https://concavepos.com/",
    }
  ];

  // Populate Swiper slides & projects grid
  const swWrapper = document.getElementById('projects-swiper');
  const grid = document.getElementById('projects-grid');
  projects.forEach(p => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `<div class="project-slide card"><h3>${p.title}</h3><p>${p.desc}</p><a href="${p.url}" target="_blank" class="btn ghost">Open</a></div>`;
    swWrapper.appendChild(slide);

    const card = document.createElement('article');
    card.className = 'project-card exp-card';
    card.innerHTML = `<h3>${p.title}</h3><p>${p.desc}</p><p><a target="_blank" href="${p.url}">Visit</a></p>`;
    grid.appendChild(card);
  });

  // Init Swiper
  const swiper = new Swiper('.swiper-container', {
    loop: false,
    slidesPerView: 1.1,
    spaceBetween: 16,
    centeredSlides: false,
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    breakpoints: { 768: { slidesPerView: 2.1 }, 1100: { slidesPerView: 3 } }
  });

  // Contact form (Formspree)
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Sending…';
    const data = new FormData(form);
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      });
      if (res.ok) {
        form.reset();
        status.textContent = 'Message sent — check your email.';
      } else {
        status.textContent = 'Failed to send. Please configure Formspree endpoint.';
      }
    } catch (err) {
      status.textContent = 'Network error — try again later.';
    }
  });

  // Medium feed fetcher
  async function fetchMediumPosts() {
    const mediumList = document.getElementById('medium-list');
    const rssUrl = 'https://medium.com/feed/@engrmaan';
    // First try rss2json (easy) — if you have an api key you can add &api_key=YOUR_KEY
    const rss2json = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    // CORS fallback using AllOrigins if direct fails
    const allOrigins = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;

    function render(items){
      mediumList.innerHTML = '';
      items.slice(0,6).forEach(item => {
        const card = document.createElement('article');
        card.className = 'blog-card';
        card.innerHTML = `<h4><a href="${item.link}" target="_blank">${item.title}</a></h4>
                          <p class="meta">${new Date(item.pubDate || item.pubDateString).toLocaleDateString()}</p>
                          <p>${(item.description || item.contentSnippet || '').slice(0,160)}…</p>`;
        mediumList.appendChild(card);
      });
    }

    try {
      // try rss2json
      let r = await fetch(rss2json);
      let j = await r.json();
      if (j.status === 'ok' && j.items) {
        render(j.items.map(it => ({title: it.title, link: it.link, pubDate: it.pubDate, description: it.description || it.content})));
        return;
      }
      throw new Error('rss2json failed');
    } catch (e) {
      // fallback: fetch raw rss and parse in browser (may need CORS proxy)
      try {
        const r2 = await fetch(allOrigins);
        const xml = await r2.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'application/xml');
        const items = Array.from(doc.querySelectorAll('item')).map(it => ({
          title: it.querySelector('title')?.textContent || '',
          link: it.querySelector('link')?.textContent || '',
          pubDate: it.querySelector('pubDate')?.textContent || '',
          description: it.querySelector('description')?.textContent || ''
        }));
        render(items);
        return;
      } catch (err) {
        mediumList.innerHTML = `<div class="loader">Unable to load Medium posts. See README for RSS/CORS instructions.</div>`;
      }
    }
  }

  fetchMediumPosts();

});

