const loginButton = document.querySelector("#login");

const redirectToLogin = () => {
  window.location.href = 'http://localhost:3000/login';
};

if (loginButton) {
  loginButton.addEventListener('click', redirectToLogin);
}
