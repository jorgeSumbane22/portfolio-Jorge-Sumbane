/*
 * Gera o currículo a partir de tools/cv/cv-data.mjs:
 *   - cv.html                                       versão interativa (PT + EN, tema, fotografia)
 *   - assets/cv/Jorge_Lourenco_Sumbane_CV_PT.pdf    versão para recrutamento (ATS), português
 *   - assets/cv/Jorge_Lourenco_Sumbane_CV_EN.pdf    versão para recrutamento (ATS), inglês
 *
 * Requisitos: Node 22+ e Google Chrome (ou Edge). Uso, na raiz do portfólio:
 *     node tools/cv/build-cv.mjs
 * Para usar outro navegador: defina CHROME_PATH com o caminho do executável.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as CV from './cv-data.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LANGS = ['pt', 'en'];
const PDF = {
    pt: 'assets/cv/Jorge_Lourenco_Sumbane_CV_PT.pdf',
    en: 'assets/cv/Jorge_Lourenco_Sumbane_CV_EN.pdf'
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const short = (u) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const T = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] : v);
const L = (lang) => CV.labels[lang];

/* ==========================================================
   1. Versão interativa (cv.html)
   ========================================================== */
const index = readFileSync(join(ROOT, 'index.html'), 'utf8');
const sprite = index.match(/<svg width="0" height="0"[\s\S]*?<\/svg>\n/)[0].trim();

const icon = (id) => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;
const statusBadge = (s, lang) => `<span class="badge ${s === 'ongoing' ? 'badge-ongoing' : 'badge-done'}">${esc(CV.STATUS[s][lang])}</span>`;

