// =========================================================
// ESTADO DA APLICAÇÃO
// =========================================================
let currentPage = 'security';
let countdownInterval = null; // Usado para o timer do Sensor OU o timer de Check-in
let timeRemaining = 60; // Tempo restante para o timer do Sensor
const CHECKIN_INTERVAL_SECONDS = 72 * 60 * 60; // 72 horas em segundos
let checkInTimeLeft = 71 * 60 * 60; // 71 horas em segundos (para inicializar o timer)

// =========================================================
// DADOS MOCK
// =========================================================
const emergencyContacts = [
    { name: 'Maria Silva', phone: '+55 11 98765-4321', relationship: 'Mãe' },
    { name: 'Ana Santos', phone: '+55 11 98765-1234', relationship: 'Amiga' },
    { name: 'Dr. João Souza', phone: '+55 11 98765-5678', relationship: 'Psicólogo' }
];

const notes = [
    {
        id: 1,
        title: 'Sessão de Terapia',
        date: '2025-10-15',
        content: 'Discutimos técnicas de gerenciamento de estresse relacionadas ao trabalho. Exercícios de respiração foram recomendados.',
        image: 'https://images.unsplash.com/photo-1549414216-9b5751915609?w=400&h=200&fit=crop', // Imagem Mock
        eventDate: '15/10/2025'
    },
    {
        id: 2,
        title: 'Objetivos Pessoais',
        date: '2025-10-12',
        content: 'Focar em equilibrar trabalho e vida pessoal. Praticar hobbies pelo menos 2x por semana.',
        image: null, // Sem imagem
        eventDate: '12/10/2025'
    },
    {
        id: 3,
        title: 'Progresso Semanal',
        date: '2025-10-10',
        content: 'Semana positiva. Consegui praticar meditação 4 dias. Notei redução na ansiedade.',
        image: null, // Sem imagem
        eventDate: '10/10/2025'
    }
];

const chatMessages = [
    { sender: 'psychologist', text: 'Olá! Como você está se sentindo hoje?', time: '10:30' },
    { sender: 'user', text: 'Estou me sentindo melhor, obrigada.', time: '10:32' },
    { sender: 'psychologist', text: 'Que bom! Gostaria de conversar sobre algo específico?', time: '10:33' },
    { sender: 'user', text: 'Gostaria de falar sobre como lidar com momentos difíceis.', time: '10:35' }
];

// ARRAY DE DADOS DOS SENSORES (com estado isActive)
const sensorsData = [
    { id: 'sensor_motion', name: 'Detector de Movimento Brusco', description: 'Detecta movimentos súbitos ou quedas do dispositivo', icon: 'fa-bolt', sensitivity: 77, isActive: true },
    { id: 'sensor_sound', name: 'Detector de Sons Altos', description: 'Identifica gritos, sons altos ou vozes agressivas', icon: 'fa-volume-up', sensitivity: 80, isActive: true },
    { id: 'sensor_fall', name: 'Detector de Queda', description: 'Detecta quedas bruscas que podem indicar perigo', icon: 'fa-arrow-down', sensitivity: 70, isActive: true },
    { id: 'sensor_shake', name: 'Botão de Pânico por Agitação', description: 'Agite o celular 3 vezes rapidamente para disparar alerta', icon: 'fa-mobile-alt', sensitivity: 85, isActive: false }
];


// =========================================================
// FUNÇÕES DE TEMPO E ESTILO (Check-in)
// =========================================================

/**
 * Formata o tempo restante (em segundos) em uma string no formato "2d 23h" ou "03h 15m".
 * @returns {string} Tempo restante formatado.
 */
function formatTimeRemaining(timeInSeconds) {
    const totalSeconds = Math.max(0, timeInSeconds);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) {
        return `${days}d ${String(hours).padStart(2, '0')}h`;
    }
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
}

/**
 * Calcula a porcentagem de progresso do check-in (tempo decorrido).
 * @returns {number} Porcentagem (0 a 100).
 */
function getProgressPercentage(timeInSeconds) {
    const elapsed = CHECKIN_INTERVAL_SECONDS - timeInSeconds;
    return Math.min(100, (elapsed / CHECKIN_INTERVAL_SECONDS) * 100);
}


// =========================================================
// RENDERIZAÇÃO DE COMPONENTES DE SEGURANÇA
// =========================================================

/**
 * Renderiza o bloco completo do Check-in de Segurança.
 */
