// KЁLTISON Mini App JavaScript

// Global variables
let tg = null;
let currentUser = null;
let currentSession = null;
let navigationStack = [];
let currentContext = {
    category: null,
    brand: null,
    model: null,
    problem: null
};

// Initialize Telegram WebApp
document.addEventListener('DOMContentLoaded', function() {
    // Check if running in Telegram WebApp
    if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
        tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Initialize user
        initUser();
        
        // Set theme
        document.body.style.backgroundColor = tg.themeParams.bg_color || '#ffffff';
        document.body.style.color = tg.themeParams.text_color || '#000000';
    } else {
        // Development mode
        console.log('Running in development mode');
        initUser();
    }
    
    // Initialize app
    initializeApp();
});

// Initialize user
async function initUser() {
    try {
        let initData = '';
        
        if (tg && tg.initData) {
            initData = tg.initData;
        } else {
            // Development mode - create mock initData
            initData = 'user=' + encodeURIComponent(JSON.stringify({
                id: 123456789,
                first_name: 'Test',
                last_name: 'User',
                username: 'testuser',
                language_code: 'ru'
            }));
        }
        
        const response = await fetch('/api/auth/webapp-init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ initData })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            currentSession = data.token;
            
            // Устанавливаем админские права для тестового пользователя
            if (currentUser && currentUser.username === 'testuser') {
                currentUser.is_admin = true;
            }
            
            // Update UI
            updateUserInfo();
            
            // Store token for API calls
            localStorage.setItem('keltison_token', currentSession);
        } else {
            console.error('Failed to initialize user');
            showError('Ошибка инициализации пользователя');
        }
    } catch (error) {
        console.error('Init user error:', error);
        showError('Ошибка подключения к серверу');
    }
}

// Update user info in header
function updateUserInfo() {
    if (currentUser) {
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const subscriptionBadge = document.getElementById('subscriptionBadge');
        
        userName.textContent = currentUser.first_name || 'Пользователь';
        
        // Check subscription
        if (currentUser.is_premium) {
            subscriptionBadge.textContent = 'PRO';
            subscriptionBadge.style.display = 'block';
        } else {
            subscriptionBadge.style.display = 'none';
        }
        
        userInfo.style.display = 'block';
        
        // Показываем/скрываем кнопку админ-панели
        toggleAdminButton();
    }
}

// Initialize app
function initializeApp() {
    console.log('Initializing app...');
    
    try {
        // Set up event listeners
        setupEventListeners();
        
        // Initialize navigation stack
        navigationStack = ['welcomeScreen'];
        
        // Show welcome screen
        showScreen('welcomeScreen');
        
        // Update welcome message
        if (currentUser) {
            const welcomeElement = document.getElementById('welcomeMessage');
            if (welcomeElement) {
                welcomeElement.textContent = 
                    `Привет, ${currentUser.first_name}! Выберите тип устройства для ремонта:`;
            }
        }
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    try {
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const categoryId = this.dataset.category;
                console.log('Category selected:', categoryId);
                selectCategory(categoryId);
            });
        });
        
        // Brand buttons
        document.querySelectorAll('.brand-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const brandId = this.dataset.brand;
                console.log('Brand selected:', brandId);
                selectBrand(brandId);
            });
        });
        
        // Model buttons
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const modelId = this.dataset.model;
                console.log('Model selected:', modelId);
                selectModel(modelId);
            });
        });
        
        // Problem buttons
        document.querySelectorAll('.problem-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const problemId = this.dataset.problem;
                console.log('Problem selected:', problemId);
                selectProblem(problemId);
            });
        });
        
        // Chat input
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendMessageBtn');
        
        if (chatInput) {
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', sendChatMessage);
        }
        
        console.log('Event listeners set up successfully');
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// Navigation functions
function showScreen(screenId) {
    console.log('showScreen called with:', screenId);
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
        console.log('Showing screen:', screenId);
        
        // Update navigation stack
        if (navigationStack.length === 0 || navigationStack[navigationStack.length - 1] !== screenId) {
            navigationStack.push(screenId);
        }
        console.log('Navigation stack:', navigationStack);
    } else {
        console.error('Screen not found:', screenId);
        // Fallback to welcome screen
        showScreen('welcomeScreen');
    }
}

// Make showScreen globally available
window.showScreen = showScreen;