function webDoc(lang) {
    const p = CV.person;
    const l = L(lang);
    const id = (name) => `${name}-${lang}`;
    const contacts = [
        [icon('i-pin'), esc(T(p.location, lang)), null],
        [icon('i-mail'), esc(p.email), `mailto:${p.email}`],
        [icon('i-phone'), esc(p.phone), p.phoneHref],
        [icon('i-linkedin'), 'LinkedIn', p.linkedin],
        [icon('i-github'), 'GitHub', p.github],
        [icon('i-globe'), esc(l.portfolio), p.portfolio]
    ].map(([ic, text, href]) => href
        ? `<li><a href="${esc(href)}"${href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${ic}<span>${text}</span></a></li>`
        : `<li><span class="cv-contact-static">${ic}<span>${text}</span></span></li>`).join('\n                        ');

    const projects = CV.projects.map((pr) => {
        const links = [
            pr.demo ? `<a class="btn btn-primary btn-sm" href="${esc(pr.demo)}" target="_blank" rel="noopener noreferrer">${esc(l.demo)} ${icon('i-arrow')}</a>` : '',
            pr.repo ? `<a class="btn btn-ghost btn-sm" href="${esc(pr.repo)}" target="_blank" rel="noopener noreferrer">${icon('i-github')} ${esc(l.code)}</a>` : ''
        ].filter(Boolean).join('\n                                ');
        return `
                        <article class="cv-project" aria-labelledby="${id('p-' + pr.key)}">
                            <header class="cv-project-head">
                                <h3 id="${id('p-' + pr.key)}">${esc(pr.name)}</h3>
                                ${statusBadge(pr.status, lang)}
                            </header>
                            <p class="cv-project-desc">${esc(T(pr.desc, lang))}</p>
                            <ul class="cv-points">
${T(pr.points, lang).map((pt) => `                                <li>${esc(pt)}</li>`).join('\n')}
                            </ul>
                            <p class="cv-tech"><strong>${esc(l.tech)}:</strong> ${esc(pr.tech)}</p>
                            <div class="cv-project-links">
                                ${links}
                            </div>
                        </article>`;
    }).join('\n');

    const experience = CV.experience.length ? `
                    <section class="cv-section" aria-labelledby="${id('exp')}">
                        <h2 id="${id('exp')}">${esc(l.experience)}</h2>
${CV.experience.map((e) => `                        <article class="cv-item">
                            <h3>${esc(T(e.role, lang))} — ${esc(e.company)}</h3>
                            <p class="cv-meta">${esc(T(e.period, lang))} · ${esc(T(e.place, lang))}</p>
                            <ul class="cv-points">${T(e.points, lang).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
                            ${e.tech ? `<p class="cv-tech"><strong>${esc(l.tech)}:</strong> ${esc(e.tech)}</p>` : ''}
                        </article>`).join('\n')}
                    </section>` : '';

    const education = CV.education.map((e) => `
                        <article class="cv-item">
                            <h3>${esc(T(e.degree, lang))}</h3>
                            <p class="cv-meta">${esc(e.school)} · ${esc(e.place)}</p>
                            <p class="cv-meta cv-period">${esc(T(e.period, lang))}</p>
                        </article>`).join('');

    const skills = CV.skills.map((g) => `
                        <div class="cv-skill-group">
                            <h3>${esc(T(g.group, lang))}</h3>
                            <ul class="cv-chips">${T(g.items, lang).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
                        </div>`).join('');

    const languages = CV.languages.length ? `
                    <section class="cv-section" aria-labelledby="${id('lang')}">
                        <h2 id="${id('lang')}">${esc(l.languages)}</h2>
                        <ul class="cv-list">${CV.languages.map((x) => `<li><strong>${esc(T(x.name, lang))}</strong><span>${esc(T(x.level, lang))}</span></li>`).join('')}</ul>
                    </section>` : '';

    return `
            <article class="cv-doc" data-cv-lang="${lang}" lang="${lang}" data-no-i18n>
                <header class="cv-hero">
                    <img class="cv-photo" src="${p.photo}" alt="${lang === 'pt' ? 'Fotografia de' : 'Photo of'} ${esc(p.name)}" width="400" height="600">
                    <div class="cv-id">
                        <h1 class="cv-name">${esc(p.name)}</h1>
                        <p class="cv-role">${esc(T(p.title, lang))}</p>
                        <ul class="cv-contacts" aria-label="${esc(l.contact)}">
                        ${contacts}
                        </ul>
                    </div>
                </header>

                <div class="cv-grid">
                    <div class="cv-main">
                        <section class="cv-section" aria-labelledby="${id('sum')}">
                            <h2 id="${id('sum')}">${esc(l.summary)}</h2>
                            <p class="cv-summary">${esc(T(CV.summary, lang))}</p>
                        </section>
${experience}
                        <section class="cv-section" aria-labelledby="${id('proj')}">
                            <h2 id="${id('proj')}">${esc(l.projects)}</h2>
${projects}
                        </section>

                        <section class="cv-section" aria-labelledby="${id('edu')}">
                            <h2 id="${id('edu')}">${esc(l.education)}</h2>
${education}
                        </section>
                    </div>

                    <aside class="cv-side">
                        <section class="cv-section" aria-labelledby="${id('skills')}">
                            <h2 id="${id('skills')}">${esc(l.skills)}</h2>
${skills}
                        </section>

                        <section class="cv-section" aria-labelledby="${id('courses')}">
                            <h2 id="${id('courses')}">${esc(l.courses)}</h2>
                            <ul class="cv-list">${CV.courses.map((c) => {
                                const [name, detail] = c[lang].split(' — ');
                                return `<li><strong>${esc(name)}</strong>${detail ? `<span>${esc(detail)}</span>` : ''}</li>`;
                            }).join('')}</ul>
                        </section>
${languages}
                        <section class="cv-section" aria-labelledby="${id('soft')}">
                            <h2 id="${id('soft')}">${esc(l.softSkills)}</h2>
                            <ul class="cv-chips cv-chips-soft">${CV.softSkills[lang].map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
                        </section>
                    </aside>
                </div>
            </article>`;
}

const p = CV.person;
const webHtml = `<!DOCTYPE html>
<!-- Gerado por tools/cv/build-cv.mjs a partir de tools/cv/cv-data.mjs. Não editar à mão. -->
<html lang="pt" data-title-en="CV — ${esc(p.name)} | ${esc(p.title.en)}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV — ${esc(p.name)} | ${esc(p.title.pt)}</title>
    <meta name="description" content="Currículo de ${esc(p.name)}, ${esc(p.title.pt.toLowerCase())} em Maputo, Moçambique. Projetos em PHP, Laravel, MySQL e Java. Versão em PDF para português e inglês.">
    <meta name="author" content="${esc(p.name)}">
    <meta name="theme-color" content="#1e3a8a">
    <link rel="canonical" href="${CV.SITE}cv.html">
    <link rel="alternate" hreflang="pt" href="${CV.SITE}cv.html">
    <link rel="alternate" hreflang="en" href="${CV.SITE}cv.html?lang=en">
    <meta property="og:type" content="profile">
    <meta property="og:title" content="CV — ${esc(p.name)}">
    <meta property="og:description" content="${esc(p.title.pt)} · Maputo, Moçambique">
    <meta property="og:url" content="${CV.SITE}cv.html">
    <meta property="og:image" content="${CV.SITE}assets/img/og-image.jpg">
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
    <link rel="manifest" href="site.webmanifest">
    <script>
        (function () {
            var d = document.documentElement, t = null;
            try { t = localStorage.getItem('theme'); } catch (e) {}
            if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            d.setAttribute('data-theme', t);
        })();
    </script>
    <link rel="preload" href="assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="assets/fonts/plus-jakarta-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/cv.css">
</head>
<body class="cv-page">

    ${sprite}

    <a class="skip-link" href="#conteudo">Saltar para o conteúdo</a>

    <div class="cv-toolbar">
        <div class="cv-toolbar-inner">
            <a class="btn btn-ghost btn-sm cv-back" href="index.html">
                <svg class="icon icon-flip" aria-hidden="true"><use href="#i-arrow"/></svg>
                <span>Voltar ao portfólio</span>
            </a>
            <div class="cv-toolbar-actions">
                <button class="lang-btn" id="langToggle" type="button" aria-label="Mudar para inglês" title="English / Português">
                    <svg class="icon" aria-hidden="true"><use href="#i-globe"/></svg>
                    <span id="langLabel">EN</span>
                </button>
                <button class="icon-btn" id="themeToggle" type="button" aria-label="Alternar tema claro/escuro">
                    <svg class="icon icon-moon" aria-hidden="true"><use href="#i-moon"/></svg>
                    <svg class="icon icon-sun" aria-hidden="true"><use href="#i-sun"/></svg>
                </button>
                <button class="btn btn-ghost btn-sm" id="printBtn" type="button" title="Imprime esta página (o tema escuro não é impresso)">
                    <svg class="icon" aria-hidden="true"><use href="#i-file"/></svg>
                    <span>Imprimir</span>
                </button>
                <a class="btn btn-primary btn-sm" id="cvDownload" href="${PDF.pt}" download data-pdf-pt="${PDF.pt}" data-pdf-en="${PDF.en}">
                    <svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>
                    <span>Descarregar PDF</span>
                </a>
            </div>
        </div>
    </div>

    <main class="cv-wrap" id="conteudo">
${LANGS.map(webDoc).join('\n')}
    </main>

    <script src="assets/js/i18n.js" defer></script>
    <script src="assets/js/page.js" defer></script>
</body>
</html>
`;
writeFileSync(join(ROOT, 'cv.html'), webHtml);
console.log('cv.html gerado');

/* ==========================================================
   2. Versão para recrutamento (ATS) → PDF
   ========================================================== */
const fontUrl = (f) => pathToFileURL(join(ROOT, 'assets', 'fonts', f)).href;

function atsHtml(lang) {
    const l = L(lang);
    const contactLine1 = [T(p.location, lang), p.email, p.phone].join(' | ');
    const linkLine = [
        `LinkedIn: <a href="${p.linkedin}">${esc(short(p.linkedin))}</a>`,
        `GitHub: <a href="${p.github}">${esc(short(p.github))}</a>`,
        `${esc(l.portfolio)}: <a href="${p.portfolio}">${esc(short(p.portfolio))}</a>`
    ].join(' | ');

    const pdfProjects = CV.projects.filter((x) => x.pdf);
    const other = CV.projects.filter((x) => !x.pdf);

    const experience = CV.experience.length ? `
    <section>
        <h2>${esc(l.experience)}</h2>
${CV.experience.map((e) => `        <div class="entry">
            <h3>${esc(T(e.role, lang))} — ${esc(e.company)}</h3>
            <p class="meta">${esc(T(e.period, lang))} | ${esc(T(e.place, lang))}</p>
            <ul>${T(e.points, lang).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
            ${e.tech ? `<p class="tech"><strong>${esc(l.tech)}:</strong> ${esc(e.tech)}</p>` : ''}
        </div>`).join('\n')}
    </section>` : '';

    const languages = CV.languages.length ? `
    <section>
        <h2>${esc(l.languages)}</h2>
        <p>${CV.languages.map((x) => `${esc(T(x.name, lang))} — ${esc(T(x.level, lang))}`).join(' | ')}</p>
    </section>` : '';

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<title>${esc(p.name)} — CV (${lang.toUpperCase()})</title>
<meta name="author" content="${esc(p.name)}">
<meta name="description" content="${esc(T(p.title, lang))}">
<style>
    @font-face { font-family: "Inter"; font-weight: 400 600; src: url("${fontUrl('inter-latin.woff2')}") format("woff2"); }
    @font-face { font-family: "Plus Jakarta Sans"; font-weight: 600 800; src: url("${fontUrl('plus-jakarta-sans-latin.woff2')}") format("woff2"); }
    @page { size: A4; margin: 14mm 16mm 14mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Inter", Arial, Helvetica, sans-serif; font-size: 9.6pt; line-height: 1.42; color: #1f2937; background: #fff; }
    a { color: #1d4ed8; text-decoration: none; white-space: nowrap; }
    header { padding-bottom: 7pt; border-bottom: 1.6pt solid #1e3a8a; margin-bottom: 9pt; }
    h1 { font-family: "Plus Jakarta Sans", Arial, sans-serif; font-size: 20pt; font-weight: 800; color: #111827; letter-spacing: -.2pt; line-height: 1.1; }
    .role { font-family: "Plus Jakarta Sans", Arial, sans-serif; font-size: 11pt; font-weight: 700; color: #1e3a8a; margin: 2pt 0 5pt; }
    .contact { font-size: 8.8pt; color: #374151; }
    section { margin-top: 9pt; }
    h2 { font-family: "Plus Jakarta Sans", Arial, sans-serif; font-size: 9.6pt; font-weight: 800; text-transform: uppercase; letter-spacing: .8pt;
         color: #1e3a8a; padding-bottom: 2pt; border-bottom: .6pt solid #d1d5db; margin-bottom: 5pt; break-after: avoid; }
    h3 { font-size: 10pt; font-weight: 600; color: #111827; }
    h3 .status { font-weight: 400; color: #4b5563; font-size: 9pt; }
    .entry { margin-bottom: 7pt; break-inside: avoid; }
    .entry p { margin-top: 1pt; }
    .meta { color: #4b5563; font-size: 9pt; }
    ul { margin: 2pt 0 0 13pt; }
    li { margin-bottom: 1pt; }
    .tech, .links { font-size: 8.9pt; color: #374151; }
    .skills p { margin-bottom: 2pt; }
    strong { font-weight: 600; color: #111827; }
</style>
</head>
<body>
    <header>
        <h1>${esc(p.name)}</h1>
        <p class="role">${esc(T(p.title, lang))}</p>
        <p class="contact">${esc(contactLine1)}</p>
        <p class="contact">${linkLine}</p>
    </header>

    <section>
        <h2>${esc(l.summary)}</h2>
        <p>${esc(T(CV.summary, lang))}</p>
    </section>
${experience}
    <section class="skills">
        <h2>${esc(l.skills)}</h2>
${CV.skills.map((g) => `        <p><strong>${esc(T(g.group, lang))}:</strong> ${esc(T(g.items, lang).join(', '))}</p>`).join('\n')}
    </section>

    <section>
        <h2>${esc(l.projects)}</h2>
${pdfProjects.map((pr) => `        <div class="entry">
            <h3>${esc(pr.name)} <span class="status">| ${esc(CV.STATUS[pr.status][lang])}</span></h3>
            <p>${esc(T(pr.desc, lang))}</p>
            <ul>${T(pr.points, lang).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
            <p class="tech"><strong>${esc(l.tech)}:</strong> ${esc(pr.tech)}</p>
            <p class="links">${[pr.demo ? `${esc(l.demo)}: <a href="${pr.demo}">${esc(short(pr.demo))}</a>` : '', pr.repo ? `${esc(l.code)}: <a href="${pr.repo}">${esc(short(pr.repo))}</a>` : ''].filter(Boolean).join(' | ')}</p>
        </div>`).join('\n')}
        <div class="entry">
            <h3>${esc(l.otherProjects)}</h3>
            <ul>${other.map((pr) => `<li>${esc(pr.name)} (${esc(T(pr.short, lang))}) — <a href="${pr.repo}">${esc(short(pr.repo))}</a></li>`).join('')}</ul>
        </div>
    </section>

    <section>
        <h2>${esc(l.education)}</h2>
${CV.education.filter((e) => e.pdf).map((e) => `        <div class="entry">
            <h3>${esc(T(e.degree, lang))}</h3>
            <p class="meta">${esc(e.school)}, ${esc(e.place)} | ${esc(T(e.period, lang))}</p>
        </div>`).join('\n')}
    </section>

    <section>
        <h2>${esc(l.courses)}</h2>
        <p>${CV.courses.map((c) => esc(c[lang].split(' — ')[0])).join(' | ')}</p>
    </section>
${languages}
</body>
</html>
`;
}

/* ----- impressão para PDF com o Chrome (protocolo DevTools) ----- */
const CHROME = process.env.CHROME_PATH || [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].find((c) => existsSync(c));
if (!CHROME) { console.error('Chrome/Edge não encontrado. Defina CHROME_PATH.'); process.exit(1); }

const tmp = mkdtempSync(join(tmpdir(), 'cv-build-'));
const PORT = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${join(tmp, 'profile')}`, '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
    let wsUrl;
    for (let i = 0; i < 80 && !wsUrl; i++) {
        try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
        if (!wsUrl) await sleep(200);
    }
    if (!wsUrl) throw new Error('Não foi possível ligar ao Chrome.');
    const ws = new WebSocket(wsUrl);
    await new Promise((r) => ws.addEventListener('open', r));
    let id = 0;
    const pending = new Map();
    const waiters = [];
    ws.addEventListener('message', (e) => {
        const m = JSON.parse(e.data);
        if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
        else if (m.method === 'Page.loadEventFired') waiters.splice(0).forEach((w) => w());
    });
    const send = (method, params = {}) => new Promise((res, rej) => {
        const i = ++id;
        pending.set(i, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
        ws.send(JSON.stringify({ id: i, method, params }));
    });
    await send('Page.enable');
    mkdirSync(join(ROOT, 'assets', 'cv'), { recursive: true });

    for (const lang of LANGS) {
        const file = join(tmp, `cv-${lang}.html`);
        writeFileSync(file, atsHtml(lang));
        if (process.env.CV_KEEP_HTML) writeFileSync(join(process.env.CV_KEEP_HTML, `cv-ats-${lang}.html`), atsHtml(lang));
        const loaded = new Promise((r) => waiters.push(r));
        await send('Page.navigate', { url: pathToFileURL(file).href });
        await loaded;
        await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true });
        const { data } = await send('Page.printToPDF', {
            paperWidth: 8.27, paperHeight: 11.69, preferCSSPageSize: true,
            printBackground: true, displayHeaderFooter: false,
            generateTaggedPDF: true, generateDocumentOutline: true
        });
        writeFileSync(join(ROOT, PDF[lang]), Buffer.from(data, 'base64'));
        console.log(`${PDF[lang]} gerado`);
    }
    ws.close();
} finally {
    chrome.kill();
    await sleep(500);
    try { rmSync(tmp, { recursive: true, force: true }); } catch {}
}