function renderSafetyCheckIn() {
    const timeString = formatTimeRemaining(checkInTimeLeft);
    const progressPercentage = getProgressPercentage(checkInTimeLeft);
    const checkInHistoryData = [ // Mock data
        { date: '2025-10-26', time: '14:30', content: 'Confirmado' },
        { date: '2025-10-23', time: '09:15', content: 'Confirmado' },
        { date: '2025-10-20', time: '18:45', content: 'Confirmado' }
    ];
    const checkInHistoryHtml = checkInHistoryData.map(note => `
        <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
                <i class="fas fa-check-circle text-green-600"></i>
                <span class="text-[var(--azul-marinho-escuro)] opacity-70">${new Date(note.date).toLocaleDateString('pt-BR')} ${note.time}</span>
            </div>
            <span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">${note.content}</span>
        </div>
    `).join('');
    return `
        <div class="bg-[var(--branco)] rounded-xl border-2 border-[var(--azul-claro)] p-6">
            <div class="flex items-start justify-between mb-6">
                <div class="flex items-center gap-3"> <i class="fas fa-clock text-2xl text-[var(--azul-marinho)]"></i> <div> <h3 class="text-[var(--azul-marinho-escuro)] mb-1 font-semibold">Check-in de Segurança</h3> <p class="text-sm text-[var(--azul-marinho-escuro)] opacity-60">Confirme sua segurança a cada 72 horas</p> </div> </div>
                <span id="checkin-status-badge" class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Ativo</span>
            </div>
            <div class="mb-6">
                <div class="flex items-center justify-between mb-2"> <span class="text-sm text-[var(--azul-marinho-escuro)] opacity-70">Tempo até próximo check-in</span> <span id="checkin-timer-display" class="text-lg font-bold text-[var(--azul-marinho-escuro)]">${timeString}</span> </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden"> <div id="checkin-progress-bar" class="h-full bg-[var(--azul-marinho)] transition-all duration-1000" style="width: ${progressPercentage}%;"></div> </div>
            </div>
            <button id="performCheckInBtn" onclick="performCheckIn()" class="w-full bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-[var(--branco)] py-3 rounded-lg font-semibold transition-colors"> <i class="fas fa-check mr-2"></i> Confirmar que Estou Segura </button>
            <div class="pt-4 border-t border-[var(--azul-claro)] mt-4"> <p class="text-xs text-[var(--azul-marinho-escuro)] opacity-60 mb-3">Histórico de Check-ins Recentes</p> <div class="space-y-2">${checkInHistoryHtml}</div> </div>
            <div class="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg"> <p class="text-xs text-orange-900"><strong>Importante:</strong> Se você não confirmar sua segurança em até 72 horas, seus contatos de emergência serão notificados.</p> </div>
        </div>
    `;
}

function renderSensorItem(sensor) {
    let statusText = sensor.isActive ? 'Ativo' : 'Desativado';
    let statusClass = sensor.isActive ? 'text-green-600' : 'text-red-500';
    const toggleChecked = sensor.isActive ? 'checked' : '';
    const inactiveClass = !sensor.isActive ? 'opacity-60' : '';

    return `
        <div id="${sensor.id}" class="sensor-item flex justify-between items-start p-4 bg-[var(--azul-claro)] rounded-lg border border-[var(--azul-marinho)] transition-opacity duration-300 ${inactiveClass}">
           
            <div class="flex items-start gap-3 flex-1 min-w-0"> 
                <i class="fas ${sensor.icon} text-[var(--branco)] text-lg bg-[var(--azul-marinho)] p-3 rounded-full w-12 h-12 text-center flex items-center justify-center flex-shrink-0"></i> 
                
            
                <div class="flex-1">
                    <p class="font-semibold text-[var(--azul-marinho-escuro)]"> 
                        ${sensor.name} 
                        <span class="sensor-status font-semibold text-sm ml-2 ${statusClass}">${statusText}</span> 
                    </p>
                    <p class="text-xs text-gray-700/80 mb-2 break-words"> 
                        ${sensor.description}
                    </p>
                    
                    <div class="flex items-center justify-between text-xs mb-1 max-w-[200px]"> 
                        <span class="text-gray-600">Sensibilidade</span> 
                        <span>${sensor.sensitivity}%</span> 
                    </div>
                    <div class="h-1 bg-[var(--azul-claro-houver)] rounded-full overflow-hidden mt-1 max-w-[200px]"> 
                        <div class="h-full bg-[var(--azul-marinho-escuro)]" style="width: ${sensor.sensitivity}%;"></div> 
                    </div>


                    <button onclick="testSensor('${sensor.name}')" class="mt-3 px-4 py-1 bg-[var(--branco)] border border-[var(--azul-marinho-escuro)] text-[var(--azul-marinho-escuro)] rounded-lg hover:bg-[var(--azul-claro)] transition-colors text-sm font-semibold"> 
                        Testar 
                    </button>
                </div>
            </div>
            
        
            <div class="ml-4 flex-shrink-0"> 
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" ${toggleChecked} class="sr-only peer" onchange="toggleSensor('${sensor.id}', this.checked)">
                    <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
            </div>
        </div>
    `;
}

/**
 * Renderiza o bloco completo da Detecção Automática (com contador dinâmico).
 */
function renderAutomaticDetection() {
    const activeSensors = sensorsData.filter(s => s.isActive).length;
    const totalSensors = sensorsData.length;
    const sensorsHtml = sensorsData.map(sensor => renderSensorItem(sensor)).join('');
    return `
        <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] p-6">
            <div class="flex items-center gap-3 mb-6">
                <div class="bg-[var(--azul-marinho-escuro)] p-3 rounded-full"> <i class="fas fa-robot text-[var(--branco)] text-xl"></i> </div>
                <h3 class="text-xl font-bold text-[var(--azul-marinho-escuro)]">Detecção Automática</h3>
                <span id="activeSensorCount" class="ml-auto px-3 py-1 bg-[var(--azul-marinho-escuro)] text-[var(--branco)] rounded-full text-xs font-semibold">${activeSensors}/${totalSensors} Ativos</span>
            </div>
            <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"> <p class="text-sm text-blue-900 mb-2"><strong>Como funciona:</strong> Os sensores monitoram automaticamente padrões que podem indicar situações de perigo.</p> <p class="text-sm text-blue-900">Quando acionados, você terá <strong>60 segundos</strong> para confirmar que está segura.</p> </div>
            <div class="space-y-3"> ${sensorsHtml} </div>
        </div>
    `;
}

// =========================================================
// RENDERIZAÇÃO DE PÁGINAS
// =========================================================

