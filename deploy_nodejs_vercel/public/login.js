const loginButton = document.querySelector("#login");

const redirectToLogin = () => {
  window.location.href = 'https://songle.vercel.app/login';
};

if (loginButton) {
  loginButton.addEventListener('click', redirectToLogin);
}
