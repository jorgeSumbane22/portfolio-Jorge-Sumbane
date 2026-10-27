/*
 * ==========================================================
 *  DADOS DO CURRÍCULO — fonte única (PT + EN)
 * ==========================================================
 *  Tudo o que aparece em cv.html e nos PDFs (assets/cv/*.pdf) vem daqui.
 *  Depois de alterar este ficheiro, gere tudo de novo:
 *      node tools/cv/build-cv.mjs
 *
 *  Regra: só informação verdadeira e confirmada. Campos ainda por confirmar
 *  ficam vazios ou comentados e NÃO aparecem no CV publicado.
 * ==========================================================
 */

export const SITE = 'https://jorgesumbane22.github.io/portfolio-Jorge-Sumbane/';

export const person = {
    name: 'Jorge Lourenço Sumbane',
    title: {
        pt: 'Desenvolvedor de Software',
        en: 'Software Developer'
    },
    location: { pt: 'Maputo, Moçambique', en: 'Maputo, Mozambique' },
    email: 'jsumbane22@gmail.com',
    phone: '+258 84 587 2347',
    phoneHref: 'tel:+258845872347',
    linkedin: 'https://www.linkedin.com/in/jorge-sumbane-sumbane-174478320/',
    github: 'https://github.com/jorgeSumbane22',
    portfolio: SITE,
    photo: 'assets/img/profile-400.webp'
};

export const summary = {
    pt: 'Desenvolvedor de software em Maputo, atualmente estagiário na ACSUN e finalista da licenciatura em Informática de Sistemas no ISCIM. '
      + 'Desenvolvo aplicações web completas em PHP 8 (puro e Laravel) com MySQL, JavaScript e Bootstrap, e aplicações desktop em Java. '
      + 'Entre os meus projetos estão uma plataforma de faturação SaaS publicada online, um sistema de microcrédito com motor financeiro '
      + 'e um marketplace agrícola, sempre com atenção à segurança, à organização do código e à experiência do utilizador. '
      + 'Procuro integrar uma equipa de desenvolvimento, presencial ou remota.',
    en: 'Software developer based in Maputo, currently an intern at ACSUN and a final-year Information Systems student at ISCIM. '
      + 'I build complete web applications in PHP 8 (plain PHP and Laravel) with MySQL, JavaScript and Bootstrap, as well as desktop applications in Java. '
      + 'My projects include a live SaaS invoicing platform, a microcredit system with a financial engine and an agricultural marketplace, '
      + 'built with a focus on security, clean code and user experience. '
      + 'I am looking to join a development team, on-site or remote.'
};

/*
 * EXPERIÊNCIA PROFISSIONAL
 * Confirmado: estágio atual na ACSUN. Por confirmar: data de início, área do estágio,
 * responsabilidades e tecnologias — acrescente-as em "period", "points" e "tech" quando as tiver.
 * Campos opcionais: place, points, tech. Modelo completo:
 *
 *  {
 *      role: { pt: 'Cargo', en: 'Role' },
 *      company: 'Empresa ou organização',
 *      place: { pt: 'Maputo · Presencial', en: 'Maputo · On-site' },
 *      period: { pt: 'Jan 2025 – presente', en: 'Jan 2025 – present' },
 *      points: {
 *          pt: ['Desenvolvi ...', 'Implementei ...'],
 *          en: ['Developed ...', 'Implemented ...']
 *      },
 *      tech: 'PHP · MySQL'
 *  }
 */
export const experience = [
    {
        role: { pt: 'Estagiário', en: 'Intern' },
        company: 'ACSUN',
        period: { pt: 'Atualmente', en: 'Present' }
    }
];