// Central de Segurança
function renderSecurityPage() {
    const activeSensorsCount = sensorsData.filter(s => s.isActive).length;
    const totalSensorsCount = sensorsData.length;
    return `
        <div class="bg-gradient-to-r from-[var(--azul-marinho-escuro)] to-[var(--azul-marinho)] text-[var(--branco)] rounded-xl p-6 sm:p-8 border-2 border-[var(--azul-marinho-escuro)] mb-6">
            <div class="flex flex-col sm:flex-row justify-between items-start mb-6">
                <div class="flex gap-4 items-center mb-4 sm:mb-0"> <div class="bg-[var(--branco)] p-4 rounded-full"> <i class="fas fa-shield-alt text-3xl text-[var(--azul-marinho)]"></i> </div> <div> <h2 class="text-2xl font-bold mb-2">Central de Segurança</h2> <p class="text-[var(--azul-claro)]">Sistema de proteção integrado e monitoramento 24/7</p> </div> </div>
                <span id="headerSystemStatus" class="px-4 py-2 ${activeSensorsCount === totalSensorsCount ? 'bg-green-500' : 'bg-orange-500'} text-[var(--branco)] rounded-full text-sm font-semibold border-0 self-start sm:self-center"> ${activeSensorsCount === totalSensorsCount ? 'Sistemas Ativos' : 'Atenção Necessária'} </span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"> <div class="flex items-center gap-3 mb-2"><i class="fas fa-microchip text-[var(--azul-claro)]"></i><span class="text-sm text-[var(--azul-claro)]">Sensores</span></div> <p id="headerSensorCount" class="text-3xl font-bold mb-1">${activeSensorsCount}/${totalSensorsCount}</p><p class="text-xs text-[var(--azul-claro)]">Ativos</p> </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"> <div class="flex items-center gap-3 mb-2"><i class="fas fa-clock text-[var(--azul-claro)]"></i><span class="text-sm text-[var(--azul-claro)]">Check-in</span></div> <p class="text-3xl font-bold mb-1">${formatTimeRemaining(checkInTimeLeft)}</p><p class="text-xs text-[var(--azul-claro)]">Próximo</p> </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"> <div class="flex items-center gap-3 mb-2"><i class="fas fa-user-friends text-[var(--azul-claro)]"></i><span class="text-sm text-[var(--azul-claro)]">Contatos</span></div> <p class="text-3xl font-bold mb-1">${emergencyContacts.length}</p><p class="text-xs text-[var(--azul-claro)]">Emergência</p> </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"> <div class="flex items-center gap-3 mb-2"><i class="fas fa-map-marker-alt text-[var(--azul-claro)]"></i><span class="text-sm text-[var(--azul-claro)]">Localização</span></div> <p class="text-3xl font-bold mb-1">ON</p><p class="text-xs text-[var(--azul-claro)]">GPS</p> </div>
            </div>
        </div>
        <div class="bg-gradient-to-r from-[var(--azul-marinho-escuro)] to-[var(--azul-marinho)] text-[var(--branco)] rounded-xl p-6 sm:p-8 border-2 border-[var(--azul-marinho-escuro)] mb-6"">
            <div class="flex flex-col sm:flex-row justify-between items-start mb-6">
                <div class="flex items-center gap-3 mb-4 sm:mb-0"> <i class="fas fa-bolt text-2xl text-[var(--branco)]"></i> <h3 class="text-xl font-bold text-[var(--branco)]">Ações Rápidas</h3> </div>
                <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold self-start sm:self-center"><i class="fas fa-location-arrow mr-1"></i> Localização Ativa</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button id="security-alert-imediato-btn" onclick="showEmergencyModal()" class="bg-red-600 hover:bg-red-700 text-[var(--branco)] rounded-lg p-6 flex flex-col items-center gap-2 transition-colors"> <i class="fas fa-exclamation-triangle text-3xl"></i> <span class="font-semibold text-lg">Alerta de Emergência</span> <small class="text-sm opacity-90">Notifica contatos</small> </button>
                <button id="security-alert-silencioso-btn" onclick="showToast('Alerta silencioso ativado', 'info', 'Monitoramento discreto iniciado.')" class="bg-orange-600 hover:bg-orange-700 text-[var(--branco)] rounded-lg p-6 flex flex-col items-center gap-2 transition-colors"> <i class="fas fa-bell-slash text-3xl"></i> <span class="font-semibold text-lg">Alerta Silencioso</span> <small class="text-sm opacity-90">Monitora sem notificar</small> </button>
                <button id="security-chamar-190-btn" onclick="showToast('Discando 190...', 'info', 'Chamada de emergência sendo iniciada')" class="bg-[var(--azul-claro)] hover:bg-[var(--azul-claro-houver)] text-[var(--azul-marinho)] rounded-lg p-6 flex flex-col items-center gap-2 transition-colors"> <i class="fas fa-phone text-3xl"></i> <span class="font-semibold text-lg">Ligar 190</span> <small class="text-sm opacity-70">Polícia Militar</small> </button>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            ${renderSafetyCheckIn()}
            ${renderAutomaticDetection()}
        </div>
        <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] p-6">
            <h3 class="text-xl font-bold text-[var(--azul-marinho-escuro)] mb-4">Dicas de Segurança</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg"> <h4 class="text-sm font-semibold text-primary mb-2">📱 Mantenha seu celular carregado</h4> <p class="text-xs text-primary/70"> Certifique-se de que seu dispositivo esteja sempre com bateria suficiente. </p> </div>
                <div class="p-4 bg-purple-50 border border-purple-200 rounded-lg"> <h4 class="text-sm font-semibold text-primary mb-2">🔒 Configure seus contatos</h4> <p class="text-xs text-primary/70"> Adicione pessoas de confiança que possam responder rapidamente. </p> </div>
                <div class="p-4 bg-green-50 border border-green-200 rounded-lg"> <h4 class="text-sm font-semibold text-primary mb-2">⏰ Faça check-ins regulares</h4> <p class="text-xs text-primary/70"> Confirme sua segurança regularmente para manter o sistema ativo. </p> </div>
                <div class="p-4 bg-orange-50 border border-orange-200 rounded-lg"> <h4 class="text-sm font-semibold text-primary mb-2">🧪 Teste os sensores</h4> <p class="text-xs text-primary/70"> Use os botões de teste para se familiarizar com o sistema. </p> </div>
            </div>
        </div>
    `;
}

