/* ==========================================================
   Animações interativas — Jorge Sumbane
   Carregado antes de main.js. Tudo é desligado para quem
   prefere menos movimento, e os efeitos que dependem do rato
   só ligam em dispositivos com rato (não em ecrãs táteis).
   ========================================================== */
(function () {
    'use strict';

    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    /* ---------- Direção de entrada de cada bloco ---------- */
    const variants = {
        '.about-text': 'left',
        '.about-cards .info-card': 'right',
        '.skill-group': 'scale',
        '.timeline-item': 'left',
        '.certs': 'right',
        '.contact-wrap': 'scale'
    };
    Object.entries(variants).forEach(([sel, v]) => {
        $$(sel).forEach((el) => { el.dataset.reveal = v; });
    });

    /* ---------- Listas cujos itens entram um a um ---------- */
    $$('.soft-list, .skill-list, .cert-list, .project .chips, .learning .chips, .contact-list').forEach((list) => {
        list.setAttribute('data-stagger', '');
        Array.from(list.children).forEach((child, i) => child.style.setProperty('--i', i));
    });
    $$('.nav-link').forEach((link, i) => link.style.setProperty('--i', i));

    /* ---------- Mensagem para quem abre a consola ---------- */
    console.log(
        '%c Olá! 👋 %c Gostou do código? Fale comigo: jsumbane22@gmail.com',
        'background:#2563eb;color:#fff;font-size:13px;font-weight:700;padding:5px 8px;border-radius:6px',
        'color:#2563eb;font-size:12px;padding-left:6px'
    );

    const preloader = document.getElementById('preloader');
    if (reduceMotion) { preloader?.remove(); return; }

    /* ---------- Ecrã de abertura ---------- */
    if (preloader && root.classList.contains('first-visit')) {
        const countEl = document.getElementById('plCount');
        const start = performance.now();
        const duration = 1000;
        const step = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            countEl.textContent = Math.round(eased * 100);
            preloader.style.setProperty('--pl', eased.toFixed(3));
            if (p < 1) return requestAnimationFrame(step);
            preloader.classList.add('is-done');
            try { sessionStorage.setItem('intro-seen', '1'); } catch (e) { /* ignore */ }
            setTimeout(() => preloader.remove(), 1100);
        };
        requestAnimationFrame(step);
    } else {
        preloader?.remove();
    }

    /* ---------- Títulos revelados letra a letra ---------- */
    const splitTitle = (title, text) => {
        const words = text.trim().replace(/\s+/g, ' ').split(' ');
        let c = 0;
        title.setAttribute('aria-label', words.join(' '));
        title.textContent = '';
        words.forEach((w, wi) => {
            const word = document.createElement('span');
            word.className = 'word';
            word.setAttribute('aria-hidden', 'true');
            for (const ch of w) {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = ch;
                span.style.setProperty('--c', c++);
                word.appendChild(span);
            }
            title.appendChild(word);
            if (wi < words.length - 1) title.appendChild(document.createTextNode(' '));
        });
        title.classList.add('split');
    };
    const titles = $$('.section-title, .contact-title');
    titles.forEach((title) => splitTitle(title, title.textContent));
    // ao mudar de língua, o i18n.js traduz o aria-label; voltamos a dividir a partir dele
    document.addEventListener('langchange', () => {
        titles.forEach((title) => splitTitle(title, title.getAttribute('aria-label') || title.textContent));
    });

    /* ---------- Subtítulos que se "descodificam" ---------- */
    const glyphs = '!<>-_/[]{}=+*^?#01';
    const scramble = (el) => {
        const final = el.textContent;
        el.setAttribute('aria-label', final);
        const order = Array.from(final, (_, i) => i * 1.4 + Math.random() * 10);
        let frame = 0;
        const tick = () => {
            let out = '';
            let done = true;
            for (let i = 0; i < final.length; i++) {
                if (final[i] === ' ' || frame >= order[i]) {
                    out += final[i];
                } else {
                    out += glyphs[(Math.random() * glyphs.length) | 0];
                    done = false;
                }
            }
            el.textContent = out;
            frame++;
            if (!done) requestAnimationFrame(tick);
        };
        tick();
    };
    if ('IntersectionObserver' in window) {
        const eio = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                setTimeout(() => scramble(entry.target), 250);
                eio.unobserve(entry.target);
            });
        }, { threshold: 1 });
        $$('.eyebrow').forEach((el) => eio.observe(el));
    }

    /* ---------- Onda ao clicar em botões ---------- */
    document.addEventListener('pointerdown', (e) => {
        const el = e.target.closest('.btn, .filter');
        if (!el) return;
        const r = el.getBoundingClientRect();
        const size = Math.max(r.width, r.height) * 2.2;
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
        el.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    });

    /* ---------- Faixa de tecnologias (acelera com o scroll) ---------- */
    const marquee = document.querySelector('.marquee');
    const track = document.getElementById('marqueeTrack');
    if (marquee && track) {
        const group = track.querySelector('.marquee-group');
        const clone = group.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
        marquee.classList.add('is-running');

        let x = 0, vel = 0, last = performance.now(), lastY = window.scrollY;
        let visible = false, hovering = false;
        const baseSpeed = 45; // px por segundo
        // a largura só é medida quando muda (medir a cada fotograma pesa muito)
        let groupW = group.offsetWidth;
        const measure = () => { groupW = group.offsetWidth || groupW; };
        window.addEventListener('resize', measure);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

        const loop = (now) => {
            if (!visible) return;
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            const dy = window.scrollY - lastY;
            lastY = window.scrollY;
            vel += (clamp(dy * 14, -900, 900) - vel) * 0.08;
            x -= ((hovering ? baseSpeed * 0.2 : baseSpeed) + vel) * dt;
            const w = groupW;
            if (w > 0) {
                if (x <= -w) x += w;
                if (x > 0) x -= w;
            }
            track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
            requestAnimationFrame(loop);
        };
        marquee.addEventListener('pointerenter', () => { hovering = true; });
        marquee.addEventListener('pointerleave', () => { hovering = false; });
        new IntersectionObserver(([entry]) => {
            const was = visible;
            visible = entry.isIntersecting;
            if (visible && !was) { last = performance.now(); lastY = window.scrollY; requestAnimationFrame(loop); }
        }).observe(marquee);
    }

    /* ---------- Rede de partículas no topo ---------- */
    const heroBg = document.querySelector('.hero-bg');
    const heroEl = document.querySelector('.hero');
    // Decoração contínua: só em computadores com rato e recursos suficientes
    // (em telemóveis e aparelhos modestos fica desligada, para poupar bateria e fluidez).
    const capable = finePointer
        && (navigator.hardwareConcurrency || 4) >= 4
        && (!navigator.deviceMemory || navigator.deviceMemory >= 4)
        && !(navigator.connection && navigator.connection.saveData);
    if (heroBg && heroEl && capable) {
        const canvas = document.createElement('canvas');
        canvas.className = 'hero-canvas';
        heroBg.prepend(canvas);
        const ctx = canvas.getContext('2d');
        let w = 0, h = 0, pts = [], rgb = '37,99,235', running = false;
        const pointer = { x: -9999, y: -9999 };

        const readColor = () => { rgb = root.getAttribute('data-theme') === 'dark' ? '96,165,250' : '37,99,235'; };
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = heroBg.clientWidth;
            h = heroBg.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            // menos partículas em telemóveis (menos processador e bateria)
            const n = finePointer
                ? Math.round(clamp((w * h) / 15000, 24, 85))
                : Math.round(clamp((w * h) / 26000, 14, 32));
            pts = Array.from({ length: n }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 1.6 + 0.7
            }));
        };

        const LINK = 115, MOUSE = 170;
        const draw = () => {
            if (!running) return;
            ctx.clearRect(0, 0, w, h);
            for (const p of pts) {
                const dx = pointer.x - p.x, dy = pointer.y - p.y;
                const d = Math.hypot(dx, dy);
                if (d < MOUSE && d > 1) { p.vx += (dx / d) * 0.012; p.vy += (dy / d) * 0.012; }
                p.vx *= 0.99; p.vy *= 0.99;
                const sp = Math.hypot(p.vx, p.vy);
                if (sp < 0.12) { p.vx += (Math.random() - 0.5) * 0.05; p.vy += (Math.random() - 0.5) * 0.05; }
                if (sp > 1.2) { p.vx *= 1.2 / sp; p.vy *= 1.2 / sp; }
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
            }
            ctx.lineWidth = 1;
            for (let i = 0; i < pts.length; i++) {
                const a = pts[i];
                for (let j = i + 1; j < pts.length; j++) {
                    const b = pts[j];
                    const d = Math.hypot(a.x - b.x, a.y - b.y);
                    if (d < LINK) {
                        ctx.strokeStyle = `rgba(${rgb},${((1 - d / LINK) * 0.28).toFixed(3)})`;
                        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                    }
                }
                const dm = Math.hypot(a.x - pointer.x, a.y - pointer.y);
                if (dm < MOUSE) {
                    ctx.strokeStyle = `rgba(${rgb},${((1 - dm / MOUSE) * 0.55).toFixed(3)})`;
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
                }
                ctx.fillStyle = `rgba(${rgb},0.75)`;
                ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
            }
            requestAnimationFrame(draw);
        };
        const setRunning = (on) => {
            if (on === running) return;
            running = on;
            if (on) requestAnimationFrame(draw);
        };

        // A rede só arranca depois de a página carregar e o navegador ficar livre,
        // para não competir com o conteúdo principal.
        const startCanvas = () => {
            readColor();
            resize();
            canvas.classList.add('is-ready');
            new MutationObserver(readColor).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
            let rt;
            window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
            if (finePointer) {
                heroEl.addEventListener('pointermove', (e) => {
                    const r = heroBg.getBoundingClientRect();
                    pointer.x = e.clientX - r.left;
                    pointer.y = e.clientY - r.top;
                });
                heroEl.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });
            }
            new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting && !document.hidden)).observe(heroEl);
            document.addEventListener('visibilitychange', () => {
                const r = heroEl.getBoundingClientRect();
                setRunning(!document.hidden && r.bottom > 0);
            });
        };
        const whenIdle = () => {
            const delay = root.classList.contains('first-visit') ? 1800 : 600;
            setTimeout(() => {
                if ('requestIdleCallback' in window) requestIdleCallback(startCanvas, { timeout: 1500 });
                else startCanvas();
            }, delay);
        };
        if (document.readyState === 'complete') whenIdle();
        else window.addEventListener('load', whenIdle, { once: true });
    }

    /* ---------- Barra de progresso da leitura ---------- */
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.prepend(bar);

    let ticking = false;
    const heroSection = document.querySelector('.hero');
    const backTop = document.getElementById('backToTop');
    // medidas guardadas e só atualizadas quando a página muda de tamanho
    let maxScroll = 1, heroH = 1, lastHs = -1;
    const measurePage = () => {
        maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
        heroH = heroSection ? heroSection.offsetHeight || 1 : 1;
    };
    const updateProgress = () => {
        const p = clamp(window.scrollY / maxScroll, 0, 1).toFixed(4);
        // a variável é posta só nos 2 elementos que a usam (pô-la na raiz obrigaria a recalcular a página toda)
        bar.style.setProperty('--progress', p);
        backTop?.style.setProperty('--progress', p);
        // o topo recua e desvanece enquanto se desce
        if (heroSection) {
            const hs = clamp(window.scrollY / heroH, 0, 1);
            if (hs !== lastHs) { heroSection.style.setProperty('--hs', hs.toFixed(3)); lastHs = hs; }
        }
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
    }, { passive: true });
    if ('ResizeObserver' in window) {
        new ResizeObserver(() => { measurePage(); updateProgress(); }).observe(document.body);
    }
    window.addEventListener('resize', () => { measurePage(); updateProgress(); });
    measurePage();
    updateProgress();

    /* ---------- Indicador que desliza entre os links do menu ---------- */
    const nav = document.getElementById('nav');
    if (nav) {
        const indicator = document.createElement('span');
        indicator.className = 'nav-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        nav.prepend(indicator);
        nav.classList.add('has-indicator');

        const links = $$('.nav-link', nav);
        const sync = () => {
            const link = links.find((l) => l.classList.contains('is-active') && !l.classList.contains('nav-cta'));
            if (!link) { indicator.classList.remove('is-on'); return; }
            indicator.style.setProperty('--ni-x', link.offsetLeft + 'px');
            indicator.style.setProperty('--ni-w', link.offsetWidth + 'px');
            indicator.style.setProperty('--ni-top', link.offsetTop + 'px');
            indicator.style.setProperty('--ni-h', link.offsetHeight + 'px');
            indicator.classList.add('is-on');
        };
        const mo = new MutationObserver(sync);
        links.forEach((l) => mo.observe(l, { attributes: true, attributeFilter: ['class'] }));
        window.addEventListener('resize', sync);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
        sync();
    }

    if (!finePointer) return;

    /* ---------- Paralaxe suave no topo ---------- */
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('pointermove', (e) => {
            const r = hero.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            hero.style.setProperty('--hx', (x * 16).toFixed(1) + 'px');
            hero.style.setProperty('--hy', (y * 16).toFixed(1) + 'px');
        });
        hero.addEventListener('pointerleave', () => {
            hero.style.setProperty('--hx', '0px');
            hero.style.setProperty('--hy', '0px');
        });
    }

    /* ---------- Luz que segue o rato dentro dos cartões ---------- */
    $$('.project, .skill-group, .info-card, .timeline-card, .cert-list li, .contact-form').forEach((el) => {
        el.classList.add('spotlight');
        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            el.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
    });

    /* ---------- Inclinação 3D dos cartões de projeto ---------- */
    $$('.project').forEach((card) => {
        card.addEventListener('pointerenter', () => card.classList.add('is-tilting'));
        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.setProperty('--ry', (x * 6).toFixed(2) + 'deg');
            card.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
        });
        card.addEventListener('pointerleave', () => {
            card.classList.remove('is-tilting');
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });
    });

    /* ---------- Botões "magnéticos" ---------- */
    $$('.btn, .hero-social a, .back-to-top, .icon-btn, .filter').forEach((el) => {
        el.classList.add('magnetic');
        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            const x = clamp((e.clientX - (r.left + r.width / 2)) * 0.25, -8, 8);
            const y = clamp((e.clientY - (r.top + r.height / 2)) * 0.3, -6, 6);
            el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
        });
        el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });

    /* ---------- Cursor: anel que segue o rato com atraso ---------- */
    $$('a.project-media').forEach((el) => { el.dataset.cursor = 'open'; });
    const photo = document.querySelector('.photo-frame');
    if (photo) photo.dataset.cursor = 'hello';
    const CURSOR_TEXT = { open: ['cursorOpen', 'Abrir ↗'], hello: ['cursorHello', 'Olá! 👋'], details: ['cursorDetails', 'Ver mais'] };
    const cursorText = (key) => {
        const [k, fallback] = CURSOR_TEXT[key] || [null, key];
        return window.I18N && k ? window.I18N.t(k) : fallback;
    };

    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.setAttribute('aria-hidden', 'true');
    ring.innerHTML = '<span class="cursor-label"></span>';
    document.body.appendChild(ring);
    const ringLabel = ring.firstElementChild;

    let mx = -100, my = -100, rx = -100, ry = -100, seen = false;
    const updateRing = (target) => {
        if (!target || !target.closest) return;
        const inField = target.closest('input, textarea');
        const labelled = target.closest('[data-cursor]');
        const interactive = target.closest('a, button, label, .project');
        ring.classList.toggle('is-active', !inField);
        ring.classList.toggle('has-label', !!labelled);
        ring.classList.toggle('is-hover', !labelled && !!interactive);
        if (labelled) ringLabel.textContent = cursorText(labelled.dataset.cursor);
    };
    window.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        mx = e.clientX;
        my = e.clientY;
        seen = true;
        updateRing(e.target);
    }, { passive: true });
    // ao fazer scroll com o rato parado, o elemento por baixo muda
    let scrollRaf = 0;
    window.addEventListener('scroll', () => {
        if (!seen || scrollRaf) return;
        scrollRaf = requestAnimationFrame(() => {
            scrollRaf = 0;
            updateRing(document.elementFromPoint(mx, my));
        });
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
    window.addEventListener('pointerdown', () => ring.classList.add('is-down'));
    window.addEventListener('pointerup', () => ring.classList.remove('is-down'));

    // o anel só se move enquanto não alcança o rato; depois a animação para (não gasta processador)
    let following = false;
    const follow = () => {
        rx += (mx - rx) * 0.2;
        ry += (my - ry) * 0.2;
        ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
        if (Math.abs(mx - rx) < 0.2 && Math.abs(my - ry) < 0.2) { following = false; return; }
        requestAnimationFrame(follow);
    };
    window.addEventListener('pointermove', () => {
        if (!following) { following = true; requestAnimationFrame(follow); }
    }, { passive: true });
})();
