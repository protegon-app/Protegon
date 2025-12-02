 // =========================================================
        // ESTADO DA APLICAÇÃO
        // =========================================================

        let currentPage = 'security';
        let countdownInterval = null;
        let timeRemaining = 60;
        const CHECKIN_INTERVAL_SECONDS = 72 * 60 * 60;
        let checkInTimeLeft = 71 * 60 * 60;
        let editingContactId = null;
        let currentNoteIdToDelete = null;

        // =========================================================
        // DADOS MOCK
        // =========================================================

        let emergencyContacts = [
            { id: 'c1', name: 'Maria Silva', phone: '+5511987654321', relationship: 'Mãe' },
            { id: 'c2', name: 'Ana Santos', phone: '+5511987651234', relationship: 'Amiga' },
            { id: 'c3', name: 'Dr. João Souza', phone: '+5511987655678', relationship: 'Psicólogo' }
        ];

        const notes = [
            {
                id: 1,
                title: 'Sessão de Terapia',
                date: '2025-10-15',
                content: 'Discutimos técnicas de gerenciamento de estresse relacionadas ao trabalho. Exercícios de respiração foram recomendados.',
                image: 'https://images.unsplash.com/photo-1549414216-9b5751915609?w=400&h=200&fit=crop',
                eventDate: '15/10/2025'
            },
            {
                id: 2,
                title: 'Objetivos Pessoais',
                date: '2025-10-12',
                content: 'Focar em equilibrar trabalho e vida pessoal. Praticar hobbies pelo menos 2x por semana.',
                image: null,
                eventDate: '12/10/2025'
            },
            {
                id: 3,
                title: 'Progresso Semanal',
                date: '2025-10-10',
                content: 'Semana positiva. Consegui praticar meditação 4 dias. Notei redução na ansiedade.',
                image: null,
                eventDate: '10/10/2025'
            }
        ];

        const chatMessages = [
            { sender: 'psychologist', text: 'Olá! Como você está se sentindo hoje?', time: '10:30' },
            { sender: 'user', text: 'Estou me sentindo melhor, obrigada.', time: '10:32' },
            { sender: 'psychologist', text: 'Que bom! Gostaria de conversar sobre algo específico?', time: '10:33' },
            { sender: 'user', text: 'Gostaria de falar sobre como lidar com momentos difíceis.', time: '10:35' }
        ];

        const sensorsData = [
            { id: 'sensor_motion', name: 'Detector de Movimento Brusco', description: 'Detecta movimentos súbitos ou quedas do dispositivo', icon: 'fa-bolt', sensitivity: 77, isActive: true },
            { id: 'sensor_sound', name: 'Detector de Sons Altos', description: 'Identifica gritos, sons altos ou vozes agressivas', icon: 'fa-volume-up', sensitivity: 80, isActive: true },
            { id: 'sensor_fall', name: 'Detector de Queda', description: 'Detecta quedas bruscas que podem indicar perigo', icon: 'fa-arrow-down', sensitivity: 70, isActive: true },
            { id: 'sensor_shake', name: 'Botão de Pânico por Agitação', description: 'Agite o celular 3 vezes rapidamente para disparar alerta', icon: 'fa-mobile-alt', sensitivity: 85, isActive: false }
        ];

        // =========================================================
        // FUNÇÕES UI / RESPONSIVIDADE
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

        function formatTimeRemaining(timeInSeconds) {
            const totalSeconds = Math.max(0, timeInSeconds);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            if (days > 0) return `${days}d ${String(hours).padStart(2, '0')}h`;
            return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
        }

        function getProgressPercentage(timeInSeconds) {
            const elapsed = CHECKIN_INTERVAL_SECONDS - timeInSeconds;
            return Math.min(100, (elapsed / CHECKIN_INTERVAL_SECONDS) * 100);
        }

        // =========================================================
        // RENDERIZAÇÃO (ESTILO ORIGINAL)
        // =========================================================

        function renderSafetyCheckIn() {
            const timeString = formatTimeRemaining(checkInTimeLeft);
            const progressPercentage = getProgressPercentage(checkInTimeLeft);
            const checkInHistoryData = [
                { date: '2025-10-26', time: '14:30', content: 'Confirmado' },
                { date: '2025-10-23', time: '09:15', content: 'Confirmado' }
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
                            <p class="text-xs text-gray-700/80 mb-2 break-words">${sensor.description}</p>
                            <div class="flex items-center justify-between text-xs mb-1 max-w-[200px]">
                                <span class="text-gray-600">Sensibilidade</span>
                                <span>${sensor.sensitivity}%</span>
                            </div>
                            <div class="h-1 bg-[var(--azul-claro-houver)] rounded-full overflow-hidden mt-1 max-w-[200px]">
                                <div class="h-full bg-[var(--azul-marinho-escuro)]" style="width: ${sensor.sensitivity}%;"></div>
                            </div>
                            <button onclick="testSensor('${sensor.name}')" class="mt-3 px-4 py-1 bg-[var(--branco)] border border-[var(--azul-marinho-escuro)] text-[var(--azul-marinho-escuro)] rounded-lg hover:bg-[var(--azul-claro)] transition-colors text-sm font-semibold">Testar</button>
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
        // RENDERIZAÇÃO DAS PÁGINAS PRINCIPAIS
        // =========================================================

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
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    ${renderSafetyCheckIn()}
                    ${renderAutomaticDetection()}
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
            const timerDisplay = document.getElementById('checkin-timer-display');
            const progressBar = document.getElementById('checkin-progress-bar');
            if (timerDisplay) timerDisplay.textContent = formatTimeRemaining(checkInTimeLeft);
            if (progressBar) progressBar.style.width = getProgressPercentage(checkInTimeLeft) + '%';
        }

        function testSensor(sensorName) {
            showSensorModal(sensorName);
        }

        function renderProfilePage() {
            const userName = "Mariana Moenchiali"; const userEmail = "marimoenchiali@email.com"; const userPhone = "+55 11 98765-4321"; const userBirthDate = "1990-05-15";
            const userAddress = "Rua Example, 123 - São Paulo, SP"; const userSince = "Janeiro 2025"; const lastPasswordChange = "15 de Janeiro de 2025";
            const stats = [
                { count: emergencyContacts.length, label: 'Contatos', icon: 'fas fa-users' }, { count: 47, label: 'Check-ins', icon: 'fas fa-check-circle' }, { count: notes.length, label: 'Anotações', icon: 'fas fa-file-alt' }, { count: 5, label: 'Conversas', icon: 'fas fa-comment-dots' }
            ];
            
            return `
                <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] overflow-hidden shadow-lg mb-8">
                    <div class="h-32 bg-gradient-to-r from-[var(--azul-marinho-escuro)] to-[var(--azul-marinho)]"></div>
                    <div class="px-4 sm:px-8 pb-8">
                        <div class="flex flex-col sm:flex-row justify-between items-center sm:items-end -mt-16 mb-6"> <div class="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left"> <div class="relative"> <img src="./assets/img/foto perfil.png" onerror="this.src='https://ui-avatars.com/api/?name=Mariana+Moenchiali&background=0D8ABC&color=fff'" alt="${userName}" class="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"> <button onclick="showToast('Alterar foto...', 'info')" class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-[var(--branco)] flex items-center justify-center text-sm transition-colors"> <i class="fas fa-camera"></i> </button> </div> <div class="mb-2"> <h2 class="text-2xl font-bold text-[var(--azul-marinho-escuro)] mb-1">${userName}</h2> <p class="text-gray-600/60">Usuário desde ${userSince}</p> </div> </div> <span class="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200 mb-2 mt-4 sm:mt-0"> Conta Ativa </span> </div>
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
            `;
        }

        function findNoteById(id) {
            return notes.find(note => note.id === id);
        }

        function toggleNewNoteButton(enable) {
            const newNoteButton = document.getElementById('showNewNoteFormBtn');
            if (newNoteButton) {
                newNoteButton.disabled = !enable;
                newNoteButton.classList.toggle('opacity-50', !enable);
                newNoteButton.classList.toggle('cursor-not-allowed', !enable);
            }
        }

        function renderNoteForm(note = null) {
            const isEditing = note !== null;
            const formTitle = isEditing ? `Editar Anotação: ${note.title}` : 'Criar Nova Anotação';
            const noteTitle = isEditing ? note.title : '';
            const noteContent = isEditing ? note.content : '';
            const saveAction = isEditing ? `saveEditedNote(${note.id})` : `saveNewNote()`;
            
            return `
                <div id="noteForm" class="bg-white rounded-xl border-2 border-[var(--azul-claro)] p-6 shadow-md transition-all duration-300">
                    <h4 class="text-lg font-semibold text-[var(--azul-marinho-escuro)] mb-4">${formTitle}</h4>
                    <div class="mb-4">
                        <label for="noteTitle" class="sr-only">Título da anotação</label>
                        <input type="text" id="noteTitle" placeholder="Título da anotação" value="${noteTitle}" class="w-full px-4 py-3 border border-[var(--azul-claro)] rounded-lg focus:outline-none focus:border-[var(--azul-marinho)]">
                    </div>
                    <div class="mb-4">
                        <label for="noteContent" class="sr-only">Escreva sua anotação aqui...</label>
                        <textarea id="noteContent" rows="4" placeholder="Escreva sua anotação aqui..." class="w-full px-4 py-3 border border-[var(--azul-claro)] rounded-lg focus:outline-none focus:border-[var(--azul-marinho)] resize-none">${noteContent}</textarea>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div class="flex gap-2 w-full sm:w-auto">
                            <button onclick="document.getElementById('noteImageUpload').click()" class="w-full sm:w-auto px-4 py-2 border border-[var(--azul-marinho)] text-[var(--azul-marinho-escuro)] rounded-lg hover:bg-[var(--azul-claro-houver)] font-semibold transition-colors flex items-center justify-center gap-2">
                                <i class="fas fa-image"></i> Adicionar Fotos
                            </button>
                        </div>
                        <input type="file" id="noteImageUpload" accept="image/*" multiple class="hidden">
                        <div class="flex gap-3 w-full sm:w-auto">
                            <button onclick="cancelNoteForm()" class="flex-1 sm:flex-none px-6 py-2 border border-[var(--azul-marinho)] text-[var(--azul-marinho-escuro)] rounded-lg hover:bg-[var(--azul-claro-houver)] font-semibold transition-colors">Cancelar</button>
                            <button onclick="${saveAction}" class="flex-1 sm:flex-none px-6 py-2 bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-[var(--branco)] rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"><i class="fas fa-save"></i> Salvar</button>
                        </div>
                    </div>
                </div>
            `;
        }

        function cancelNoteForm() {
            const container = document.getElementById('newNoteFormContainer');
            if (container) container.innerHTML = '';
            toggleNewNoteButton(true);
        }

        function showNewNoteForm() {
            cancelNoteForm();
            toggleNewNoteButton(false);
            const container = document.getElementById('newNoteFormContainer');
            if (container) {
                container.innerHTML = renderNoteForm(null);
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        function saveNewNote() {
            const title = document.getElementById('noteTitle')?.value.trim();
            const content = document.getElementById('noteContent')?.value.trim();
            if (!title || !content) { showToast('Erro ao salvar', 'error', 'Preencha os campos.'); return; }
            notes.unshift({ id: Date.now(), title: title, date: new Date().toISOString().split('T')[0], content: content, image: null, eventDate: new Date().toLocaleDateString('pt-BR') });
            renderPage('notes');
            showToast('Anotação Salva!', 'success');
        }

        function editNote(id) {
            const note = findNoteById(id);
            if (!note) return;
            toggleNewNoteButton(false);
            const container = document.getElementById('newNoteFormContainer');
            if (container) {
                container.innerHTML = renderNoteForm(note);
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        function saveEditedNote(id) {
            const index = notes.findIndex(n => n.id === id);
            if (index === -1) return;
            const title = document.getElementById('noteTitle')?.value.trim();
            const content = document.getElementById('noteContent')?.value.trim();
            if (!title || !content) return;
            notes[index].title = title;
            notes[index].content = content;
            renderPage('notes');
            showToast('Anotação Atualizada!', 'success');
        }

        function confirmDeleteNote(id, title) {
            const escapedTitle = title.replace(/'/g, "\\'");
            showDeleteNoteModal(id, escapedTitle);
        }

        function renderNotesPage() {
            const notesHtml = notes.map(note => `
                <div class="p-6 bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:border-[var(--azul-marinho)] transition-all duration-300">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h4 class="font-semibold text-lg text-[var(--azul-marinho-escuro)] mb-1">${note.title}</h4>
                            <p class="text-sm text-gray-500">${note.eventDate}</p>
                        </div>
                        <div class="flex gap-3">
                            <button onclick="editNote(${note.id})" class="text-[var(--azul-marinho)] hover:text-[var(--azul-marinho-escuro)] transition-colors text-lg"><i class="fas fa-edit"></i></button>
                            <button onclick="confirmDeleteNote(${note.id}, '${note.title.replace(/'/g, "\\'")}')" class="text-red-500 hover:text-red-700 transition-colors text-lg"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                    <p class="text-gray-700 mb-4">${note.content}</p>
                    ${note.image ? `<div class="mt-4 max-w-sm rounded-lg overflow-hidden shadow-md"><img src="${note.image}" class="w-full h-auto object-cover"></div>` : ''}
                </div>
            `).join('');

            return `
                <div class="max-w-4xl mx-auto">
                     <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <h2 class="text-3xl font-bold text-[var(--azul-marinho-escuro)]">Anotações</h2>
                        <button id="showNewNoteFormBtn" onclick="showNewNoteForm()" class="w-full sm:w-auto px-5 py-2 bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                            <i class="fas fa-plus"></i> Nova Anotação
                        </button>
                     </div>
                     <div id="newNoteFormContainer" class="mb-6"></div>
                     <h3 class="text-xl font-semibold text-[var(--azul-marinho-escuro)] mb-4 border-b border-gray-300 pb-2">Minhas Anotações</h3>
                     <div class="space-y-6" id="notesListContainer">
                        ${notesHtml.length > 0 ? notesHtml : '<p class="text-gray-500 text-center">Nenhuma anotação encontrada.</p>'}
                     </div>
                </div>
            `;
        }

        function renderChatPage() {
            return `
                <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] flex flex-col h-[calc(100vh-220px)] overflow-hidden shadow-sm">
                    <div class="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                        <div class="relative">
                            <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
                                 <i class="fas fa-user-md text-gray-500 text-xl"></i>
                            </div>
                            <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div>
                            <h3 class="font-bold text-[var(--azul-marinho-escuro)]">Dr. João Souza</h3>
                            <p class="text-xs text-green-600 font-semibold">Online agora</p>
                        </div>
                    </div>

                    <div id="chatMessages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
                        ${chatMessages.map(msg => `
                            <div class="flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in">
                                <div class="${msg.sender === 'user' ? 'bg-[var(--azul-marinho)] text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' : 'bg-white border border-gray-200 text-gray-800 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'} px-4 py-3 shadow-sm max-w-[85%] sm:max-w-[70%]">
                                    <p class="text-sm leading-relaxed">${msg.text}</p>
                                    <span class="text-[10px] ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'} mt-1 block text-right">${msg.time}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="p-4 bg-white border-t border-gray-100">
                        <div class="flex items-center gap-2">
                            <input type="text" id="chatInput" placeholder="Digite sua mensagem..." class="flex-1 bg-gray-100 text-gray-800 placeholder-gray-500 border-0 rounded-full px-6 py-3 focus:ring-2 focus:ring-[var(--azul-claro)] focus:bg-white transition-all outline-none">
                            <button id="sendMessageBtn" class="w-12 h-12 bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-white rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function initChatPage() {
            const chatInput = document.getElementById('chatInput');
            const sendBtn = document.getElementById('sendMessageBtn');
            const messagesContainer = document.getElementById('chatMessages');

            if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;

            function addMessageToScreen(text, sender) {
                const div = document.createElement('div');
                div.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`;
                const bubbleClass = sender === 'user' ? 'bg-[var(--azul-marinho)] text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' : 'bg-white border border-gray-200 text-gray-800 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl';
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                div.innerHTML = `
                    <div class="${bubbleClass} px-4 py-3 shadow-sm max-w-[85%] sm:max-w-[70%]">
                        <p class="text-sm leading-relaxed">${text}</p>
                        <span class="text-[10px] ${sender === 'user' ? 'text-blue-200' : 'text-gray-400'} mt-1 block text-right">${time}</span>
                    </div>
                `;
                messagesContainer.appendChild(div);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            function handleSend() {
                const text = chatInput.value.trim();
                if (!text) return;
                
                addMessageToScreen(text, 'user');
                chatMessages.push({ sender: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
                chatInput.value = '';
                chatInput.focus();

                setTimeout(() => {
                    const respostas = ["Entendo, continue.", "Como isso te afeta?", "Estou ouvindo.", "Pode elaborar mais?"];
                    const resp = respostas[Math.floor(Math.random() * respostas.length)];
                    addMessageToScreen(resp, 'psychologist');
                    chatMessages.push({ sender: 'psychologist', text: resp, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
                }, 1500);
            }

            if (sendBtn && chatInput) {
                sendBtn.addEventListener('click', handleSend);
                chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
            }
        }

        function openAddModal() {
            editingContactId = null;
            const modal = document.getElementById("addContactModal");
            const title = modal.querySelector("h2");
            title.innerHTML = '<i class="fas fa-user-plus"></i> Novo Contato';
            document.getElementById("contactName").value = "";
            document.getElementById("contactPhone").value = "";
            document.getElementById("contactRelation").value = "";
            modal.classList.remove("hidden");
            modal.classList.add("flex");
        }

        function openEditModal(id) {
            const contact = emergencyContacts.find(c => c.id === id);
            if (!contact) return;
            editingContactId = id;
            const modal = document.getElementById("addContactModal");
            const title = modal.querySelector("h2");
            title.innerHTML = '<i class="fas fa-edit"></i> Editar Contato';
            document.getElementById("contactName").value = contact.name;
            document.getElementById("contactPhone").value = contact.phone;
            document.getElementById("contactRelation").value = contact.relationship;
            modal.classList.remove("hidden");
            modal.classList.add("flex");
        }

        function closeAddContactModal() {
            editingContactId = null;
            const modal = document.getElementById("addContactModal");
            modal.classList.add("hidden");
            modal.classList.remove("flex");
        }

        function saveNewEmergencyContact() {
            const name = document.getElementById("contactName").value.trim();
            const phone = document.getElementById("contactPhone").value.trim();
            const relation = document.getElementById("contactRelation").value.trim();
            if (!name || !phone || !relation) { showToast("Preencha todos os campos!", "error"); return; }
            if (editingContactId) {
                const index = emergencyContacts.findIndex(c => c.id === editingContactId);
                if (index !== -1) { emergencyContacts[index] = { ...emergencyContacts[index], name, phone, relationship: relation }; showToast("Contato atualizado!", "success"); }
            } else {
                emergencyContacts.push({ id: 'c' + Date.now(), name, phone, relationship: relation });
                showToast("Contato adicionado!", "success");
            }
            closeAddContactModal();
            renderPage('emergency');
        }

        function confirmDelete(id) {
            const contact = emergencyContacts.find(c => c.id === id);
            if (!contact) return;
            const nameEl = document.getElementById('contactToDeleteName');
            if (nameEl) nameEl.textContent = contact.name;
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            if (confirmBtn) confirmBtn.dataset.idToDelete = id; 
            const modal = document.getElementById('deleteConfirmationModal');
            if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
        }

        function closeDeleteModal() {
            const modal = document.getElementById('deleteConfirmationModal');
            if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
        }

        function executeDelete() {
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            const id = confirmBtn?.dataset.idToDelete;
            if (id) {
                emergencyContacts = emergencyContacts.filter(c => c.id !== id);
                showToast("Contato excluído.", "info");
                renderPage('emergency');
            }
            closeDeleteModal();
        }

        function renderEmergencyContactsPage() {
            const contactsListHtml = emergencyContacts.map(contact => `
                <div class="p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-100 transition-colors gap-4">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-[var(--azul-marinho)] text-white flex items-center justify-center text-xl font-bold">
                            ${contact.name.charAt(0)}
                        </div>
                        <div>
                            <h4 class="font-semibold text-[var(--azul-marinho-escuro)] mb-1">${contact.name}</h4>
                            <p class="text-sm text-gray-600 mb-0.5">${contact.phone}</p>
                            <p class="text-xs text-[var(--azul-marinho)]/60">${contact.relationship}</p>
                        </div>
                    </div>
                    <div class="flex gap-2 w-full sm:w-auto">
                        <a href="tel:${contact.phone}" class="flex-1 sm:flex-none px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-center"> <i class="fas fa-phone"></i> </a>
                        <button onclick="openEditModal('${contact.id}')" class="flex-1 sm:flex-none px-3 py-2 border border-[var(--azul-marinho)] text-[var(--azul-marinho)] rounded-lg hover:bg-[var(--azul-claro)] transition-colors"> <i class="fas fa-edit"></i> </button>
                        <button onclick="confirmDelete('${contact.id}')" class="flex-1 sm:flex-none px-3 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"> <i class="fas fa-trash-alt"></i> </button>
                    </div>
                </div>
            `).join('');

            return `
                <div class="bg-white rounded-xl border-2 border-[var(--azul-claro)] p-4 sm:p-6">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div class="flex items-center gap-3">
                            <div class="bg-[var(--azul-claro)] p-3 rounded-full"> <i class="fas fa-users text-[var(--azul-marinho)] text-xl"></i> </div>
                            <h3 class="text-xl font-bold text-[var(--azul-marinho-escuro)]">Contatos de Emergência</h3>
                        </div>
                        <button onclick="openAddModal()" class="w-full sm:w-auto px-4 py-2 bg-[var(--azul-marinho)] hover:bg-[var(--azul-marinho-escuro)] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"> <i class="fas fa-plus mr-2"></i>Adicionar Contato </button>
                    </div>
                    <div class="space-y-3"> ${contactsListHtml} </div>
                </div>
            `;
        }

        function renderSettingsPage() {
            // Design Original
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
        // NAVEGAÇÃO
        // =========================================================

        document.addEventListener('DOMContentLoaded', function() {
            initNavigation();
            initEmergencyButtons();
            renderPage(currentPage);
        });

        function initNavigation() {
            const navItems = document.querySelectorAll('.item-nav-sidebar');
            navItems.forEach(item => {
                item.addEventListener('click', function() {
                    const page = this.dataset.page;
                    if (countdownInterval) clearInterval(countdownInterval);
                    navItems.forEach(nav => nav.classList.remove('bg-white/10')); // Remove estilo de seleção anterior
                    document.querySelectorAll(`.item-nav-sidebar[data-page="${page}"]`).forEach(nav => nav.classList.add('bg-white/10'));
                    if (window.innerWidth < 1024) toggleSidebar(false);
                    renderPage(page);
                });
            });
            // Seleção inicial
            document.querySelectorAll(`.item-nav-sidebar[data-page="${currentPage}"]`).forEach(nav => nav.classList.add('bg-white/10'));
        }

        function renderPage(page) {
            currentPage = page;
            const pageContent = document.getElementById('pageContent');
            const pageTitle = document.getElementById('pageTitle');
            const pages = { 
                'security': { title: 'Central de Segurança', render: renderSecurityPage, init: initSecurityPage },
                'profile': { title: 'Perfil do Usuário', render: renderProfilePage, init: null },
                'notes': { title: '', render: renderNotesPage, init: null },
                'chat': { title: 'Chat com o Psicólogo', render: renderChatPage, init: initChatPage },
                'emergency': { title: 'Contatos de Emergência', render: renderEmergencyContactsPage, init: null },
                'settings': { title: 'Configurações', render: renderSettingsPage, init: null }
            };

            if (!pages[page]) return;
            
            pageContent.style.opacity = '0';
            setTimeout(() => {
                pageTitle.textContent = pages[page].title;
                pageContent.innerHTML = pages[page].render();
                pageContent.style.opacity = '1';
                window.scrollTo(0, 0);
                if (pages[page].init) pages[page].init();
            }, 150);
        }

        function initEmergencyButtons() {
            document.getElementById('floatingEmergencyBtn').addEventListener('click', showEmergencyModal);
            const sidebarBtnDesktop = document.getElementById('sidebarEmergencyBtn');
            if(sidebarBtnDesktop) sidebarBtnDesktop.addEventListener('click', showEmergencyModal);
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
            showToast('SOS ENVIADO!', 'success', 'Sua localização foi compartilhada.');
        }

        function toggleSensor(sensorId, isChecked) {
            const sensorIndex = sensorsData.findIndex(s => s.id === sensorId);
            if (sensorIndex === -1) return;
            sensorsData[sensorIndex].isActive = isChecked;
            const sensor = sensorsData[sensorIndex];
            showToast(`${sensor.name} ${isChecked ? 'Ativado' : 'Desativado'}`, isChecked ? 'success' : 'info');

            if(currentPage === 'security') {
                renderPage('security');
            }
        }

        function showSensorModal(sensorName) {
            const modal = document.getElementById('sensorModal');
            document.getElementById('sensorName').textContent = sensorName;
            modal.classList.remove('hidden'); modal.classList.add('flex');
            if (countdownInterval) clearInterval(countdownInterval);
            timeRemaining = 60;
            const countdownEl = document.getElementById('countdown');
            const progressFill = document.getElementById('progressFill');
            if(countdownEl) countdownEl.textContent = timeRemaining;
            if(progressFill) progressFill.style.width = '100%';

            countdownInterval = setInterval(() => {
                timeRemaining--;
                if(countdownEl) countdownEl.textContent = timeRemaining;
                if(progressFill) progressFill.style.width = (timeRemaining / 60) * 100 + '%';
                if (timeRemaining <= 0) { clearInterval(countdownInterval); sendAlertNow(); }
            }, 1000);
        }

        function confirmSafe() {
            if (countdownInterval) clearInterval(countdownInterval);
            document.getElementById('sensorModal').classList.add('hidden');
            document.getElementById('sensorModal').classList.remove('flex');
            showToast('Confirmado: Você está segura.', 'success');
            if (currentPage === 'security') initSecurityPage();
        }

        function sendAlertNow() {
            if (countdownInterval) clearInterval(countdownInterval);
            document.getElementById('sensorModal').classList.add('hidden');
            document.getElementById('sensorModal').classList.remove('flex');
            showToast('ALERTA ENVIADO!', 'error');
            if (currentPage === 'security') initSecurityPage();
        }

        function showDeleteNoteModal(id, title) {
            currentNoteIdToDelete = id;
            const modal = document.getElementById('deleteNoteModal');
            const titleEl = document.getElementById('noteToDeleteTitle');
            if (titleEl) titleEl.textContent = title;
            modal.classList.remove('hidden'); modal.classList.add('flex');
        }

        function closeDeleteNoteModal() {
            currentNoteIdToDelete = null;
            const modal = document.getElementById('deleteNoteModal');
            modal.classList.add('hidden'); modal.classList.remove('flex');
        }

        function deleteNoteFromModal() {
            const id = currentNoteIdToDelete;
            closeDeleteNoteModal();
            if (id === null) return;
            const updatedNotes = notes.filter(note => note.id !== id);
            if (updatedNotes.length === notes.length) return;
            notes.length = 0; notes.push(...updatedNotes);
            renderPage('notes');
            showToast('Anotação excluída.', 'info');
        }

        function showToast(title, type = 'info', description = '') {
            const container = document.getElementById('toastContainer');
            const icons = { success: 'fa-check-circle', error: 'fa-exclamation-triangle', info: 'fa-info-circle' };
            const colors = { success: 'border-green-500 text-green-700', error: 'border-red-500 text-red-700', info: 'border-blue-500 text-blue-700' };
            
            const toast = document.createElement('div');
            toast.className = `bg-white rounded-lg shadow-xl p-4 flex items-center gap-3 border-l-4 ${colors[type]} transform translate-y-full opacity-0 transition-all duration-300`;
            toast.innerHTML = `
                <i class="fas ${icons[type]} text-xl"></i>
                <div>
                    <div class="font-bold text-sm">${title}</div>
                    ${description ? `<div class="text-xs opacity-80">${description}</div>` : ''}
                </div>
            `;
            
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.remove('translate-y-full', 'opacity-0');
            }, 10);

            setTimeout(() => {
                toast.classList.add('translate-y-full', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }

        window.addEventListener('click', function(event) {
            const modals = ['emergencyModal', 'sensorModal', 'deleteNoteModal', 'deleteConfirmationModal', 'addContactModal'];
            modals.forEach(id => {
                const modal = document.getElementById(id);
                if (modal && event.target === modal) {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                    if (id === 'sensorModal' && countdownInterval) clearInterval(countdownInterval);
                }
            });
        });