function initSecurityPage() {
    if (countdownInterval) clearInterval(countdownInterval);
    let checkInTimerInterval = setInterval(() => {
        checkInTimeLeft--;
        if (checkInTimeLeft < 0) {
            clearInterval(checkInTimerInterval);
            checkInTimeLeft = CHECKIN_INTERVAL_SECONDS;
            showToast('Alerta de Check-in!', 'error', 'O prazo de 72 horas expirou. Alerta enviado.');
            initSecurityPage(); // Reinicia
            return;
        }
        const timerDisplay = document.getElementById('checkin-timer-display');
        const progressBar = document.getElementById('checkin-progress-bar');
        if (timerDisplay) timerDisplay.textContent = formatTimeRemaining(checkInTimeLeft);
        if (progressBar) progressBar.style.width = getProgressPercentage(checkInTimeLeft) + '%';
    }, 1000);
    countdownInterval = checkInTimerInterval;
}

function performCheckIn() {
    checkInTimeLeft = CHECKIN_INTERVAL_SECONDS;
    showToast('Check-in realizado!', 'success', `Próximo em ${formatTimeRemaining(CHECKIN_INTERVAL_SECONDS)}`);
    // Atualiza imediatamente o display
    const timerDisplay = document.getElementById('checkin-timer-display');
    const progressBar = document.getElementById('checkin-progress-bar');
    if (timerDisplay) timerDisplay.textContent = formatTimeRemaining(checkInTimeLeft);
    if (progressBar) progressBar.style.width = getProgressPercentage(checkInTimeLeft) + '%';
}

function testSensor(sensorName) {
    showSensorModal(sensorName);
}

// =========================================================
// RENDERIZAÇÃO DE OUTRAS PÁGINAS (Perfil, Anotações, Chat, etc.)
// =========================================================

