/* ==========================================================
   Portfólio — Jorge Lourenço Sumbane
   ========================================================== */

/*
 * FORMULÁRIO DE CONTACTO
 * 1. Crie uma conta grátis em https://formspree.io e um novo formulário.
 * 2. Copie o ID (ex.: "xyzabcd" de https://formspree.io/f/xyzabcd) e cole abaixo.
 * Enquanto estiver vazio, o formulário abre o programa de email do visitante
 * com a mensagem já preenchida — por isso funciona sempre.
 */
const FORMSPREE_ID = '';
const CONTACT_EMAIL = 'jsumbane22@gmail.com';

/*
 * CV EM PDF (gerados por tools/cv/build-cv.mjs a partir de tools/cv/cv-data.mjs)
 * O botão "Descarregar CV" escolhe o ficheiro da língua ativa.
 */
const CV_PDF = {
    pt: 'assets/cv/Jorge_Lourenco_Sumbane_CV_PT.pdf',
    en: 'assets/cv/Jorge_Lourenco_Sumbane_CV_EN.pdf'
};

(function () {
    'use strict';

    const root = document.documentElement;
    root.classList.add('js');
    window.__portfolioReady = true; // sinal para o script do topo: o JavaScript carregou

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    // texto traduzido (i18n.js); se faltar, usa o português
    const tr = (key, fallback) => (window.I18N ? window.I18N.t(key) : fallback);

    /* ---------- Ano no rodapé ---------- */
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    /* ---------- Tema claro / escuro ---------- */
    const themeBtn = $('#themeToggle');
    const metaTheme = $('meta[name="theme-color"]');

    function setTheme(theme, save) {
        root.setAttribute('data-theme', theme);
        if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#0b1120' : '#1e3a8a');
        if (themeBtn) themeBtn.setAttribute('aria-label', theme === 'dark' ? tr('themeToLight', 'Mudar para tema claro') : tr('themeToDark', 'Mudar para tema escuro'));
        if (save) {
            try { localStorage.setItem('theme', theme); } catch (e) { /* armazenamento indisponível */ }
        }
    }

    setTheme(root.getAttribute('data-theme') || 'light', false);
    document.addEventListener('langchange', () => setTheme(root.getAttribute('data-theme') || 'light', false));

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

            // Sem suporte (ou com movimento reduzido): troca direta
            if (!document.startViewTransition || reduceMotion) {
                setTheme(next, true);
                return;
            }

            // O novo tema "abre-se" num círculo a partir do botão
            const r = themeBtn.getBoundingClientRect();
            const x = r.left + r.width / 2;
            const y = r.top + r.height / 2;
            const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

            const transition = document.startViewTransition(() => setTheme(next, true));
            transition.ready.then(() => {
                root.animate(
                    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                    { duration: 700, easing: 'cubic-bezier(.16, 1, .3, 1)', pseudoElement: '::view-transition-new(root)' }
                );
            }).catch(() => {});
        });
    }

    // Segue o sistema enquanto o visitante não escolher manualmente
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkQuery.addEventListener?.('change', (e) => {
        let saved = null;
        try { saved = localStorage.getItem('theme'); } catch (err) { /* ignore */ }
        if (!saved) setTheme(e.matches ? 'dark' : 'light', false);
    });

    /* ---------- Menu móvel ---------- */
    const menuBtn = $('#menuBtn');
    const nav = $('#nav');

    function closeMenu() {
        root.classList.remove('menu-open');
        menuBtn?.setAttribute('aria-expanded', 'false');
        menuBtn?.setAttribute('aria-label', tr('menuOpen', 'Abrir menu'));
    }

    menuBtn?.addEventListener('click', () => {
        const open = root.classList.toggle('menu-open');
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? tr('menuClose', 'Fechar menu') : tr('menuOpen', 'Abrir menu'));
    });

    $$('a', nav).forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', (e) => {
        if (root.classList.contains('menu-open') && !e.target.closest('.header')) closeMenu();
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 860) closeMenu(); });

    /* ---------- Cabeçalho e botão "voltar ao topo" ---------- */
    const header = $('#header');
    const backToTop = $('#backToTop');

    function onScroll() {
        const y = window.scrollY;
        header?.classList.toggle('is-scrolled', y > 10);
        backToTop?.classList.toggle('is-visible', y > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Link ativo no menu ---------- */
    const navLinks = $$('.nav-link');
    const sections = navLinks
        .map((l) => document.getElementById(l.getAttribute('href').slice(1)))
        .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((l) => {
                    const active = l.getAttribute('href') === '#' + entry.target.id;
                    l.classList.toggle('is-active', active);
                    if (active) l.setAttribute('aria-current', 'true');
                    else l.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach((s) => spy.observe(s));
    }

    /* ---------- Aparecer ao fazer scroll ---------- */
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                // pequeno atraso entre elementos irmãos, para um efeito em cascata
                const siblings = $$('.reveal', el.parentElement);
                const i = Math.max(0, siblings.indexOf(el));
                el.style.transitionDelay = Math.min(i * 80, 400) + 'ms';
                el.classList.add('is-visible');
                // depois de entrar, o hover deve reagir sem atraso
                setTimeout(() => { el.style.transitionDelay = ''; }, 1500);
                io.unobserve(el);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach((el) => io.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add('is-visible'));
    }

    /* ---------- Contagem dos números ---------- */
    const counters = $$('[data-count]');
    if ('IntersectionObserver' in window && !reduceMotion) {
        const co = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                const start = performance.now();
                const dur = 1200;
                const tick = (now) => {
                    const p = Math.min((now - start) / dur, 1);
                    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
                co.unobserve(el);
            });
        }, { threshold: 0.6 });
        counters.forEach((el) => co.observe(el));
    }

    /* ---------- Texto rotativo no topo ---------- */
    const roleEl = $('#roleText');
    const PT_ROLES = [
        'Desenvolvedor de Software',
        'Java & Spring Boot · React',
        'Estudante de Informática de Sistemas',
        'Aberto a novas oportunidades'
    ];
    const getRoles = () => tr('roles', PT_ROLES);
    let r = 0, c = getRoles()[0].length, deleting = true;

    // ao mudar de língua, mostra logo a frase atual traduzida
    document.addEventListener('langchange', () => {
        if (!roleEl) return;
        const word = getRoles()[r];
        roleEl.textContent = word;
        c = word.length;
        deleting = true;
    });

    if (roleEl && !reduceMotion) {
        const step = () => {
            const roles = getRoles();
            const word = roles[r];
            roleEl.textContent = word.slice(0, c);
            let delay = deleting ? 35 : 70;

            if (deleting && c <= 0) {
                deleting = false;
                c = 0;
                r = (r + 1) % roles.length;
                delay = 300;
            } else if (!deleting && c >= roles[r].length) {
                deleting = true;
                delay = 2200;
            }
            c += deleting ? -1 : 1;
            setTimeout(step, delay);
        };
        setTimeout(step, 2400);
    }

    /* ---------- Projetos: pesquisa e filtros ---------- */
    const filters = $$('.filter');
    const projects = $$('.project');
    const searchInput = $('#projectSearch');
    const resultsEl = $('#projectResults');
    const emptyEl = $('#projectsEmpty');
    let activeFilter = 'all';
    // sem acentos e em minúsculas, para "gestao" encontrar "Gestão"
    const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const hasTag = (p, tag) => (p.dataset.tags || '').split(' ').includes(tag);

    // quantos projetos tem cada filtro (ex.: "Java 2")
    filters.forEach((b) => {
        const f = b.dataset.filter;
        const count = document.createElement('span');
        count.className = 'filter-count';
        count.setAttribute('aria-hidden', 'true');
        count.textContent = f === 'all' ? projects.length : projects.filter((p) => hasTag(p, f)).length;
        b.append(count);
    });

    function applyFilters(animate) {
        const q = normalize((searchInput && searchInput.value.trim()) || '');
        const before = animate ? new Map(projects.map((p) => [p, p.getBoundingClientRect()])) : null;
        let shown = 0;

        projects.forEach((p) => {
            const okTag = activeFilter === 'all' || hasTag(p, activeFilter);
            // pesquisa no texto visível (na língua atual) e nas etiquetas
            const okText = !q || normalize(p.textContent + ' ' + (p.dataset.tags || '')).includes(q);
            const show = okTag && okText;
            p.classList.toggle('is-hidden', !show);
            if (show) { p.classList.add('is-visible'); shown++; }
        });

        if (resultsEl) {
            const all = shown === projects.length;
            resultsEl.textContent = (all ? tr('resultsAll', '{n} projetos') : tr('resultsSome', '{n} de {total} projetos'))
                .replace('{n}', shown).replace('{total}', projects.length);
        }
        if (emptyEl) emptyEl.hidden = shown !== 0;

        if (!animate || reduceMotion || !Element.prototype.animate) return;
        // Técnica FLIP: cada cartão desliza da posição antiga para a nova
        projects.forEach((p, i) => {
            if (p.classList.contains('is-hidden')) return;
            const a = before.get(p);
            const b = p.getBoundingClientRect();
            if (!a.width) {
                p.animate([{ opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1 }],
                    { duration: 450, delay: i * 40, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' });
            } else if (a.left !== b.left || a.top !== b.top) {
                p.animate([{ translate: `${a.left - b.left}px ${a.top - b.top}px` }, { translate: '0 0' }],
                    { duration: 550, easing: 'cubic-bezier(.16, 1, .3, 1)' });
            }
        });
    }

    function setFilter(f) {
        activeFilter = f;
        filters.forEach((b) => {
            const on = b.dataset.filter === f;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', String(on));
        });
    }

    filters.forEach((btn) => btn.addEventListener('click', () => { setFilter(btn.dataset.filter); applyFilters(true); }));
    let searchTimer;
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => applyFilters(true), 120);
    });
    $('#clearFilters')?.addEventListener('click', () => {
        setFilter('all');
        if (searchInput) searchInput.value = '';
        applyFilters(true);
        searchInput?.focus();
    });
    document.addEventListener('langchange', () => applyFilters(false));
    applyFilters(false);

    /* ---------- Impressão: o texto rotativo fica sempre completo ---------- */
    window.addEventListener('beforeprint', () => {
        if (roleEl) roleEl.textContent = getRoles()[0];
        reveals.forEach((el) => el.classList.add('is-visible'));
    });

    /* ---------- Botões do CV: ver (página) e descarregar (PDF) ---------- */
    const cvLink = $('#cvLink');
    const cvLabel = $('#cvLabel');
    const cvPdf = $('#cvPdf');
    const cvPdfLabel = $('#cvPdfLabel');
    function updateCv() {
        const en = window.I18N && window.I18N.lang === 'en';
        if (cvLink) {
            cvLink.href = 'cv.html' + (en ? '?lang=en' : '');
            if (cvLabel) cvLabel.textContent = tr('cvView', 'Ver CV');
        }
        if (cvPdf) {
            const file = en ? CV_PDF.en : CV_PDF.pt;
            cvPdf.href = file;
            cvPdf.setAttribute('download', file.split('/').pop());
            if (cvPdfLabel) cvPdfLabel.textContent = tr('cvDownload', 'Descarregar CV');
        }
    }
    updateCv();
    document.addEventListener('langchange', updateCv);

    /* ---------- Copiar (email, link do projeto) com aviso ---------- */
    const toast = $('#toast');
    let toastTimer;
    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
    }
    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            // alternativa para navegadores sem acesso à área de transferência
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.append(ta);
            ta.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
            ta.remove();
            return ok;
        }
    }
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-copy], [data-copy-link]');
        if (!btn) return;
        const isLink = btn.hasAttribute('data-copy-link');
        const ok = await copyText(isLink ? window.location.href : btn.dataset.copy);
        const msg = ok
            ? (isLink ? tr('linkCopied', 'Link copiado!') : tr('emailCopied', 'Email copiado!'))
            : tr('copyFailed', 'Não foi possível copiar.');
        btn.classList.toggle('is-copied', ok);
        setTimeout(() => btn.classList.remove('is-copied'), 1600);
        if (isLink) {
            // dentro da janela de detalhe o aviso aparece no próprio botão
            const label = $('.copy-link-label', btn);
            if (label) {
                label.textContent = msg;
                setTimeout(() => { label.textContent = tr('copyLink', 'Copiar link'); }, 1600);
            }
        } else {
            showToast(msg);
        }
    });

    /* ---------- Detalhe dos projetos (janela, com link direto) ---------- */
    const dialog = $('#projectDialog');
    const detailContent = $('#detailContent');
    let lastTrigger = null;
    const baseUrl = () => window.location.pathname + window.location.search;

    function openDetail(key, trigger) {
        const tpl = document.getElementById('detail-' + key);
        if (!tpl || !dialog) return;
        detailContent.replaceChildren(tpl.content.cloneNode(true));

        // botão "Copiar link" para partilhar este projeto
        let links = $('.detail-body .project-links', detailContent);
        if (!links) {
            links = document.createElement('div');
            links.className = 'project-links';
            $('.detail-body', detailContent).append(links);
        }
        const full = document.createElement('a');
        full.className = 'btn btn-ghost btn-sm';
        full.href = 'pages/' + key + '.html' + (window.I18N && window.I18N.lang === 'en' ? '?lang=en' : '');
        full.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-file"/></svg> <span></span>';
        $('span', full).textContent = tr('fullPage', 'Página completa do projeto');
        links.append(full);

        const share = document.createElement('button');
        share.type = 'button';
        share.className = 'btn btn-ghost btn-sm';
        share.setAttribute('data-copy-link', '');
        share.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-copy"/></svg> <span class="copy-link-label"></span>';
        $('.copy-link-label', share).textContent = tr('copyLink', 'Copiar link');
        links.append(share);

        lastTrigger = trigger || null;
        if (typeof dialog.showModal === 'function') { if (!dialog.open) dialog.showModal(); }
        else dialog.setAttribute('open', '');
        root.classList.add('dialog-open');
        dialog.scrollTop = 0;
        try { history.replaceState(null, '', baseUrl() + '#projeto-' + key); } catch (e) { /* ignore */ }
        $('.detail-close', dialog)?.focus();
    }

    function closeDetail() {
        if (!dialog || !dialog.open || dialog.classList.contains('is-closing')) return;
        const finish = () => {
            dialog.classList.remove('is-closing');
            if (dialog.open) dialog.close();
        };
        if (reduceMotion) return finish();
        dialog.classList.add('is-closing');
        dialog.addEventListener('animationend', finish, { once: true });
        setTimeout(finish, 450); // segurança, caso a animação não dispare
    }

    const openFromHash = () => {
        const m = window.location.hash.match(/^#projeto-([a-z]+)$/);
        if (m && document.getElementById('detail-' + m[1])) openDetail(m[1], $(`[data-detail="${m[1]}"]`));
    };

    if (dialog) {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-detail]');
            if (!btn) return;
            // Ctrl/Cmd+clique ou clique do meio: abre a página completa normalmente
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
            e.preventDefault();
            openDetail(btn.dataset.detail, btn);
        });
        // a imagem de um projeto sem site também abre o detalhe (atalho para rato; o botão é o acesso principal)
        projects.forEach((p) => {
            const media = $('div.project-media', p);
            if (!media || !p.dataset.key) return;
            media.classList.add('is-clickable');
            media.dataset.cursor = 'details';
            media.addEventListener('click', () => openDetail(p.dataset.key, $('[data-detail]', p)));
        });
        dialog.addEventListener('click', (e) => {
            // clique fora do conteúdo (no fundo escuro) ou no botão fechar
            if (e.target === dialog || e.target.closest('[data-close]')) closeDetail();
        });
        dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeDetail(); });
        dialog.addEventListener('close', () => {
            root.classList.remove('dialog-open');
            if (/^#projeto-/.test(window.location.hash)) {
                try { history.replaceState(null, '', baseUrl() + '#projetos'); } catch (e) { /* ignore */ }
            }
            lastTrigger?.focus();
        });
        window.addEventListener('hashchange', openFromHash);
        openFromHash();
    }

    /* ---------- Atividade no GitHub (repositórios públicos) ---------- */
    const ghGrid = $('#ghGrid');
    if (ghGrid) {
        const USER = 'jorgeSumbane22';
        const CACHE_KEY = 'gh-repos-v2';
        const LANG_COLORS = {
            JavaScript: '#f1e05a', TypeScript: '#3178c6', Java: '#b07219', HTML: '#e34c26',
            CSS: '#563d7c', PHP: '#4f5d95', Python: '#3572a5'
        };
        let repos = null;
        let state = 'idle';   // idle | loading | ok | error
        let reason = '';      // offline | ratelimit | error

        const el = (tag, cls, text) => {
            const node = document.createElement(tag);
            if (cls) node.className = cls;
            if (text != null) node.textContent = text;
            return node;
        };
        const icon = (id) => {
            const span = el('span', 'gh-icon');
            span.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`; // conteúdo fixo, sem dados externos
            return span;
        };
        const skeletons = () => [0, 1, 2].map(() => el('div', 'gh-card gh-skeleton'));

        const render = () => {
            if (state === 'loading') { ghGrid.replaceChildren(...skeletons()); ghGrid.setAttribute('aria-busy', 'true'); return; }
            ghGrid.removeAttribute('aria-busy');

            if (state === 'error') {
                const box = el('div', 'gh-error');
                const msg = reason === 'offline' ? tr('ghOffline', 'Sem ligação à Internet. Os repositórios aparecem quando a ligação voltar.')
                    : reason === 'ratelimit' ? tr('ghRateLimit', 'O GitHub limitou temporariamente os pedidos. Tente daqui a alguns minutos.')
                    : tr('ghError', 'Não foi possível carregar os repositórios agora.');
                const actions = el('div', 'gh-error-actions');
                const retry = el('button', 'btn btn-ghost btn-sm', tr('ghRetry', 'Tentar novamente'));
                retry.type = 'button';
                retry.addEventListener('click', () => load(true));
                const open = el('a', 'btn btn-ghost btn-sm', tr('ghOpen', 'Abrir no GitHub'));
                open.href = `https://github.com/${USER}`;
                open.target = '_blank';
                open.rel = 'noopener noreferrer';
                actions.append(retry, open);
                box.append(el('p', null, msg), actions);
                ghGrid.replaceChildren(box);
                return;
            }
            if (!repos) return;
            if (!repos.length) {
                ghGrid.replaceChildren(el('p', 'gh-error', tr('ghEmpty', 'Ainda não há repositórios públicos.')));
                return;
            }

            const fmt = new Intl.DateTimeFormat(tr('locale', 'pt-PT'), { day: 'numeric', month: 'short', year: 'numeric' });
            // todo o texto vindo da API é inserido com textContent (seguro)
            const cards = repos.map((r) => {
                const a = el('a', 'gh-card');
                a.href = r.html_url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';

                const top = el('div', 'gh-card-top');
                top.append(icon('i-repo'), el('strong', 'gh-name', r.name));
                a.append(top, el('p', 'gh-desc', r.description || tr('ghNoDesc', 'Sem descrição.')));

                const meta = el('div', 'gh-meta');
                if (r.language) {
                    const lang = el('span', 'gh-lang');
                    const dot = el('i', 'gh-dot');
                    dot.style.background = LANG_COLORS[r.language] || 'var(--brand-500)';
                    lang.append(dot, document.createTextNode(r.language));
                    meta.append(lang);
                }
                if (r.stargazers_count) {
                    const stars = el('span');
                    stars.append(icon('i-star'), document.createTextNode(String(r.stargazers_count)));
                    meta.append(stars);
                }
                const upd = el('span');
                upd.append(icon('i-clock'), document.createTextNode(`${tr('ghUpdated', 'Atualizado')} ${fmt.format(new Date(r.pushed_at || r.updated_at))}`));
                meta.append(upd);
                a.append(meta);
                return a;
            });
            ghGrid.replaceChildren(...cards);
        };

        const load = async (force) => {
            if (!force) {
                try {
                    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
                    if (cached && Date.now() - cached.t < 60 * 60 * 1000) { repos = cached.repos; state = 'ok'; return render(); }
                } catch (e) { /* ignore */ }
            }
            if (!navigator.onLine) { state = 'error'; reason = 'offline'; return render(); }

            state = 'loading';
            reason = '';
            render();
            const ctrl = 'AbortController' in window ? new AbortController() : null;
            const timer = ctrl ? setTimeout(() => ctrl.abort(), 9000) : null;
            try {
                const res = await fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=12`, {
                    headers: { Accept: 'application/vnd.github+json' },
                    signal: ctrl ? ctrl.signal : undefined
                });
                if (res.status === 403 || res.status === 429) { reason = 'ratelimit'; throw new Error('rate limit'); }
                if (!res.ok) { reason = 'error'; throw new Error('HTTP ' + res.status); }
                const data = await res.json();
                repos = (Array.isArray(data) ? data : [])
                    .filter((r) => !r.fork)
                    .slice(0, 6)
                    .map(({ name, description, language, html_url, stargazers_count, pushed_at, updated_at }) =>
                        ({ name, description, language, html_url, stargazers_count, pushed_at, updated_at }));
                state = 'ok';
                try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), repos })); } catch (e) { /* ignore */ }
            } catch (e) {
                state = 'error';
                if (!reason) reason = navigator.onLine ? 'error' : 'offline';
            } finally {
                if (timer) clearTimeout(timer);
            }
            render();
        };

        // só pede os dados quando a secção está perto de aparecer
        if ('IntersectionObserver' in window) {
            const gio = new IntersectionObserver(([entry]) => {
                if (!entry.isIntersecting) return;
                gio.disconnect();
                load(false);
            }, { rootMargin: '600px 0px' });
            gio.observe(ghGrid);
        } else {
            load(false);
        }
        window.addEventListener('online', () => { if (state === 'error') { reason = ''; load(true); } });
        document.addEventListener('langchange', render);
    }

    /* ---------- Formulário de contacto ---------- */
    const form = $('#contactForm');
    if (!form) return;

    const statusEl = $('#formStatus');

    // Explica com clareza o que acontece ao enviar (sem fingir um envio que não existe)
    const formNote = $('#formNote');
    const updateFormNote = () => {
        if (!formNote) return;
        formNote.textContent = FORMSPREE_ID
            ? tr('noteFormspree', 'A mensagem é enviada diretamente para o meu email.')
            : tr('noteMailto', 'Ao enviar, abre-se o seu programa de email com a mensagem já escrita. Também pode usar o WhatsApp.');
    };
    updateFormNote();
    document.addEventListener('langchange', updateFormNote);
    const submitBtn = $('#submitBtn');
    const submitLabel = $('span', submitBtn);
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const messages = {
        name: () => tr('errName', 'Indique o seu nome.'),
        email: () => tr('errEmail', 'Indique um email válido.'),
        subject: () => tr('errSubject', 'Indique o assunto.'),
        message: () => tr('errMessage', 'Escreva a sua mensagem.')
    };

    function setFieldError(input, msg) {
        const field = input.closest('.field');
        let err = $('.field-error', field);
        if (msg) {
            field.classList.add('has-error');
            input.setAttribute('aria-invalid', 'true');
            if (!err) {
                err = document.createElement('span');
                err.className = 'field-error';
                err.id = input.id + '-error';
                field.appendChild(err);
                input.setAttribute('aria-describedby', err.id);
            }
            err.textContent = msg;
        } else {
            field.classList.remove('has-error');
            input.removeAttribute('aria-invalid');
            err?.remove();
            input.removeAttribute('aria-describedby');
        }
    }

    function validate() {
        let firstInvalid = null;
        ['name', 'email', 'subject', 'message'].forEach((id) => {
            const input = form.elements[id];
            const value = input.value.trim();
            const bad = !value || (id === 'email' && !emailRe.test(value));
            setFieldError(input, bad ? messages[id]() : '');
            if (bad && !firstInvalid) firstInvalid = input;
        });
        if (firstInvalid) firstInvalid.focus();
        return !firstInvalid;
    }

    // ao mudar de língua, as mensagens de erro já visíveis também são traduzidas
    document.addEventListener('langchange', () => {
        ['name', 'email', 'subject', 'message'].forEach((id) => {
            const input = form.elements[id];
            if (input && input.closest('.field')?.classList.contains('has-error')) setFieldError(input, messages[id]());
        });
    });

    $$('input, textarea', form).forEach((input) => {
        input.addEventListener('input', () => {
            if (input.closest('.field')?.classList.contains('has-error')) setFieldError(input, '');
        });
    });

    function setStatus(text, type) {
        statusEl.textContent = text;
        statusEl.className = 'form-status' + (type ? ' ' + type : '');
    }

    function setLoading(on) {
        submitBtn.disabled = on;
        submitLabel.textContent = on ? tr('sending', 'A enviar…') : tr('send', 'Enviar mensagem');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        setStatus('', '');
        if (form.elements._gotcha.value) return; // provavelmente um bot
        if (!validate()) return;

        const data = {
            name: form.elements.name.value.trim(),
            email: form.elements.email.value.trim(),
            subject: form.elements.subject.value.trim(),
            message: form.elements.message.value.trim()
        };

        // Sem Formspree configurado: abre o email do visitante já preenchido
        if (!FORMSPREE_ID) {
            const body = `${data.message}\n\n— ${data.name} (${data.email})`;
            window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
            // evita abrir várias janelas de email com cliques repetidos
            submitBtn.disabled = true;
            setTimeout(() => { submitBtn.disabled = false; }, 2500);
            setStatus(tr('mailto', 'A abrir o seu programa de email… Se nada acontecer, escreva para ') + CONTACT_EMAIL + '.', 'ok');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ ...data, _subject: `Portfólio: ${data.subject}` })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            form.reset();
            setStatus(tr('sent', 'Mensagem enviada com sucesso! Entrarei em contacto em breve.'), 'ok');
        } catch (err) {
            setStatus(tr('failed', 'Não foi possível enviar agora. Tente pelo WhatsApp ou escreva para ') + CONTACT_EMAIL + '.', 'err');
        } finally {
            setLoading(false);
        }
    });
})();