function goBack() {
    console.log('goBack called, navigationStack:', navigationStack);
    
    if (navigationStack.length > 1) {
        navigationStack.pop(); // Remove current screen
        const previousScreen = navigationStack[navigationStack.length - 1];
        console.log('Going back to:', previousScreen);
        
        // Сбрасываем контекст в зависимости от экрана
        if (previousScreen === 'welcomeScreen') {
            // Возвращаемся на главный экран - сбрасываем весь контекст
            currentContext = {
                category: null,
                brand: null,
                model: null,
                problem: null
            };
            console.log('🔄 Context reset to welcome screen');
            
            // Очищаем URL параметры
            const url = new URL(window.location);
            url.search = '';
            window.history.pushState({}, '', url);
            
        } else if (previousScreen === 'brandsScreen') {
            // Возвращаемся к выбору брендов - сбрасываем brand, model, problem
            currentContext.brand = null;
            currentContext.model = null;
            currentContext.problem = null;
            console.log('🔄 Context reset to brands screen, category:', currentContext.category);
            
            // Обновляем URL с правильным category_id
            const url = new URL(window.location);
            url.searchParams.set('category_id', currentContext.category);
            window.history.pushState({}, '', url);
            
        } else if (previousScreen === 'modelsScreen') {
            // Возвращаемся к выбору моделей - сбрасываем model, problem
            currentContext.model = null;
            currentContext.problem = null;
            console.log('🔄 Context reset to models screen, category:', currentContext.category, 'brand:', currentContext.brand);
            
            // Обновляем URL с правильными параметрами
            const url = new URL(window.location);
            url.searchParams.set('category_id', currentContext.category);
            url.searchParams.set('brand_id', currentContext.brand);
            window.history.pushState({}, '', url);
        }
        
        showScreen(previousScreen);
    } else {
        console.log('Going to welcome screen');
        // Сбрасываем весь контекст при возврате на главный экран
        currentContext = {
            category: null,
            brand: null,
            model: null,
            problem: null
        };
        console.log('🔄 Full context reset to welcome screen');
        
        // Очищаем URL параметры
        const url = new URL(window.location);
        url.search = '';
        window.history.pushState({}, '', url);
        
        showScreen('welcomeScreen');
    }
}

// Make goBack globally available
window.goBack = goBack;

// Category selection
async function selectCategory(categoryId) {
    console.log('selectCategory called with:', categoryId);
    
    // Полностью сбрасываем контекст при выборе новой категории
    currentContext = {
        category: categoryId,
        brand: null,
        model: null,
        problem: null
    };
    
    console.log('🔍 Category Debug:', {
        categoryId: categoryId,
        currentContext: currentContext,
        categorySet: currentContext.category
    });
    
    try {
        showLoading(true);
        
        const response = await apiCall('/api/brands', {
            query: {
                category_id: categoryId
            }
        });
        
        if (response.ok) {
            const brands = await response.json();
            displayBrands(brands);
            showScreen('brandsScreen');
            
            // Update title
            const categoryNames = {
                '1': 'Телефоны',
                '2': 'Ноутбуки',
                '3': 'Стиральные машины',
                '4': 'Холодильники',
                '5': 'Микроволновки',
                '6': 'Посудомоечные машины',
                '7': 'Телевизоры'
            };
            const titleElement = document.getElementById('brandsTitle');
            if (titleElement) {
                titleElement.textContent = `Выберите бренд для ${categoryNames[categoryId] || 'устройства'}:`;
            }
        } else {
            showError('Ошибка загрузки брендов');
        }
    } catch (error) {
        console.error('Select category error:', error);
        showError('Ошибка загрузки данных');
    } finally {
        showLoading(false);
    }
}

// Display brands
function displayBrands(brands) {
    const brandsList = document.getElementById('brandsList');
    brandsList.innerHTML = '';
    
    brands.forEach(brand => {
        const brandItem = document.createElement('div');
        brandItem.className = 'list-item';
        brandItem.addEventListener('click', () => selectBrand(brand.id, brand.name));
        
        brandItem.innerHTML = `
            <h4>${brand.name}</h4>
            <p>${brand.description || 'Нажмите для выбора моделей'}</p>
        `;
        
        brandsList.appendChild(brandItem);
    });
}

