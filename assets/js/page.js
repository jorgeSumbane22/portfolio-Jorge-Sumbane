/* ==========================================================
   Páginas secundárias (estudos de caso dos projetos e CV)
   Tema claro/escuro, ano no rodapé e botão de imprimir.
   As traduções vêm de i18n.js.
   ========================================================== */
(function () {
    'use strict';

    const root = document.documentElement;
    const tr = (key, fallback) => (window.I18N ? window.I18N.t(key) : fallback);

    /* ---------- Ano no rodapé ---------- */
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    /* ---------- Tema ---------- */
    const themeBtn = document.getElementById('themeToggle');
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const setTheme = (theme, save) => {
        root.setAttribute('data-theme', theme);
        if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#0b1120' : '#1e3a8a');
        if (themeBtn) {
            themeBtn.setAttribute('aria-label', theme === 'dark'
                ? tr('themeToLight', 'Mudar para tema claro')
                : tr('themeToDark', 'Mudar para tema escuro'));
        }
        if (save) { try { localStorage.setItem('theme', theme); } catch (e) { /* ignore */ } }
    };
    setTheme(root.getAttribute('data-theme') || 'light', false);
    themeBtn?.addEventListener('click', () => {
        setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
    document.addEventListener('langchange', () => setTheme(root.getAttribute('data-theme') || 'light', false));

    /* ---------- Links internos mantêm a língua escolhida ---------- */
    const keepLang = () => {
        const en = window.I18N && window.I18N.lang === 'en';
        document.querySelectorAll('a[data-keep-lang], .case-nav-link, .breadcrumb a, .brand, .back-link, .cv-back').forEach((a) => {
            const href = a.getAttribute('href');
            if (!href || /^https?:/.test(href)) return;
            const [pathPart, hash] = href.split('#');
            const clean = pathPart.replace(/\?lang=en$/, '');
            a.setAttribute('href', clean + (en ? '?lang=en' : '') + (hash ? '#' + hash : ''));
        });
    };
    keepLang();
    document.addEventListener('langchange', keepLang);

    /* ---------- CV: imprimir e descarregar o PDF da língua ativa ---------- */
    document.getElementById('printBtn')?.addEventListener('click', () => window.print());

    const cvDownload = document.getElementById('cvDownload');
    const updateDownload = () => {
        if (!cvDownload) return;
        const en = window.I18N && window.I18N.lang === 'en';
        const href = en ? cvDownload.dataset.pdfEn : cvDownload.dataset.pdfPt;
        if (href) {
            cvDownload.href = href;
            cvDownload.setAttribute('download', href.split('/').pop());
        }
    };
    updateDownload();
    document.addEventListener('langchange', updateDownload);
})();
