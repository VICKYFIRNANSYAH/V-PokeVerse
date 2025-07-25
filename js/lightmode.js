const toggleBtn = document.getElementById("toggleMode");

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light"); // sesuai class yang kamu pakai di CSS (bukan 'dark-mode')

  const isLight = document.body.classList.contains("light");
  toggleBtn.innerHTML = isLight
    ? '<i class="fas fa-moon"></i> Dark Mode'
    : '<i class="fas fa-sun"></i> Light Mode';
});
