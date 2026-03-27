// Initialize interactions
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }

  // Sticky Header
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Scroll Reveal Animations
  const reveals = document.querySelectorAll('.reveal');

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 150;

    reveals.forEach(reveal => {
      const elementTop = reveal.getBoundingClientRect().top;
      if (elementTop < windowHeight - elementVisible) {
        reveal.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Trigger on initial load

  // Active Link Highlighting
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });

  // Form Submission via AJAX to show popup
  const contactForm = document.getElementById('contactForm');
  const successModal = document.getElementById('successModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (contactForm && successModal && closeModalBtn) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault(); // Prevent default redirection

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Submitting... <i class="fas fa-spinner fa-spin"></i>';
      submitBtn.disabled = true;

      const formData = new FormData(contactForm);

      // 1. URL for FormSubmit Email (use /ajax/ endpoint to fix Vercel CORS)
      const formSubmitUrl = contactForm.action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');

      // Send to FormSubmit
      const emailPromise = fetch(formSubmitUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      }).catch(err => console.error("FormSubmit Error:", err));

      // 2. URL for Google Sheets Apps Script
      const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbw2FK3HRUZC9BnytvoPGTYuqMlZ3R5vpUt6ANgZ1iu0iEsHm6FcPLwf-5ZuH1uuXA/exec';

      // Send to Google Sheets
      const sheetPromise = fetch(googleScriptUrl, {
        method: 'POST',
        body: formData
      }).catch(err => console.error("Google Sheets Error:", err));

      // Wait for both submissions
      Promise.all([emailPromise, sheetPromise])
        .then(responses => {
          const emailResponse = responses[0];
          // As long as the primary email succeeds, we indicate success
          if (emailResponse && emailResponse.ok) {
            successModal.classList.add('active');
            contactForm.reset();
          } else {
            alert("Oops! There was a problem submitting your form.");
          }
        })
        .catch(error => {
          alert("Oops! There was a problem submitting your form.");
          console.error(error);
        })
        .finally(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        });
    });

    closeModalBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
      window.location.reload(); // Reload the page
    });

    // Also close on click outside the modal content
    window.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.remove('active');
        window.location.reload();
      }
    });
  }
});
