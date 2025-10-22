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
    { id: 1, title: 'Anotação Importante', content: 'Lembrar de ligar para consulta na próxima semana...', date: '2025-01-15' },
    { id: 2, title: 'Consulta Psicólogo', content: 'Próxima consulta dia 20 às 14h...', date: '2025-01-14' },
    { id: 3, title: 'Documentos', content: 'Organizar documentos importantes...', date: '2025-01-13' }
];

const chatMessages = [
    { sender: 'psychologist', text: 'Olá! Como você está se sentindo hoje?', time: '10:30' },
    { sender: 'user', text: 'Estou me sentindo melhor, obrigada.', time: '10:32' },
    { sender: 'psychologist', text: 'Que bom! Gostaria de conversar sobre algo específico?', time: '10:33' },
    { sender: 'user', text: 'Gostaria de falar sobre como lidar com momentos difíceis.', time: '10:35' }
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

    // Se houver dias, mostra dias e horas. Se não, horas e minutos.
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
    // O progresso é o tempo *decorrido* em relação ao total de 72h.
    return Math.min(100, (elapsed / CHECKIN_INTERVAL_SECONDS) * 100);
}


// =========================================================
// RENDERIZAÇÃO DE COMPONENTES DE SEGURANÇA
// =========================================================

/**
 * Renderiza o bloco completo do Check-in de Segurança.
 * @returns {string} O HTML formatado do componente.
 */
