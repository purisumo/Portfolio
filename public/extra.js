  function hideElementOnScroll(hides, scrollThreshold) {
    const element = document.getElementById("hides");

    if (!element) {
      console.error(`Element with ID '${hides}' not found.`);
      return;
    }

    window.addEventListener('scroll', function () {
      if (window.scrollY > scrollThreshold) {
        element.style.display = 'none';
      } else {
        element.style.display = 'block';
      }
    });
  }

  // Call the function with the element ID and scroll threshold
  hideElementOnScroll('elementToHide', 100);

  function scrollToTop() {
    // Scroll to the top of the page with smooth animation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }