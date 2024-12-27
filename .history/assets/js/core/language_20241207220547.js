// Définir un namespace pour la gestion des langues
window.FanMa = window.FanMa || {};
window.FanMa.Language = {};

document.addEventListener('alpine:init', () => {
    Alpine.store('language', {
        current: localStorage.getItem('lang') || 'fr',
        isScrolled: false,
        translationCache: new Map(), // Cache pour les traductions

        init() {
            this.initScroll();
            this.setupLanguageChangeListener();
            this.validateTranslations();
        },

        validateTranslations() {
            if (!window.translations) {
                console.error('Translations not loaded');
                return;
            }

            // Vérifier les traductions manquantes
            const languages = ['fr', 'en'];
            const missingTranslations = new Set();

            Object.keys(window.translations).forEach(key => {
                languages.forEach(lang => {
                    if (!window.translations[key][lang]) {
                        missingTranslations.add(`${key}:${lang}`);
                    }
                });
            });

            if (missingTranslations.size > 0) {
                console.warn('Missing translations:', Array.from(missingTranslations));
            }
        },

        setLanguage(newLang) {
            if (this.current === newLang || !['fr', 'en'].includes(newLang)) return;

            this.current = newLang;
            localStorage.setItem('lang', newLang);
            document.documentElement.lang = newLang;
            
            // Vider le cache lors du changement de langue
            this.translationCache.clear();
            
            this.updateDOM();
            
            // Déclencher l'événement de changement de langue
            document.dispatchEvent(new CustomEvent('language-changed', { 
                detail: { 
                    language: newLang,
                    timestamp: new Date().toISOString()
                }
            }));
        },

        t(key) {
            if (!key) return '';
            
            // Vérifier le cache d'abord
            const cacheKey = `${key}:${this.current}`;
            if (this.translationCache.has(cacheKey)) {
                return this.translationCache.get(cacheKey);
            }

            const translation = window.translations?.[key]?.[this.current];
            if (translation) {
                this.translationCache.set(cacheKey, translation);
                return translation;
            }

            console.warn(`Translation missing: ${key} (${this.current})`);
            return key;
        },

        updateDOM() {
            // Mettre à jour le texte
            this.updateTextElements();
            this.updateAltAttributes();
            
            // Mettre à jour les autres éléments Alpine
            Alpine.nextTick(() => {
                document.querySelectorAll('[x-data]').forEach(el => {
                    if (el.__x) {
                        el.__x.updateElement(el);
                    }
                });
            });
        },

        updateTextElements() {
            document.querySelectorAll('[x-text^="$store.language.t("], [x-text^="t("]')
                .forEach(this.updateTranslatedElement.bind(this));
        },

        updateAltAttributes() {
            document.querySelectorAll('[x-bind\\:alt^="$store.language.t("], [x-bind\\:alt^="t("]')
                .forEach(this.updateTranslatedAttribute.bind(this));
        },

        updateTranslatedElement(el) {
            const xTextValue = el.getAttribute('x-text');
            const key = this.extractTranslationKey(xTextValue);
            if (key) {
                el.textContent = this.t(key);
            }
        },

        updateTranslatedAttribute(el) {
            const xBindValue = el.getAttribute('x-bind:alt');
            const key = this.extractTranslationKey(xBindValue);
            if (key) {
                el.setAttribute('alt', this.t(key));
            }
        },

        extractTranslationKey(value) {
            return value?.match(/t\(['"](.+?)['"]\)/)?.[1];
        },

        initScroll() {
            const handler = () => {
                this.isScrolled = window.pageYOffset > 20;
            };
            window.addEventListener('scroll', handler, { passive: true });
        }
    });
});

// Exportations globales
window.t = key => Alpine.store('language')?.t(key) || key;
window.FanMa.Language = {
    setLanguage: lang => Alpine.store('language')?.setLanguage(lang),
    t: key => Alpine.store('language')?.t(key) || key,
    getCurrentLanguage: () => Alpine.store('language')?.current
};

// Mode debug
const isDebugMode = localStorage.getItem('debugMode') === 'true' || 
                    window.location.hostname === 'localhost';

if (isDebugMode) {
    console.log('Debug mode enabled');
    window.FanMa.Language.debug = true;
}