document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DOS ELEMENTOS ---
    const form = document.getElementById('cadastroForm');
    const steps = document.querySelectorAll('.step-content');
    const indicators = document.querySelectorAll('.step');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    let currentStep = 0;

    // --- FUNÇÕES DE VALIDAÇÃO (COLE AS SUAS AQUI) ---
    // Exemplo: const validateName = () => { /* ... sua lógica de validação aqui ... */ return true; };

    // --- FUNÇÃO PRINCIPAL PARA ATUALIZAR A TELA ---
    const updateFormState = () => {
        // Mostra/esconde as seções do formulário
        steps.forEach((step, index) => {
            step.classList.toggle('hidden', index !== currentStep);
        });

        // --- LÓGICA DOS INDICADORES (RESTAURADA) ---
        indicators.forEach((indicator, index) => {
            const span = indicator.querySelector('span');
            const svg = indicator.querySelector('svg');
            
            // Limpa os estilos
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

        // Lógica correta para os botões de navegação
        if (currentStep === 0) {
            // Etapa 1
            prevBtn.classList.add('hidden');
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        } else if (currentStep === steps.length - 1) {
            // Etapa Final
            prevBtn.classList.remove('hidden');
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            // Etapas Intermediárias
            prevBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    };
    
    // --- EVENTOS DE CLIQUE ---
    nextBtn.addEventListener('click', () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            updateFormState();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateFormState();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Formulário enviado com sucesso!');
    });

    // --- INICIA O FORMULÁRIO ---
    updateFormState();
});

