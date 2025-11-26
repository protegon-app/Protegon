
document.addEventListener("DOMContentLoaded", function () {
  // 1. Selecionamos os elementos do HTML que vamos usar
  const loginForm = document.getElementById("form-login");
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");

  // Seleciona o botão de "Entrar" dentro do formulário
  const submitButton = loginForm.querySelector('button[type="submit"]');
  loginForm.addEventListener("submit", function (event) {
    // 3. Previne o comportamento padrão do formulário
    // (que é recarregar a página)
    event.preventDefault();

    // 4. Pegamos os valores que o usuário digitou
    const email = emailInput.value;
    const senha = senhaInput.value;

    // --- SIMULAÇÃO DE LOGIN ---
    // Damos um feedback visual para o usuário
    submitButton.textContent = "Carregando...";
    submitButton.disabled = true; // Desabilita o botão para evitar cliques duplos

    setTimeout(() => {
      if (email !== "" && senha !== "") {
        console.log("Login simulado com sucesso! Redirecionando...");

        // 6. A "ROTA" (Redirecionamento)
        // O navegador será enviado para a página de perfil.
        // Altere "perfil.html" se o nome do seu arquivo for outro.
        window.location.href = "Perfil.html";
      } else {
        // Caso de "erro" na simulação
        alert("Por favor, preencha o e-mail e a senha.");

        // Restaura o botão ao estado original
        submitButton.textContent = "Entrar";
        submitButton.disabled = false;
      }
    }, 1000); // 1000ms = 1 segundo de espera
  });
});
