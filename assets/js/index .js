// Aguarda o documento carregar completamente
document.addEventListener('DOMContentLoaded', () => {
    
    // Seleciona o botão de menu e o menu mobile
    const btnMobile = document.getElementById('mobile-menu-btn');
    const menuDiv = document.getElementById('mobile-menu');

    // Verifica se os elementos existem para evitar erros
    if(btnMobile && menuDiv) {
        
        // Adiciona evento de clique
        btnMobile.addEventListener('click', () => {
            // Alterna a classe 'hidden' (mostra/esconde)
            menuDiv.classList.toggle('hidden');
        });

        // Opcional: Fechar o menu ao clicar em um link
        const links = menuDiv.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                menuDiv.classList.add('hidden');
            });
        });
    }
});