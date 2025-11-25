(function () {
    class HeroSliderController {
        constructor(root) {
            this.root = root;
            this.timerId = null;
            this.autoInterval = Number(root.dataset.autoInterval || 6000);
            this.reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.current = 0;

            this.boundPrevClick = this.handlePrevClick.bind(this);
            this.boundNextClick = this.handleNextClick.bind(this);
            this.boundDotClick = this.handleDotClick.bind(this);
            this.boundMouseEnter = this.stopAutoPlay.bind(this);
            this.boundMouseLeave = this.startAutoPlay.bind(this);
            this.boundVisibilityChange = this.handleVisibilityChange.bind(this);
            this.boundReduceMotionChange = this.handleReduceMotionChange.bind(this);
        }

        refreshElements() {
            this.slides = Array.from(this.root.querySelectorAll('.hero-slide'));
            this.dots = Array.from(this.root.querySelectorAll('.hero-slider__dot'));
            this.prevBtn = this.root.querySelector('[data-direction="prev"]');
            this.nextBtn = this.root.querySelector('[data-direction="next"]');
        }

        init() {
            this.refreshElements();
            if (!this.slides.length) return;

            const activeIndex = this.slides.findIndex((slide) => slide.classList.contains('is-active'));
            this.current = Math.max(activeIndex, 0);

            this.setActiveState();
            this.bindEvents();

            if (!this.reduceMotionQuery.matches) {
                this.startAutoPlay();
            }
        }

        bindEvents() {
            this.prevBtn?.addEventListener('click', this.boundPrevClick);
            this.nextBtn?.addEventListener('click', this.boundNextClick);
            this.dots.forEach((dot) => dot.addEventListener('click', this.boundDotClick));
            this.root.addEventListener('mouseenter', this.boundMouseEnter);
            this.root.addEventListener('mouseleave', this.boundMouseLeave);
            document.addEventListener('visibilitychange', this.boundVisibilityChange);

            if (this.reduceMotionQuery.addEventListener) {
                this.reduceMotionQuery.addEventListener('change', this.boundReduceMotionChange);
            } else if (this.reduceMotionQuery.addListener) {
                this.reduceMotionQuery.addListener(this.boundReduceMotionChange);
            }
        }

        destroy() {
            this.stopAutoPlay();
            this.prevBtn?.removeEventListener('click', this.boundPrevClick);
            this.nextBtn?.removeEventListener('click', this.boundNextClick);
            this.dots?.forEach((dot) => dot.removeEventListener('click', this.boundDotClick));
            this.root.removeEventListener('mouseenter', this.boundMouseEnter);
            this.root.removeEventListener('mouseleave', this.boundMouseLeave);
            document.removeEventListener('visibilitychange', this.boundVisibilityChange);

            if (this.reduceMotionQuery.removeEventListener) {
                this.reduceMotionQuery.removeEventListener('change', this.boundReduceMotionChange);
            } else if (this.reduceMotionQuery.removeListener) {
                this.reduceMotionQuery.removeListener(this.boundReduceMotionChange);
            }
        }

        setActiveState() {
            this.slides.forEach((slide, index) => {
                const isActive = index === this.current;
                slide.classList.toggle('is-active', isActive);
                slide.setAttribute('aria-hidden', (!isActive).toString());
            });

            this.dots.forEach((dot, index) => {
                const isActive = index === this.current;
                dot.classList.toggle('is-active', isActive);
                dot.setAttribute('aria-selected', isActive.toString());
            });
        }

        goToSlide(nextIndex) {
            const total = this.slides.length;
            this.current = (nextIndex + total) % total;
            this.setActiveState();
        }

        handlePrevClick() {
            this.goToSlide(this.current - 1);
            this.startAutoPlay();
        }

        handleNextClick() {
            this.goToSlide(this.current + 1);
            this.startAutoPlay();
        }

        handleDotClick(event) {
            const target = event.currentTarget;
            const index = Number(target?.dataset.slideTarget);
            if (Number.isNaN(index)) return;
            this.goToSlide(index);
            this.startAutoPlay();
        }

        handleVisibilityChange() {
            if (document.hidden) {
                this.stopAutoPlay();
            } else {
                this.startAutoPlay();
            }
        }

        handleReduceMotionChange(event) {
            if (event.matches) {
                this.stopAutoPlay();
            } else {
                this.startAutoPlay();
            }
        }

        startAutoPlay() {
            if (this.reduceMotionQuery.matches) {
                this.stopAutoPlay();
                return;
            }
            this.stopAutoPlay();
            this.timerId = window.setInterval(() => this.goToSlide(this.current + 1), this.autoInterval);
        }

        stopAutoPlay() {
            if (this.timerId) {
                clearInterval(this.timerId);
                this.timerId = null;
            }
        }
    }

    function init(root = document.getElementById('heroSlider')) {
        if (!root) return null;

        if (root.__heroSliderInstance) {
            root.__heroSliderInstance.destroy();
        }

        const instance = new HeroSliderController(root);
        root.__heroSliderInstance = instance;
        instance.init();
        return instance;
    }

    window.HeroSlider = { init };

    document.addEventListener('DOMContentLoaded', () => init());
    document.addEventListener('sections:ready', () => init());
})();