// Perfil (Com layout atualizado e responsivo)
function renderProfilePage() {
    const userName = "Mariana Moenchiali"; const userEmail = "marimoenchiali@email.com"; const userPhone = "+55 11 98765-4321"; const userBirthDate = "1990-05-15"; // Formato AAAA-MM-DD
    const userAddress = "Rua Example, 123 - São Paulo, SP"; const userSince = "Janeiro 2025"; const lastPasswordChange = "15 de Janeiro de 2025";
    const stats = [
        { count: emergencyContacts.length, label: 'Contatos', icon: 'fas fa-users' }, { count: 47, label: 'Check-ins', icon: 'fas fa-check-circle' }, { count: notes.length, label: 'Anotações', icon: 'fas fa-file-alt' }, { count: 5, label: 'Conversas', icon: 'fas fa-comment-dots' }
    ];
    return `
        <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] overflow-hidden shadow-lg mb-8">
            <div class="h-32 bg-gradient-to-r from-[var(--azul-marinho-escuro)] to-[var(--azul-marinho)]"></div>
            <div class="px-4 sm:px-8 pb-8">
                <div class="flex flex-col sm:flex-row justify-between items-center sm:items-end -mt-16 mb-6"> <div class="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left"> <div class="relative"> <img src="./assets/img/foto perfil.png" alt="${userName}" class="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"> <button onclick="showToast('Alterar foto...', 'info')" class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-[var(--branco)] flex items-center justify-center text-sm transition-colors"> <i class="fas fa-camera"></i> </button> </div> <div class="mb-2"> <h2 class="text-2xl font-bold text-[var(--azul-marinho-escuro)] mb-1">${userName}</h2> <p class="text-gray-600/60">Usuário desde ${userSince}</p> </div> </div> <span class="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200 mb-2 mt-4 sm:mt-0"> Conta Ativa </span> </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"> ${stats.map(stat => `<div class="p-4 bg-[var(--azul-claro)] rounded-lg text-center border border-[var(--branco)]"> <p class="text-3xl font-bold text-[var(--azul-marinho)] mb-1">${stat.count}</p> <p class="text-xs text-[var(--azul-marinho)]">${stat.label}</p> </div>`).join('')} </div>
            </div>
        </div>
        <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] p-4 sm:p-6 mb-8">
            <div class="flex items-center gap-3 mb-6 border-b border-gray-600/30 pb-4"> <div class="w-10 h-10 rounded-full bg-[var(--azul-claro)] text-[var(--azul-marinho)] flex items-center justify-center text-xl"> <i class="fas fa-user"></i> </div> <h3 class="text-xl font-bold text-[var(--azul-marinho-escuro)]">Informações Pessoais</h3> </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-8">
                <div> <label class="block text-sm font-medium text-[var(--azul-marinho-escuro)] mb-2">Nome Completo</label> <div class="relative"> <input type="text" value="${userName}" class="w-full px-4 py-3 border border-[var(--azul-claro)] rounded-lg focus:outline-none focus:border-[var(--azul-marinho)]"> <i class="fas fa-user absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--azul-claro-houver)]"></i> </div> </div>
                <div> <label class="block text-sm font-medium text-[var(--azul-marinho-escuro)] mb-2">Email</label> <div class="relative"> <input type="email" value="${userEmail}" class="w-full px-4 py-3 border border-[var(--azul-claro)] rounded-lg focus:outline-none focus:border-[var(--azul-marinho)]"> <i class="fas fa-envelope absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--azul-claro-houver)]"></i> </div> </div>
                <div> <label class="block text-sm font-medium text-[var(--azul-marinho-escuro)] mb-2">Telefone</label> <div class="relative"> <input type="tel" value="${userPhone}" class="w-full px-4 py-3 border border-[var(--azul-claro)] rounded-lg focus:outline-none focus:border-[var(--azul-marinho)]"> <i class="fas fa-phone absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--azul-claro-houver)]"></i> </div> </div>
                <div> <label class="block text-sm font-medium text-[var(--azul-marinho-escuro)] mb-2">Data de Nascimento</label> <div class="relative"> <input type="date" value="${userBirthDate}" class="w-full px-4 py-3 border border-[var(--azul-claro)] rounded-lg focus:outline-none focus:border-[var(--azul-marinho)] appearance-none"> <i class="fas fa-calendar-alt absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--azul-claro-houver)] pointer-events-none"></i> </div> </div>
                <div class="md:col-span-2"> <label class="block text-sm font-medium text-[var(--azul-marinho-escuro)] mb-2">Endereço</label> <div class="relative"> <input type="text" value="${userAddress}" class="w-full px-4 py-3 border border-[var(--azul-claro)] rounded-lg focus:outline-none focus:border-[var(--azul-marinho)]"> <i class="fas fa-map-marker-alt absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--azul-claro-houver)]"></i> </div> </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-600/30"> <button onclick="showToast('Alterações salvas!', 'success')" class="w-full sm:w-auto px-6 py-2 bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-[var(--branco)] rounded-lg font-semibold transition-colors"> Salvar Alterações </button> <button class="w-full sm:w-auto px-6 py-2 border border-[var(--azul-marinho)] text-[var(--azul-marinho-escuro)] rounded-lg hover:bg-[var(--azul-claro-houver)] font-semibold transition-colors"> Cancelar </button> </div>
        </div>
        <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] p-4 sm:p-6">
            <div class="flex items-center gap-3 mb-6 border-b border-gray-600/30 pb-4"> <div class="w-10 h-10 rounded-full bg-[var(--azul-claro)] text-[var(--azul-marinho)] flex items-center justify-center text-xl"> <i class="fas fa-lock"></i> </div> <h3 class="text-xl font-bold text-[var(--azul-marinho-escuro)]">Segurança da Conta</h3> </div>
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg"> <div> <p class="text-sm font-semibold text-[var(--azul-marinho-escuro)] mb-1">Senha</p> <p class="text-xs text-[var(--azul-marinho-escuro)]/70">Última alteração: ${lastPasswordChange}</p> </div> <button onclick="showToast('Redirecionando...', 'info')" class="w-full sm:w-auto mt-3 sm:mt-0 px-4 py-2 border border-[var(--azul-marinho-escuro)] text-[var(--azul-marinho)] rounded-lg hover:bg-[var(--azul-claro-houver)] text-sm font-semibold transition-colors"> Alterar Senha </button> </div>
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg"> <div> <p class="text-sm font-semibold text-[var(--azul-marinho-escuro)] mb-1">Autenticação em Dois Fatores</p> <p class="text-xs text-[var(--azul-marinho-escuro)]/70">Adicione uma camada extra de segurança</p> </div> <span class="mt-3 sm:mt-0 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold border border-orange-200"> Desativado </span> </div>
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg"> <div> <p class="text-sm font-semibold text-[var(--azul-marinho-escuro)] mb-1">Sessões Ativas</p> <p class="text-xs text-[var(--azul-marinho-escuro)]/70">2 dispositivos conectados</p> </div> <button onclick="showToast('Gerenciando sessões...', 'info')" class="w-full sm:w-auto mt-3 sm:mt-0 px-4 py-2 border border-[var(--azul-marinho-escuro)] text-[var(--azul-marinho)] rounded-lg hover:bg-[var(--azul-claro-houver)] text-sm font-semibold transition-colors"> Gerenciar </button> </div>
            </div>
        </div>
    `;
}

// Anotações (Com layout atualizado e responsivo)
function renderNotesPage() {
    const notesHtml = notes.map(note => `
        <div class="p-6 bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:border-[var(--azul-marinho)] transition-all duration-300">
            <div class="flex justify-between items-start mb-2">
                <div> <h4 class="font-semibold text-lg text-[var(--azul-marinho-escuro)] mb-1">${note.title}</h4> <p class="text-sm text-gray-500">${note.eventDate}</p> </div>
                <div class="flex gap-3"> <button onclick="showToast('Editando nota ID: ${note.id}', 'info')" class="text-[var(--azul-marinho)] hover:text-[var(--azul-marinho-escuro)] transition-colors text-lg"> <i class="fas fa-edit"></i> </button> <button onclick="showToast('Deletando nota ID: ${note.id}', 'error')" class="text-red-500 hover:text-red-700 transition-colors text-lg"> <i class="fas fa-trash-alt"></i> </button> </div>
            </div>
            <p class="text-gray-700 mb-4">${note.content}</p>
            ${note.image ? `<div class="mt-4 max-w-sm rounded-lg overflow-hidden shadow-md"> <img src="${note.image}" alt="Imagem" class="w-full h-auto object-cover"> </div>` : ''}
        </div>
    `).join('');
    return `
        <div class="max-w-4xl mx-auto">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"> <h2 class="text-3xl font-bold text-[var(--azul-marinho-escuro)]">Anotações</h2> <button onclick="showToast('Nova anotação...', 'info')" class="w-full sm:w-auto px-5 py-2 bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"> <i class="fas fa-plus"></i> Nova Anotação </button> </div>
            <h3 class="text-xl font-semibold text-[var(--azul-marinho-escuro)] mb-4 border-b border-gray-300 pb-2">Minhas Anotações</h3>
            <div class="space-y-6"> ${notesHtml} </div>
            <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900"> <i class="fas fa-info-circle mr-2"></i> Suas anotações são privadas. </div>
        </div>
    `;
}