// Brand selection
async function selectBrand(brandId, brandName) {
    currentContext.brand = brandId;
    
    try {
        showLoading(true);
        
        const response = await apiCall('/api/models', {
            query: {
                brand_id: brandId,
                category_id: currentContext.category
            }
        });
        
        if (response.ok) {
            const models = await response.json();
            displayModels(models);
            showScreen('modelsScreen');
            
            // Update title
            document.getElementById('brandTitle').textContent = 
                `Выберите модель - ${brandName}`;
        } else {
            showError('Ошибка загрузки моделей');
        }
    } catch (error) {
        console.error('Select brand error:', error);
        showError('Ошибка загрузки данных');
    } finally {
        showLoading(false);
    }
}

// Display models
function displayModels(models) {
    const modelsList = document.getElementById('modelsList');
    modelsList.innerHTML = '';
    
    models.forEach(model => {
        const modelItem = document.createElement('div');
        modelItem.className = 'list-item';
        modelItem.addEventListener('click', () => selectModel(model.id, model.name));
        
        modelItem.innerHTML = `
            <h4>${model.name}</h4>
            <p>${model.description || 'Нажмите для выбора проблем'}</p>
        `;
        
        modelsList.appendChild(modelItem);
    });
}

// Model selection
async function selectModel(modelId, modelName) {
    currentContext.model = modelId;
    
    try {
        showLoading(true);
        
        // Всегда используем текущий контекст категории
        const categoryId = currentContext.category;
        
        console.log('🔍 Frontend Debug:', {
            currentContext: currentContext,
            category: currentContext.category,
            categoryId: categoryId,
            urlParams: window.location.search,
            modelId: modelId,
            modelName: modelName
        });
        
        if (!categoryId) {
            console.error('❌ No category_id found!');
            showError('Ошибка: не удалось определить категорию');
            return;
        }
        
        console.log('🔍 Making problems request with category_id:', categoryId);
        const response = await apiCall('/api/problems', {
            query: {
                category_id: categoryId
            }
        });
        
        if (response.ok) {
            const problems = await response.json();
            displayProblems(problems);
            
            // Добавляем category_id в URL
            const url = new URL(window.location);
            url.searchParams.set('category_id', categoryId);
            window.history.pushState({}, '', url);
            
            showScreen('problemsScreen');
            
            // Update title
            document.getElementById('modelTitle').textContent = 
                `Выберите проблему - ${modelName}`;
        } else {
            showError('Ошибка загрузки проблем');
        }
    } catch (error) {
        console.error('Select model error:', error);
        showError('Ошибка загрузки данных');
    } finally {
        showLoading(false);
    }
}

// Display problems
function displayProblems(problems) {
    const problemsList = document.getElementById('problemsList');
    problemsList.innerHTML = '';
    
    problems.forEach(problem => {
        const problemItem = document.createElement('div');
        problemItem.className = 'list-item';
        problemItem.addEventListener('click', () => selectProblem(problem.id, problem.name));
        
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
        
        problemItem.innerHTML = `
            <h4>${problem.name}</h4>
            <p>${problem.description || 'Нажмите для просмотра инструкций'}</p>
            <div style="margin-top: 0.5rem;">
                <span style="color: ${severityColors[problem.severity]}; font-weight: 600;">
                    ${severityTexts[problem.severity]} сложность
                </span>
            </div>
        `;
        
        problemsList.appendChild(problemItem);
    });
}

// Problem selection
async function selectProblem(problemId, problemName) {
    currentContext.problem = problemId;
    
    try {
        showLoading(true);
        
        const response = await apiCall('/api/instructions', {
            query: {
                model_id: currentContext.model,
                problem_id: problemId
            }
        });
        
        if (response.ok) {
            const instructions = await response.json();
            displayInstructions(instructions);
            showScreen('instructionsScreen');
        } else {
            showError('Ошибка загрузки инструкций');
        }
    } catch (error) {
        console.error('Select problem error:', error);
        showError('Ошибка загрузки данных');
    } finally {
        showLoading(false);
    }
}

