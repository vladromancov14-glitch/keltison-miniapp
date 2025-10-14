// KЁLTISON Admin Panel JavaScript

// Global variables
let currentAdmin = null;
let currentToken = null;
let currentSection = 'dashboard';
let editingItem = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
        currentToken = savedToken;
        showAdminDashboard();
    } else {
        showLoginScreen();
    }
    
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            switchSection(section);
        });
    });
    
    // Modal form
    const modalForm = document.getElementById('modalForm');
    if (modalForm) {
        modalForm.addEventListener('submit', handleModalSubmit);
    }
    
    // File upload
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Drag and drop for file upload
    const uploadArea = document.querySelector('.file-upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('click', () => fileInput.click());
    }
}

// Login handling
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showError('Заполните все поля');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentToken = data.token;
            currentAdmin = data.admin;
            
            localStorage.setItem('admin_token', currentToken);
            showAdminDashboard();
        } else {
            const error = await response.json();
            showError(error.error || 'Ошибка входа');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Ошибка подключения к серверу');
    } finally {
        showLoading(false);
    }
}

// Show login screen
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
}

// Show admin dashboard
function showAdminDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    
    // Update admin info
    if (currentAdmin) {
        document.getElementById('adminUserInfo').textContent = 
            `Администратор: ${currentAdmin.username}`;
    }
    
    // Load dashboard data
    loadDashboardData();
}

// Logout
function logout() {
    currentToken = null;
    currentAdmin = null;
    localStorage.removeItem('admin_token');
    showLoginScreen();
}

// Switch section
function switchSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}Section`).classList.add('active');
    
    currentSection = section;
    
    // Load section data
    switch (section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'brands':
            loadBrands();
            break;
        case 'models':
            loadModels();
            break;
        case 'problems':
            loadProblems();
            break;
        case 'instructions':
            loadInstructions();
            break;
        case 'partners':
            loadPartners();
            break;
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await apiCall('/api/admin/stats');
        
        if (response.ok) {
            const stats = await response.json();
            displayStats(stats);
        }
    } catch (error) {
        console.error('Load dashboard error:', error);
    }
}

// Display stats
function displayStats(stats) {
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${stats.users}</div>
            <div class="stat-label">Пользователи</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.categories}</div>
            <div class="stat-label">Категории</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.brands}</div>
            <div class="stat-label">Бренды</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.models}</div>
            <div class="stat-label">Модели</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.problems}</div>
            <div class="stat-label">Проблемы</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.instructions}</div>
            <div class="stat-label">Инструкции</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.partners}</div>
            <div class="stat-label">Партнеры</div>
        </div>
    `;
}

// Load categories
async function loadCategories() {
    try {
        const response = await apiCall('/api/admin/categories');
        
        if (response.ok) {
            const categories = await response.json();
            displayCategories(categories);
        }
    } catch (error) {
        console.error('Load categories error:', error);
    }
}