// Chat (Com responsividade básica)
function renderChatPage() {
    return `
        <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] flex flex-col" style="height: 70vh;">
            <div class="flex items-center gap-3 p-4 sm:p-6 border-b border-[var(--azul-claro)]"> <div class="bg-[var(--azul-claro)] p-3 rounded-full"> <i class="fas fa-comment-dots text-[var(--azul-marinho)] text-xl"></i> </div> <h3 class="text-xl font-bold text-[var(--azul-marinho-escuro)]">Chat com Dr. João Souza</h3> </div>
            <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50" id="chatMessages"> ${chatMessages.map(msg => `<div class="flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4"> <div class="max-w-[80%] sm:max-w-md px-4 py-3 rounded-lg ${msg.sender === 'user' ? 'bg-[var(--azul-marinho)] text-white' : 'bg-white border border-[var(--azul-claro)] text-[var(--azul-marinho-escuro)]'}"> <p class="mb-1">${msg.text}</p> <p class="text-xs opacity-70 text-right">${msg.time}</p> </div> </div>`).join('')} </div>
            <div class="p-4 border-t border-[var(--azul-claro)] flex gap-3"> <input type="text" placeholder="Digite sua mensagem..." id="chatInput" class="flex-1 px-4 py-2 border border-[var(--azul-claro)] rounded-lg focus:outline-none focus:border-[var(--azul-marinho)]" onkeypress="if(event.key==='Enter') sendMessage()"> <button onclick="sendMessage()" class="px-6 py-2 bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-white rounded-lg font-semibold transition-colors"> <i class="fas fa-paper-plane"></i> </button> </div>
        </div>
    `;
}

function initChatPage() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) { chatMessages.scrollTop = chatMessages.scrollHeight; }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    if (input && input.value.trim()) {
        showToast('Mensagem enviada!', 'success');
        input.value = '';
        // TODO: Adicionar mensagem ao array `chatMessages` e chamar renderPage('chat')
    }
}

// Contatos de Emergência (Com responsividade básica)
function renderEmergencyContactsPage() {
    return `
        <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] p-4 sm:p-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"> <div class="flex items-center gap-3"> <div class="bg-[var(--azul-claro)] p-3 rounded-full"> <i class="fas fa-users text-[var(--azul-marinho)] text-xl"></i> </div> <h3 class="text-xl font-bold text-[var(--azul-marinho-escuro)]">Contatos de Emergência</h3> </div> <button onclick="showToast('Adicionando contato...', 'info')" class="w-full sm:w-auto px-4 py-2 bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"> <i class="fas fa-plus mr-2"></i>Adicionar Contato </button> </div>
            <div class="space-y-3"> ${emergencyContacts.map(contact => `<div class="p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-100 transition-colors gap-4"> <div class="flex items-center gap-4"> <div class="w-12 h-12 rounded-full bg-[var(--azul-marinho)] text-white flex items-center justify-center text-xl font-bold"> ${contact.name.charAt(0)} </div> <div> <h4 class="font-semibold text-[var(--azul-marinho-escuro)] mb-1">${contact.name}</h4> <p class="text-sm text-gray-600 mb-0.5">${contact.phone}</p> <p class="text-xs text-[var(--azul-marinho)]/60">${contact.relationship}</p> </div> </div> <div class="flex gap-2 w-full sm:w-auto"> <button onclick="showToast('Ligando...', 'info')" class="flex-1 sm:flex-none px-3 py-2 border border-[var(--azul-marinho)] text-[var(--azul-marinho)] rounded-lg hover:bg-[var(--azul-claro)] transition-colors"> <i class="fas fa-phone"></i> </button> <button onclick="showToast('Editando...', 'info')" class="flex-1 sm:flex-none px-3 py-2 border border-[var(--azul-marinho)] text-[var(--azul-marinho)] rounded-lg hover:bg-[var(--azul-claro)] transition-colors"> <i class="fas fa-edit"></i> </button> </div> </div>`).join('')} </div>
        </div>
    `;
}