// Display instructions
function displayInstructions(instructions) {
    const instructionsList = document.getElementById('instructionsList');
    instructionsList.innerHTML = '';
    
    if (instructions.length === 0) {
        instructionsList.innerHTML = `
            <div class="error-message">
                <h4>Инструкции не найдены</h4>
                <p>К сожалению, для данной комбинации устройства и проблемы пока нет инструкций.</p>
                <button class="action-btn secondary" id="masterBtn">
                    💬 Написать мастеру
                </button>
            </div>
        `;
        
        // Добавляем обработчик для кнопки мастера
        const masterBtn = document.getElementById('masterBtn');
        if (masterBtn) {
            masterBtn.addEventListener('click', () => {
                // Открываем чат с мастером в Telegram
                if (window.Telegram && window.Telegram.WebApp) {
                    window.Telegram.WebApp.openLink('https://t.me/KELTISON');
                } else {
                    // Fallback для браузера
                    window.open('https://t.me/KELTISON', '_blank');
                }
            });
        }
        
        return;
    }
    
    instructions.forEach(instruction => {
        const instructionItem = document.createElement('div');
        instructionItem.className = 'list-item';
        instructionItem.addEventListener('click', () => viewInstruction(instruction.id));
        
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
        
        const proBadge = instruction.is_pro_pretent ? '<span style="background: #f39c12; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; margin-left: 0.5rem;">PRO</span>' : '';
        
        instructionItem.innerHTML = `
            <h4>${instruction.title}${proBadge}</h4>
            <p>${instruction.description || 'Подробная инструкция по ремонту'}</p>
            <div style="margin-top: 0.5rem; display: flex; gap: 1rem; font-size: 0.9rem;">
                <span style="color: ${difficultyColors[instruction.difficulty]}; font-weight: 600;">
                    🔧 ${difficultyTexts[instruction.difficulty]}
                </span>
                <span style="color: #666;">
                    ⏱️ ${instruction.estimated_time || 'Не указано'}
                </span>
                ${instruction.cost_estimate > 0 ? `<span style="color: #27ae60;">💰 ${instruction.cost_estimate}₽</span>` : ''}
            </div>
        `;
        
        instructionsList.appendChild(instructionItem);
    });
}

// View instruction details
async function viewInstruction(instructionId) {
    try {
        showLoading(true);
        
        const response = await apiCall(`/api/instructions/${instructionId}`);
        
        if (response.ok) {
            const instruction = await response.json();
            displayInstructionDetail(instruction);
            showScreen('instructionDetailScreen');
        } else if (response.status === 403) {
            const error = await response.json();
            showProRestriction(error);
        } else {
            showError('Ошибка загрузки инструкции');
        }
    } catch (error) {
        console.error('View instruction error:', error);
        showError('Ошибка загрузки данных');
    } finally {
        showLoading(false);
    }
}