function renderSafetyCheckIn() {
    const timeString = formatTimeRemaining(checkInTimeLeft);
    const progressPercentage = getProgressPercentage(checkInTimeLeft);

    // Dados Mock para Histórico
    const checkInHistoryData = [
        { date: '2025-10-16', time: '14:30', content: 'Confirmado' },
        { date: '2025-10-13', time: '09:15', content: 'Confirmado' },
        { date: '2025-10-10', time: '18:45', content: 'Confirmado' }
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
    
    // Substituindo as variáveis Tailwind primárias (primary, primary-light) 
    // pelas variáveis CSS que você definiu (var(--azul-marinho), var(--azul-claro))
    
    return `
        <div class="bg-[var(--branco)] rounded-xl border-2 border-[var(--azul-claro)] p-6">
            <div class="flex items-start justify-between mb-6">
                <div class="flex items-center gap-3">
                    <i class="fas fa-clock text-2xl text-[var(--azul-marinho)]"></i>
                    <div>
                        <h3 class="text-[var(--azul-marinho-escuro)] mb-1 font-semibold">Check-in de Segurança</h3>
                        <p class="text-sm text-[var(--azul-marinho-escuro)] opacity-60">Confirme sua segurança a cada 72 horas</p>
                    </div>
                </div>
                <span id="checkin-status-badge" class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Ativo</span>
            </div>

            <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-[var(--azul-marinho-escuro)] opacity-70">Tempo até próximo check-in</span>
                    <span id="checkin-timer-display" class="text-lg font-bold text-[var(--azul-marinho-escuro)]">${timeString}</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div id="checkin-progress-bar" class="h-full bg-[var(--azul-marinho)] transition-all duration-1000" style="width: ${progressPercentage}%;"></div>
                </div>
            </div>
            
            <button id="performCheckInBtn" onclick="performCheckIn()" class="w-full bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-[var(--branco)] py-3 rounded-lg font-semibold transition-colors">
                <i class="fas fa-check mr-2"></i> Confirmar que Estou Segura
            </button>

            <div class="pt-4 border-t border-[var(--azul-claro)] mt-4">
                <p class="text-xs text-[var(--azul-marinho-escuro)] opacity-60 mb-3">Histórico de Check-ins Recentes</p>
                <div class="space-y-2">${checkInHistoryHtml}</div>
            </div>

            <div class="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p class="text-xs text-orange-900"><strong>Importante:</strong> Se você não confirmar sua segurança em até 72 horas, seus contatos de emergência serão notificados.</p>
            </div>
        </div>
    `;
}

/**
 * Função de suporte para renderizar cada item do sensor de forma limpa
 */
function renderSensorItem(name, description, icon, sensitivity) {
    return `
        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex items-center gap-3">
                <i class="fas ${icon} text-primary text-xl"></i>
                <div>
                    <p class="font-semibold text-primary">${name} <span class="text-green-600 font-semibold text-sm ml-2">Ativo</span></p>
                    <p class="text-xs text-gray-600">${description}</p>
                    <div class="h-1 bg-gray-300 rounded-full overflow-hidden mt-1" style="width: 100px;">
                        <div class="h-full bg-primary" style="width: ${sensitivity}%;"></div>
                    </div>
                </div>
            </div>
            <button onclick="testSensor('${name}')" class="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light transition-colors text-sm font-semibold">
                Testar
            </button>
        </div>
    `;
}

/**
 * Renderiza o bloco completo da Detecção Automática.
 * @returns {string} O HTML formatado do componente.
 */
function renderAutomaticDetection() {
    return `
        <div class="bg-white rounded-xl border-2 border-primary-light p-6">
            <div class="flex items-center gap-3 mb-6">
                <div class="bg-primary-light p-3 rounded-full">
                    <i class="fas fa-robot text-primary text-xl"></i>
                </div>
                <h3 class="text-xl font-bold text-primary">Detecção Automática</h3>
                <span class="ml-auto px-3 py-1 bg-[var(--azul-marinho-escuro)] text-[var(--branco)] rounded-full text-xs font-semibold">4/4 Ativos</span>
            </div>
            
            <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-sm text-blue-900 mb-2"><strong>Como funciona:</strong> Os sensores monitoram automaticamente padrões que podem indicar situações de perigo.</p>
                <p class="text-sm text-blue-900">Quando acionados, você terá <strong>60 segundos</strong> para confirmar que está segura.</p>
            </div>
            
            <div class="space-y-3">
                ${renderSensorItem('Detector de Movimento Brusco', 'Detecta movimentos súbitos ou quedas do dispositivo', 'fa-bolt', 77)}
                ${renderSensorItem('Detector de Sons Altos', 'Identifica gritos, sons altos ou vozes agressivas', 'fa-volume-up', 80)}
                ${renderSensorItem('Detector de Queda', 'Detecta quedas bruscas que podem indicar perigo', 'fa-arrow-down', 70)}
                ${renderSensorItem('Botão de Pânico por Agitação', 'Agite o celular 3 vezes rapidamente para disparar alerta', 'fa-mobile-alt', 85)}
            </div>
        </div>
    `;
}

// =========================================================
// RENDERIZAÇÃO DE PÁGINAS
// =========================================================

// Central de Segurança
function renderSecurityPage() {
    // Note: Esta função junta os blocos para formar o layout da página
    return `
        <div class="bg-gradient-to-r from-[var(--azul-marinho-escuro)] to-[var(--azul-marinho)] text-[var(--branco)] rounded-xl p-8 border-2 border-[var(--azul-marinho-escuro)] mb-6">
            
            <div class="flex justify-between items-start mb-6">
                <div class="flex gap-4 items-center">
                    <div class="bg-[var(--branco)] p-4 rounded-full">
                        <i class="fas fa-shield-alt text-3xl text-[var(--azul-marinho)]"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold mb-2">Central de Segurança</h2>
                        <p class="text-[var(--azul-claro)]">Sistema de proteção integrado e monitoramento 24/7</p>
                    </div>
                </div>
                <span class="px-4 py-2 bg-green-500 text-[var(--branco)] rounded-full text-sm font-semibold border-0">
                    Todos os Sistemas Ativos
                </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div class="flex items-center gap-3 mb-2"><i class="fas fa-microchip text-[var(--azul-claro)]"></i><span class="text-sm text-[var(--azul-claro)]">Sensores</span></div>
                    <p class="text-3xl font-bold mb-1">4/4</p><p class="text-xs text-[var(--azul-claro)]">Ativos e monitorando</p>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div class="flex items-center gap-3 mb-2"><i class="fas fa-clock text-[var(--azul-claro)]"></i><span class="text-sm text-[var(--azul-claro)]">Check-in</span></div>
                    <p class="text-3xl font-bold mb-1">${formatTimeRemaining(checkInTimeLeft)}</p><p class="text-xs text-[var(--azul-claro)]">Próximo em ${formatTimeRemaining(CHECKIN_INTERVAL_SECONDS)}</p>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div class="flex items-center gap-3 mb-2"><i class="fas fa-user-friends text-[var(--azul-claro)]"></i><span class="text-sm text-[var(--azul-claro)]">Contatos</span></div>
                    <p class="text-3xl font-bold mb-1">${emergencyContacts.length}</p><p class="text-xs text-[var(--azul-claro)]">Contatos de emergência</p>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div class="flex items-center gap-3 mb-2"><i class="fas fa-map-marker-alt text-[var(--azul-claro)]"></i><span class="text-sm text-[var(--azul-claro)]">Localização</span></div>
                    <p class="text-3xl font-bold mb-1">ON</p><p class="text-xs text-[var(--azul-claro)]">GPS compartilhado</p>
                </div>
            </div>
        </div>

        <div class="bg-gradient-to-r from-[var(--azul-marinho-escuro)] to-[var(--azul-marinho)] text-[var(--branco)] rounded-xl p-8 border-2 border-[var(--azul-marinho-escuro)] mb-6"">
            <div class="flex justify-between items-start mb-6">
                <div class="flex items-center gap-3">
                    <i class="fas fa-shield-alt text-2xl text-[var(--branco)]"></i>
                    <h3 class="text-xl font-bold text-[var(--branco)]">Ações Rápidas</h3>
                </div>
                <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><i class="fas fa-location-arrow"></i> Localização Ativa</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button id="security-alert-imediato-btn" onclick="showEmergencyModal()" class="bg-red-600 hover:bg-red-700 text-[var(--branco)] rounded-lg p-6 flex flex-col items-center gap-2 transition-colors">
                    <i class="fas fa-exclamation-triangle text-3xl"></i>
                    <span class="font-semibold text-lg">Alerta de Emergência</span>
                    <small class="text-sm opacity-90">Notifica contatos de confiança</small>
                </button>
                <button id="security-alert-silencioso-btn" onclick="showToast('Alerta silencioso ativado', 'info', 'Monitoramento discreto iniciado.')" class="bg-orange-600 hover:bg-orange-700 text-[var(--branco)] rounded-lg p-6 flex flex-col items-center gap-2 transition-colors">
                    <i class="fas fa-bell-slash text-3xl"></i>
                    <span class="font-semibold text-lg">Alerta Silencioso</span>
                    <small class="text-sm opacity-90">Monitora sem notificação</small>
                </button>
                <button id="security-chamar-190-btn" onclick="showToast('Discando 190...', 'info', 'Chamada de emergência sendo iniciada')" class="bg-[var(--azul-claro)] hover:bg-[var(--azul-claro-houver)] text-[var(--azul-marinho)] rounded-lg p-6 flex flex-col items-center gap-2 transition-colors">
                    <i class="fas fa-phone text-3xl"></i>
                    <span class="font-semibold text-lg">Ligar 190</span>
                    <small class="text-sm opacity-70">Polícia Militar</small>
                </button>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200">
                <div class="grid grid-cols-4 gap-4 text-center text-sm text-[var(--branco)]">
                    <div><p class="text-xs text-[var(--azul-claro)]">Último Check-in</p><p class="font-semibold">Há 5 minutos</p></div>
                    <div><p class="text-xs text-[var(--azul-claro)]">Contatos Ativos</p><p class="font-semibold">${emergencyContacts.length} pessoas</p></div>
                    <div><p class="text-xs text-[var(--azul-claro)]">Sensores Ativos</p><p class="font-semibold">4/4</p></div>
                    <div><button class="text-[var(--azul-claro)] hover:text-[var(--branco)] opacity-80">Pausar Localização</button></div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            ${renderSafetyCheckIn()}
            ${renderAutomaticDetection()} 
        </div>

        <div class="bg-white rounded-xl border-2 border-primary-light p-6">
            <h3 class="text-xl font-bold text-primary mb-4">Dicas de Segurança</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 class="text-sm font-semibold text-primary mb-2">📱 Mantenha seu celular carregado</h4>
                    <p class="text-xs text-primary/70">
                        Certifique-se de que seu dispositivo esteja sempre com bateria suficiente para acionar os alertas de emergência.
                    </p>
                </div>
                <div class="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 class="text-sm font-semibold text-primary mb-2">🔒 Configure seus contatos</h4>
                    <p class="text-xs text-primary/70">
                        Adicione pessoas de confiança que possam responder rapidamente em caso de emergência.
                    </p>
                </div>
                <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 class="text-sm font-semibold text-primary mb-2">⏰ Faça check-ins regulares</h4>
                    <p class="text-xs text-primary/70">
                        Não espere até o último momento. Confirme sua segurança regularmente para manter o sistema ativo.
                    </p>
                </div>
                <div class="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 class="text-sm font-semibold text-primary mb-2">🧪 Teste os sensores</h4>
                    <p class="text-xs text-primary/70">
                        Use os botões de teste para se familiarizar com como o sistema funciona e como responder aos alertas.
                    </p>
                </div>
            </div>
        </div>
    `;
}

function initSecurityPage() {
    // Inicia a atualização do timer a cada segundo
    if (countdownInterval) clearInterval(countdownInterval); // Limpa o timer anterior (seja sensor ou check-in)
    
    let checkInTimerInterval = setInterval(() => {
        checkInTimeLeft--;
        
        // Verifica se o tempo esgotou (alerta)
        if (checkInTimeLeft < 0) {
            clearInterval(checkInTimerInterval);
            checkInTimeLeft = CHECKIN_INTERVAL_SECONDS; // Resetar para o próximo ciclo
            showToast('Alerta de Check-in!', 'error', 'O prazo de 72 horas expirou. Alerta enviado aos contatos.');
            // Precisa re-iniciar o timer após o alerta
            initSecurityPage(); 
            return;
        }
        
        // Atualiza a visualização no bloco de Check-in (formato da imagem)
        const timerDisplay = document.getElementById('checkin-timer-display');
        const progressBar = document.getElementById('checkin-progress-bar');
        
        if (timerDisplay) timerDisplay.textContent = formatTimeRemaining(checkInTimeLeft);
        if (progressBar) progressBar.style.width = getProgressPercentage(checkInTimeLeft) + '%';
        
    }, 1000);
    
    // Usa a variável global para o check-in, mas pode ser limpa por outra função
    countdownInterval = checkInTimerInterval; 
}

function performCheckIn() {
    checkInTimeLeft = CHECKIN_INTERVAL_SECONDS; // Resetar para 72 horas
    showToast('Check-in realizado com sucesso!', 'success', 'Próximo check-in em 72 horas');
    
    // Não precisa recarregar a página, a função initSecurityPage (rodando via setInterval)
    // já se encarregará de atualizar o display no próximo segundo.
}

function testSensor(sensorName) {
    showSensorModal(sensorName);
}

// =========================================================
// RENDERIZAÇÃO DE OUTRAS PÁGINAS
// =========================================================

// Perfil
function renderProfilePage() {
    // Definindo as variáveis para o usuário (pode vir de um estado real da aplicação)
    const userName = "Mariana Moenchiali";
    const userEmail = "marimoenchiali@email.com";
    const userPhone = "+55 11 98765-4321";
    const userBirthDate = "15/05/1990";
    const userAddress = "Rua Example, 123 - São Paulo, SP";
    const userSince = "Janeiro 2025";
    const lastPasswordChange = "15 de Janeiro de 2025";
    
    // Contagem de estatísticas (usando os arrays mock)
    const stats = [
        { count: emergencyContacts.length, label: 'Contatos de Emergência', icon: 'fas fa-users' },
        { count: 47, label: 'Check-ins Realizados', icon: 'fas fa-check-circle' },
        { count: notes.length, label: 'Anotações Salvas', icon: 'fas fa-file-alt' },
        { count: 5, label: 'Conversas com Psicólogo', icon: 'fas fa-comment-dots' }
    ];

    return `
        <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] overflow-hidden shadow-lg mb-8">
            
            <div class="h-32 bg-gradient-to-r from-[var(--azul-marinho-escuro)] to-[var(--azul-marinho)]"></div>
            
            <div class="px-8 pb-8">
                <div class="flex justify-between items-end -mt-16 mb-6">
                    <div class="flex gap-4 items-end">
                        <div class="relative">
                            <img src="./assets/img/foto perfil.png" 
                                    alt="${userName}" 
                                    class="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover">
                            <button onclick="showToast('Selecionando nova foto...', 'info')" 
                                    class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-[var(--branco)] flex items-center justify-center text-sm transition-colors">
                                <i class="fas fa-camera text-"></i>
                            </button>
                        </div>
                        <div class="mb-2">
                            <h2 class="text-2xl font-bold text-[var(--azul-marinho-escuro)] mb-1">${userName}</h2>
                            <p class="text-primary/60">Usuário desde ${userSince}</p>
                        </div>
                    </div>
                    <span class="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200 mb-2">
                        Conta Ativa
                    </span>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    ${stats.map(stat => `
                        <div class="p-4 bg-[var(--azul-claro)] rounded-lg text-center border border-[var(--azul-claro)]/50">
                            <p class="text-3xl font-bold text-primary mb-1">${stat.count}</p>
                            <p class="text-xs text-primary/80">${stat.label}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl border-2 border-primary-light p-6 mb-8">
            <div class="flex items-center gap-3 mb-6 border-b border-primary-light pb-4">
                <div class="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-xl">
                    <i class="fas fa-user"></i>
                </div>
                <h3 class="text-xl font-bold text-primary">Informações Pessoais</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-8">
                
                <div>
                    <label class="block text-sm font-medium text-primary mb-2">Nome Completo</label>
                    <div class="relative">
                        <input type="text" value="${userName}" class="w-full px-4 py-3 border border-primary-light rounded-lg focus:outline-none focus:border-primary">
                        <i class="fas fa-user absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-primary mb-2">Email</label>
                    <div class="relative">
                        <input type="email" value="${userEmail}" class="w-full px-4 py-3 border border-primary-light rounded-lg focus:outline-none focus:border-primary">
                        <i class="fas fa-envelope absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-primary mb-2">Telefone</label>
                    <div class="relative">
                        <input type="tel" value="${userPhone}" class="w-full px-4 py-3 border border-primary-light rounded-lg focus:outline-none focus:border-primary">
                        <i class="fas fa-phone absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-primary mb-2">Data de Nascimento</label>
                    <div class="relative">
                        <input type="text" value="${userBirthDate}" class="w-full px-4 py-3 border border-primary-light rounded-lg focus:outline-none focus:border-primary" onfocus="(this.type='date')" onblur="(this.type='text')">
                        <i class="fas fa-calendar-alt absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>
                
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-primary mb-2">Endereço</label>
                    <div class="relative">
                        <input type="text" value="${userAddress}" class="w-full px-4 py-3 border border-primary-light rounded-lg focus:outline-none focus:border-primary">
                        <i class="fas fa-map-marker-alt absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>
            </div>
            
            <div class="flex gap-3 pt-6 border-t border-primary-light">
                <button onclick="showToast('Alterações salvas com sucesso!', 'success')" class="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
                    Salvar Alterações
                </button>
                <button class="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light font-semibold transition-colors">
                    Cancelar
                </button>
            </div>
        </div>

        <div class="bg-white rounded-xl border-2 border-primary-light p-6">
            <div class="flex items-center gap-3 mb-6 border-b border-primary-light pb-4">
                <div class="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-xl">
                    <i class="fas fa-lock"></i>
                </div>
                <h3 class="text-xl font-bold text-primary">Segurança da Conta</h3>
            </div>
            
            <div class="space-y-4">
                <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p class="text-sm font-semibold text-primary mb-1">Senha</p>
                        <p class="text-xs text-primary/60">Última alteração: ${lastPasswordChange}</p>
                    </div>
                    <button onclick="showToast('Redirecionando para alteração de senha...', 'info')" 
                            class="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light text-sm font-semibold transition-colors">
                        Alterar Senha
                    </button>
                </div>
                
                <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p class="text-sm font-semibold text-primary mb-1">Autenticação em Dois Fatores</p>
                        <p class="text-xs text-primary/60">Adicione uma camada extra de segurança</p>
                    </div>
                    <span class="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold border border-orange-200">
                        Desativado
                    </span>
                </div>

                <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p class="text-sm font-semibold text-primary mb-1">Sessões Ativas</p>
                        <p class="text-xs text-primary/60">2 dispositivos conectados</p>
                    </div>
                    <button onclick="showToast('Gerenciando sessões ativas...', 'info')" 
                            class="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light text-sm font-semibold transition-colors">
                        Gerenciar
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Anotações
function renderNotesPage() {
    return `
        <div class="bg-white rounded-xl border-2 border-primary-light p-6">
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-3">
                    <div class="bg-primary-light p-3 rounded-full">
                        <i class="fas fa-file-alt text-primary text-xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-primary">Minhas Anotações</h3>
                </div>
                <button onclick="showToast('Criando nova anotação...', 'info')" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
                    <i class="fas fa-plus mr-2"></i>Nova Anotação
                </button>
            </div>
            <div class="space-y-3">
                ${notes.map(note => `
                    <div class="p-4 bg-gray-50 rounded-lg border-l-4 border-primary hover:bg-gray-100 transition-colors">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-semibold text-primary mb-2">${note.title}</h4>
                                <p class="text-sm text-gray-600 mb-2">${note.content}</p>
                                <p class="text-xs text-primary/60">${new Date(note.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <button onclick="showToast('Editando anotação...', 'info')" class="px-3 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light text-sm transition-colors">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Chat
function renderChatPage() {
    return `
        <div class="bg-white rounded-xl border-2 border-primary-light flex flex-col" style="height: 600px;">
            <div class="flex items-center gap-3 p-6 border-b border-primary-light">
                <div class="bg-primary-light p-3 rounded-full">
                    <i class="fas fa-comment-dots text-primary text-xl"></i>
                </div>
                <h3 class="text-xl font-bold text-primary">Conversa com Dr. João Souza</h3>
            </div>
            <div class="flex-1 overflow-y-auto p-6 bg-gray-50" id="chatMessages">
                ${chatMessages.map(msg => `
                    <div class="flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4">
                        <div class="max-w-sm md:max-w-md px-4 py-3 rounded-lg ${
                            msg.sender === 'user' 
                                ? 'bg-primary text-white' 
                                : 'bg-white border border-primary-light text-primary'
                        }">
                            <p class="mb-1">${msg.text}</p>
                            <p class="text-xs opacity-70">${msg.time}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="p-4 border-t border-primary-light flex gap-3">
                <input type="text" placeholder="Digite sua mensagem..." id="chatInput" 
                        class="flex-1 px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:border-primary"
                        onkeypress="if(event.key==='Enter') sendMessage()">
                <button onclick="sendMessage()" class="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
}

function initChatPage() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    if (input && input.value.trim()) {
        // Lógica de envio da mensagem aqui...
        showToast('Mensagem enviada!', 'success');
        input.value = '';
    }
}

// Contatos de Emergência
function renderEmergencyContactsPage() {
    return `
        <div class="bg-white rounded-xl border-2 border-primary-light p-6">
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-3">
                    <div class="bg-primary-light p-3 rounded-full">
                        <i class="fas fa-users text-primary text-xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-primary">Contatos de Emergência</h3>
                </div>
                <button onclick="showToast('Adicionando novo contato...', 'info')" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
                    <i class="fas fa-plus mr-2"></i>Adicionar Contato
                </button>
            </div>
            <div class="space-y-3">
                ${emergencyContacts.map(contact => `
                    <div class="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                                ${contact.name.charAt(0)}
                            </div>
                            <div>
                                <h4 class="font-semibold text-primary mb-1">${contact.name}</h4>
                                <p class="text-sm text-gray-600 mb-0.5">${contact.phone}</p>
                                <p class="text-xs text-primary/60">${contact.relationship}</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="showToast('Ligando para ${contact.name}...', 'info')" class="px-3 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light transition-colors">
                                <i class="fas fa-phone"></i>
                            </button>
                            <button onclick="showToast('Editando contato...', 'info')" class="px-3 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light transition-colors">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Configurações
function renderSettingsPage() {
    return `
        <div class="bg-white rounded-xl border-2 border-primary-light p-6">
            <div class="flex items-center gap-3 mb-6">
                <div class="bg-primary-light p-3 rounded-full">
                    <i class="fas fa-cog text-primary text-xl"></i>
                </div>
                <h3 class="text-xl font-bold text-primary">Preferências do Sistema</h3>
            </div>
            <div class="space-y-4">
                <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p class="text-sm font-semibold text-primary mb-1">Notificações Push</p>
                        <p class="text-xs text-primary/60">Receber alertas no dispositivo</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked class="sr-only peer" onchange="showToast('Notificações atualizadas', 'success')">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
                <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p class="text-sm font-semibold text-primary mb-1">Compartilhamento de Localização</p>
                        <p class="text-xs text-primary/60">Permitir acesso ao GPS</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked class="sr-only peer" onchange="showToast('Localização atualizada', 'success')">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
                <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p class="text-sm font-semibold text-primary mb-1">Gravação Automática de Áudio</p>
                        <p class="text-xs text-primary/60">Gravar áudio ao acionar alerta</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" onchange="showToast('Gravação de áudio atualizada', 'success')">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
                <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p class="text-sm font-semibold text-primary mb-1">Modo Escuro</p>
                        <p class="text-xs text-primary/60">Tema escuro para a interface</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" onchange="showToast('Tema atualizado', 'success')">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
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
    renderPage('security');
});

// Sistema de Navegação
function initNavigation() {
    const navItems = document.querySelectorAll('.item-nav-sidebar');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            
            // Limpar timer anterior para não ter conflito de setInterval
            if (countdownInterval) clearInterval(countdownInterval);
            
            // Atualizar estado ativo
            navItems.forEach(nav => {
                // Aqui você deve usar as classes CSS corretas que o Tailwind gera para 'active'
                nav.classList.remove('active'); 
            });
            this.classList.add('active');
            
            // Renderizar página
            renderPage(page);
        });
    });
    
    // Ativar botão de navegação da página inicial ('security')
    const initialActiveButton = document.querySelector(`.item-nav-sidebar[data-page="${currentPage}"]`);
    if (initialActiveButton) initialActiveButton.classList.add('active');
}

// Renderizar Páginas
function renderPage(page) {
    currentPage = page;
    const pageContent = document.getElementById('pageContent');
    const pageTitle = document.getElementById('pageTitle');
    
    const pages = {
        'security': { title: 'Central de Segurança', render: renderSecurityPage, init: initSecurityPage },
        'profile': { title: 'Perfil do Usuário', render: renderProfilePage, init: null },
        'notes': { title: 'Anotações', render: renderNotesPage, init: null },
        'chat': { title: 'Chat com o Psicólogo', render: renderChatPage, init: initChatPage },
        // O HTML da sidebar usa 'emergency' para contatos.
        'emergency': { title: 'Contatos de Emergência', render: renderEmergencyContactsPage, init: null },
        'settings': { title: 'Configurações', render: renderSettingsPage, init: null }
    };
    
    if (!pages[page]) {
        console.error(`Página "${page}" não encontrada.`);
        return;
    }
    
    pageTitle.textContent = pages[page].title;
    pageContent.innerHTML = pages[page].render();
    
    // Reinicializar eventos específicos da página
    if (pages[page].init) {
        pages[page].init();
    }
}


// =========================================================
// UTILITÁRIOS (TOASTS E MODAIS)
// =========================================================

// Sistema de Emergência (Botões Flutuantes e da Sidebar)
function initEmergencyButtons() {
    document.getElementById('floatingEmergencyBtn').addEventListener('click', showEmergencyModal);
    document.getElementById('sidebarEmergencyBtn').addEventListener('click', showEmergencyModal);
}

function showEmergencyModal() {
    const modal = document.getElementById('emergencyModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeEmergencyModal() {
    const modal = document.getElementById('emergencyModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function confirmEmergency() {
    closeEmergencyModal();
    showToast('Alerta de emergência enviado!', 'success', 'Seus contatos de confiança foram notificados.');
}

// Sistema de Sensores
function showSensorModal(sensorName) {
    const modal = document.getElementById('sensorModal');
    document.getElementById('sensorName').textContent = sensorName;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Limpa qualquer timer anterior (seja de check-in ou outro sensor)
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Iniciar countdown
    timeRemaining = 60;
    updateSensorCountdown();
    
    countdownInterval = setInterval(() => {
        timeRemaining--;
        updateSensorCountdown();
        
        if (timeRemaining <= 0) {
            clearInterval(countdownInterval);
            sendAlertNow();
        }
    }, 1000);
}

function updateSensorCountdown() {
    const countdownEl = document.getElementById('countdown');
    const countdownTextEl = document.getElementById('countdownText');
    const progressFill = document.getElementById('progressFill');
    
    if (countdownEl) countdownEl.textContent = timeRemaining;
    if (countdownTextEl) countdownTextEl.textContent = timeRemaining;
    if (progressFill) {
        const percentage = (timeRemaining / 60) * 100;
        progressFill.style.width = percentage + '%';
    }
}

function confirmSafe() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    const modal = document.getElementById('sensorModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    showToast('Obrigado por confirmar!', 'success', 'Sensor resetado. Continuamos monitorando sua segurança.');
    
    // Re-inicia o timer de check-in se estiver na página de segurança
    if (currentPage === 'security') initSecurityPage();
}

function sendAlertNow() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    const modal = document.getElementById('sensorModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    showToast('Alerta de emergência enviado!', 'error', 'Seus contatos foram notificados com sua localização.');
    
    // Re-inicia o timer de check-in se estiver na página de segurança
    if (currentPage === 'security') initSecurityPage();
}

// Sistema de Toasts
function showToast(title, type = 'info', description = '') {
    const container = document.getElementById('toastContainer');
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    const colors = {
        success: 'border-green-500',
        error: 'border-red-500',
        info: 'border-blue-500'
    };
    
    const iconColors = {
        success: 'text-green-500',
        error: 'text-red-500',
        info: 'text-blue-500'
    };
    
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
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Fechar modais ao clicar fora
window.addEventListener('click', function(event) {
    const emergencyModal = document.getElementById('emergencyModal');
    const sensorModal = document.getElementById('sensorModal');
    
    if (event.target === emergencyModal) {
        closeEmergencyModal();
    }
    
    if (event.target === sensorModal) {
        // Se o modal do sensor for fechado, o timer deve ser parado
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        sensorModal.classList.add('hidden');
        sensorModal.classList.remove('flex');
        
        // Re-inicia o timer de check-in se estiver na página de segurança
        if (currentPage === 'security') initSecurityPage();
    }
});