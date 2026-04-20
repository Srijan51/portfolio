const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://127.0.0.1:8000/api'
    : 'https://srijan-portfolio-api.azurewebsites.net/api';

class AdminAPI {
    constructor() {
        this.token = localStorage.getItem('adminToken');
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        });
        
        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = 'index.html';
        }
        
        if (!response.ok && response.status !== 204) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return response.status !== 204 ? await response.json() : null;
    }

    login(password) { return this.request('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }); }
    
    getProjects() { return this.request('/projects'); }
    createProject(data) { return this.request('/admin/projects', { method: 'POST', body: JSON.stringify(data) }); }
    deleteProject(id) { return this.request(`/admin/projects/${id}`, { method: 'DELETE' }); }
    
    getBlogs() { return this.request('/admin/blog'); }
    createBlog(data) { return this.request('/admin/blog', { method: 'POST', body: JSON.stringify(data) }); }
    deleteBlog(id) { return this.request(`/admin/blog/${id}`, { method: 'DELETE' }); }
    
    getCertifications() { return this.request('/certifications'); }
    createCertification(data) { return this.request('/admin/certifications', { method: 'POST', body: JSON.stringify(data) }); }
    deleteCertification(id) { return this.request(`/admin/certifications/${id}`, { method: 'DELETE' }); }
    
    getSkills() { return this.request('/skills'); }
    createSkill(data) { return this.request('/admin/skills', { method: 'POST', body: JSON.stringify(data) }); }
    deleteSkill(id) { return this.request(`/admin/skills/${id}`, { method: 'DELETE' }); }
    
    getMessages() { return this.request('/admin/messages'); }
    deleteMessage(id) { return this.request(`/admin/messages/${id}`, { method: 'DELETE' }); }
}

window.adminApi = new AdminAPI();

window.adminApp = {
    init() {
        this.contentArea = document.getElementById('content-area');
        this.pageTitle = document.getElementById('page-title');
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                e.target.classList.add('active');
                this.loadTab(e.target.dataset.tab);
            });
        });
        
        this.loadTab('projects');
    },
    
    async loadTab(tab) {
        this.currentTab = tab;
        this.contentArea.innerHTML = '<div style="text-align:center; padding:2rem;"><div class="preloader-spinner" style="width:30px;height:30px;border-width:3px;margin:0 auto;border-color:currentColor;border-top-color:transparent;"></div></div>';
        const formContainer = document.getElementById('form-container');
        if(formContainer) formContainer.style.display = 'none';

        const addBtn = document.getElementById('add-btn');
        if(addBtn) {
            addBtn.style.display = tab === 'messages' ? 'none' : 'flex';
        }
        
        try {
            switch(tab) {
                case 'projects':
                    this.pageTitle.textContent = 'Manage Projects';
                    await this.renderProjects();
                    break;
                case 'blog':
                    this.pageTitle.textContent = 'Manage Blog Posts';
                    await this.renderBlogs();
                    break;
                case 'certifications':
                    this.pageTitle.textContent = 'Manage Certifications';
                    await this.renderCertifications();
                    break;
                case 'skills':
                    this.pageTitle.textContent = 'Manage Skills';
                    await this.renderSkills();
                    break;
                case 'messages':
                    this.pageTitle.textContent = 'Contact Messages';
                    await this.renderMessages();
                    break;
            }
        } catch (error) {
            this.contentArea.innerHTML = `<div style="color:red">Error loading data: Ensure backend server is running on localhost:8000.</div>`;
        }
    },
    
    async renderProjects() {
        const data = await window.adminApi.getProjects();
        let html = '<table class="admin-table"><tr><th>Title</th><th>Demo URL</th><th>Featured</th><th>Actions</th></tr>';
        data.forEach(item => {
            html += `<tr>
                <td>${item.icon_emoji} ${item.title}</td>
                <td>${item.live_url ? '<a href="'+item.live_url+'" target="_blank" style="color:var(--accent-secondary)">Link</a>' : '-'}</td>
                <td>${item.is_featured ? 'Yes' : 'No'}</td>
                <td>
                    <button class="action-btn delete" onclick="adminApp.deleteItem('projects', ${item.id})">Delete</button>
                </td>
            </tr>`;
        });
        html += '</table>';
        this.contentArea.innerHTML = html;
    },

    async renderBlogs() {
        const data = await window.adminApi.getBlogs();
        let html = '<table class="admin-table"><tr><th>Title</th><th>Category</th><th>Published Date</th><th>Actions</th></tr>';
        data.forEach(item => {
            html += `<tr>
                <td>${item.title}</td>
                <td>${item.category}</td>
                <td>${item.published_date}</td>
                <td>
                    <button class="action-btn delete" onclick="adminApp.deleteItem('blog', ${item.id})">Delete</button>
                </td>
            </tr>`;
        });
        html += '</table>';
        this.contentArea.innerHTML = html;
    },

    async renderCertifications() {
        const data = await window.adminApi.getCertifications();
        let html = '<table class="admin-table"><tr><th>Title</th><th>Issuer</th><th>Year</th><th>Actions</th></tr>';
        data.forEach(item => {
            html += `<tr>
                <td>${item.title}</td>
                <td>${item.issuer}</td>
                <td>${item.year}</td>
                <td>
                    <button class="action-btn delete" onclick="adminApp.deleteItem('certifications', ${item.id})">Delete</button>
                </td>
            </tr>`;
        });
        html += '</table>';
        this.contentArea.innerHTML = html;
    },

    async renderSkills() {
        const data = await window.adminApi.getSkills();
        let html = '<table class="admin-table"><tr><th>Name</th><th>Category</th><th>Proficiency</th><th>Actions</th></tr>';
        data.forEach(item => {
            html += `<tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.proficiency_percent}%</td>
                <td>
                    <button class="action-btn delete" onclick="adminApp.deleteItem('skills', ${item.id})">Delete</button>
                </td>
            </tr>`;
        });
        html += '</table>';
        this.contentArea.innerHTML = html;
    },

    async renderMessages() {
        const data = await window.adminApi.getMessages();
        let html = '<table class="admin-table"><tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Actions</th></tr>';
        data.forEach(item => {
            html += `<tr>
                <td>${item.name}</td>
                <td><a href="mailto:${item.email}" style="color:var(--accent-secondary)">${item.email}</a></td>
                <td>${item.subject}</td>
                <td>${item.message}</td>
                <td>
                    <button class="action-btn delete" onclick="adminApp.deleteItem('messages', ${item.id})">Delete</button>
                </td>
            </tr>`;
        });
        html += '</table>';
        this.contentArea.innerHTML = html;
    },

    async deleteItem(type, id) {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            switch(type) {
                case 'projects': await window.adminApi.deleteProject(id); break;
                case 'blog': await window.adminApi.deleteBlog(id); break;
                case 'certifications': await window.adminApi.deleteCertification(id); break;
                case 'skills': await window.adminApi.deleteSkill(id); break;
                case 'messages': await window.adminApi.deleteMessage(id); break;
            }
            this.loadTab(type);
        } catch (err) {
            alert('Failed to delete item: ' + err.message);
        }
    },

    showAddForm() {
        const container = document.getElementById('form-container');
        container.style.display = 'block';
        let html = '<h3 style="margin-bottom: 1.5rem;">Add New Item</h3>';
        
        // Input style helper
        const inputStyle = `width: 100%; border: 1px solid var(--bg-glass-border); padding: 12px; background: transparent; color: white; border-radius: 8px; margin-bottom: 1rem;`;
        
        switch(this.currentTab) {
            case 'projects':
                html += `
                <form onsubmit="event.preventDefault(); adminApp.submitForm('projects')">
                    <input type="text" id="f_title" placeholder="Project Title" style="${inputStyle}" required>
                    <textarea id="f_desc" rows="3" placeholder="Description" style="${inputStyle}" required></textarea>
                    <input type="text" id="f_tags" placeholder="Tags (comma separated e.g., HTML, CSS)" style="${inputStyle}">
                    <input type="url" id="f_live" placeholder="Live Demo URL (optional)" style="${inputStyle}">
                    <input type="url" id="f_github" placeholder="GitHub URL (optional)" style="${inputStyle}">
                    <div style="display:flex; gap:1rem; margin-bottom:1rem; align-items:center;">
                        <input type="text" id="f_icon" placeholder="Emoji (e.g. 📊)" style="${inputStyle} width:150px; margin:0;" value="🚀">
                        <label style="color:white; display:flex; align-items:center; gap:8px;"><input type="checkbox" id="f_feat"> Featured Project</label>
                    </div>
                    <div><button type="submit" class="btn btn-primary">Save</button> <button type="button" class="btn btn-outline" onclick="document.getElementById('form-container').style.display='none'">Cancel</button></div>
                </form>`;
                break;
            case 'blog':
                html += `
                <form onsubmit="event.preventDefault(); adminApp.submitForm('blog')">
                    <input type="text" id="f_title" placeholder="Blog Title" style="${inputStyle}" required>
                    <input type="text" id="f_category" placeholder="Category (e.g., Web Dev)" style="${inputStyle}" required>
                    <input type="text" id="f_date" placeholder="Date (e.g., Apr 2026)" style="${inputStyle}" required>
                    <textarea id="f_excerpt" rows="3" placeholder="Excerpt / Summary" style="${inputStyle}" required></textarea>
                    <textarea id="f_content" rows="6" placeholder="Full Content (Markdown format)" style="${inputStyle}"></textarea>
                    <div><button type="submit" class="btn btn-primary">Save</button> <button type="button" class="btn btn-outline" onclick="document.getElementById('form-container').style.display='none'">Cancel</button></div>
                </form>`;
                break;
            case 'certifications':
                html += `
                <form onsubmit="event.preventDefault(); adminApp.submitForm('certifications')">
                    <input type="text" id="f_title" placeholder="Certification Title" style="${inputStyle}" required>
                    <input type="text" id="f_issuer" placeholder="Issuer (e.g., Coursera)" style="${inputStyle}" required>
                    <input type="text" id="f_year" placeholder="Year" style="${inputStyle}" required>
                    <textarea id="f_desc" rows="3" placeholder="Description" style="${inputStyle}" required></textarea>
                    <input type="text" id="f_icon" placeholder="Emoji (e.g. 📜)" style="${inputStyle}" value="📜">
                    <input type="url" id="f_url" placeholder="Certificate URL (optional)" style="${inputStyle}">
                    <div><button type="submit" class="btn btn-primary">Save</button> <button type="button" class="btn btn-outline" onclick="document.getElementById('form-container').style.display='none'">Cancel</button></div>
                </form>`;
                break;
            case 'skills':
                html += `
                <form onsubmit="event.preventDefault(); adminApp.submitForm('skills')">
                    <input type="text" id="f_name" placeholder="Skill Name (e.g., Python)" style="${inputStyle}" required>
                    <input type="text" id="f_category" placeholder="Category (e.g., Web Development)" style="${inputStyle}" required>
                    <input type="number" id="f_percent" placeholder="Proficiency % (0-100)" min="0" max="100" style="${inputStyle}" required>
                    <input type="text" id="f_icon" placeholder="Emoji (e.g. 🐍)" style="${inputStyle}" value="💻">
                    <div><button type="submit" class="btn btn-primary">Save</button> <button type="button" class="btn btn-outline" onclick="document.getElementById('form-container').style.display='none'">Cancel</button></div>
                </form>`;
                break;
        }
        container.innerHTML = html;
        container.scrollIntoView({ behavior: 'smooth' });
    },

    async submitForm(type) {
        try {
            let data = {};
            switch(type) {
                case 'projects':
                    data = {
                        title: document.getElementById('f_title').value,
                        description: document.getElementById('f_desc').value,
                        tags: document.getElementById('f_tags').value.split(',').map(s=>s.trim()).filter(s=>s),
                        live_url: document.getElementById('f_live').value || null,
                        github_url: document.getElementById('f_github').value || null,
                        icon_emoji: document.getElementById('f_icon').value || "🚀",
                        is_featured: document.getElementById('f_feat').checked
                    };
                    await window.adminApi.createProject(data);
                    break;
                case 'blog':
                    data = {
                        title: document.getElementById('f_title').value,
                        category: document.getElementById('f_category').value,
                        published_date: document.getElementById('f_date').value,
                        excerpt: document.getElementById('f_excerpt').value,
                        content: document.getElementById('f_content').value
                    };
                    await window.adminApi.createBlog(data);
                    break;
                case 'certifications':
                    data = {
                        title: document.getElementById('f_title').value,
                        issuer: document.getElementById('f_issuer').value,
                        year: document.getElementById('f_year').value,
                        description: document.getElementById('f_desc').value,
                        icon_emoji: document.getElementById('f_icon').value || "📜",
                        certificate_url: document.getElementById('f_url').value || null
                    };
                    await window.adminApi.createCertification(data);
                    break;
                case 'skills':
                    data = {
                        name: document.getElementById('f_name').value,
                        category: document.getElementById('f_category').value,
                        proficiency_percent: parseInt(document.getElementById('f_percent').value),
                        icon_emoji: document.getElementById('f_icon').value || "💻"
                    };
                    await window.adminApi.createSkill(data);
                    break;
            }
            document.getElementById('form-container').style.display = 'none';
            this.loadTab(type);
        } catch (err) {
            alert('Error saving item: ' + err.message);
        }
    }
};
