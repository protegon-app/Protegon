let currentStep = 1;
        const totalSteps = 3;

        // Funções do Modal
        function openModal(modalId) {
            document.getElementById(modalId).classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Impede rolagem do fundo
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.add('hidden');
            document.body.style.overflow = 'auto'; // Libera rolagem
        }

        // Fechar modal com a tecla ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === "Escape") {
                closeModal('termsModal');
                closeModal('privacyModal');
            }
        });

        // Máscaras de Input (Formatação automática)
        document.getElementById('cpf').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = value;
        });

        document.getElementById('telefone').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
            value = value.replace(/(\d)(\d{4})$/, "$1-$2");
            e.target.value = value;
        });

        // Alternar Visibilidade da Senha
        function togglePasswordVisibility(inputId, btn) {
            const input = document.getElementById(inputId);
            const isPassword = input.type === 'password';
            
            input.type = isPassword ? 'text' : 'password';
            
            // Trocar ícone
            if (isPassword) {
                // Se virou texto, mostrar ícone de "Ocultar" (Olho riscado)
                btn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                `;
            } else {
                // Se virou password, mostrar ícone de "Ver" (Olho normal)
                btn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                `;
            }
        }

        // Função para validar campos do passo atual
        function validateCurrentStep() {
            let isValid = true;
            const stepContent = document.getElementById(`step-${currentStep}`);
            const inputs = stepContent.querySelectorAll('input, select');

            // Resetar erros visuais
            inputs.forEach(input => input.classList.remove('error'));
            document.querySelectorAll('[id$="-error"]').forEach(el => el.classList.add('hidden'));

            if (currentStep === 1) {
                const name = document.getElementById('name');
                const cpf = document.getElementById('cpf');
                const day = document.getElementById('day');
                const month = document.getElementById('month');
                const year = document.getElementById('year');

                if (name.value.trim().split(' ').length < 2) {
                    showError('name', 'Digite nome e sobrenome');
                    isValid = false;
                }
                if (cpf.value.length < 14) {
                    showError('cpf', null);
                    isValid = false;
                }
                if (!day.value || !month.value || !year.value) {
                    day.classList.add('error'); // Genérico para data
                    isValid = false;
                }
            }

            if (currentStep === 2) {
                const email = document.getElementById('email');
                const tel = document.getElementById('telefone');
                
                if (!email.value.includes('@') || !email.value.includes('.')) {
                    showError('email', null);
                    isValid = false;
                }
                if (tel.value.length < 14) {
                    showError('telefone', null);
                    isValid = false;
                }
            }

            if (currentStep === 3) {
                const pass = document.getElementById('password');
                const passConf = document.getElementById('password_confirmation');
                const terms = document.getElementById('terms');

                if (pass.value.length < 8) {
                    showError('password', 'A senha deve ter no mínimo 8 caracteres');
                    isValid = false;
                } else if (pass.value !== passConf.value) {
                    showError('password', 'As senhas não conferem');
                    isValid = false;
                }
                
                if (!terms.checked) {
                    document.getElementById('terms-error').classList.remove('hidden');
                    isValid = false;
                }
            }

            return isValid;
        }

        function showError(fieldId, msg) {
            document.getElementById(fieldId).classList.add('error');
            const errorDiv = document.getElementById(`${fieldId}-error`);
            if(msg) errorDiv.innerText = msg;
            errorDiv.classList.remove('hidden');
        }

        // Navegação entre passos
        function changeStep(direction) {
            // Se estiver avançando, valida antes
            if (direction === 1 && !validateCurrentStep()) {
                return;
            }

            // Oculta passo atual
            document.getElementById(`step-${currentStep}`).classList.add('hidden');
            
            // Atualiza número do passo
            currentStep += direction;

            // Mostra novo passo
            document.getElementById(`step-${currentStep}`).classList.remove('hidden');

            updateUI();
        }

        function updateUI() {
            // Atualiza indicadores (bolinhas)
            for (let i = 1; i <= totalSteps; i++) {
                const indicator = document.getElementById(`indicator-${i}`);
                if (i === currentStep) {
                    indicator.classList.add('active');
                    indicator.classList.remove('completed');
                    indicator.innerHTML = i;
                } else if (i < currentStep) {
                    indicator.classList.remove('active');
                    indicator.classList.add('completed');
                    indicator.innerHTML = '✓';
                } else {
                    indicator.classList.remove('active', 'completed');
                    indicator.innerHTML = i;
                }
            }

            // Atualiza barras de progresso
            if (currentStep > 1) document.getElementById('line-1').style.width = '100%';
            else document.getElementById('line-1').style.width = '0%';
            
            if (currentStep > 2) document.getElementById('line-2').style.width = '100%';
            else document.getElementById('line-2').style.width = '0%';

            // Controla visibilidade dos botões
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const submitBtn = document.getElementById('submit-btn');

            // Botão Voltar
            if (currentStep === 1) {
                prevBtn.classList.add('opacity-0', 'pointer-events-none');
            } else {
                prevBtn.classList.remove('opacity-0', 'pointer-events-none');
            }

            // Botões Próximo / Submit
            if (currentStep === totalSteps) {
                nextBtn.classList.add('hidden');
                submitBtn.classList.remove('hidden');
            } else {
                nextBtn.classList.remove('hidden');
                submitBtn.classList.add('hidden');
            }
        }

        // Simulação de envio do formulário
        document.getElementById('cadastroForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateCurrentStep()) return;

            // Pega o nome do usuário para exibir no sucesso
            const firstName = document.getElementById('name').value.split(' ')[0];
            document.getElementById('user-name-display').innerText = firstName;

            // Esconde formulário e mostra loading
            document.getElementById('form-container').classList.add('hidden');
            document.getElementById('loading-screen').classList.remove('hidden');

            // Simula tempo de requisição (2 segundos)
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('hidden');
                document.getElementById('success-screen').classList.remove('hidden');
                
                // (Opcional) Salvar no LocalStorage para simular persistência
                const userData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    date: new Date().toISOString()
                };
                localStorage.setItem('protegon_user', JSON.stringify(userData));

                // DICA: Se quiser redirecionar AUTOMATICAMENTE após 3 segundos, descomente a linha abaixo:
                // setTimeout(() => { window.location.href = "./perfil.html"; }, 3000);
                
            }, 2000);
        });