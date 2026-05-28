const API_BASE_URL = 'https://srijan-portfolio-api.azurewebsites.net/api';

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

    async uploadCertificationPdf(file) {
        const formData = new FormData();
        formData.append('file', file);

        const headers = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${API_BASE_URL}/admin/certifications/upload`, {
            method: 'POST',
            headers,
            body: formData
        });

        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = 'index.html';
        }

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    }
}

window.adminApi = new AdminAPI();

window.adminApp = {
    init() {
        this.contentArea = document.getElementById('content-area');
        this.pageTitle = document.getElementById('page-title');
        this.metrics = {
            count: document.getElementById('metric-count'),
            featured: document.getElementById('metric-featured'),
            drafts: document.getElementById('metric-drafts')
        };
        this.searchInput = document.getElementById('admin-search');
        this.toolbarHint = document.getElementById('toolbar-hint');
        this.dataStore = [];
        this.visibleData = [];

        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadTab(this.currentTab || 'projects'));
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.renderCurrentList();
            });
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                const navItem = e.currentTarget;
                navItem.classList.add('active');
                this.loadTab(navItem.dataset.tab);
            });
        });

        this.loadTab('projects');
    },

    async loadTab(tab) {
        this.currentTab = tab;
        this.dataStore = [];
        this.visibleData = [];
        this.contentArea.innerHTML = '<div style="text-align:center; padding:2rem;"><div class="preloader-spinner" style="width:30px;height:30px;border-width:3px;margin:0 auto;border-color:currentColor;border-top-color:transparent;"></div></div>';
        const formContainer = document.getElementById('form-container');
        if (formContainer) formContainer.style.display = 'none';

        const addBtn = document.getElementById('add-btn');
        if (addBtn) {
            addBtn.style.display = tab === 'messages' ? 'none' : 'flex';
            addBtn.textContent = tab === 'projects'
                ? 'Add Project'
                : tab === 'certifications'
                ? 'Add Certification'
                : tab === 'blog'
                ? 'Add Blog Post'
                : tab === 'skills'
                ? 'Add Skill'
                : 'Add Item';
            if (tab !== 'messages') {
                addBtn.innerHTML += ' <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:8px"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
            }
        }

        try {
            switch (tab) {
                case 'projects':
                    this.pageTitle.textContent = 'Manage Projects';
                    this.dataStore = await window.adminApi.getProjects();
                    this.updateMetrics();
                    this.renderCurrentList();
                    break;
                case 'blog':
                    this.pageTitle.textContent = 'Manage Blog Posts';
                    this.dataStore = await window.adminApi.getBlogs();
                    this.updateMetrics();
                    this.renderCurrentList();
                    break;
                case 'certifications':
                    this.pageTitle.textContent = 'Manage Certifications';
                    this.dataStore = await window.adminApi.getCertifications();
                    this.updateMetrics();
                    this.renderCurrentList();
                    break;
                case 'skills':
                    this.pageTitle.textContent = 'Manage Skills';
                    this.dataStore = await window.adminApi.getSkills();
                    this.updateMetrics();
                    this.renderCurrentList();
                    break;
                case 'messages':
                    this.pageTitle.textContent = 'Contact Messages';
                    this.dataStore = await window.adminApi.getMessages();
                    this.updateMetrics();
                    this.renderCurrentList();
                    break;
            }
        } catch (error) {
            this.contentArea.innerHTML = `<div class="admin-empty-state"><div><strong>Could not load content</strong><p>Check the backend API and try again.</p></div></div>`;
        }
    },

    updateMetrics() {
        const total = this.dataStore.length;
        const featured = this.currentTab === 'projects'
            ? this.dataStore.filter(item => item.is_featured).length
            : 0;
        const drafts = this.currentTab === 'blog'
            ? this.dataStore.filter(item => !item.is_published).length
            : this.currentTab === 'projects'
                ? this.dataStore.filter(item => !item.live_url).length
                : this.currentTab === 'certifications'
                    ? this.dataStore.filter(item => !item.certificate_url).length
                    : 0;

        if (this.metrics.count) this.metrics.count.textContent = total;
        if (this.metrics.featured) this.metrics.featured.textContent = featured;
        if (this.metrics.drafts) this.metrics.drafts.textContent = drafts;
    },

    getFilteredData() {
        const query = (this.searchInput?.value || '').trim().toLowerCase();
        if (!query) return this.dataStore;

        return this.dataStore.filter(item => JSON.stringify(item).toLowerCase().includes(query));
    },

    renderCurrentList() {
        const data = this.getFilteredData();
        const count = data.length;
        if (this.toolbarHint) {
            this.toolbarHint.textContent = this.searchInput?.value ? `${count} matching item${count === 1 ? '' : 's'}` : 'No filters applied.';
        }

        if (!count) {
            this.contentArea.innerHTML = `<div class="admin-empty-state"><div><strong>No items found</strong><p>${this.searchInput?.value ? 'Try a different search term.' : 'Add your first item using the button above.'}</p></div></div>`;
            return;
        }

        switch (this.currentTab) {
            case 'projects':
                this.contentArea.innerHTML = this.renderProjectsTable(data);
                break;
            case 'blog':
                this.contentArea.innerHTML = this.renderBlogsTable(data);
                break;
            case 'certifications':
                this.contentArea.innerHTML = this.renderCertificationsTable(data);
                break;
            case 'skills':
                this.contentArea.innerHTML = this.renderSkillsTable(data);
                break;
            case 'messages':
                this.contentArea.innerHTML = this.renderMessagesTable(data);
                break;
        }
    },

    renderProjectsTable(data) {
        let html = '<table class="admin-table"><thead><tr><th>Title</th><th>Demo URL</th><th>GitHub</th><th>Featured</th><th>Actions</th></tr></thead><tbody>';
        data.forEach(item => {
            html += `<tr>
                <td data-label="Title"><strong>${item.icon_emoji} ${item.title}</strong><div class="admin-pill is-muted">Order ${item.display_order ?? 0}</div></td>
                <td data-label="Demo URL">${item.live_url ? '<a href="' + item.live_url + '" target="_blank" rel="noopener noreferrer" style="color:var(--accent-secondary)">Open</a>' : '<span class="admin-pill is-muted">None</span>'}</td>
                <td data-label="GitHub">${item.github_url ? '<a href="' + item.github_url + '" target="_blank" rel="noopener noreferrer" style="color:var(--accent-secondary)">Open</a>' : '<span class="admin-pill is-muted">None</span>'}</td>
                <td data-label="Featured">${item.is_featured ? '<span class="admin-pill">Featured</span>' : '<span class="admin-pill is-muted">No</span>'}</td>
                <td data-label="Actions"><button class="action-btn delete" onclick="adminApp.deleteItem('projects', ${item.id})">Delete</button></td>
            </tr>`;
        });
        html += '</tbody></table>';
        return html;
    },

    renderBlogsTable(data) {
        let html = '<table class="admin-table"><thead><tr><th>Title</th><th>Category</th><th>Published Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        data.forEach(item => {
            html += `<tr>
                <td data-label="Title"><strong>${item.title}</strong></td>
                <td data-label="Category">${item.category}</td>
                <td data-label="Published Date">${item.published_date}</td>
                <td data-label="Status">${item.is_published ? '<span class="admin-pill">Published</span>' : '<span class="admin-pill is-muted">Draft</span>'}</td>
                <td data-label="Actions"><button class="action-btn delete" onclick="adminApp.deleteItem('blog', ${item.id})">Delete</button></td>
            </tr>`;
        });
        html += '</tbody></table>';
        return html;
    },

    renderCertificationsTable(data) {
        let html = '<table class="admin-table"><thead><tr><th>Title</th><th>Issuer</th><th>Year</th><th>Document</th><th>Actions</th></tr></thead><tbody>';
        data.forEach(item => {
            const certificateUrl = item.certificate_url
                ? (/^https?:\/\//i.test(item.certificate_url) ? item.certificate_url : item.certificate_url.replace(/^\//, '').startsWith('uploads/') ? `https://srijan-portfolio-api.azurewebsites.net/${item.certificate_url.replace(/^\//, '')}` : `../${item.certificate_url.replace(/^\//, '')}`)
                : '';
            html += `<tr>
                <td data-label="Title"><strong>${item.icon_emoji} ${item.title}</strong></td>
                <td data-label="Issuer">${item.issuer}</td>
                <td data-label="Year">${item.year}</td>
                <td data-label="Document">${certificateUrl ? '<a href="' + certificateUrl + '" target="_blank" rel="noopener noreferrer" style="color:var(--accent-secondary)">Open PDF</a>' : '<span class="admin-pill is-muted">Missing</span>'}</td>
                <td data-label="Actions"><button class="action-btn delete" onclick="adminApp.deleteItem('certifications', ${item.id})">Delete</button></td>
            </tr>`;
        });
        html += '</tbody></table>';
        return html;
    },

    renderSkillsTable(data) {
        let html = '<table class="admin-table"><thead><tr><th>Name</th><th>Category</th><th>Proficiency</th><th>Actions</th></tr></thead><tbody>';
        data.forEach(item => {
            html += `<tr>
                <td data-label="Name"><strong>${item.name}</strong></td>
                <td data-label="Category">${item.category}</td>
                <td data-label="Proficiency">${item.proficiency_percent}%</td>
                <td data-label="Actions"><button class="action-btn delete" onclick="adminApp.deleteItem('skills', ${item.id})">Delete</button></td>
            </tr>`;
        });
        html += '</tbody></table>';
        return html;
    },

    renderMessagesTable(data) {
        let html = '<table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Actions</th></tr></thead><tbody>';
        data.forEach(item => {
            html += `<tr>
                <td data-label="Name"><strong>${item.name}</strong></td>
                <td data-label="Email"><a href="mailto:${item.email}" style="color:var(--accent-secondary)">${item.email}</a></td>
                <td data-label="Subject">${item.subject}</td>
                <td data-label="Message">${item.message}</td>
                <td data-label="Actions"><button class="action-btn delete" onclick="adminApp.deleteItem('messages', ${item.id})">Delete</button></td>
            </tr>`;
        });
        html += '</tbody></table>';
        return html;
    },

    async deleteItem(type, id) {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            switch (type) {
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
        let html = `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1rem;"><div><span class="section-subtitle">Create item</span><h3 style="margin-bottom: 0.35rem;">${this.currentTab === 'projects' ? 'Add New Project' : this.currentTab === 'certifications' ? 'Add New Certification' : this.currentTab === 'blog' ? 'Add New Blog Post' : this.currentTab === 'skills' ? 'Add New Skill' : 'Add New Item'}</h3><p style="margin:0;color:var(--text-muted);">Save content here and it will show on the public portfolio without any code changes.</p></div><button type="button" class="action-btn" onclick="document.getElementById('form-container').style.display='none'">Close</button></div>`;

        // Input style helper
        const inputStyle = `width: 100%; border: 1px solid var(--bg-glass-border); padding: 12px 14px; background: rgba(255,255,255,0.9); color: var(--text-primary); border-radius: 12px; margin-bottom: 1rem;`;

        switch (this.currentTab) {
            case 'projects':
                html += `
                <form onsubmit="event.preventDefault(); adminApp.submitForm('projects')">
                    <div style="display:grid; grid-template-columns: 1.2fr 0.8fr; gap: 1rem;">
                    <input type="text" id="f_title" placeholder="Project Title" style="${inputStyle}" required>
                    <input type="number" id="f_order" placeholder="Display Order" style="${inputStyle}" value="0">
                    </div>
                    <textarea id="f_desc" rows="3" placeholder="Description" style="${inputStyle}" required></textarea>
                    <input type="text" id="f_tags" placeholder="Tags (comma separated e.g., HTML, CSS)" style="${inputStyle}">
                    <div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem;">
                    <input type="url" id="f_live" placeholder="Live Demo URL (optional)" style="${inputStyle}">
                    <input type="url" id="f_github" placeholder="GitHub URL (optional)" style="${inputStyle}">
                    </div>
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
                    <div style="display:grid; grid-template-columns: 1.1fr 0.9fr; gap: 1rem;">
                    <input type="text" id="f_title" placeholder="Certification Title" style="${inputStyle}" required>
                    <input type="text" id="f_year" placeholder="Year" style="${inputStyle}" required>
                    </div>
                    <input type="text" id="f_issuer" placeholder="Issuer (e.g., Coursera)" style="${inputStyle}" required>
                    <textarea id="f_desc" rows="3" placeholder="Description" style="${inputStyle}" required></textarea>
                    <div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem;">
                        <input type="text" id="f_icon" placeholder="Emoji (e.g. 📜)" style="${inputStyle}" value="📜">
                        <input type="number" id="f_order" placeholder="Display Order" style="${inputStyle}" value="0">
                    </div>
                    <div class="upload-row">
                        <input type="file" id="f_file" class="admin-file-input" accept="application/pdf">
                        <div class="file-chip" id="file-chip">No PDF selected</div>
                    </div>
                    <input type="url" id="f_url" placeholder="Certificate URL (optional, for external links)" style="${inputStyle}">
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
            switch (type) {
                case 'projects':
                    data = {
                        title: document.getElementById('f_title').value,
                        description: document.getElementById('f_desc').value,
                        tags: document.getElementById('f_tags').value.split(',').map(s => s.trim()).filter(s => s),
                        live_url: document.getElementById('f_live').value || null,
                        github_url: document.getElementById('f_github').value || null,
                        icon_emoji: document.getElementById('f_icon').value || "🚀",
                        display_order: parseInt(document.getElementById('f_order').value || '0', 10),
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
                    let certificateUrl = document.getElementById('f_url').value || null;
                    const certificateFile = document.getElementById('f_file').files[0];
                    if (certificateFile) {
                        const uploadResult = await window.adminApi.uploadCertificationPdf(certificateFile);
                        certificateUrl = uploadResult.certificate_url;
                    }

                    data = {
                        title: document.getElementById('f_title').value,
                        issuer: document.getElementById('f_issuer').value,
                        year: document.getElementById('f_year').value,
                        description: document.getElementById('f_desc').value,
                        icon_emoji: document.getElementById('f_icon').value || "📜",
                        certificate_url: certificateUrl,
                        display_order: parseInt(document.getElementById('f_order').value || '0', 10)
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