// Configurações (Com responsividade básica)
function renderSettingsPage() {
    return `
        <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] p-4 sm:p-6">
            <div class="flex items-center gap-3 mb-6"> <div class="bg-[var(--azul-claro)] p-3 rounded-full"> <i class="fas fa-cog text-[var(--azul-marinho)] text-xl"></i> </div> <h3 class="text-xl font-bold text-[var(--azul-marinho-escuro)]">Preferências do Sistema</h3> </div>
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg gap-3"> <div> <p class="text-sm font-semibold text-[var(--azul-marinho-escuro)] mb-1">Notificações Push</p> <p class="text-xs text-[var(--azul-marinho)]/60">Receber alertas no dispositivo</p> </div> <label class="relative inline-flex items-center cursor-pointer"> <input type="checkbox" checked class="sr-only peer" onchange="showToast('Notificações atualizadas', 'success')"> <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div> </label> </div>
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg gap-3"> <div> <p class="text-sm font-semibold text-[var(--azul-marinho-escuro)] mb-1">Compartilhamento de Localização</p> <p class="text-xs text-[var(--azul-marinho)]/60">Permitir acesso ao GPS</p> </div> <label class="relative inline-flex items-center cursor-pointer"> <input type="checkbox" checked class="sr-only peer" onchange="showToast('Localização atualizada', 'success')"> <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div> </label> </div>
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg gap-3"> <div> <p class="text-sm font-semibold text-[var(--azul-marinho-escuro)] mb-1">Gravação Automática de Áudio</p> <p class="text-xs text-[var(--azul-marinho)]/60">Gravar áudio ao acionar alerta</p> </div> <label class="relative inline-flex items-center cursor-pointer"> <input type="checkbox" class="sr-only peer" onchange="showToast('Gravação atualizada', 'success')"> <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div> </label> </div>
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg gap-3"> <div> <p class="text-sm font-semibold text-[var(--azul-marinho-escuro)] mb-1">Modo Escuro</p> <p class="text-xs text-[var(--azul-marinho)]/60">Tema escuro para a interface</p> </div> <label class="relative inline-flex items-center cursor-pointer"> <input type="checkbox" class="sr-only peer" onchange="showToast('Tema atualizado', 'success')"> <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div> </label> </div>
            </div>
        </div>
    `;
}

// =========================================================
// RENDERIZAÇÃO E NAVEGAÇÃO
// =========================================================

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initEmergencyButtons();
    renderPage(currentPage); // Usa a variável global para iniciar na página correta
});

// Sistema de Navegação (ATUALIZADO PARA RESPONSIVO e ATIVAÇÃO CORRETA)
function initNavigation() {
    const navItems = document.querySelectorAll('.item-nav-sidebar');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            if (countdownInterval) clearInterval(countdownInterval); // Limpa timer ao trocar de página
            navItems.forEach(nav => nav.classList.remove('active')); // Desativa todos
            // Ativa os botões correspondentes em AMBOS os menus (desktop e mobile)
            document.querySelectorAll(`.item-nav-sidebar[data-page="${page}"]`).forEach(nav => nav.classList.add('active'));
            closeMobileMenu(); // Fecha o menu mobile se estiver aberto
            renderPage(page); // Renderiza a nova página
        });
    });
    // Ativa o botão correto ao carregar a página pela primeira vez
    document.querySelectorAll(`.item-nav-sidebar[data-page="${currentPage}"]`).forEach(nav => {
        if (nav) nav.classList.add('active');
    });
}

// Renderizar Páginas (com scroll to top)
function renderPage(page) {
    currentPage = page; // Atualiza a página atual globalmente
    const pageContent = document.getElementById('pageContent');
    const pageTitle = document.getElementById('pageTitle');
    const pages = { // Mapeamento de 'data-page' para funções e títulos
        'security': { title: 'Central de Segurança', render: renderSecurityPage, init: initSecurityPage },
        'profile': { title: 'Perfil do Usuário', render: renderProfilePage, init: null },
        'notes': { title: 'Anotações', render: renderNotesPage, init: null },
        'chat': { title: 'Chat com o Psicólogo', render: renderChatPage, init: initChatPage },
        'emergency': { title: 'Contatos de Emergência', render: renderEmergencyContactsPage, init: null },
        'settings': { title: 'Configurações', render: renderSettingsPage, init: null }
    };
    if (!pages[page]) { console.error(`Página "${page}" não encontrada.`); return; } // Tratamento de erro
    
    // Atualiza título e conteúdo da página
    pageTitle.textContent = pages[page].title;
    pageContent.innerHTML = pages[page].render();
    window.scrollTo(0, 0); // Garante que a nova página comece no topo

    // Executa função de inicialização específica da página (se houver)
    if (pages[page].init) { pages[page].init(); }
}

// =========================================================
// UTILITÁRIOS (TOASTS, MODAIS, MENU)
// =========================================================

// --- Funções do Menu Mobile ---
function openMobileMenu() {
    const sidebar = document.getElementById('mobileSidebar');
    if (sidebar) {
        sidebar.classList.remove('hidden'); 
        setTimeout(() => { sidebar.querySelector('aside').classList.remove('-translate-x-full'); }, 10); // Delay p/ transição
    }
}

function closeMobileMenu() {
    const sidebar = document.getElementById('mobileSidebar');
    if (sidebar) {
        sidebar.querySelector('aside').classList.add('-translate-x-full');
        setTimeout(() => { sidebar.classList.add('hidden'); }, 300); // Espera a transição
    }
}

// --- Funções de Emergência ---
function initEmergencyButtons() {
    document.getElementById('floatingEmergencyBtn').addEventListener('click', showEmergencyModal);
    const sidebarBtnDesktop = document.getElementById('sidebarEmergencyBtn');
    if(sidebarBtnDesktop) { sidebarBtnDesktop.addEventListener('click', showEmergencyModal); }
    // O botão da sidebar mobile usa onclick="" no HTML
}

function showEmergencyModal() {
    const modal = document.getElementById('emergencyModal');
    modal.classList.remove('hidden'); modal.classList.add('flex');
}

