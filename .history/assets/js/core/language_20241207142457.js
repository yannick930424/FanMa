// language.js
document.addEventListener('alpine:init', () => {
    Alpine.store('language', {
        current: localStorage.getItem('lang') || 'fr',
        isScrolled: false,

        init() {
            this.initScroll();
            this.setupLanguageChangeListener();

        },

        setLanguage(newLang) {
            if (this.current === newLang) return;

            this.current = newLang;
            localStorage.setItem('lang', newLang);
            document.documentElement.lang = newLang;

            this.updateTextElements();
            this.updateAltAttributes();

            Alpine.nextTick(() => {
                document.querySelectorAll('[x-data]').forEach(el => {
                    if (el.__x) {
                        el.__x.updateElement(el);
                    }
                });
            });

            document.dispatchEvent(new CustomEvent('language-changed', { detail: newLang }));
        },

        t(key) {
            if (!key) return '';
            if (window.translations && window.translations[key] && window.translations[key][this.current]) {
                return window.translations[key][this.current];
            }
            console.warn(`Translation missing for key: ${key} in language: ${this.current}`);
            return key;
        },
/*         t(key) {
            if (!key) return '';
            const translation = window.translations && window.translations[key] && window.translations[key][this.current];
            if (translation) {
                console.log(`Traduction trouvée pour la clé "${key}" dans la langue "${this.current}":`, translation);
                return translation;
            }
            console.warn(`Translation missing for key: ${key} in language: ${this.current}`);
            return key;
        }, */
        

        isCurrentLang(checkLang) {
            return this.current === checkLang;
        },

        initScroll() {
            window.addEventListener('scroll', () => {
                this.isScrolled = window.pageYOffset > 20;
            });
        },

        updateTextElements() {
            document.querySelectorAll('[x-text^="$store.language.t("], [x-text^="t("]').forEach(el => {
                const xTextValue = el.getAttribute('x-text');

                if (xTextValue) {
                    const key = xTextValue.match(/t\(['"](.+?)['"]\)/)?.[1];
                    if (key) {
                        el.textContent = this.t(key);
                    }
                }
            });
        },
/*         updateTextElements() {
            console.log('updateTextElements() appelée');
            document.querySelectorAll('[x-text^="$store.language.t("], [x-text^="t("]').forEach(el => {
                const xTextValue = el.getAttribute('x-text');
                console.log('Element trouvé pour x-text:', el, 'Valeur:', xTextValue);
                const key = xTextValue.match(/t\(['"](.+?)['"]\)/)?.[1];
                if (key) {
                    el.textContent = this.t(key);
                }
            });
        }, */
        

        updateAltAttributes() {
            document.querySelectorAll('[x-bind\\:alt^="$store.language.t("], [x-bind\\:alt^="t("]').forEach(el => {
                const xBindValue = el.getAttribute('x-bind:alt');
                if (xBindValue) {
                    const key = xBindValue.match(/t\(['"](.+?)['"]\)/)?.[1];
                    if (key) {
                        el.setAttribute('alt', this.t(key));
                    }
                }
            });
        },

        setupLanguageChangeListener() {
            document.addEventListener('language-changed', (event) => {
                console.log('Langue changée:', event.detail);
            });
        }
    });
});

window.t = (key) => Alpine.store('language').t(key);

document.addEventListener('alpine:initialized', () => {
    Alpine.store('language').init();
});

const isDebugMode = localStorage.getItem('debugMode') === 'true' || window.location.hostname === 'localhost';

if (isDebugMode) {
    console.log('Mode débogage activé');
    document.addEventListener('alpine:initialized', () => {
        console.log('Configuration initiale de la langue:', Alpine.store('language').current);
    });
}

window.languageSetup = {
    setLanguage: (lang) => Alpine.store('language').setLanguage(lang),
    t: (key) => Alpine.store('language').t(key),
    isCurrentLang: (lang) => Alpine.store('language').isCurrentLang(lang)
};