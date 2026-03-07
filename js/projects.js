/* ===================================================
   PORTFOLIO - Projects Filtering
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach((card, index) => {
        const category = card.getAttribute('data-category');

        if (filter === 'all' || category === filter) {
          card.style.transition = `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`;
          card.style.opacity = '1';
          card.style.transform = 'scale(1) translateY(0)';
          card.style.pointerEvents = 'auto';
          card.style.position = 'relative';
          card.style.display = '';
        } else {
          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8) translateY(20px)';
          card.style.pointerEvents = 'none';
          setTimeout(() => {
            if (!card.classList.contains('show')) {
              card.style.display = 'none';
            }
          }, 300);
        }

        // toggle class for timeout reference
        if (filter === 'all' || category === filter) {
          card.classList.add('show');
        } else {
          card.classList.remove('show');
        }
      });
    });
  });
});
