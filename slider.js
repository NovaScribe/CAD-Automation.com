class PromoSlider {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.track = this.container.querySelector('.promo-slider-track');
    this.dotsContainer = this.container.querySelector('.promo-dots');
    this.items = [];
    this.cardWidth = options.cardWidth || 280;
    this.gap = options.gap || 16;
    this.stepDuration = options.stepDuration || 3;

    this.container.style.setProperty('--card-width', `${this.cardWidth}px`);
    this.container.style.setProperty('--gap', `${this.gap}px`);

    window.addEventListener('resize', () => this.updateLayout());
  }

  addItem(mediaUrl, badgeText = null) {
    this.items.push({ mediaUrl, badgeText });
    this.render();
  }

  isVideo(url) {
    return /\.(mp4|webm|ogg)($|\?)/i.test(url) || url.includes('cc0-videos');
  }

  createCardElement(item, isDuplicate = false) {
    const card = document.createElement('div');
    card.className = 'promo-card';
    if (isDuplicate) card.setAttribute('aria-hidden', 'true');

    if (this.isVideo(item.mediaUrl)) {
      const video = document.createElement('video');
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.src = item.mediaUrl;
      card.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = item.mediaUrl;
      img.alt = 'Promo Item';
      card.appendChild(img);
    }

    if (item.badgeText) {
      const badge = document.createElement('div');
      badge.className = 'promo-badge';
      badge.textContent = item.badgeText;
      card.appendChild(badge);
    }

    return card;
  }

  // Synchronizes carousel track movement and dot animations automatically
  injectDynamicKeyframes(count, stepPx) {
    const styleId = 'promo-slider-dynamic-css';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    let trackKeyframes = `@keyframes dynamicSlideCarousel {\n`;
    let dotKeyframes = '';

    const percentStep = 100 / count;
    
    // Generate keyframes for track transition
    for (let i = 0; i <= count; i++) {
      const startPct = (i * percentStep).toFixed(2);
      const movePct = Math.min(100, (i * percentStep + percentStep * 0.8)).toFixed(2);
      const offset = -(i * stepPx);

      trackKeyframes += `  ${startPct}%, ${movePct}% { transform: translateX(${offset}px); }\n`;
    }
    trackKeyframes += `}\n`;

    // Generate synchronized active keyframes for each dot
    for (let d = 0; d < count; d++) {
      dotKeyframes += `@keyframes dotActive_${d} {\n`;
      for (let i = 0; i <= count; i++) {
        const activeIndex = i % count;
        const startPct = (i * percentStep).toFixed(2);
        const movePct = Math.min(100, (i * percentStep + percentStep * 0.8)).toFixed(2);

        if (activeIndex === d) {
          dotKeyframes += `  ${startPct}%, ${movePct}% { background-color: #007bff; transform: scale(1.3); }\n`;
        } else {
          dotKeyframes += `  ${startPct}%, ${movePct}% { background-color: #ccc; transform: scale(1); }\n`;
        }
      }
      dotKeyframes += `}\n`;
    }

    styleTag.textContent = trackKeyframes + dotKeyframes;
  }

  render() {
    this.track.innerHTML = '';
    this.dotsContainer.innerHTML = '';

    if (this.items.length === 0) return;

    this.items.forEach((item) => {
      this.track.appendChild(this.createCardElement(item));

      const dot = document.createElement('span');
      dot.className = 'dot';
      this.dotsContainer.appendChild(dot);
    });

    this.updateLayout();
  }

  updateLayout() {
    const count = this.items.length;
    if (count === 0) return;

    const totalWidthNeeded = count * this.cardWidth + (count - 1) * this.gap;
    const containerWidth = this.container.clientWidth;

    // Clear previous duplicates
    const duplicates = this.track.querySelectorAll('[aria-hidden="true"]');
    duplicates.forEach(d => d.remove());

    if (totalWidthNeeded > containerWidth) {
      const stepPx = this.cardWidth + this.gap;
      
      // Calculate how many visible cards fit on screen to duplicate enough items for SEAMLESS looping
      const visibleCardsCount = Math.ceil(containerWidth / stepPx);
      for (let i = 0; i < visibleCardsCount; i++) {
        const itemToClone = this.items[i % count];
        this.track.appendChild(this.createCardElement(itemToClone, true));
      }

      this.injectDynamicKeyframes(count, stepPx);

      const totalDuration = count * this.stepDuration;
      
      // Apply smooth carousel animation
      this.track.style.justifyContent = 'flex-start';
      this.track.style.animation = `dynamicSlideCarousel ${totalDuration}s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95)`;
      this.dotsContainer.style.display = 'flex';

      // Attach dynamic synced keyframe animations to each dot
      const dots = this.dotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, index) => {
        dot.style.animation = `dotActive_${index} ${totalDuration}s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95)`;
      });
    } else {
      // Center statically if content fits inside container
      this.track.style.justifyContent = 'center';
      this.track.style.animation = 'none';
      this.dotsContainer.style.display = 'none';
    }
  }
}