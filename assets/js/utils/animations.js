// Namespace FanMa
window.FanMa = window.FanMa || {};
window.FanMa.UI = window.FanMa.UI || {};

// Configuration
const CONFIG = {
    SCROLL: {
        HEADER_THRESHOLD: 80,
        BACK_TO_TOP_THRESHOLD: 300,
        ANIMATION_THRESHOLD: 0.2,
        ANIMATION_MARGIN: "0px 0px -100px 0px"
    },
    COOKIE_CONSENT: {
        POSITION: "bottom-right",
        TYPE: "opt-in",
        THEME: "classic",
        PALETTE: {
            POPUP: { background: "#000" },
            BUTTON: { background: "#f1d600" }
        }
    },
    GSAP: {
        DEFAULT_DURATION: 1,
        DEFAULT_Y_OFFSET: 50
    }
};

// Gestionnaire d'erreurs global
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Animation Error:', {
        message,
        source,
        lineno,
        colno,
        error
    });
    return true;
};

// Module d'animations au défilement
const ScrollAnimations = {
    init() {
        if (!this.checkDependencies()) return;
        
        gsap.registerPlugin(ScrollTrigger);
        this.initScrollTriggers();
        this.initIntersectionObserver();
    },

    checkDependencies() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('GSAP or ScrollTrigger not loaded');
            return false;
        }
        return true;
    },

    initScrollTriggers() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        if (elements.length === 0) return;

        elements.forEach(element => {
            gsap.from(element, {
                y: CONFIG.GSAP.DEFAULT_Y_OFFSET,
                opacity: 0,
                duration: CONFIG.GSAP.DEFAULT_DURATION,
                scrollTrigger: {
                    trigger: element,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
    },

    initIntersectionObserver() {
        if (window.fadeAnimationsInitialized) return;

        const options = {
            threshold: CONFIG.SCROLL.ANIMATION_THRESHOLD,
            rootMargin: CONFIG.SCROLL.ANIMATION_MARGIN
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        document.querySelectorAll('.fade-in-section').forEach(element => {
            observer.observe(element);
        });

        window.fadeAnimationsInitialized = true;
    }
};

// Module de gestion du défilement
const ScrollManager = {
    init() {
        this.initHeaderShrink();
        this.initSmoothScroll();
        this.initBackToTop();
    },

    initHeaderShrink() {
        const header = document.querySelector('header');
        if (!header) return;

        const handleScroll = () => {
            header.classList.toggle('shrink', window.scrollY > CONFIG.SCROLL.HEADER_THRESHOLD);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    },

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleSmoothScroll.bind(this));
        });
    },

    handleSmoothScroll(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');

        if (targetId === '#') {
            this.scrollToTop();
            return;
        }

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    },

    initBackToTop() {
        const button = document.getElementById('back-to-top');
        if (!button) return;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollToTop();
        });

        window.addEventListener('scroll', () => {
            button.style.display = window.pageYOffset > CONFIG.SCROLL.BACK_TO_TOP_THRESHOLD ? 'block' : 'none';
        }, { passive: true });
    },

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

// Module de gestion des cookies
const CookieConsent = {
    init() {
        if (!window.cookieconsent) {
            console.warn('Cookie consent library not loaded');
            return;
        }

        window.cookieconsent.initialise({
            palette: CONFIG.COOKIE_CONSENT.PALETTE,
            theme: CONFIG.COOKIE_CONSENT.THEME,
            position: CONFIG.COOKIE_CONSENT.POSITION,
            type: CONFIG.COOKIE_CONSENT.TYPE,
            content: {
                message: FanMa.Language.t('cookie_consent_message') || "Ce site utilise des cookies pour améliorer votre expérience.",
                deny: FanMa.Language.t('cookie_consent_deny') || "Refuser",
                allow: FanMa.Language.t('cookie_consent_allow') || "Accepter",
                link: FanMa.Language.t('cookie_consent_learn_more') || "En savoir plus",
                href: "/privacy-policy"
            },
            onInitialise: (status) => this.handleCookieStatus(status),
            onStatusChange: (status) => this.handleCookieStatus(status),
            onRevokeChoice: () => this.handleRevokeChoice()
        });
    },

    handleCookieStatus(status) {
        const didConsent = this.hasConsented();
        if (didConsent) {
            this.enableCookies();
        } else {
            this.disableCookies();
        }
    },

    handleRevokeChoice() {
        this.disableCookies();
    },

    enableCookies() {
        // Implémenter l'activation des cookies
        document.dispatchEvent(new CustomEvent('cookies-enabled'));
    },

    disableCookies() {
        // Implémenter la désactivation des cookies
        document.dispatchEvent(new CustomEvent('cookies-disabled'));
    },

    hasConsented() {
        return window.cookieconsent.utils.getCookie('cookieconsent_status') === 'allow';
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    ScrollAnimations.init();
    ScrollManager.init();
    CookieConsent.init();
});

// Export pour utilisation dans d'autres modules
window.FanMa.UI = {
    ScrollAnimations,
    ScrollManager,
    CookieConsent
};