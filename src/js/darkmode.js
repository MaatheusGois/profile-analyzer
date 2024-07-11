document.getElementById('toggleDarkMode').addEventListener('change', function () {
    document.body.classList.toggle('dark-mode');
    document.getElementById('podfileInput').classList.toggle('dark-mode');
});