function closeEmergencyModal() {
    const modal = document.getElementById('emergencyModal');
    modal.classList.add('hidden'); modal.classList.remove('flex');
}

function confirmEmergency() {
    closeEmergencyModal();
    showToast('Alerta enviado!', 'success', 'Contatos notificados.');
}

// --- Funções do Sensor (Modal e Toggles) ---

/**
 * Lida com o clique no interruptor (toggle) de um sensor.
 * Atualiza o estado no array e a interface diretamente (sem recarregar a página).
 */
function toggleSensor(sensorId, isChecked) {
    const sensorIndex = sensorsData.findIndex(s => s.id === sensorId);
    if (sensorIndex === -1) return;
    sensorsData[sensorIndex].isActive = isChecked;
    const sensor = sensorsData[sensorIndex];
    const status = isChecked ? "ativado" : "desativado";
    showToast(`${sensor.name} ${status}!`, isChecked ? 'success' : 'info');

    // Atualiza DOM diretamente
    const sensorElement = document.getElementById(sensor.id);
    if (sensorElement) {
        sensorElement.classList.toggle('opacity-60', !isChecked);
        const statusElement = sensorElement.querySelector('.sensor-status');
        if (statusElement) {
            statusElement.textContent = isChecked ? 'Ativo' : 'Desativado';
            statusElement.className = `sensor-status font-semibold text-sm ml-2 ${isChecked ? 'text-green-600' : 'text-red-500'}`;
        }
    }
    // Atualiza contador na seção de Detecção
    const activeSensors = sensorsData.filter(s => s.isActive).length;
    const totalSensors = sensorsData.length;
    const countElement = document.getElementById('activeSensorCount');
    if (countElement) { countElement.textContent = `${activeSensors}/${totalSensors} Ativos`; }
    
    // Atualiza contador e status no Header Principal
    const headerSensorCount = document.getElementById('headerSensorCount');
    if(headerSensorCount) { headerSensorCount.textContent = `${activeSensors}/${totalSensors}`; }
    const headerSystemStatus = document.getElementById('headerSystemStatus');
    if(headerSystemStatus) {
        const allActive = activeSensors === totalSensors;
        headerSystemStatus.textContent = allActive ? 'Sistemas Ativos' : 'Atenção Necessária';
        headerSystemStatus.classList.remove('bg-green-500', 'bg-orange-500');
        headerSystemStatus.classList.add(allActive ? 'bg-green-500' : 'bg-orange-500');
    }
}

function showSensorModal(sensorName) {
    const modal = document.getElementById('sensorModal');
    document.getElementById('sensorName').textContent = sensorName;
    modal.classList.remove('hidden'); modal.classList.add('flex');
    if (countdownInterval) { clearInterval(countdownInterval); } // Para timer de checkin ou outro sensor
    timeRemaining = 60;
    updateSensorCountdown();
    countdownInterval = setInterval(() => {
        timeRemaining--;
        updateSensorCountdown();
        if (timeRemaining <= 0) { clearInterval(countdownInterval); sendAlertNow(); }
    }, 1000);
}

function updateSensorCountdown() {
    const countdownEl = document.getElementById('countdown');
    const countdownTextEl = document.getElementById('countdownText');
    const progressFill = document.getElementById('progressFill');
    if (countdownEl) countdownEl.textContent = timeRemaining;
    if (countdownTextEl) countdownTextEl.textContent = timeRemaining;
    if (progressFill) { progressFill.style.width = (timeRemaining / 60) * 100 + '%'; }
}

function confirmSafe() {
    if (countdownInterval) { clearInterval(countdownInterval); }
    const modal = document.getElementById('sensorModal');
    modal.classList.add('hidden'); modal.classList.remove('flex');
    showToast('Segurança confirmada!', 'success', 'Sensor resetado.');
    if (currentPage === 'security') initSecurityPage(); // Reinicia timer de check-in
}

function sendAlertNow() {
    if (countdownInterval) { clearInterval(countdownInterval); }
    const modal = document.getElementById('sensorModal');
    modal.classList.add('hidden'); modal.classList.remove('flex');
    showToast('Alerta enviado!', 'error', 'Contatos notificados.');
    if (currentPage === 'security') initSecurityPage(); // Reinicia timer de check-in
}

// --- Sistema de Toasts ---
function showToast(title, type = 'info', description = '') {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const colors = { success: 'border-green-500', error: 'border-red-500', info: 'border-blue-500' };
    const iconColors = { success: 'text-green-500', error: 'text-red-500', info: 'text-blue-500' };
    const toast = document.createElement('div');
    toast.className = `bg-white rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[300px] max-w-md border-l-4 ${colors[type]} slide-up pointer-events-auto`;
    toast.innerHTML = `
        <i class="fas ${icons[type]} text-xl ${iconColors[type]}"></i>
        <div class="flex-1">
            <div class="font-semibold text-gray-900">${title}</div>
            ${description ? `<div class="text-sm text-gray-600 mt-1">${description}</div>` : ''}
        </div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0'; toast.style.transform = 'translateY(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// --- Fechar modais ao clicar fora ---
window.addEventListener('click', function(event) {
    const emergencyModal = document.getElementById('emergencyModal');
    const sensorModal = document.getElementById('sensorModal');
    if (event.target === emergencyModal) { closeEmergencyModal(); }
    if (event.target === sensorModal) {
        if (countdownInterval) { clearInterval(countdownInterval); } // Para o timer do sensor
        sensorModal.classList.add('hidden'); sensorModal.classList.remove('flex');
        if (currentPage === 'security') initSecurityPage(); // Reinicia timer de check-in
    }
});