// Display categories
function displayCategories(categories) {
    const tbody = document.querySelector('#categoriesTable tbody');
    tbody.innerHTML = '';
    
    categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${category.icon || '-'}</td>
            <td>${category.description || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editItem('category', ${category.id})">✏️</button>
                    <button class="btn-delete" onclick="deleteItem('category', ${category.id})">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load brands
async function loadBrands() {
    try {
        const response = await apiCall('/api/admin/brands');
        
        if (response.ok) {
            const brands = await response.json();
            displayBrands(brands);
        }
    } catch (error) {
        console.error('Load brands error:', error);
    }
}

// Display brands
function displayBrands(brands) {
    const tbody = document.querySelector('#brandsTable tbody');
    tbody.innerHTML = '';
    
    brands.forEach(brand => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${brand.id}</td>
            <td>${brand.name}</td>
            <td>${brand.logo_url ? `<img src="${brand.logo_url}" alt="${brand.name}" style="height: 30px;">` : '-'}</td>
            <td>${brand.website ? `<a href="${brand.website}" target="_blank">${brand.website}</a>` : '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editItem('brand', ${brand.id})">✏️</button>
                    <button class="btn-delete" onclick="deleteItem('brand', ${brand.id})">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load models
async function loadModels() {
    try {
        const response = await apiCall('/api/admin/models');
        
        if (response.ok) {
            const models = await response.json();
            displayModels(models);
        }
    } catch (error) {
        console.error('Load models error:', error);
    }
}

// Display models
function displayModels(models) {
    const tbody = document.querySelector('#modelsTable tbody');
    tbody.innerHTML = '';
    
    models.forEach(model => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${model.id}</td>
            <td>${model.name}</td>
            <td>${model.brand_name}</td>
            <td>${model.category_name}</td>
            <td>${model.description || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editItem('model', ${model.id})">✏️</button>
                    <button class="btn-delete" onclick="deleteItem('model', ${model.id})">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load problems
async function loadProblems() {
    try {
        const response = await apiCall('/api/admin/problems');
        
        if (response.ok) {
            const problems = await response.json();
            displayProblems(problems);
        }
    } catch (error) {
        console.error('Load problems error:', error);
    }
}

// Display problems
function displayProblems(problems) {
    const tbody = document.querySelector('#problemsTable tbody');
    tbody.innerHTML = '';
    
    problems.forEach(problem => {
        const severityColors = {
            low: '#27ae60',
            medium: '#f39c12',
            high: '#e74c3c',
            critical: '#8e44ad'
        };
        
        const severityTexts = {
            low: 'Легкая',
            medium: 'Средняя',
            high: 'Серьезная',
            critical: 'Критическая'
        };
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${problem.id}</td>
            <td>${problem.name}</td>
            <td>${problem.category_name}</td>
            <td><span style="color: ${severityColors[problem.severity]}; font-weight: 600;">${severityTexts[problem.severity]}</span></td>
            <td>${problem.description || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editItem('problem', ${problem.id})">✏️</button>
                    <button class="btn-delete" onclick="deleteItem('problem', ${problem.id})">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load instructions
async function loadInstructions() {
    try {
        const response = await apiCall('/api/admin/instructions');
        
        if (response.ok) {
            const instructions = await response.json();
            displayInstructions(instructions);
        }
    } catch (error) {
        console.error('Load instructions error:', error);
    }
}

// Display instructions
function displayInstructions(instructions) {
    const tbody = document.querySelector('#instructionsTable tbody');
    tbody.innerHTML = '';
    
    instructions.forEach(instruction => {
        const difficultyColors = {
            easy: '#27ae60',
            medium: '#f39c12',
            hard: '#e74c3c',
            expert: '#8e44ad'
        };
        
        const difficultyTexts = {
            easy: 'Легко',
            medium: 'Средне',
            hard: 'Сложно',
            expert: 'Эксперт'
        };
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${instruction.id}</td>
            <td>${instruction.title}</td>
            <td>${instruction.brand_name} ${instruction.model_name}</td>
            <td>${instruction.problem_name}</td>
            <td><span style="color: ${difficultyColors[instruction.difficulty]}; font-weight: 600;">${difficultyTexts[instruction.difficulty]}</span></td>
            <td>${instruction.is_pro_pretent ? '<span class="status-badge status-pro">PRO</span>' : '<span class="status-badge status-free">Free</span>'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-view" onclick="viewInstruction(${instruction.id})">👁️</button>
                    <button class="btn-edit" onclick="editItem('instruction', ${instruction.id})">✏️</button>
                    <button class="btn-delete" onclick="deleteItem('instruction', ${instruction.id})">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load partners
async function loadPartners() {
    try {
        const response = await apiCall('/api/admin/partners');
        
        if (response.ok) {
            const partners = await response.json();
            displayPartners(partners);
        }
    } catch (error) {
        console.error('Load partners error:', error);
    }
}

// Display partners
function displayPartners(partners) {
    const tbody = document.querySelector('#partnersTable tbody');
    tbody.innerHTML = '';
    
    partners.forEach(partner => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${partner.id}</td>
            <td>${partner.name}</td>
            <td>${partner.website ? `<a href="${partner.website}" target="_blank">${partner.website}</a>` : '-'}</td>
            <td>${partner.is_active ? '<span class="status-badge status-active">Активен</span>' : '<span class="status-badge status-inactive">Неактивен</span>'}</td>
            <td>${partner.description || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editItem('partner', ${partner.id})">✏️</button>
                    <button class="btn-delete" onclick="deleteItem('partner', ${partner.id})">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Show add modal
function showAddModal(type) {
    editingItem = null;
    showModal(type, 'add');
}

// Show edit modal
async function editItem(type, id) {
    try {
        showLoading(true);
        
        const response = await apiCall(`/api/admin/${type}s/${id}`);
        
        if (response.ok) {
            const item = await response.json();
            editingItem = item;
            showModal(type, 'edit');
        } else {
            showError('Ошибка загрузки данных');
        }
    } catch (error) {
        console.error('Edit item error:', error);
        showError('Ошибка загрузки данных');
    } finally {
        showLoading(false);
    }
}

// Show modal
function showModal(type, action) {
    const modal = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalForm = document.getElementById('modalForm');
    
    const titles = {
        add: {
            category: 'Добавить категорию',
            brand: 'Добавить бренд',
            model: 'Добавить модель',
            problem: 'Добавить проблему',
            instruction: 'Добавить инструкцию',
            partner: 'Добавить партнера'
        },
        edit: {
            category: 'Редактировать категорию',
            brand: 'Редактировать бренд',
            model: 'Редактировать модель',
            problem: 'Редактировать проблему',
            instruction: 'Редактировать инструкцию',
            partner: 'Редактировать партнера'
        }
    };
    
    modalTitle.textContent = titles[action][type];
    modalForm.innerHTML = generateFormHTML(type, editingItem);
    
    modal.style.display = 'flex';
}

// Generate form HTML
function generateFormHTML(type, item = null) {
    const forms = {
        category: `
            <div class="form-group">
                <label for="name">Название *</label>
                <input type="text" id="name" name="name" value="${item?.name || ''}" required>
            </div>
            <div class="form-group">
                <label for="icon">Иконка</label>
                <input type="text" id="icon" name="icon" value="${item?.icon || ''}" placeholder="📱">
                <small>Эмодзи для отображения категории</small>
            </div>
            <div class="form-group">
                <label for="description">Описание</label>
                <textarea id="description" name="description">${item?.description || ''}</textarea>
            </div>
        `,
        
        brand: `
            <div class="form-group">
                <label for="name">Название *</label>
                <input type="text" id="name" name="name" value="${item?.name || ''}" required>
            </div>
            <div class="form-group">
                <label for="logo_url">URL логотипа</label>
                <input type="url" id="logo_url" name="logo_url" value="${item?.logo_url || ''}">
            </div>
            <div class="form-group">
                <label for="website">Сайт</label>
                <input type="url" id="website" name="website" value="${item?.website || ''}">
            </div>
        `,
        
        model: `
            <div class="form-group">
                <label for="name">Название *</label>
                <input type="text" id="name" name="name" value="${item?.name || ''}" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="brand_id">Бренд *</label>
                    <select id="brand_id" name="brand_id" required>
                        <option value="">Выберите бренд</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="category_id">Категория *</label>
                    <select id="category_id" name="category_id" required>
                        <option value="">Выберите категорию</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="description">Описание</label>
                <textarea id="description" name="description">${item?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="image_url">URL изображения</label>
                <input type="url" id="image_url" name="image_url" value="${item?.image_url || ''}">
            </div>
        `,
        
        problem: `
            <div class="form-group">
                <label for="name">Название *</label>
                <input type="text" id="name" name="name" value="${item?.name || ''}" required>
            </div>
            <div class="form-group">
                <label for="category_id">Категория *</label>
                <select id="category_id" name="category_id" required>
                    <option value="">Выберите категорию</option>
                </select>
            </div>
            <div class="form-group">
                <label for="severity">Серьезность *</label>
                <select id="severity" name="severity" required>
                    <option value="low" ${item?.severity === 'low' ? 'selected' : ''}>Легкая</option>
                    <option value="medium" ${item?.severity === 'medium' ? 'selected' : ''}>Средняя</option>
                    <option value="high" ${item?.severity === 'high' ? 'selected' : ''}>Серьезная</option>
                    <option value="critical" ${item?.severity === 'critical' ? 'selected' : ''}>Критическая</option>
                </select>
            </div>
            <div class="form-group">
                <label for="description">Описание</label>
                <textarea id="description" name="description">${item?.description || ''}</textarea>
            </div>
        `,
        
        instruction: `
            <div class="form-group">
                <label for="title">Название *</label>
                <input type="text" id="title" name="title" value="${item?.title || ''}" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="model_id">Модель *</label>
                    <select id="model_id" name="model_id" required>
                        <option value="">Выберите модель</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="problem_id">Проблема *</label>
                    <select id="problem_id" name="problem_id" required>
                        <option value="">Выберите проблему</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="description">Описание</label>
                <textarea id="description" name="description">${item?.description || ''}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="difficulty">Сложность *</label>
                    <select id="difficulty" name="difficulty" required>
                        <option value="easy" ${item?.difficulty === 'easy' ? 'selected' : ''}>Легко</option>
                        <option value="medium" ${item?.difficulty === 'medium' ? 'selected' : ''}>Средне</option>
                        <option value="hard" ${item?.difficulty === 'hard' ? 'selected' : ''}>Сложно</option>
                        <option value="expert" ${item?.difficulty === 'expert' ? 'selected' : ''}>Эксперт</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="estimated_time">Примерное время</label>
                    <input type="text" id="estimated_time" name="estimated_time" value="${item?.estimated_time || ''}" placeholder="1-2 часа">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="cost_estimate">Примерная стоимость (₽)</label>
                    <input type="number" id="cost_estimate" name="cost_estimate" value="${item?.cost_estimate || ''}" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="is_pro_pretent" name="is_pro_pretent" ${item?.is_pro_pretent ? 'checked' : ''}>
                        PRO-контент
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label for="tools_required">Инструменты (через запятую)</label>
                <textarea id="tools_required" name="tools_required">${item?.tools_required ? item.tools_required.join(', ') : ''}</textarea>
            </div>
            <div class="form-group">
                <label for="parts_required">Запчасти (через запятую)</label>
                <textarea id="parts_required" name="parts_required">${item?.parts_required ? item.parts_required.join(', ') : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Файлы (изображения и видео)</label>
                <button type="button" class="btn-secondary" onclick="showFileUpload()">Загрузить файлы</button>
                <div id="uploadedFiles" class="uploaded-files"></div>
            </div>
        `,
        
        partner: `
            <div class="form-group">
                <label for="name">Название *</label>
                <input type="text" id="name" name="name" value="${item?.name || ''}" required>
            </div>
            <div class="form-group">
                <label for="website">Сайт</label>
                <input type="url" id="website" name="website" value="${item?.website || ''}">
            </div>
            <div class="form-group">
                <label for="logo_url">URL логотипа</label>
                <input type="url" id="logo_url" name="logo_url" value="${item?.logo_url || ''}">
            </div>
            <div class="form-group">
                <label for="description">Описание</label>
                <textarea id="description" name="description">${item?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="is_active" name="is_active" ${item?.is_active !== false ? 'checked' : ''}>
                    Активен
                </label>
            </div>
        `
    };
    
    return forms[type] || '';
}

// Load dependent data for forms
async function loadFormDependencies(type) {
    if (type === 'model' || type === 'instruction') {
        // Load brands
        try {
            const brandsResponse = await apiCall('/api/admin/brands');
            if (brandsResponse.ok) {
                const brands = await brandsResponse.json();
                const brandSelect = document.getElementById('brand_id');
                if (brandSelect) {
                    brandSelect.innerHTML = '<option value="">Выберите бренд</option>' +
                        brands.map(brand => `<option value="${brand.id}" ${editingItem?.brand_id === brand.id ? 'selected' : ''}>${brand.name}</option>`).join('');
                }
            }
        } catch (error) {
            console.error('Load brands error:', error);
        }
        
        // Load categories
        try {
            const categoriesResponse = await apiCall('/api/admin/categories');
            if (categoriesResponse.ok) {
                const categories = await categoriesResponse.json();
                const categorySelect = document.getElementById('category_id');
                if (categorySelect) {
                    categorySelect.innerHTML = '<option value="">Выберите категорию</option>' +
                        categories.map(category => `<option value="${category.id}" ${editingItem?.category_id === category.id ? 'selected' : ''}>${category.name}</option>`).join('');
                }
            }
        } catch (error) {
            console.error('Load categories error:', error);
        }
    }
    
    if (type === 'problem') {
        // Load categories
        try {
            const categoriesResponse = await apiCall('/api/admin/categories');
            if (categoriesResponse.ok) {
                const categories = await categoriesResponse.json();
                const categorySelect = document.getElementById('category_id');
                if (categorySelect) {
                    categorySelect.innerHTML = '<option value="">Выберите категорию</option>' +
                        categories.map(category => `<option value="${category.id}" ${editingItem?.category_id === category.id ? 'selected' : ''}>${category.name}</option>`).join('');
                }
            }
        } catch (error) {
            console.error('Load categories error:', error);
        }
    }
    
    if (type === 'instruction') {
        // Load problems
        try {
            const problemsResponse = await apiCall('/api/admin/problems');
            if (problemsResponse.ok) {
                const problems = await problemsResponse.json();
                const problemSelect = document.getElementById('problem_id');
                if (problemSelect) {
                    problemSelect.innerHTML = '<option value="">Выберите проблему</option>' +
                        problems.map(problem => `<option value="${problem.id}" ${editingItem?.problem_id === problem.id ? 'selected' : ''}>${problem.name}</option>`).join('');
                }
            }
        } catch (error) {
            console.error('Load problems error:', error);
        }
    }
}

// Handle modal submit
async function handleModalSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Convert checkbox values
    if (data.is_pro_pretent) data.is_pro_pretent = 'true';
    if (data.is_active) data.is_active = 'true';
    
    // Convert arrays
    if (data.tools_required) {
        data.tools_required = data.tools_required.split(',').map(t => t.trim()).filter(t => t);
    }
    if (data.parts_required) {
        data.parts_required = data.parts_required.split(',').map(p => p.trim()).filter(p => p);
    }
    
    try {
        showLoading(true);
        
        let response;
        if (editingItem) {
            // Edit existing item
            response = await apiCall(`/api/admin/${currentSection}/${editingItem.id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } else {
            // Create new item
            response = await apiCall(`/api/admin/${currentSection}`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        }
        
        if (response.ok) {
            closeModal();
            switchSection(currentSection); // Reload current section
            showSuccess(editingItem ? 'Элемент обновлен' : 'Элемент создан');
        } else {
            const error = await response.json();
            showError(error.error || 'Ошибка сохранения');
        }
    } catch (error) {
        console.error('Modal submit error:', error);
        showError('Ошибка сохранения данных');
    } finally {
        showLoading(false);
    }
}

// Delete item
async function deleteItem(type, id) {
    if (!confirm('Вы уверены, что хотите удалить этот элемент?')) {
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await apiCall(`/api/admin/${type}s/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            switchSection(currentSection); // Reload current section
            showSuccess('Элемент удален');
        } else {
            const error = await response.json();
            showError(error.error || 'Ошибка удаления');
        }
    } catch (error) {
        console.error('Delete item error:', error);
        showError('Ошибка удаления данных');
    } finally {
        showLoading(false);
    }
}

// View instruction
function viewInstruction(id) {
    // Open instruction in new tab or show in modal
    window.open(`/api/instructions/${id}`, '_blank');
}

// File upload functions
function showFileUpload() {
    document.getElementById('fileUploadModal').style.display = 'flex';
}

function closeFileUploadModal() {
    document.getElementById('fileUploadModal').style.display = 'none';
    document.getElementById('fileInput').value = '';
    document.getElementById('filePreview').innerHTML = '';
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    displayFilePreviews(files);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    displayFilePreviews(files);
}

function displayFilePreviews(files) {
    const preview = document.getElementById('filePreview');
    preview.innerHTML = '';
    
    files.forEach(file => {
        const previewItem = document.createElement('div');
        previewItem.className = 'file-preview-item';
        
        if (file.type.startsWith('image/')) {
            previewItem.innerHTML = `
                <img src="${URL.createObjectURL(file)}" alt="${file.name}">
                <div class="file-name">${file.name}</div>
            `;
        } else if (file.type.startsWith('video/')) {
            previewItem.innerHTML = `
                <video src="${URL.createObjectURL(file)}" controls></video>
                <div class="file-name">${file.name}</div>
            `;
        }
        
        preview.appendChild(previewItem);
    });
}

function confirmFileUpload() {
    // This would handle the actual file upload
    // For now, just close the modal
    closeFileUploadModal();
    showSuccess('Файлы загружены');
}

// Modal functions
function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    editingItem = null;
}

// Utility functions
function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// API call helper
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
        }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    if (finalOptions.body && typeof finalOptions.body === 'object' && !(finalOptions.body instanceof FormData)) {
        finalOptions.body = JSON.stringify(finalOptions.body);
    }
    
    return fetch(endpoint, finalOptions);
}

// Load form dependencies when modal is shown
document.addEventListener('DOMContentLoaded', function() {
    const modalObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const modal = document.getElementById('modalOverlay');
                if (modal.style.display === 'flex') {
                    const formType = document.querySelector('.modal-header h3').textContent.toLowerCase();
                    if (formType.includes('модель')) loadFormDependencies('model');
                    else if (formType.includes('проблем')) loadFormDependencies('problem');
                    else if (formType.includes('инструкц')) loadFormDependencies('instruction');
                }
            }
        });
    });
    
    modalObserver.observe(document.getElementById('modalOverlay'), {
        attributes: true,
        attributeFilter: ['style']
    });
});
