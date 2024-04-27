const loginButton = document.querySelector("#login");

const redirectToLogin = () => {
  window.location.href = '/api/login';
};

if (loginButton) {
  loginButton.addEventListener('click', redirectToLogin);
}