// Display instruction detail
function displayInstructionDetail(instruction) {
    const instructionDetail = document.getElementById('instructionDetail');
    
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
    
    let mediaHtml = '';
    if (instruction.media && instruction.media.length > 0) {
        mediaHtml = `
            <div class="instruction-media">
                <h4>📸 Медиафайлы:</h4>
                <div class="media-gallery">
                    ${instruction.media.map(media => `
                        <div class="media-item">
                            ${media.mimetype.startsWith('image/') ? 
                                `<img src="${media.url}" alt="${media.originalname}" style="max-width: 100%; border-radius: 8px; margin-bottom: 0.5rem;">` :
                                `<video controls style="max-width: 100%; border-radius: 8px; margin-bottom: 0.5rem;">
                                    <source src="${media.url}" type="${media.mimetype}">
                                </video>`
                            }
                            <div class="media-info">
                                <small style="color: #666; font-size: 0.8rem;">${media.originalname}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    let stepsHtml = '';
    if (instruction.steps && instruction.steps.length > 0) {
        stepsHtml = `
            <div class="instruction-steps">
                <h4>Пошаговая инструкция:</h4>
                ${instruction.steps.map((step, index) => `
                    <div class="step">
                        <div class="step-number">Шаг ${step.step || index + 1}</div>
                        <div class="step-title">${step.title}</div>
                        <div class="step-description">${step.description}</div>
                        ${step.warning ? `<div class="step-warning">⚠️ ${step.warning}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    let stepMediaHtml = '';
    if (instruction.steps && instruction.steps.length > 0) {
        stepMediaHtml = instruction.steps.map((step, index) => {
            if (step.photos && step.photos.length > 0) {
                return `
                    <div class="step-media">
                        <h5>Фото к шагу ${step.step || index + 1}:</h5>
                        <div class="step-photos">
                            ${step.photos.map(photo => `
                                <img src="${photo.url}" alt="${photo.originalname}" style="max-width: 150px; border-radius: 4px; margin: 0.25rem;">
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            return '';
        }).join('');
    }
    
    let toolsHtml = '';
    if (instruction.tools_required && instruction.tools_required.length > 0) {
        toolsHtml = `
            <div class="instruction-meta">
                <div class="meta-item">
                    <span>🔧 Инструменты:</span>
                    <span>${instruction.tools_required.join(', ')}</span>
                </div>
            </div>
        `;
    }
    
    let partsHtml = '';
    if (instruction.parts_required && instruction.parts_required.length > 0) {
        partsHtml = `
            <div class="instruction-meta">
                <div class="meta-item">
                    <span>🔩 Запчасти:</span>
                    <span>${instruction.parts_required.join(', ')}</span>
                </div>
            </div>
        `;
    }
    
    instructionDetail.innerHTML = `
        <div class="instruction-header">
            <h3>${instruction.title}</h3>
            <p>${instruction.description}</p>
        </div>
        
        <div class="instruction-meta">
            <div class="meta-item">
                <span>📱 Устройство:</span>
                <span>${instruction.brand_name} ${instruction.model_name}</span>
            </div>
            <div class="meta-item">
                <span>🔧 Сложность:</span>
                <span style="color: ${difficultyColors[instruction.difficulty]}; font-weight: 600;">
                    ${difficultyTexts[instruction.difficulty]}
                </span>
            </div>
            <div class="meta-item">
                <span>⏱️ Время:</span>
                <span>${instruction.estimated_time || 'Не указано'}</span>
            </div>
            ${instruction.cost_estimate > 0 ? `
                <div class="meta-item">
                    <span>💰 Стоимость:</span>
                    <span style="color: #27ae60; font-weight: 600;">${instruction.cost_estimate}₽</span>
                </div>
            ` : ''}
        </div>
        
        ${toolsHtml}
        ${partsHtml}
        
        <div class="instruction-content">
            ${stepsHtml}
            ${stepMediaHtml}
            ${mediaHtml}
        </div>
        
        <div class="instruction-actions">
            <button class="action-btn" id="partsBtn">
                🛒 Где купить запчасти
            </button>
            <button class="action-btn secondary" id="masterHelpBtn">
                💬 Написать мастеру
            </button>
        </div>
    `;
    
    // Добавляем обработчики для кнопок
    const partsBtn = document.getElementById('partsBtn');
    if (partsBtn) {
        partsBtn.addEventListener('click', () => showScreen('partnersScreen'));
    }
    
    const masterHelpBtn = document.getElementById('masterHelpBtn');
    if (masterHelpBtn) {
        masterHelpBtn.addEventListener('click', () => {
            // Открываем чат с мастером в Telegram
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.openLink('https://t.me/KELTISON');
            } else {
                // Fallback для браузера
                window.open('https://t.me/KELTISON', '_blank');
            }
        });
    }
}

// Show PRO restriction
function showProRestriction(error) {
    const instructionsList = document.getElementById('instructionsList');
    instructionsList.innerHTML = `
        <div class="pro-restricted">
            <h4>💎 PRO-контент</h4>
            <p>Эта инструкция доступна только для пользователей с PRO-подпиской.</p>
            <div style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px; text-align: left;">
                <h5>${error.preview.title}</h5>
                <p>${error.preview.description}</p>
                <div style="margin-top: 0.5rem;">
                    <span style="color: #f39c12;">🔧 ${error.preview.difficulty}</span>
                    <span style="margin-left: 1rem; color: #666;">⏱️ ${error.preview.estimated_time}</span>
                </div>
            </div>
            <button class="upgrade-btn" data-screen="proUpgradeScreen">
                💎 Оформить PRO-подписку
            </button>
        </div>
    `;
}

// Chat functionality
let currentChatSession = null;

async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, true);
    chatInput.value = '';
    
    try {
        const response = await apiCall('/api/assistant/chat', {
            method: 'POST',
            body: JSON.stringify({
                message: message,
                session_id: currentChatSession
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentChatSession = data.session_id;
            
            // Add AI response to chat
            addMessageToChat(data.response, false);
            
            // Update suggestions
            if (data.suggestions && data.suggestions.length > 0) {
                updateChatSuggestions(data.suggestions);
            }
        } else {
            addMessageToChat('Извините, произошла ошибка. Попробуйте еще раз.', false);
        }
    } catch (error) {
        console.error('Chat error:', error);
        addMessageToChat('Извините, произошла ошибка. Попробуйте еще раз.', false);
    }
}

function sendSuggestion(suggestion) {
    document.getElementById('chatInput').value = suggestion;
    sendChatMessage();
}

function addMessageToChat(message, isUser) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">${message}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateChatSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('chatSuggestions');
    suggestionsContainer.innerHTML = '';
    
    suggestions.forEach(suggestion => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-btn';
        btn.textContent = suggestion;
        btn.addEventListener('click', () => sendSuggestion(suggestion));
        suggestionsContainer.appendChild(btn);
    });
}

// Partners screen – if first visit, ask for city and show local stores
async function loadPartners() {
    try {
        let city = localStorage.getItem('keltison_city');
        if (!city) {
            city = prompt('Ваш город? (например: Ростов-на-Дону)');
            if (city) {
                localStorage.setItem('keltison_city', city);
            }
        }

        // If we have a city, try city-specific stores first
        if (city) {
            const storesResp = await apiCall('/api/parts/stores', { query: { city } });
            if (storesResp.ok) {
                const stores = await storesResp.json();
                if (stores && stores.length) {
                    displayStores(city, stores);
                    return; // done
                }
            }
        }

        // Fallback to generic partners list
        const response = await apiCall('/api/partners');
        if (response.ok) {
            const partners = await response.json();
            displayPartners(partners);
        } else {
            showError('Ошибка загрузки партнеров');
        }
    } catch (error) {
        console.error('Load partners error:', error);
        showError('Ошибка загрузки данных');
    }
}

function displayPartners(partners) {
    const partnersList = document.getElementById('partnersList');
    partnersList.innerHTML = '';
    // header with change-city if city known
    const savedCity = localStorage.getItem('keltison_city');
    const header = document.createElement('div');
    header.className = 'list-item';
    header.innerHTML = `
        <h4>${savedCity ? `Ваш город: ${savedCity}` : 'Город не выбран'}</h4>
        <div style="margin-top: 0.5rem;">
            <button class="action-btn secondary" id="changeCityBtn">Изменить город</button>
        </div>
    `;
    partnersList.appendChild(header);
    const changeBtn1 = header.querySelector('#changeCityBtn');
    if (changeBtn1) changeBtn1.addEventListener('click', changeCity);
    
    partners.forEach(partner => {
        const partnerItem = document.createElement('div');
        partnerItem.className = 'list-item';
        
        partnerItem.innerHTML = `
            <h4>${partner.name}</h4>
            <p>${partner.description || 'Надежный поставщик запчастей'}</p>
            <div style="margin-top: 1rem;">
                <button class="action-btn" data-action="partner" data-url="${partner.website}">
                    🛒 Перейти в магазин
                </button>
            </div>
        `;
        // attach opener for this dynamic button
        const btn = partnerItem.querySelector('[data-action="partner"]');
        if (btn) {
            btn.addEventListener('click', function() {
                const url = this.dataset.url;
                if (url) openExternal(url);
            });
        }

        partnersList.appendChild(partnerItem);
    });
}

function displayStores(city, stores) {
    const partnersList = document.getElementById('partnersList');
    partnersList.innerHTML = '';
    const title = document.getElementById('partnersTitle');
    if (title) title.textContent = `Запчасти в городе: ${city}`;

    // Add change-city control at top
    const header = document.createElement('div');
    header.className = 'list-item';
    header.innerHTML = `
        <h4>Ваш город: ${city}</h4>
        <div style="margin-top: 0.5rem;">
            <button class="action-btn secondary" id="changeCityBtn">Изменить город</button>
        </div>
    `;
    partnersList.appendChild(header);
    const changeBtn = header.querySelector('#changeCityBtn');
    if (changeBtn) changeBtn.addEventListener('click', changeCity);

    stores.forEach(store => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <h4>${store.name}</h4>
            <p>${store.address}</p>
            <div style="margin-top: 1rem;">
                <button class="action-btn" data-action="partner" data-url="${store.website}">🛒 Перейти</button>
            </div>
        `;
        // attach opener for this dynamic button
        const btn = item.querySelector('[data-action="partner"]');
        if (btn) {
            btn.addEventListener('click', function() {
                const url = this.dataset.url;
                if (url) openExternal(url);
            });
        }
        partnersList.appendChild(item);
    });
}

// Open external link aware of Telegram WebApp
function openExternal(url) {
    try {
        if (tg && tg.openLink) {
            tg.openLink(url, { try_instant_view: false });
        } else {
            window.open(url, '_blank');
        }
    } catch (e) {
        console.error('openExternal error', e);
        window.location.href = url;
    }
}

// Change city flow
function changeCity() {
    const current = localStorage.getItem('keltison_city') || '';
    const next = prompt('Выберите город', current);
    if (next && next.trim()) {
        localStorage.setItem('keltison_city', next.trim());
    } else {
        localStorage.removeItem('keltison_city');
    }
    // reload list
    loadPartners();
}

// PRO upgrade
function upgradeToPro() {
    // In a real implementation, this would integrate with a payment system
    showSuccess('Для оформления PRO-подписки обратитесь в поддержку: @keltison_support');
}

// Utility functions
function showLoading(show) {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    console.error('Error:', message);
    
    // Создаем визуальное уведомление об ошибке
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4444;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        max-width: 80%;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Убираем через 3 секунды
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 3000);
}

function showSuccess(message) {
    console.log('Success:', message);
    
    // Создаем визуальное уведомление об успехе
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #44ff44;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        max-width: 80%;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    // Убираем через 3 секунды
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

// API call helper
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('keltison_token');
    
    // Обрабатываем query параметры + cache-busting
    let url = endpoint;
    const q = new URLSearchParams(options.query || {});
    q.set('_ts', Date.now().toString()); // кэш-бастинг для API
    const qs = q.toString();
    if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    delete finalOptions.query; // Убираем query из options
    
    if (finalOptions.body && typeof finalOptions.body === 'object') {
        finalOptions.body = JSON.stringify(finalOptions.body);
    }
    
    return fetch(url, finalOptions);
}

// Initialize partners when screen is shown
document.addEventListener('DOMContentLoaded', function() {
    // Load partners when partners screen is accessed
    const originalShowScreen = showScreen;
    showScreen = function(screenId) {
        originalShowScreen(screenId);
        
        if (screenId === 'partnersScreen') {
            loadPartners();
        }
    };
});

// Fix event listeners for data attributes
document.addEventListener('DOMContentLoaded', function() {
    // Back buttons
    document.querySelectorAll('[data-action="back"]').forEach(btn => {
        btn.addEventListener('click', goBack);
    });
    
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryId = this.dataset.category;
            selectCategory(categoryId);
        });
    });
    
    // Brand buttons
    document.querySelectorAll('.brand-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const brandId = this.dataset.brand;
            selectBrand(brandId);
        });
    });
    
    // Model buttons
    document.querySelectorAll('.model-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modelId = this.dataset.model;
            selectModel(modelId);
        });
    });
    
    // Problem buttons
    document.querySelectorAll('.problem-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const problemId = this.dataset.problem;
            selectProblem(problemId);
        });
    });
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const screenId = this.dataset.screen;
            showScreen(screenId);
        });
    });
    
    // Action buttons
    document.querySelectorAll('[data-action="send-message"]').forEach(btn => {
        btn.addEventListener('click', sendMessage);
    });
    
    // Partner buttons
    document.querySelectorAll('[data-action="partner"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const url = this.dataset.url;
            if (url) {
                window.open(url, '_blank');
            }
        });
    });
    
    // Suggestion buttons
    document.querySelectorAll('[data-action="suggestion"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.dataset.text;
            if (text) {
                sendSuggestion(text);
            }
        });
    });
    
    // Upgrade button
    document.querySelectorAll('[data-action="upgrade-pro"]').forEach(btn => {
        btn.addEventListener('click', function() {
            upgradeToPro();
        });
    });
    
    console.log('Event listeners fixed');
});

// Функция для получения текущего пользователя
function getCurrentUser() {
    return currentUser;
}

// Функция для открытия админ-панели
function openAdminPanel() {
    // Проверяем, что пользователь авторизован как админ
    const user = getCurrentUser();
    if (user && user.is_admin) {
        // Открываем админ-панель в новом окне
        window.open('/admin-instructions', '_blank');
    } else {
        // Показываем сообщение о необходимости авторизации
        alert('Для доступа к админ-панели необходимо войти как администратор');
    }
}

// Функция для показа/скрытия кнопки админ-панели
function toggleAdminButton() {
    const user = getCurrentUser();
    const adminBtn = document.getElementById('adminPanelBtn');
    
    if (user && user.is_admin) {
        adminBtn.style.display = 'block';
    } else {
        adminBtn.style.display = 'none';
    }
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    toggleAdminButton();
    
    // Добавляем обработчик для кнопки админ
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', openAdminPanel);
    }
});
