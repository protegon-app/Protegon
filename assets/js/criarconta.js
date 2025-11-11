document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DOS ELEMENTOS ---
    const form = document.getElementById('cadastroForm');
    const steps = document.querySelectorAll('.step-content');
    const indicators = document.querySelectorAll('.step');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    let currentStep = 0;

    // --- FUNÇÕES DE VALIDAÇÃO DE ETAPAS ---
    
    // Funções de validação específicas (você pode expandir estas!)
    const validateStep1 = () => {
        let isValid = true;
        const nameInput = document.getElementById('name');
        const cpfInput = document.getElementById('cpf');
        const nameError = document.getElementById('name-error');
        const cpfError = document.getElementById('cpf-error');
        
        // 1. Validação de Nome
        if (nameInput.value.trim().length < 5) {
            nameError.textContent = 'O nome completo é obrigatório e deve ter no mínimo 5 caracteres.';
            isValid = false;
        } else {
            nameError.textContent = '';
        }

        // 2. Validação de CPF (apenas formato, não se é um CPF válido de verdade)
        if (cpfInput.value.trim().length !== 11 || isNaN(cpfInput.value.trim())) {
            cpfError.textContent = 'O CPF deve conter exatamente 11 dígitos numéricos.';
            isValid = false;
        } else {
            cpfError.textContent = '';
        }

        // 3. Validação da Data de Nascimento
        // Os campos de Dia, Mês e Ano também têm 'required' no HTML,
        // mas é ideal adicionar uma validação mais robusta aqui se necessário.

        return isValid;
    };

    const validateStep2 = () => {
        let isValid = true;
        const emailInput = document.getElementById('email');
        const telefoneInput = document.getElementById('telefone');
        const emailError = document.getElementById('email-error');
        const telefoneError = document.getElementById('telefone-error');
        
        // Expressão regular simples para validar e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

        // 1. Validação de E-mail
        if (!emailRegex.test(emailInput.value.trim())) {
            emailError.textContent = 'Por favor, digite um e-mail válido.';
            isValid = false;
        } else {
            emailError.textContent = '';
        }

        // 2. Validação de Telefone (pelo menos 10 ou 11 dígitos)
        // Remove tudo que não for dígito e verifica o tamanho
        const cleanPhone = telefoneInput.value.replace(/\D/g, '');
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            telefoneError.textContent = 'O telefone deve ter 10 ou 11 dígitos (incluindo DDD).';
            isValid = false;
        } else {
            telefoneError.textContent = '';
        }

        return isValid;
    };

    const validateStep3 = () => {
        let isValid = true;
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('password_confirmation');
        const passwordError = document.getElementById('password-error');
        const confirmError = document.getElementById('password_confirmation-error');
        const termsCheckbox = document.getElementById('terms');

        // 1. Validação de Senha (minlength="8" já está no HTML)
        if (passwordInput.value.length < 8) {
            passwordError.textContent = 'A senha deve ter no mínimo 8 caracteres.';
            isValid = false;
        } else {
            passwordError.textContent = '';
        }

        // 2. Validação de Confirmação de Senha
        if (passwordInput.value !== confirmInput.value) {
            confirmError.textContent = 'As senhas não coincidem.';
            isValid = false;
        } else {
            confirmError.textContent = '';
        }

        // 3. Validação dos Termos
        if (!termsCheckbox.checked) {
            alert('Você deve aceitar os Termos e Condições para se cadastrar.');
            isValid = false;
        }
        
        return isValid;
    };

    const validations = [validateStep1, validateStep2, validateStep3];

    // --- FUNÇÃO PRINCIPAL PARA ATUALIZAR A TELA ---
    const updateFormState = () => {
        // Mostra/esconde as seções do formulário
        steps.forEach((step, index) => {
            step.classList.toggle('hidden', index !== currentStep);
        });

        // Lógica dos Indicadores
        indicators.forEach((indicator, index) => {
            const span = indicator.querySelector('span');
            const svg = indicator.querySelector('svg');
            
            // Limpa os estilos CSS personalizados no seu CriarConta.css/Tailwind
            indicator.classList.remove('step-active', 'step-complete');
            
            if (index < currentStep) {
                // Etapa já concluída
                indicator.classList.add('step-complete');
                span.classList.add('hidden');
                svg.classList.remove('hidden');
            } else if (index === currentStep) {
                // Etapa atual
                indicator.classList.add('step-active');
                span.classList.remove('hidden');
                svg.classList.add('hidden');
            } else {
                // Etapa futura
                span.classList.remove('hidden');
                svg.classList.add('hidden');
            }
        });

        // Lógica para os botões de navegação
        prevBtn.classList.toggle('hidden', currentStep === 0);
        nextBtn.classList.toggle('hidden', currentStep === steps.length - 1);
        submitBtn.classList.toggle('hidden', currentStep !== steps.length - 1);
    };
    
    // --- EVENTOS DE CLIQUE ---

    nextBtn.addEventListener('click', () => {
        // Antes de avançar, valida a etapa atual
        if (validations[currentStep]()) {
            if (currentStep < steps.length - 1) {
                currentStep++;
                updateFormState();
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateFormState();
        }
    });

    // --- LÓGICA DE ENVIO DO FORMULÁRIO (Backend) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 1. Validação final da última etapa
        if (!validateStep3()) {
            return;
        }

        // 2. Coleta dos dados do formulário
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // 3. Monta o objeto de dados a ser enviado (limpando e formatando)
        const userData = {
            fullName: data.fullName,
            cpf: data.cpf.replace(/\D/g, ''), // Limpa o CPF
            birthDate: `${data.birthYear}-${data.birthMonth.padStart(2, '0')}-${data.birthDay.padStart(2, '0')}`, // Formato AAAA-MM-DD
            email: data.email,
            telefone: data.telefone.replace(/\D/g, ''), // Limpa o telefone
            password: data.password, // Será criptografada no Backend
            termsAccepted: data.terms === 'on'
        };

        // 4. ENVIO PARA O BACKEND (usando o 'action' do form ou um endpoint fixo)
        const url = form.getAttribute('action') || '/api/cadastro'; // Usa o action do HTML ou este valor
        
        submitBtn.disabled = true; // Desabilita o botão para evitar cliques duplicados
        submitBtn.textContent = 'Enviando...';
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                alert('🎉 Cadastro realizado com sucesso! Bem-vindo(a) à Protegon.');
                window.location.href = './CriarConta.html'; 
            } else {
                // Tenta ler a mensagem de erro do backend
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido do servidor.' }));
                alert(`Ops! Não foi possível cadastrar: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Erro de rede ou servidor:', error);
            alert('❌ Erro de conexão com o servidor. Verifique sua rede e tente novamente.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Cadastre-se';
        }
    });

    // --- INICIA O FORMULÁRIO ---
    updateFormState();
});