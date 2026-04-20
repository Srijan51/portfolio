// js/api.js
const API_BASE_URL = 'https://srijan-portfolio-api.azurewebsites.net/api';
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
    submitContactForm
};
