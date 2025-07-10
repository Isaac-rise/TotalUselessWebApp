const container = document.querySelector('.viewport-container');
const pages = document.querySelectorAll('.page');
const pageWidth = window.innerWidth;

let lastScrollLeft = container.scrollLeft;
let idleCounter = 0;
let checkInterval = null;

function startScrollWatcher() {
  if (checkInterval) return;

  checkInterval = setInterval(() => {
    const currentScrollLeft = container.scrollLeft;

    if (currentScrollLeft === lastScrollLeft) {
      idleCounter++;
    } else {
      idleCounter = 0;
      lastScrollLeft = currentScrollLeft;
    }

    // Wenn 5x keine Bewegung mehr -> scroll beendet (ca. 250ms)
    if (idleCounter >= 5) {
      clearInterval(checkInterval);
      checkInterval = null;
      snapToNearestPage();
    }
  }, 50); // alle 50ms prüfen
}

container.addEventListener('scroll', () => {
  startScrollWatcher();
});

function snapToNearestPage() {
  const scrollLeft = container.scrollLeft;
  const centerX = scrollLeft + pageWidth / 2;

  let closestPageIndex = 0;
  let minDistance = Infinity;

  pages.forEach((page, index) => {
    const pageCenter = index * pageWidth + pageWidth / 2;
    const distance = Math.abs(centerX - pageCenter);
    if (distance < minDistance) {
      minDistance = distance;
      closestPageIndex = index;
    }
  });

  container.scrollTo({
    left: closestPageIndex * pageWidth,
    behavior: 'smooth'
  });
}