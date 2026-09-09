(function() {
  try {
    var theme = document.cookie.split('; ').find(row => row.startsWith('theme=')).split('=')[1];
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
