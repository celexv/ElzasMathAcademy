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

  // View Transition Navigation for internal links
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // If href is just "#", target is the top of the page, otherwise find the element
      const targetElement = href === '#' ? document.documentElement : document.querySelector(href);
      
      if (targetElement) {
        e.preventDefault();

        // Check if View Transition API is supported
        if (document.startViewTransition) {
          const currentScroll = window.scrollY;
          const targetScroll = href === '#' ? 0 : targetElement.offsetTop;
          
          // Determine scroll direction to apply appropriate animation
          const direction = targetScroll < currentScroll ? 'up' : 'down';
          
          document.documentElement.classList.add(`transition-${direction}`);
          
          const transition = document.startViewTransition(() => {
            // Scroll instantly during the transition snapshot
            if (href === '#') {
              window.scrollTo({ top: 0, behavior: 'instant' });
            } else {
              targetElement.scrollIntoView({ behavior: 'instant' });
            }
            
            // Instantly update active navigation state
            const targetId = href === '#' ? '#home' : href;
            navItems.forEach(item => {
              item.classList.remove('active');
              if (item.getAttribute('href') === targetId) {
                item.classList.add('active');
              }
            });
          });

          // Clean up the animation classes when the transition finishes
          transition.finished.finally(() => {
            document.documentElement.classList.remove('transition-up', 'transition-down');
          });
        } else {
          // Fallback to native smooth scroll for unsupported browsers
          if (href === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }

        // Close mobile navigation menu if it is currently open
        if (navLinks && navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
          const icon = mobileMenuBtn ? mobileMenuBtn.querySelector('i') : null;
          if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
          }
        }
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
      let formSubmitUrl = contactForm.action;
      if (!formSubmitUrl.includes('/ajax/')) {
        formSubmitUrl = formSubmitUrl.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');
      }

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
