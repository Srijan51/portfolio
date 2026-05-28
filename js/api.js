// js/api.js
const API_BASE_URL = 'https://srijan-portfolio-api.azurewebsites.net/api';

const TECHNOLOGY_ICON_MAP = {
    html: 'devicon-html5-plain colored',
    css: 'devicon-css3-plain colored',
    javascript: 'devicon-javascript-plain colored',
    typescript: 'devicon-typescript-plain colored',
    react: 'devicon-react-original colored',
    node: 'devicon-nodejs-plain colored',
    nodejs: 'devicon-nodejs-plain colored',
    python: 'devicon-python-plain colored',
    java: 'devicon-java-plain colored',
    sql: 'devicon-mysql-plain colored',
    mysql: 'devicon-mysql-plain colored',
    postgresql: 'devicon-postgresql-plain colored',
    git: 'devicon-git-plain colored',
    github: 'devicon-github-original colored',
    vscode: 'devicon-vscode-plain colored',
    figma: 'devicon-figma-plain colored',
    firebase: 'devicon-firebase-plain colored',
    mongodb: 'devicon-mongodb-plain colored',
    tailwind: 'devicon-tailwindcss-original colored',
    bootstrap: 'devicon-bootstrap-plain colored'
};

function normalizeTechKey(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, '');
}

function getTechnologyIconClass(label) {
    const normalized = normalizeTechKey(label);
    return TECHNOLOGY_ICON_MAP[normalized] || '';
}

function buildTechnologyBadge(label) {
    const iconClass = getTechnologyIconClass(label);
    if (iconClass) {
        return `<span class="project-tag"><i class="${iconClass} project-tag-icon" aria-hidden="true"></i><span>${label}</span></span>`;
    }

    return `<span class="project-tag project-tag--text"><span>${label}</span></span>`;
}

function buildSkillIcon(skill) {
    const iconClass = getTechnologyIconClass(skill.name);
    if (iconClass) {
        return `<span class="skill-icon-wrap"><i class="${iconClass} skill-logo" aria-hidden="true"></i></span>`;
    }

    return `<span class="skill-icon-wrap"><span class="skill-fallback" aria-hidden="true">${skill.icon_emoji || '💻'}</span></span>`;
}

function resolveAssetUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const normalizedPath = path.replace(/^\//, '');
    if (normalizedPath.startsWith('uploads/')) {
        return `${API_BASE_URL}/${normalizedPath}`;
    }
    return path;
}

window.techIcons = {
    getTechnologyIconClass,
    buildTechnologyBadge,
    buildSkillIcon,
    resolveAssetUrl
};

async function fetchProjects(featured = false) {
    try {
        const url = featured ? `${API_BASE_URL}/projects/featured` : `${API_BASE_URL}/projects`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch projects');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchBlogPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/blog`);
        if (!response.ok) throw new Error('Failed to fetch blog posts');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchCertifications() {
    try {
        const response = await fetch(`${API_BASE_URL}/certifications`);
        if (!response.ok) throw new Error('Failed to fetch certifications');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchSkills() {
    try {
        const response = await fetch(`${API_BASE_URL}/skills`);
        if (!response.ok) throw new Error('Failed to fetch skills');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function submitContactForm(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to submit message');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

window.api = {
    fetchProjects,
    fetchBlogPosts,
    fetchCertifications,
    fetchSkills,
    submitContactForm,
    getTechnologyIconClass,
    buildTechnologyBadge,
    buildSkillIcon,
    resolveAssetUrl
};
