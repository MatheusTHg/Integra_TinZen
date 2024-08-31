document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.querySelector('.burger-menu');
    const sidebar = document.querySelector('.sidebar');
  
    burgerMenu.addEventListener('click', function() {
      sidebar.classList.toggle('active');
      burgerMenu.classList.toggle('active');
    });
  });