/* Competências técnicas: só tecnologias usadas nos projetos ou declaradas no portfólio. */
export const skills = [
    { group: { pt: 'Front-end', en: 'Front-end' }, items: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap 5', 'React'] },
    { group: { pt: 'Back-end', en: 'Back-end' }, items: ['PHP 8', 'Laravel', 'Java', 'Spring Boot'] },
    { group: { pt: 'Bases de dados', en: 'Databases' }, items: ['MySQL / MariaDB', 'SQL', 'Firebase'] },
    { group: { pt: 'Ferramentas', en: 'Tools' }, items: ['Git', 'GitHub', 'GitLab', 'VS Code', 'Composer', 'Maven', 'XAMPP'] },
    {
        group: { pt: 'Engenharia de software', en: 'Software engineering' },
        items: {
            pt: ['Programação orientada a objetos', 'MVC e arquitetura em camadas', 'APIs JSON', 'Controlo de acesso por perfil',
                 'Segurança web (CSRF, consultas preparadas)', 'Transações e idempotência', 'Testes automatizados (PHPUnit)'],
            en: ['Object-oriented programming', 'MVC and layered architecture', 'JSON APIs', 'Role-based access control',
                 'Web security (CSRF, prepared statements)', 'Transactions and idempotency', 'Automated testing (PHPUnit)']
        }
    }
];

const STATUS = {
    online: { pt: 'Online', en: 'Live' },
    done: { pt: 'Concluído', en: 'Completed' },
    ongoing: { pt: 'Em desenvolvimento', en: 'In progress' }
};
export { STATUS };

/*
 * Projetos. "pdf: true" = aparece na versão PDF para recrutamento (os mais relevantes);
 * os restantes aparecem no PDF numa linha "Outros projetos" e completos na versão web.
 */
export const projects = [
    {
        key: 'sumbanepay', name: 'Sumbane Pay', status: 'online', pdf: true,
        desc: {
            pt: 'Plataforma SaaS de faturação e gestão de vendas para pequenos negócios em Moçambique, publicada online.',
            en: 'SaaS invoicing and sales management platform for small businesses in Mozambique, live online.'
        },
        points: {
            pt: [
                'Desenvolvi o back-end em PHP 8 (controladores, modelos, middleware e API JSON) a partir de uma primeira versão só de front-end.',
                'Implementei o modelo multi-empresa: um middleware isola os dados de cada empresa, com planos e limites de utilização.',
                'Apliquei proteção CSRF, consultas preparadas (PDO), limite de tentativas de login e auditoria; faturas em PDF com jsPDF.'
            ],
            en: [
                'Built the PHP 8 back-end (controllers, models, middleware and a JSON API), evolving it from a front-end-only first version.',
                'Implemented the multi-tenant model: a middleware isolates the data of each company, with plans and usage limits.',
                'Applied CSRF protection, prepared statements (PDO), login attempt limits and audit logging; PDF invoices with jsPDF.'
            ]
        },
        tech: 'PHP 8 · MySQL · JavaScript · Bootstrap 5 · Chart.js · jsPDF',
        demo: 'https://sumbanepay.freehosting.dev/',
        repo: 'https://github.com/jorgeSumbane22/SumbanePay'
    },
    {
        key: 'sumbanecredit', name: 'SumbaneCredit', status: 'ongoing', pdf: true,
        desc: {
            pt: 'Sistema de gestão de microcrédito com website institucional, portal do cliente e painel administrativo.',
            en: 'Microcredit management system with an institutional website, client portal and admin panel.'
        },
        points: {
            pt: [
                'Desenvolvi um motor financeiro com aritmética decimal (bcmath e DECIMAL) para prestações, juros, encargos e penalizações.',
                'Garanti a integridade dos pagamentos com transações, bloqueio de linhas, índices únicos, chaves de idempotência e reconciliação diária.',
                'Implementei 7 perfis de acesso com separação de funções, documentos PDF/Excel, notificações em fila e testes com PHPUnit.'
            ],
            en: [
                'Built a financial engine with decimal arithmetic (bcmath and DECIMAL) for instalments, interest, fees and penalties.',
                'Ensured payment integrity with transactions, row locking, unique indexes, idempotency keys and daily reconciliation.',
                'Implemented 7 access roles with segregation of duties, PDF/Excel documents, queued notifications and PHPUnit tests.'
            ]
        },
        tech: 'Laravel 12 · PHP 8.2 · MySQL · Bootstrap 5 · Chart.js · PHPUnit',
        repo: 'https://github.com/jorgeSumbane22/SumbaneCredit'
    },
    {
        key: 'agromercado', name: 'AgroMercado', status: 'done', pdf: true,
        desc: {
            pt: 'Marketplace agrícola que liga agricultores e compradores em Moçambique.',
            en: 'Agricultural marketplace connecting farmers and buyers in Mozambique.'
        },
        points: {
            pt: [
                'Implementei pesquisa com filtros, carrinho com Fetch API e checkout transacional que valida e reduz o stock.',
                'Criei áreas separadas para agricultor, comprador e SuperAdmin, com verificação de agricultores e auditoria.',
                'Apliquei consultas preparadas, tokens CSRF, cookies HttpOnly/SameSite e upload seguro de imagens.'
            ],
            en: [
                'Implemented filtered search, a Fetch API cart and a transactional checkout that validates and reduces stock.',
                'Built separate areas for farmers, buyers and the SuperAdmin, with farmer verification and auditing.',
                'Applied prepared statements, CSRF tokens, HttpOnly/SameSite cookies and secure image uploads.'
            ]
        },
        tech: 'PHP 8 · MySQL · PDO · JavaScript · Bootstrap 5 · Chart.js',
        repo: 'https://github.com/jorgeSumbane22/AgroMercado'
    },
    {
        key: 'courtiq', name: 'CourtIQ MZ', status: 'ongoing', pdf: true,
        desc: {
            pt: 'Plataforma de gestão de basquetebol em que vários clubes usam o mesmo sistema de forma independente.',
            en: 'Basketball management platform where several clubs use the same system independently.'
        },
        points: {
            pt: [
                'Desenvolvi uma arquitetura modular em PHP com os dados separados por clube numa única instalação.',
                'Implementei cinco perfis de acesso (SuperAdmin, administrador do clube, treinador, jogador e adepto), sessões e registo de atividades.',
                'Desenvolvi a gestão de jogos, treinos e estatísticas, e um portal público em português e inglês.'
            ],
            en: [
                'Built a modular PHP architecture with data kept separate per club in a single installation.',
                'Implemented five access roles (SuperAdmin, club admin, coach, player and fan), session management and activity logging.',
                'Built game, training and statistics management, plus a public portal in Portuguese and English.'
            ]
        },
        tech: 'PHP · MySQL · PDO · JavaScript · HTML5 · CSS3',
        repo: 'https://github.com/jorgeSumbane22/CourtIQ-MZ'
    },
    {
        key: 'rh', name: 'RH-Sistema', status: 'ongoing', pdf: false,
        desc: {
            pt: 'Sistema de gestão de Recursos Humanos com seis perfis de acesso.',
            en: 'Human Resources management system with six access roles.'
        },
        short: { pt: 'gestão de RH em PHP e MySQL', en: 'HR management in PHP and MySQL' },
        points: {
            pt: [
                'Funcionários, departamentos, férias, presenças, folha de pagamento, recrutamento e avaliação de desempenho.',
                'Arquitetura modular em PHP orientado a objetos, permissões por perfil, auditoria e documentos PDF com Dompdf.'
            ],
            en: [
                'Employees, departments, leave, attendance, payroll, recruitment and performance reviews.',
                'Modular object-oriented PHP architecture, role-based permissions, auditing and PDF documents with Dompdf.'
            ]
        },
        tech: 'PHP · MySQL · JavaScript · Composer · Dompdf',
        repo: 'https://github.com/jorgeSumbane22/Projeto-RH-Sistema'
    },
    {
        key: 'smartcare', name: 'SmartCare', status: 'done', pdf: false,
        desc: {
            pt: 'Sistema desktop de triagem hospitalar baseado no Protocolo de Manchester.',
            en: 'Desktop hospital triage system based on the Manchester Triage System.'
        },
        short: { pt: 'triagem hospitalar em Java', en: 'hospital triage in Java' },
        points: {
            pt: [
                'Classificação automática da prioridade e fila de atendimento ordenada por urgência.',
                'Persistência com Hibernate/JPA e padrão DAO, interface Swing com FlatLaf, gráficos e testes com JUnit.'
            ],
            en: [
                'Automatic priority classification and a waiting queue ordered by urgency.',
                'Persistence with Hibernate/JPA and the DAO pattern, Swing UI with FlatLaf, charts and JUnit tests.'
            ]
        },
        tech: 'Java · Hibernate/JPA · MySQL · Swing · Maven · JUnit',
        repo: 'https://github.com/jorgeSumbane22/SmartCare-Triagem'
    }
];

export const education = [
    {
        degree: { pt: 'Licenciatura em Informática de Sistemas', en: "Bachelor's degree in Information Systems" },
        school: 'Instituto Superior de Comunicação e Imagem de Moçambique (ISCIM)',
        place: 'Maputo',
        period: { pt: '2022 – presente · conclusão prevista em 2026', en: '2022 – present · expected graduation 2026' },
        pdf: true
    },
    {
        degree: { pt: 'Ensino Secundário — Ciências com Biologia', en: 'Secondary education — Sciences with Biology' },
        school: 'Escola Secundária da Polana',
        place: 'Maputo',
        period: { pt: 'Concluído', en: 'Completed' },
        pdf: false
    }
];

/*
 * Cursos. Os da RL System têm certificado (imagem em assets/img/certificados/);
 * os restantes foram concluídos em autoformação (YouTube), sem certificado.
 */
const RL = 'RL System Treinamentos (online)';
const SELF = { pt: 'Autoformação (YouTube) · sem certificado', en: 'Self-study (YouTube) · no certificate' };
export const courses = [
    {
        name: { pt: 'Java Básico', en: 'Java Fundamentals' },
        topic: { pt: 'programação orientada a objetos', en: 'object-oriented programming' },
        issuer: RL, period: { pt: 'fev. 2025 · 20 h', en: 'Feb 2025 · 20 h' },
        cert: 'assets/img/certificados/java-basico-rlsystem.webp'
    },
    {
        name: { pt: 'Lógica de Programação', en: 'Programming Logic' },
        topic: { pt: 'algoritmos e estruturas de dados', en: 'algorithms and data structures' },
        issuer: RL, period: { pt: 'mar. 2025 · 20 h', en: 'Mar 2025 · 20 h' },
        cert: 'assets/img/certificados/logica-programacao-rlsystem.webp'
    },
    { name: { pt: 'PHP Fundamentals', en: 'PHP Fundamentals' }, topic: { pt: 'desenvolvimento back-end', en: 'back-end development' }, issuer: SELF },
    { name: { pt: 'JavaScript Moderno (ES6+)', en: 'Modern JavaScript (ES6+)' }, topic: { pt: 'DOM e APIs', en: 'DOM and APIs' }, issuer: SELF },
    { name: { pt: 'MySQL', en: 'MySQL' }, topic: { pt: 'modelação e consultas SQL', en: 'data modelling and SQL queries' }, issuer: SELF }
];

export const languages = [
    { name: { pt: 'Português', en: 'Portuguese' }, level: { pt: 'Excelente', en: 'Excellent' } },
    { name: { pt: 'Inglês', en: 'English' }, level: { pt: 'Intermédio', en: 'Intermediate' } }
];

export const softSkills = {
    pt: ['Resolução de problemas', 'Trabalho em equipa', 'Comunicação', 'Organização', 'Aprendizagem contínua', 'Gestão de tempo'],
    en: ['Problem solving', 'Teamwork', 'Communication', 'Organisation', 'Continuous learning', 'Time management']
};

/* Textos fixos da interface e títulos das secções */
export const labels = {
    pt: {
        summary: 'Resumo profissional', experience: 'Experiência profissional', skills: 'Competências técnicas',
        projects: 'Projetos', otherProjects: 'Outros projetos', education: 'Formação académica', courses: 'Cursos complementares',
        languages: 'Idiomas', softSkills: 'Competências pessoais', tech: 'Tecnologias', contributions: 'Contribuições principais',
        demo: 'Demonstração', code: 'Código', contact: 'Contacto', portfolio: 'Portfólio', viewCert: 'Ver certificado'
    },
    en: {
        summary: 'Professional summary', experience: 'Professional experience', skills: 'Technical skills',
        projects: 'Projects', otherProjects: 'Other projects', education: 'Education', courses: 'Additional courses',
        languages: 'Languages', softSkills: 'Soft skills', tech: 'Technologies', contributions: 'Key contributions',
        demo: 'Live demo', code: 'Code', contact: 'Contact', portfolio: 'Portfolio', viewCert: 'View certificate'
    }
};
