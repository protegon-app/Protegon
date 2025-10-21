// Estado da Aplicação
let currentPage = 'security';
let countdownInterval = null;
let timeRemaining = 60;
let checkInTimeLeft = 71 * 60 * 60; // 71 horas em segundos

// Dados Mock
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

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initEmergencyButtons();
    renderPage('security');
});

// Sistema de Navegação
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            
            // Atualizar estado ativo
            navItems.forEach(nav => {
                nav.classList.remove('bg-primary-dark', 'text-primary-light');
            });
            this.classList.add('bg-primary-dark', 'text-primary-light');
            
            // Renderizar página
            renderPage(page);
        });
    });
    
    // Ativar primeira página
    navItems[0].classList.add('bg-primary-dark', 'text-primary-light');
}

// Renderizar Páginas
function renderPage(page) {
    currentPage = page;
    const pageContent = document.getElementById('pageContent');
    const pageTitle = document.getElementById('pageTitle');
    
    const pages = {
        'security': { title: 'Central de Segurança', render: renderSecurityPage },
        'profile': { title: 'Perfil do Usuário', render: renderProfilePage },
        'notes': { title: 'Anotações', render: renderNotesPage },
        'chat': { title: 'Chat com o Psicólogo', render: renderChatPage },
        'emergency': { title: 'Contatos de Emergência', render: renderEmergencyContactsPage },
        'settings': { title: 'Configurações', render: renderSettingsPage }
    };
    
    pageTitle.textContent = pages[page].title;
    pageContent.innerHTML = pages[page].render();
    
    // Reinicializar eventos específicos da página
    if (page === 'security') {
        initSecurityPage();
    } else if (page === 'chat') {
        initChatPage();
    }
}

