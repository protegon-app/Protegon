        // =========================================================
        // ESTADO GLOBAL & DADOS
        // =========================================================

        let currentPage = 'security';
        let countdownInterval = null;
        let timeRemaining = 60;
        const CHECKIN_INTERVAL_SECONDS = 72 * 60 * 60;
        let checkInTimeLeft = 71 * 60 * 60;
        let editingContactId = null;
        let currentNoteIdToDelete = null;

        // SOS TIMER VARIABLES
        let sosInterval = null;
        let sosTimeLeft = 5;

        // SENSOR TEST VARIABLES
        let sensorTestInterval = null;

        let userData = {
            name: "Mariana Silva",
            email: "marisilva@email.com",
            phone: "+55 11 98765-4321",
            birthDate: "1990-05-15",
            address: "Rua Example, 123 - São Paulo, SP",
            photo: "./assets/img/foto perfil.png",
            since: "Janeiro 2025"
        };

        let emergencyContacts = [{
                id: 'c1',
                name: 'Maria Silva',
                phone: '+5511987654321',
                relationship: 'Mãe'
            },
            {
                id: 'c2',
                name: 'Ana Santos',
                phone: '+5511987651234',
                relationship: 'Amiga'
            },
            {
                id: 'c3',
                name: 'Dr. João Souza',
                phone: '+5511987655678',
                relationship: 'Psicólogo'
            }
        ];

        let notes = [{
            id: 1,
            title: 'Sessão de Terapia',
            date: '15/10/2025',
            content: 'Discutimos técnicas de gerenciamento de estresse...',
            image: null,
            eventDate: '15/10/2025'
        }];

        const chatMessages = [{
            sender: 'psychologist',
            text: 'Olá! Sou seu assistente psicológico virtual. Como você está se sentindo hoje?',
            time: '10:30'
        }];

        const sensorsData = [{
                id: 'sensor_motion',
                name: 'Detector de Movimento Brusco',
                description: 'Detecta movimentos súbitos',
                icon: 'fa-bolt',
                sensitivity: 77,
                isActive: true
            },
            {
                id: 'sensor_sound',
                name: 'Detector de Sons Altos',
                description: 'Identifica gritos ou sons altos',
                icon: 'fa-volume-up',
                sensitivity: 80,
                isActive: true
            },
            {
                id: 'sensor_fall',
                name: 'Detector de Queda',
                description: 'Detecta quedas bruscas que podem indicar perigo',
                icon: 'fa-arrow-down',
                sensitivity: 70,
                isActive: true
            },
            {
                id: 'sensor_shake',
                name: 'Botão de Pânico por Agitação',
                description: 'Agite o celular 3 vezes rapidamente para disparar alerta',
                icon: 'fa-mobile-alt',
                sensitivity: 85,
                isActive: true
            }
        ];

        // =========================================================
        // FUNÇÕES UI GERAIS
        // =========================================================

        function toggleSidebar(show) {
            const sidebar = document.getElementById('mainSidebar');
            const overlay = document.getElementById('mobileOverlay');
            if (show) {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
                setTimeout(() => overlay.classList.remove('opacity-0'), 10);
            } else {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('opacity-0');
                setTimeout(() => overlay.classList.add('hidden'), 300);
            }
        }

        function formatTimeRemaining(s) {
            const d = Math.floor(s / 86400);
            const h = Math.floor((s % 86400) / 3600);
            const m = Math.floor((s % 3600) / 60);
            if (d > 0) return `${d}d ${String(h).padStart(2, '0')}h`;
            return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
        }

        function getProgressPercentage(s) {
            const elapsed = CHECKIN_INTERVAL_SECONDS - s;
            return Math.min(100, (elapsed / CHECKIN_INTERVAL_SECONDS) * 100);
        }

        function changeFontSize(size) {
            const root = document.documentElement;
            if (size === 'small') root.style.fontSize = '14px';
            else if (size === 'medium') root.style.fontSize = '16px';
            else if (size === 'large') root.style.fontSize = '20px';

            showToast(`Fonte alterada para ${size === 'small' ? 'Pequeno' : size === 'medium' ? 'Médio' : 'Grande'}`, 'success');
        }

        // =========================================================
        // RENDERIZAÇÃO DAS PÁGINAS
        // =========================================================

        function renderSecurityPage() {
            const activeSensorsCount = sensorsData.filter(s => s.isActive).length;
            const totalSensorsCount = sensorsData.length;

            return `
                <!-- Ações Rápidas - Movido para o Topo -->
                <div class="bg-gradient-to-r from-[var(--azul-marinho-escuro)] to-[var(--azul-marinho)] text-[var(--branco)] rounded-xl p-6 sm:p-8 border-2 border-[var(--azul-marinho-escuro)] mb-6">
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

                <!-- Painel de Monitoramento (Estatísticas) - RESTAURADO VISUAL ORIGINAL (FUNDO AZUL) -->
                <div class="bg-gradient-to-r from-[var(--azul-marinho-escuro)] to-[var(--azul-marinho)] text-[var(--branco)] rounded-xl p-6 sm:p-8 border-2 border-[var(--azul-marinho-escuro)] mb-6">
                    <div class="flex flex-col sm:flex-row justify-between items-start mb-6">
                        <div class="flex gap-4 items-center mb-4 sm:mb-0">
                            <div class="bg-[var(--branco)] p-4 rounded-full"> <i class="fas fa-shield-alt text-3xl text-[var(--azul-marinho)]"></i> </div>
                            <div> <h2 class="text-2xl font-bold mb-2">Monitoramento Ativo</h2> <p class="text-[var(--azul-claro)]">Status do sistema em tempo real</p> </div>
                        </div>
                        <span id="headerSystemStatus" class="px-4 py-2 ${activeSensorsCount === totalSensorsCount ? 'bg-green-500' : 'bg-orange-500'} text-[var(--branco)] rounded-full text-sm font-semibold border-0 self-start sm:self-center"> ${activeSensorsCount === totalSensorsCount ? 'Sistemas Ativos' : 'Atenção Necessária'} </span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div class="flex items-center gap-3 mb-2"><i class="fas fa-microchip text-[var(--azul-claro)]"></i><span class="text-sm text-[var(--azul-claro)]">Sensores</span></div>
                            <p id="headerSensorCount" class="text-3xl font-bold mb-1">${activeSensorsCount}/${totalSensorsCount}</p><p class="text-xs text-[var(--azul-claro)]">Ativos</p>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div class="flex items-center gap-3 mb-2"><i class="fas fa-clock text-[var(--azul-claro)]"></i><span class="text-sm text-[var(--azul-claro)]">Check-in</span></div>
                            <p class="text-3xl font-bold mb-1">${formatTimeRemaining(checkInTimeLeft)}</p><p class="text-xs text-[var(--azul-claro)]">Próximo</p>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div class="flex items-center gap-3 mb-2"><i class="fas fa-user-friends text-[var(--azul-claro)]"></i><span class="text-sm text-[var(--azul-claro)]">Contatos</span></div>
                            <p class="text-3xl font-bold mb-1">${emergencyContacts.length}</p><p class="text-xs text-[var(--azul-claro)]">Emergência</p>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div class="flex items-center gap-3 mb-2"><i class="fas fa-map-marker-alt text-[var(--azul-claro)]"></i><span class="text-sm text-[var(--azul-claro)]">Localização</span></div>
                            <p class="text-3xl font-bold mb-1">ON</p><p class="text-xs text-[var(--azul-claro)]">GPS</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    ${renderSafetyCheckIn()}
                    ${renderAutomaticDetection()}
                </div>

                <!-- Histórico e Privacidade -->
                ${renderHistoryAndPrivacy()}

                <!-- Dicas de Segurança -->
                ${renderSafetyTips()}
            `;
        }

        function renderSafetyCheckIn() {
            const timeString = formatTimeRemaining(checkInTimeLeft);
            const progressPercentage = getProgressPercentage(checkInTimeLeft);
            return `
                <div class="bg-[var(--branco)] rounded-xl border border-[var(--azul-claro)] p-6 shadow-sm h-full">
                    <div class="flex items-start justify-between mb-6">
                        <div class="flex items-center gap-3"> <i class="fas fa-clock text-2xl text-[var(--azul-marinho)]"></i> <div> <h3 class="text-[var(--azul-marinho-escuro)] mb-1 font-bold">Check-in de Segurança</h3> <p class="text-sm text-gray-500">Confirme sua segurança a cada 72 horas</p> </div> </div>
                        <span id="checkin-status-badge" class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Ativo</span>
                    </div>
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-2"> <span class="text-sm text-[var(--azul-marinho-escuro)] opacity-70">Tempo até próximo check-in</span> <span id="checkin-timer-display" class="text-lg font-bold text-[var(--azul-marinho-escuro)]">${timeString}</span> </div>
                        <div class="h-2 bg-gray-200 rounded-full overflow-hidden"> <div id="checkin-progress-bar" class="h-full bg-[var(--azul-marinho)] transition-all duration-1000" style="width: ${progressPercentage}%;"></div> </div>
                    </div>
                    <button id="performCheckInBtn" onclick="performCheckIn()" class="w-full bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-[var(--branco)] py-3 rounded-lg font-semibold transition-colors"> <i class="fas fa-check mr-2"></i> Confirmar que Estou Segura </button>
                </div>
            `;
        }

        function renderAutomaticDetection() {
            const sensorsHtml = sensorsData.map(sensor => {
                let statusClass = sensor.isActive ? 'text-green-600' : 'text-red-500';
                const toggleChecked = sensor.isActive ? 'checked' : '';
                return `
                    <div class="flex flex-col p-4 bg-blue-50/50 rounded-lg border border-blue-100 mb-3 last:mb-0">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex items-start gap-3">
                                <div class="bg-[var(--azul-marinho)] p-2 rounded-lg text-white w-10 h-10 flex items-center justify-center flex-shrink-0">
                                    <i class="fas ${sensor.icon}"></i>
                                </div>
                                <div>
                                    <div class="flex items-center gap-2">
                                        <h4 class="font-semibold text-[var(--azul-marinho-escuro)]">${sensor.name}</h4>
                                        <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">Ativo</span>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-0.5">${sensor.description}</p>
                                </div>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer ml-2">
                                <input type="checkbox" ${toggleChecked} class="sr-only peer" onchange="toggleSensor('${sensor.id}', this.checked)">
                                <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--azul-marinho)]"></div>
                            </label>
                        </div>
                        
                        <div class="space-y-3 pl-[52px]">
                            <div>
                                <div class="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Sensibilidade</span>
                                    <span>${sensor.sensitivity}%</span>
                                </div>
                                <div class="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div class="h-full bg-[var(--azul-marinho-escuro)] rounded-full" style="width: ${sensor.sensitivity}%"></div>
                                </div>
                            </div>
                            <button onclick="testSensor('${sensor.name}')" class="flex items-center gap-2 px-3 py-1.5 border border-[var(--azul-marinho)] text-[var(--azul-marinho)] text-xs font-semibold rounded hover:bg-blue-50 transition-colors w-fit">
                                <i class="fas fa-pen"></i> Testar Sensor
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            return `
                <div class="bg-[var(--branco)] rounded-xl border border-[var(--azul-claro)] p-6 shadow-sm h-full">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="bg-[var(--azul-marinho-escuro)] p-3 rounded-full"> <i class="fas fa-robot text-[var(--branco)] text-xl"></i> </div>
                        <h3 class="text-xl font-bold text-[var(--azul-marinho-escuro)]">Detecção Automática</h3>
                    </div>
                    <div class="space-y-3"> ${sensorsHtml} </div>
                </div>
            `;
        }

        function renderHistoryAndPrivacy() {
            return `
                <div class="mb-6">
                   

                    <div class="bg-purple-50 border border-purple-100 rounded-lg p-4 text-sm text-purple-900">
                        <span class="font-bold text-purple-800">Privacidade:</span> Todos os dados dos sensores são processados localmente no seu dispositivo. Nenhuma informação é enviada para servidores externos até que um alerta seja confirmado.
                    </div>
                </div>
            `;
        }

        function renderSafetyTips() {
            const tips = [
                { title: "Mantenha seu celular carregado", desc: "Certifique-se de que seu dispositivo esteja sempre com bateria suficiente para acionar os alertas de emergência.", icon: "fa-mobile-alt", color: "blue" },
                { title: "Configure seus contatos", desc: "Adicione pessoas de confiança que possam responder rapidamente em caso de emergência.", icon: "fa-user-lock", color: "purple" },
                { title: "Faça check-ins regulares", desc: "Não espere até o último momento. Confirme sua segurança regularmente para manter o sistema ativo.", icon: "fa-clock", color: "green" },
                { title: "Teste os sensores", desc: "Use os botões de teste para se familiarizar com como o sistema funciona e como responder aos alertas.", icon: "fa-flask", color: "orange" }
            ];

            return `
                <div class="bg-white rounded-xl border border-[var(--azul-claro)] p-6 shadow-sm">
                    <h3 class="text-lg font-bold text-[var(--azul-marinho-escuro)] mb-4">Dicas de Segurança</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${tips.map(tip => `
                            <div class="bg-${tip.color}-50 border border-${tip.color}-100 rounded-lg p-4 flex gap-4">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 rounded bg-${tip.color}-100 text-${tip.color}-600 flex items-center justify-center">
                                        <i class="fas ${tip.icon}"></i>
                                    </div>
                                </div>
                                <div>
                                    <h4 class="font-bold text-${tip.color}-900 text-sm mb-1">${tip.title}</h4>
                                    <p class="text-xs text-${tip.color}-800 leading-relaxed">${tip.desc}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // 2. Perfil do Usuário
        function renderProfilePage() {
            const stats = [{
                    count: emergencyContacts.length,
                    label: 'Contatos'
                },
                {
                    count: 47,
                    label: 'Check-ins'
                },
                {
                    count: notes.length,
                    label: 'Anotações'
                },
                {
                    count: 5,
                    label: 'Conversas'
                }
            ];

            return `
                <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] overflow-hidden shadow-lg mb-8">
                    <div class="h-32 bg-gradient-to-r from-[var(--azul-marinho-escuro)] to-[var(--azul-marinho)]"></div>
                    <div class="px-4 sm:px-8 pb-8">
                        <div class="flex flex-col sm:flex-row justify-between items-center sm:items-end -mt-16 mb-6"> 
                            <div class="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left"> 
                                <div class="relative"> 
                                    <img src="${userData.photo}" onerror="this.src='https://ui-avatars.com/api/?name=Mariana+Moenchiali&background=0D8ABC&color=fff'" alt="${userData.name}" class="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"> 
                                </div> 
                                <div class="mb-2"> 
                                    <h2 class="text-2xl font-bold text-[var(--azul-marinho-escuro)] mb-1 sidebar-username">${userData.name}</h2> 
                                    <p class="text-gray-600/60">Usuário desde ${userData.since}</p> 
                                </div> 
                            </div> 
                            <button id="btnEditProfile" onclick="enableProfileEdit()" class="mt-4 sm:mt-0 px-6 py-2 bg-[var(--azul-marinho)] text-white rounded-lg hover:bg-[var(--azul-marinho-escuro)] font-semibold shadow-md flex items-center gap-2">
                                <i class="fas fa-pen"></i> Editar Perfil
                            </button>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"> 
                            ${stats.map(stat => `<div class="p-4 bg-[var(--azul-claro)] rounded-lg text-center border border-[var(--branco)]"> <p class="text-3xl font-bold text-[var(--azul-marinho)] mb-1">${stat.count}</p> <p class="text-xs text-[var(--azul-marinho)]">${stat.label}</p> </div>`).join('')} 
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] p-4 sm:p-6 mb-8">
                    <div class="flex items-center gap-3 mb-6 border-b border-gray-600/30 pb-4"> 
                        <div class="w-10 h-10 rounded-full bg-[var(--azul-claro)] text-[var(--azul-marinho)] flex items-center justify-center text-xl"> <i class="fas fa-user"></i> </div> 
                        <h3 class="text-xl font-bold text-[var(--azul-marinho-escuro)]">Informações Pessoais</h3> 
                    </div>
                     
                    <form id="profileForm" onsubmit="event.preventDefault(); saveProfileChanges();" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-8">
                        <div> 
                            <label class="block text-sm font-medium text-[var(--azul-marinho-escuro)] mb-2">Nome Completo</label> 
                            <input type="text" id="profName" value="${userData.name}" disabled class="w-full px-4 py-3 border border-[var(--azul-claro)] rounded-lg focus:outline-none focus:border-[var(--azul-marinho)]"> 
                        </div>
                        <div> 
                            <label class="block text-sm font-medium text-[var(--azul-marinho-escuro)] mb-2">Email</label> 
                            <input type="email" id="profEmail" value="${userData.email}" disabled class="w-full px-4 py-3 border border-[var(--azul-claro)] rounded-lg focus:outline-none focus:border-[var(--azul-marinho)]"> 
                        </div>
                        <div> 
                            <label class="block text-sm font-medium text-[var(--azul-marinho-escuro)] mb-2">Telefone</label> 
                            <input type="tel" id="profPhone" value="${userData.phone}" disabled class="w-full px-4 py-3 border border-[var(--azul-claro)] rounded-lg focus:outline-none focus:border-[var(--azul-marinho)]"> 
                        </div>
                        <div> 
                            <label class="block text-sm font-medium text-[var(--azul-marinho-escuro)] mb-2">Data de Nascimento</label> 
                            <input type="date" id="profBirth" value="${userData.birthDate}" disabled class="w-full px-4 py-3 border border-[var(--azul-claro)] rounded-lg focus:outline-none focus:border-[var(--azul-marinho)]"> 
                        </div>
                        <div class="md:col-span-2"> 
                            <label class="block text-sm font-medium text-[var(--azul-marinho-escuro)] mb-2">Endereço</label> 
                            <input type="text" id="profAddress" value="${userData.address}" disabled class="w-full px-4 py-3 border border-[var(--azul-claro)] rounded-lg focus:outline-none focus:border-[var(--azul-marinho)]"> 
                        </div>
                         
                        <!-- Botões de Ação (Ocultos inicialmente) -->
                        <div id="profileEditActions" class="md:col-span-2 hidden flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                            <button type="submit" class="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-sm">Salvar Alterações</button>
                            <button type="button" onclick="cancelProfileEdit()" class="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition-colors">Cancelar</button>
                        </div>
                    </form>
                </div>
            `;
        }

        // 3. Configurações
        function renderSettingsPage() {
            return `
                <div class="flex flex-col gap-6">
                     
                    <!-- Card 1: Idioma -->
                    <div class="bg-white rounded-xl shadow-sm border border-[var(--azul-claro)] overflow-hidden h-fit">
                        <div class="bg-[var(--azul-claro)] p-4 flex items-center gap-3">
                            <div class="bg-white p-2 rounded-lg text-[var(--azul-marinho)]"><i class="fas fa-globe"></i></div>
                            <h3 class="font-bold text-[var(--azul-marinho-escuro)]">Idioma e Região</h3>
                        </div>
                        <div class="p-6 space-y-4">
                            <div>
                                <label class="block text-sm font-bold text-[var(--texto-cinza)] mb-2">Idioma do Sistema</label>
                                <select class="w-full p-3 bg-gray-50 border border-[var(--azul-claro)] rounded-lg text-[var(--azul-marinho-escuro)] focus:border-[var(--azul-marinho)] outline-none transition-colors">
                                    <option value="pt-BR">Português (Brasil)</option>
                                    <option value="en-US">English (US)</option>
                                    <option value="es">Español</option>
                                </select>
                            </div>
                            <div class="flex items-center justify-between pt-2">
                                <span class="text-sm font-medium text-[var(--texto-cinza)]">Fuso Horário Automático</span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--azul-marinho)]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Card 2: Segurança -->
                    <div class="bg-white rounded-xl shadow-sm border border-[var(--azul-claro)] overflow-hidden h-fit">
                        <div class="bg-[var(--azul-claro)] p-4 flex items-center gap-3">
                            <div class="bg-white p-2 rounded-lg text-[var(--azul-marinho)]"><i class="fas fa-lock"></i></div>
                            <h3 class="font-bold text-[var(--azul-marinho-escuro)]">Segurança</h3>
                        </div>
                        <div class="p-6 space-y-6">
                            <div class="flex justify-between items-center">
                                <div>
                                    <p class="font-bold text-[var(--azul-marinho-escuro)]">Senha de Acesso</p>
                                    <p class="text-xs text-[var(--texto-cinza)]">Última troca há 3 meses</p>
                                </div>
                                <button onclick="openPasswordModal()" class="px-4 py-2 border-2 border-[var(--azul-marinho)] text-[var(--azul-marinho)] rounded-lg font-bold hover:bg-[var(--azul-claro)] transition-colors text-sm">
                                    Alterar
                                </button>
                            </div>
                            <div class="h-px bg-gray-200"></div>
                            <div class="flex justify-between items-center">
                                <div>
                                    <p class="font-bold text-[var(--azul-marinho-escuro)]">Autenticação 2 Fatores</p>
                                    <p class="text-xs text-[var(--texto-cinza)]">Maior proteção</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--azul-marinho)]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Card 3: Aparência -->
                    <div class="bg-white rounded-xl shadow-sm border border-[var(--azul-claro)] overflow-hidden h-fit">
                        <div class="bg-[var(--azul-claro)] p-4 flex items-center gap-3">
                            <div class="bg-white p-2 rounded-lg text-[var(--azul-marinho)]"><i class="fas fa-paint-brush"></i></div>
                            <h3 class="font-bold text-[var(--azul-marinho-escuro)]">Aparência</h3>
                        </div>
                        <div class="p-6 space-y-5">
                            <div class="flex justify-between items-center">
                                <span class="font-bold text-[var(--azul-marinho-escuro)]">Modo Escuro <span class="text-xs font-normal text-gray-500">(funcionalidade em desenvolvimento)</span></span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" onchange="showToast('Funcionalidade em desenvolvimento', 'info')">
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--azul-marinho)]"></div>
                                </label>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-[var(--azul-marinho-escuro)] mb-3">Tamanho da Fonte</p>
                                <div class="flex gap-2">
                                    <button onclick="changeFontSize('small')" class="flex-1 py-2 border border-[var(--azul-claro)] rounded-lg text-xs font-bold hover:bg-[var(--azul-claro)] transition-colors">Pequeno</button>
                                    <button onclick="changeFontSize('medium')" class="flex-1 py-2 bg-[var(--azul-marinho)] text-white rounded-lg text-sm font-bold shadow-md">Médio</button>
                                    <button onclick="changeFontSize('large')" class="flex-1 py-2 border border-[var(--azul-claro)] rounded-lg text-lg font-bold hover:bg-[var(--azul-claro)] transition-colors">Grande</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // 4. ANOTAÇÕES (ATUALIZADO: Com Upload de Foto e Funcionalidade Completa)
        function renderNoteForm() {
            return `
                <div class="bg-white rounded-xl border border-[var(--azul-claro)] p-6 shadow-md mb-6 animate-fade-in">
                    <h4 class="font-bold text-[var(--azul-marinho-escuro)] mb-4">Nova Anotação</h4>
                    <div class="space-y-4">
                        <input type="text" id="noteTitleInput" placeholder="Título da anotação" class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--azul-marinho)] transition-colors">
                        <textarea id="noteContentInput" rows="4" placeholder="Escreva aqui..." class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--azul-marinho)] transition-colors resize-none"></textarea>
                         
                        <!-- Upload de Foto -->
                        <div class="flex items-center gap-3">
                            <label for="noteImageInput" class="cursor-pointer flex items-center gap-2 px-4 py-2 border border-[var(--azul-claro)] rounded-lg text-[var(--azul-marinho)] hover:bg-blue-50 transition-colors">
                                <i class="fas fa-camera"></i>
                                <span class="text-sm font-semibold">Adicionar Foto</span>
                            </label>
                            <input type="file" id="noteImageInput" accept="image/*" class="hidden" onchange="previewImage(this)">
                            <span id="fileName" class="text-xs text-gray-500 truncate max-w-[200px]"></span>
                        </div>
                        <div id="imagePreviewContainer" class="hidden mt-2 relative w-full max-w-xs">
                            <img id="imagePreview" src="" class="rounded-lg shadow-sm w-full h-auto object-cover max-h-48 border border-gray-200">
                            <button onclick="clearImage()" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-sm"><i class="fas fa-times text-xs"></i></button>
                        </div>

                        <div class="flex justify-end gap-3 pt-2">
                            <button onclick="cancelNoteForm()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
                            <button onclick="saveNote()" class="px-6 py-2 bg-[var(--azul-marinho)] text-white rounded-lg hover:bg-[var(--azul-marinho-escuro)] font-bold shadow-md transition-colors">Salvar</button>
                        </div>
                    </div>
                </div>
            `;
        }

        // Funções auxiliares para imagem
        function previewImage(input) {
            const file = input.files[0];
            if (file) {
                document.getElementById('fileName').textContent = file.name;
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('imagePreview').src = e.target.result;
                    document.getElementById('imagePreviewContainer').classList.remove('hidden');
                }
                reader.readAsDataURL(file);
            }
        }

        function clearImage() {
            document.getElementById('noteImageInput').value = '';
            document.getElementById('fileName').textContent = '';
            document.getElementById('imagePreviewContainer').classList.add('hidden');
            document.getElementById('imagePreview').src = '';
        }

        function showNewNoteForm() {
            document.getElementById('showNewNoteFormBtn').classList.add('hidden');
            document.getElementById('newNoteFormContainer').innerHTML = renderNoteForm();
        }

        function cancelNoteForm() {
            document.getElementById('newNoteFormContainer').innerHTML = '';
            document.getElementById('showNewNoteFormBtn').classList.remove('hidden');
        }

        function saveNote() {
            const title = document.getElementById('noteTitleInput').value.trim();
            const content = document.getElementById('noteContentInput').value.trim();
            const imageSrc = document.getElementById('imagePreview').src;
            const hasImage = document.getElementById('noteImageInput').files.length > 0;

            if (!title || !content) {
                showToast('Preencha título e conteúdo', 'error');
                return;
            }

            const newNote = {
                id: Date.now(),
                title: title,
                date: new Date().toLocaleDateString('pt-BR'),
                content: content,
                image: hasImage ? imageSrc : null
            };

            notes.unshift(newNote);
            showToast('Anotação salva!', 'success');
            renderPage('notes');
        }

        function confirmDeleteNote(id) {
            currentNoteIdToDelete = id;
            const note = notes.find(n => n.id === id);
            if (note) document.getElementById('noteToDeleteTitle').innerText = note.title;
            showDeleteNoteModal();
        }

        function renderNotesPage() {
            const notesHtml = notes.length > 0 ? notes.map(n => `
                <div class="p-6 border border-gray-200 rounded-xl hover:border-[var(--azul-claro)] transition-all bg-white shadow-sm hover:shadow-md group">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h4 class="font-bold text-[var(--azul-marinho-escuro)] text-lg">${n.title}</h4>
                            <p class="text-xs text-gray-500">${n.date}</p>
                        </div>
                        <button onclick="confirmDeleteNote(${n.id})" class="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <p class="text-sm text-gray-700 whitespace-pre-line mb-3">${n.content}</p>
                    ${n.image ? `<div class="mt-3 rounded-lg overflow-hidden border border-gray-200"><img src="${n.image}" class="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"></div>` : ''}
                </div>
            `).join('') : '<div class="text-center py-10 text-gray-500"><i class="fas fa-sticky-note text-4xl mb-3 opacity-30"></i><p>Nenhuma anotação encontrada.</p></div>';

            return `
                <div class="max-w-4xl mx-auto">
                      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <h2 class="text-3xl font-bold text-[var(--azul-marinho-escuro)]">Anotações</h2>
                        <button id="showNewNoteFormBtn" onclick="showNewNoteForm()" class="w-full sm:w-auto px-5 py-2 bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-md">
                            <i class="fas fa-plus"></i> Nova Anotação
                        </button>
                      </div>
                       
                      <div id="newNoteFormContainer"></div>
                       
                      <h3 class="text-xl font-semibold text-[var(--azul-marinho-escuro)] mb-4 border-b border-gray-200 pb-2">Minhas Anotações</h3>
                      <div class="space-y-4" id="notesListContainer">
                        ${notesHtml}
                      </div>
                </div>
            `;
        }

        // CHAT COM PSICÓLOGO (MOCK)
        function renderChatPage() {
            return `
                <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] flex flex-col h-[calc(100vh-220px)] overflow-hidden shadow-sm">
                    <div class="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 overflow-hidden"><img src="https://api.dicebear.com/7.x/bottts/svg?seed=psychologist" class="w-full h-full"></div>
                        <div>
                            <h3 class="font-bold text-[var(--azul-marinho-escuro)]">Dr. João Souza</h3>
                            <p class="text-xs text-green-600 font-semibold">Online agora</p>
                        </div>
                    </div>
                    <div id="chatMessages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
                        ${chatMessages.map(msg => `
                            <div class="flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in">
                                <div class="${msg.sender === 'user' ? 'bg-[var(--azul-marinho)] text-white rounded-l-2xl rounded-tr-2xl' : 'bg-white border border-gray-200 text-gray-800 rounded-r-2xl rounded-tl-2xl'} px-4 py-3 shadow-sm max-w-[85%]">
                                    <p class="text-sm leading-relaxed">${msg.text}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
                        <input type="text" id="chatInput" placeholder="Converse comigo..." class="flex-1 bg-gray-100 border-0 rounded-full px-6 py-3 focus:ring-2 focus:ring-[var(--azul-claro)] outline-none transition-all">
                        <button id="sendMessageBtn" class="w-12 h-12 bg-[var(--azul-marinho)] text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            `;
        }

        function renderEmergencyContactsPage() {
            return `
                <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] p-4 sm:p-6">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div class="flex items-center gap-3"><div class="bg-[var(--azul-claro)] p-3 rounded-full"> <i class="fas fa-users text-[var(--azul-marinho)] text-xl"></i> </div><h3 class="text-xl font-bold text-[var(--azul-marinho-escuro)]">Contatos de Emergência</h3></div>
                        <button onclick="openAddModal()" class="w-full sm:w-auto px-4 py-2 bg-[var(--azul-marinho)] text-white rounded-lg font-semibold shadow-md">+ Adicionar Contato</button>
                    </div>
                    <div class="space-y-3">
                        ${emergencyContacts.map(c => `
                            <div class="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors">
                                <div class="flex items-center gap-4"><div class="w-12 h-12 rounded-full bg-[var(--azul-marinho)] text-white flex items-center justify-center text-xl font-bold">${c.name.charAt(0)}</div><div><h4 class="font-semibold text-[var(--azul-marinho-escuro)]">${c.name}</h4><p class="text-sm text-gray-600">${c.phone}</p><p class="text-xs text-[var(--azul-marinho)]/60">${c.relationship}</p></div></div>
                                <div class="flex gap-2"><button class="px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"><i class="fas fa-phone"></i></button><button class="px-3 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50" onclick="showToast('Contato excluído', 'info')"><i class="fas fa-trash"></i></button></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // =========================================================
        // ROUTER E LÓGICA
        // =========================================================

        const pages = {
            'security': {
                title: 'Central de Segurança',
                render: renderSecurityPage,
                init: initSecurityPage
            },
            'profile': {
                title: 'Perfil do Usuário',
                render: renderProfilePage,
                init: null
            },
            'settings': {
                title: 'Configurações',
                render: renderSettingsPage,
                init: null
            },
            'notes': {
                title: 'Anotações',
                render: renderNotesPage,
                init: null
            },
            'chat': {
                title: 'Chat Seguro',
                render: renderChatPage,
                init: initChatPage
            },
            'emergency': {
                title: 'Contatos',
                render: renderEmergencyContactsPage,
                init: null
            }
        };

        function renderPage(pageId) {
            if (!pages[pageId]) return;
            currentPage = pageId;
            document.querySelectorAll('.item-nav-sidebar').forEach(btn => {
                if (btn.dataset.page === pageId) btn.classList.add('bg-white/10');
                else btn.classList.remove('bg-white/10');
            });
            const contentDiv = document.getElementById('pageContent');
            const titleDiv = document.getElementById('pageTitle');
            contentDiv.style.opacity = '0';
            setTimeout(() => {
                titleDiv.innerText = pages[pageId].title;
                contentDiv.innerHTML = pages[pageId].render();
                contentDiv.style.opacity = '1';
                if (pages[pageId].init) pages[pageId].init();
                if (window.innerWidth < 1024) toggleSidebar(false);
            }, 150);
        }

        function initSecurityPage() {
            if (countdownInterval) clearInterval(countdownInterval);
            let checkInTimerInterval = setInterval(() => {
                checkInTimeLeft--;
                const el = document.getElementById('checkin-timer-display');
                if (el) el.innerText = formatTimeRemaining(checkInTimeLeft);
                const bar = document.getElementById('checkin-progress-bar');
                if (bar) bar.style.width = getProgressPercentage(checkInTimeLeft) + '%';
            }, 1000);
            countdownInterval = checkInTimerInterval;
        }

        // === CHAT COM PSICÓLOGO (MOCK) ===
        function initChatPage() {
            const chatInput = document.getElementById('chatInput');
            const sendBtn = document.getElementById('sendMessageBtn');
            const messagesContainer = document.getElementById('chatMessages');

            if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;

            function handleSend() {
                const text = chatInput.value.trim();
                if (!text) return;

                // Add User Message
                chatInput.value = '';
                chatMessages.push({
                    sender: 'user',
                    text: text
                });
                messagesContainer.innerHTML += `
                    <div class="flex justify-end animate-fade-in mb-4">
                        <div class="bg-[var(--azul-marinho)] text-white rounded-l-2xl rounded-tr-2xl px-4 py-3 shadow-sm max-w-[85%]">
                            <p class="text-sm">${text}</p>
                        </div>
                    </div>`;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // Add Loading Indicator
                const loadingId = 'loading-' + Date.now();
                messagesContainer.innerHTML += `
                    <div id="${loadingId}" class="flex justify-start animate-fade-in mb-4">
                        <div class="bg-white border border-gray-200 text-gray-800 rounded-r-2xl rounded-tl-2xl px-4 py-3 shadow-sm max-w-[85%] typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>`;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // Simulated Response Delay
                setTimeout(() => {
                    const responses = [
                        "Entendo como se sente. Quer me falar mais sobre isso?",
                        "Estou aqui para ouvir. Respire fundo.",
                        "Isso parece difícil. Como tem lidado com essa situação?",
                        "Pode continuar, estou atento.",
                        "É importante validar seus sentimentos."
                    ];
                    const response = responses[Math.floor(Math.random() * responses.length)];

                    // Remove Loading and Add AI Message
                    const loader = document.getElementById(loadingId);
                    if (loader) loader.remove();

                    chatMessages.push({
                        sender: 'psychologist',
                        text: response
                    });
                    messagesContainer.innerHTML += `
                        <div class="flex justify-start animate-fade-in mb-4">
                            <div class="bg-white border border-gray-200 text-gray-800 rounded-r-2xl rounded-tl-2xl px-4 py-3 shadow-sm max-w-[85%]">
                                <p class="text-sm">${response}</p>
                            </div>
                        </div>`;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 1500);
            }

            sendBtn.onclick = handleSend;
            chatInput.onkeypress = (e) => {
                if (e.key === 'Enter') handleSend()
            };
        }

        // Lógica de Edição de Perfil
        function enableProfileEdit() {
            document.querySelectorAll('#profileForm input').forEach(input => input.disabled = false);
            document.getElementById('profileEditActions').classList.remove('hidden');
            document.getElementById('profileEditActions').classList.add('flex');
            document.getElementById('btnEditProfile').classList.add('hidden');
            document.getElementById('profName').focus();
        }

        function cancelProfileEdit() {
            renderPage('profile');
        }

        function saveProfileChanges() {
            userData.name = document.getElementById('profName').value;
            userData.email = document.getElementById('profEmail').value;
            userData.phone = document.getElementById('profPhone').value;
            userData.birthDate = document.getElementById('profBirth').value;
            userData.address = document.getElementById('profAddress').value;
            document.querySelectorAll('.sidebar-username').forEach(el => el.innerText = userData.name);
            document.querySelectorAll('.sidebar-email').forEach(el => el.innerText = userData.email);
            showToast('Perfil atualizado com sucesso!', 'success');
            renderPage('profile');
        }

        // Lógica do Modal de Senha
        function openPasswordModal() {
            document.getElementById('passwordModal').classList.remove('hidden');
            document.getElementById('passwordModal').classList.add('flex');
        }

        function closePasswordModal() {
            document.getElementById('passwordModal').classList.add('hidden');
            document.getElementById('passwordModal').classList.remove('flex');
        }

        function saveNewPassword() {
            const p1 = document.getElementById('newPass').value;
            const p2 = document.getElementById('confirmPass').value;
            if (p1 && p1 === p2) {
                showToast('Senha alterada!', 'success');
                closePasswordModal();
            } else {
                showToast('Senhas não conferem', 'error');
            }
        }

        // Helpers Gerais
        function performCheckIn() {
            showToast('Check-in realizado!', 'success');
        }

        function toggleSensor(id, checked) {
            const s = sensorsData.find(x => x.id === id);
            if (s) s.isActive = checked;
            showToast(`Sensor ${s.name} ${checked ? 'Ativado' : 'Desativado'}`, 'info');
            renderPage('security');
        }

        function showEmergencyModal() {
            document.getElementById('emergencyModal').classList.remove('hidden');
            document.getElementById('emergencyModal').classList.add('flex');

            // Reset and start countdown
            sosTimeLeft = 5;
            document.getElementById('sosCountdownText').innerText = sosTimeLeft;
            const circle = document.getElementById('sosProgressCircle');
            if (circle) circle.style.strokeDashoffset = '0';

            if (sosInterval) clearInterval(sosInterval);

            sosInterval = setInterval(() => {
                sosTimeLeft--;
                document.getElementById('sosCountdownText').innerText = sosTimeLeft;

                // Update circle (251.2 is circumference for r=40)
                const offset = 251.2 - (251.2 * sosTimeLeft / 5);
                if (circle) circle.style.strokeDashoffset = offset;

                if (sosTimeLeft <= 0) {
                    confirmEmergency();
                }
            }, 1000);
        }

        function closeEmergencyModal() {
            if (sosInterval) clearInterval(sosInterval);
            document.getElementById('emergencyModal').classList.add('hidden');
            document.getElementById('emergencyModal').classList.remove('flex');
        }

        function confirmEmergency() {
            if (sosInterval) clearInterval(sosInterval);
            closeEmergencyModal();
            showToast('SOS ENVIADO!', 'success');
        }

        function confirmSafe() {
            document.getElementById('sensorModal').classList.add('hidden');
            document.getElementById('sensorModal').classList.remove('flex');
            showToast('Confirmado: Segura', 'success');
            if (sensorTestInterval) clearInterval(sensorTestInterval);
        }

        function sendAlertNow() {
            document.getElementById('sensorModal').classList.add('hidden');
            document.getElementById('sensorModal').classList.remove('flex');
            showToast('ALERTA ENVIADO', 'error');
            if (sensorTestInterval) clearInterval(sensorTestInterval);
        }

        function testSensor(name) {
            const modal = document.getElementById('sensorModal');
            const nameSpan = document.getElementById('sensorName');
            const countSpan = document.getElementById('countdown');
            const progress = document.getElementById('progressFill');

            if (nameSpan) nameSpan.innerText = name;
            modal.classList.remove('hidden');
            modal.classList.add('flex');

            let timeLeft = 10;
            if (countSpan) countSpan.innerText = timeLeft;
            if (progress) progress.style.width = '100%';

            if (sensorTestInterval) clearInterval(sensorTestInterval);

            sensorTestInterval = setInterval(() => {
                timeLeft--;
                if (countSpan) countSpan.innerText = timeLeft;
                if (progress) progress.style.width = (timeLeft / 10) * 100 + '%';

                if (timeLeft <= 0) {
                    clearInterval(sensorTestInterval);
                    sendAlertNow();
                }
            }, 1000);
        }

        // Functions for Notes
        function showDeleteNoteModal() {
            document.getElementById('deleteNoteModal').classList.remove('hidden');
            document.getElementById('deleteNoteModal').classList.add('flex');
        }

        function closeDeleteNoteModal() {
            document.getElementById('deleteNoteModal').classList.add('hidden');
            document.getElementById('deleteNoteModal').classList.remove('flex');
            currentNoteIdToDelete = null;
        }

        function deleteNoteFromModal() {
            if (currentNoteIdToDelete !== null) {
                notes = notes.filter(n => n.id !== currentNoteIdToDelete);
                showToast('Anotação excluída.', 'info');
                renderPage('notes');
            }
            closeDeleteNoteModal();
        }

        function showToast(msg, type = 'info') {
            const c = document.getElementById('toastContainer');
            const d = document.createElement('div');
            let color = type === 'success' ? 'border-green-500 text-green-700' : type === 'error' ? 'border-red-500 text-red-700' : 'border-blue-500 text-blue-700';
            d.className = `bg-white border-l-4 ${color} p-4 rounded shadow-lg transform translate-y-full opacity-0 transition-all duration-300 flex items-center gap-3`;
            d.innerHTML = `<i class="fas fa-info-circle"></i><span class="font-bold">${msg}</span>`;
            c.appendChild(d);
            setTimeout(() => d.classList.remove('translate-y-full', 'opacity-0'), 10);
            setTimeout(() => {
                d.classList.add('opacity-0');
                setTimeout(() => d.remove(), 300);
            }, 3000);
        }

        // Init
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.item-nav-sidebar').forEach(btn => btn.addEventListener('click', () => renderPage(btn.dataset.page)));
            document.getElementById('floatingEmergencyBtn').addEventListener('click', showEmergencyModal);
            renderPage('security');
        });

        // Funções placeholders
        function openAddModal() {
            document.getElementById('addContactModal').classList.remove('hidden');
            document.getElementById('addContactModal').classList.add('flex');
        }

        function closeAddContactModal() {
            document.getElementById('addContactModal').classList.add('hidden');
            document.getElementById('addContactModal').classList.remove('flex');
        }

        function saveNewEmergencyContact() {
            showToast('Contato salvo', 'success');
            closeAddContactModal();
        }
    