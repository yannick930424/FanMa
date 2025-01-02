// Configuration Google Analytics 4 (GA4)
window.FanMa = window.FanMa || {};
window.FanMa.Analytics = {
    // ID de mesure GA4
    measurementId: 'G-VL7JBTLZ44', // À remplacer par votre ID de mesure GA4

    // Initialisation de Google Analytics
    init() {
        // Chargement du script GA4
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
        document.head.appendChild(script);

        // Configuration de base
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        window.gtag = gtag;

        gtag('js', new Date());
        gtag('config', this.measurementId, {
            'send_page_view': true,
            'language': document.documentElement.lang,
            'page_title': document.title
        });

        // Écouteurs d'événements
        this.setupEventListeners();
    },

    // Configuration des événements personnalisés
    setupEventListeners() {
        // Suivi des clics sur les liens de contact
        document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('contact', 'click', link.href.startsWith('mailto:') ? 'email' : 'phone');
            });
        });

        // Suivi des formulaires
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', () => {
                this.trackEvent('form', 'submit', form.getAttribute('id') || 'contact_form');
            });
        });

        // Suivi des changements de langue
        document.addEventListener('language-changed', (event) => {
            this.trackEvent('language', 'change', event.detail.language);
        });

        // Suivi du scroll
        this.setupScrollTracking();
    },

    // Tracking d'événements
    trackEvent(category, action, label = null, value = null) {
        gtag('event', action, {
            'event_category': category,
            'event_label': label,
            'value': value
        });
    },

    // Suivi du scroll
    setupScrollTracking() {
        let scrollDepths = [25, 50, 75, 100];
        let scrolled = new Set();

        window.addEventListener('scroll', _.debounce(() => {
            const winHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;

            scrollDepths.forEach(depth => {
                if (scrollPercent >= depth && !scrolled.has(depth)) {
                    scrolled.add(depth);
                    this.trackEvent('scroll', 'depth', `${depth}%`);
                }
            });
        }, 250));
    }
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    window.FanMa.Analytics.init();
});