// Central de Segurança
function renderSecurityPage() {
    return `
        <!-- Header da Central -->
        <div class="bg-gradient-to-r from-primary-dark to-primary text-white rounded-xl p-8 border-2 border-primary mb-6">
            <div class="flex justify-between items-start mb-6">
                <div class="flex gap-4 items-center">
                    <div class="bg-white p-4 rounded-full">
                        <i class="fas fa-shield-alt text-3xl text-primary"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold mb-2">Central de Segurança</h2>
                        <p class="text-primary-light">Sistema de proteção integrado e monitoramento 24/7</p>
                    </div>
                </div>
                <span class="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200">
                    Todos os Sistemas Ativos
                </span>
            </div>
            
            <!-- Status Rápido -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div class="flex items-center gap-3 mb-2">
                        <i class="fas fa-activity text-primary-light"></i>
                        <span class="text-sm text-primary-light">Sensores</span>
                    </div>
                    <p class="text-3xl font-bold mb-1">4/4</p>
                    <p class="text-xs text-primary-light">Ativos e monitorando</p>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div class="flex items-center gap-3 mb-2">
                        <i class="fas fa-clock text-primary-light"></i>
                        <span class="text-sm text-primary-light">Check-in</span>
                    </div>
                    <p class="text-3xl font-bold mb-1">71h</p>
                    <p class="text-xs text-primary-light">Próximo em 71 horas</p>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div class="flex items-center gap-3 mb-2">
                        <i class="fas fa-shield-alt text-primary-light"></i>
                        <span class="text-sm text-primary-light">Contatos</span>
                    </div>
                    <p class="text-3xl font-bold mb-1">3</p>
                    <p class="text-xs text-primary-light">Contatos de emergência</p>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div class="flex items-center gap-3 mb-2">
                        <i class="fas fa-mobile-alt text-primary-light"></i>
                        <span class="text-sm text-primary-light">Localização</span>
                    </div>
                    <p class="text-3xl font-bold mb-1">ON</p>
                    <p class="text-xs text-primary-light">GPS compartilhado</p>
                </div>
            </div>
        </div>

        <!-- Painel de Emergência -->
        <div class="bg-white rounded-xl border-2 border-primary-light p-6 mb-6">
            <div class="flex items-center gap-3 mb-6">
                <div class="bg-primary-light p-3 rounded-full">
                    <i class="fas fa-exclamation-triangle text-primary text-xl"></i>
                </div>
                <h3 class="text-xl font-bold text-primary">Ações de Emergência</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onclick="showEmergencyModal()" class="bg-red-600 hover:bg-red-700 text-white rounded-lg p-6 flex flex-col items-center gap-2 transition-colors">
                    <i class="fas fa-exclamation-triangle text-3xl"></i>
                    <span class="font-semibold text-lg">Alerta Imediato</span>
                    <small class="text-sm opacity-90">Notificar contatos agora</small>
                </button>
                <button onclick="showToast('Gravação de áudio iniciada', 'info')" class="border-2 border-primary text-primary hover:bg-primary-light rounded-lg p-6 flex flex-col items-center gap-2 transition-colors">
                    <i class="fas fa-microphone text-3xl"></i>
                    <span class="font-semibold text-lg">Gravar Áudio</span>
                    <small class="text-sm opacity-70">Gravar evidência sonora</small>
                </button>
            </div>
        </div>

        <!-- Grid com Check-in e Detecção -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Check-in de Segurança -->
            <div class="bg-white rounded-xl border-2 border-primary-light p-6">
                <div class="flex items-center gap-3 mb-6">
                    <div class="bg-primary-light p-3 rounded-full">
                        <i class="fas fa-check-circle text-primary text-xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-primary">Check-in de Segurança</h3>
                </div>
                <div class="text-center py-6">
                    <div class="text-6xl font-bold text-primary mb-3" id="checkInTimer">71:00:00</div>
                    <p class="text-gray-600 mb-6">Tempo restante para próximo check-in obrigatório</p>
                    <button onclick="performCheckIn()" class="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                        <i class="fas fa-check mr-2"></i>Fazer Check-in Agora
                    </button>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <p class="text-sm text-blue-900">
                        <strong class="block mb-2">Como funciona?</strong>
                        A cada 72 horas você deve confirmar que está segura. Se não confirmar, um alerta automático será enviado.
                    </p>
                </div>
            </div>

            <!-- Detecção Automática -->
            <div class="bg-white rounded-xl border-2 border-primary-light p-6">
                <div class="flex items-center gap-3 mb-6">
                    <div class="bg-primary-light p-3 rounded-full">
                        <i class="fas fa-robot text-primary text-xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-primary">Detecção Automática</h3>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div class="flex items-center gap-3">
                            <i class="fas fa-bolt text-primary text-xl"></i>
                            <div>
                                <p class="font-semibold text-primary">Movimento Brusco</p>
                                <p class="text-xs text-gray-600">Detecta agitação repentina</p>
                            </div>
                        </div>
                        <button onclick="testSensor('Movimento Brusco')" class="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light transition-colors text-sm font-semibold">
                            Testar
                        </button>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div class="flex items-center gap-3">
                            <i class="fas fa-volume-up text-primary text-xl"></i>
                            <div>
                                <p class="font-semibold text-primary">Som Alto</p>
                                <p class="text-xs text-gray-600">Detecta gritos e sons altos</p>
                            </div>
                        </div>
                        <button onclick="testSensor('Som Alto')" class="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light transition-colors text-sm font-semibold">
                            Testar
                        </button>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div class="flex items-center gap-3">
                            <i class="fas fa-arrow-down text-primary text-xl"></i>
                            <div>
                                <p class="font-semibold text-primary">Queda Detectada</p>
                                <p class="text-xs text-gray-600">Detecta quedas bruscas</p>
                            </div>
                        </div>
                        <button onclick="testSensor('Queda Detectada')" class="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light transition-colors text-sm font-semibold">
                            Testar
                        </button>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div class="flex items-center gap-3">
                            <i class="fas fa-mobile-alt text-primary text-xl"></i>
                            <div>
                                <p class="font-semibold text-primary">Agitação do Celular</p>
                                <p class="text-xs text-gray-600">Detecta balanço do telefone</p>
                            </div>
                        </div>
                        <button onclick="testSensor('Agitação do Celular')" class="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light transition-colors text-sm font-semibold">
                            Testar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dicas de Segurança -->
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
    // Atualizar timer de check-in
    updateCheckInTimer();
    setInterval(updateCheckInTimer, 1000);
}

function updateCheckInTimer() {
    const hours = Math.floor(checkInTimeLeft / 3600);
    const minutes = Math.floor((checkInTimeLeft % 3600) / 60);
    const seconds = checkInTimeLeft % 60;
    
    const timerElement = document.getElementById('checkInTimer');
    if (timerElement) {
        timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    checkInTimeLeft--;
    if (checkInTimeLeft < 0) {
        checkInTimeLeft = 72 * 60 * 60;
    }
}

function performCheckIn() {
    checkInTimeLeft = 72 * 60 * 60;
    showToast('Check-in realizado com sucesso!', 'success', 'Próximo check-in em 72 horas');
}

function testSensor(sensorName) {
    showSensorModal(sensorName);
}

// Perfil
function renderProfilePage() {
    return `
        <!-- Card de Perfil Principal -->
        <div class="bg-white rounded-xl border-2 border-primary-light overflow-hidden mb-6">
            <!-- Banner -->
            <div class="h-32 bg-gradient-to-r from-primary-dark to-primary"></div>
            
            <!-- Informações do Perfil -->
            <div class="px-8 pb-8">
                <div class="flex justify-between items-end -mt-16 mb-6">
                    <div class="flex gap-4 items-end">
                        <div class="relative">
                            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" 
                                 alt="João Moenchiali" 
                                 class="w-32 h-32 rounded-full border-4 border-white shadow-lg">
                            <button onclick="showToast('Selecionando nova foto...', 'info')" 
                                    class="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition-colors">
                                <i class="fas fa-camera"></i>
                            </button>
                        </div>
                        <div class="mb-2">
                            <h2 class="text-2xl font-bold text-primary mb-1">João Moenchiali</h2>
                            <p class="text-primary/60">Usuário desde Janeiro 2025</p>
                        </div>
                    </div>
                    <span class="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200 mb-2">
                        Conta Ativa
                    </span>
                </div>

                <!-- Estatísticas -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="p-4 bg-primary-light/30 rounded-lg text-center">
                        <p class="text-3xl font-bold text-primary mb-1">3</p>
                        <p class="text-xs text-primary/60">Contatos de Emergência</p>
                    </div>
                    <div class="p-4 bg-primary-light/30 rounded-lg text-center">
                        <p class="text-3xl font-bold text-primary mb-1">47</p>
                        <p class="text-xs text-primary/60">Check-ins Realizados</p>
                    </div>
                    <div class="p-4 bg-primary-light/30 rounded-lg text-center">
                        <p class="text-3xl font-bold text-primary mb-1">12</p>
                        <p class="text-xs text-primary/60">Anotações Salvas</p>
                    </div>
                    <div class="p-4 bg-primary-light/30 rounded-lg text-center">
                        <p class="text-3xl font-bold text-primary mb-1">5</p>
                        <p class="text-xs text-primary/60">Conversas com Psicólogo</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Informações Pessoais -->
        <div class="bg-white rounded-xl border-2 border-primary-light p-6 mb-6">
            <div class="flex items-center gap-3 mb-6">
                <div class="bg-primary-light p-3 rounded-full">
                    <i class="fas fa-user text-primary text-xl"></i>
                </div>
                <h3 class="text-xl font-bold text-primary">Informações Pessoais</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label class="block text-sm font-medium text-primary mb-2">Nome Completo</label>
                    <input type="text" value="João Moenchiali" class="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:border-primary">
                </div>
                <div>
                    <label class="block text-sm font-medium text-primary mb-2">Email</label>
                    <input type="email" value="joaomoenchiali@email.com" class="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:border-primary">
                </div>
                <div>
                    <label class="block text-sm font-medium text-primary mb-2">Telefone</label>
                    <input type="tel" value="+55 11 98765-4321" class="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:border-primary">
                </div>
                <div>
                    <label class="block text-sm font-medium text-primary mb-2">Data de Nascimento</label>
                    <input type="date" value="1990-05-15" class="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:border-primary">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-primary mb-2">Endereço</label>
                    <input type="text" value="Rua Example, 123 - São Paulo, SP" class="w-full px-4 py-2 border border-primary-light rounded-lg focus:outline-none focus:border-primary">
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

        <!-- Segurança -->
        <div class="bg-white rounded-xl border-2 border-primary-light p-6">
            <div class="flex items-center gap-3 mb-6">
                <div class="bg-primary-light p-3 rounded-full">
                    <i class="fas fa-lock text-primary text-xl"></i>
                </div>
                <h3 class="text-xl font-bold text-primary">Segurança da Conta</h3>
            </div>
            <div class="space-y-4">
                <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p class="text-sm font-semibold text-primary mb-1">Senha</p>
                        <p class="text-xs text-primary/60">Última alteração: 15 de Janeiro de 2025</p>
                    </div>
                    <button onclick="showToast('Redirecionando para alteração de senha...', 'info')" class="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light text-sm font-semibold transition-colors">
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

// Sistema de Emergência
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
    
    // Iniciar countdown
    timeRemaining = 60;
    updateSensorCountdown();
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
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
}

function sendAlertNow() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    const modal = document.getElementById('sensorModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    showToast('Alerta de emergência enviado!', 'error', 'Seus contatos foram notificados com sua localização.');
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
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        sensorModal.classList.add('hidden');
        sensorModal.classList.remove('flex');
    }
});
