// Namespace pour FanMa
window.FanMa = window.FanMa || {};

// Configuration
const CONFIG = {
    DEFAULT_LANGUAGE: 'fr',
    CONTENT_FIELDS: [
        'intro',
        'sections',
        'paragraphs',
        'areas'
    ]
};

// Utilitaires
const utils = {
    isValidIndex(index, array) {
        return index >= 0 && index < array.length;
    },

    validateService(service) {
        if (!service || typeof service !== 'object') return false;
        return ['id', 'title', 'description'].every(field => service.hasOwnProperty(field));
    },

    translateContent(content, translator) {
        if (!content || typeof content !== 'object') return {};

        return Object.entries(content).reduce((acc, [key, value]) => {
            // Traiter les tableaux
            if (Array.isArray(value)) {
                acc[key] = value.map(item => {
                    if (typeof item === 'string') return translator(item);
                    if (typeof item === 'object') return this.translateContent(item, translator);
                    return item;
                });
            }
            // Traiter les objets imbriqués
            else if (typeof value === 'object') {
                acc[key] = this.translateContent(value, translator);
            }
            // Traiter les chaînes de caractères
            else if (typeof value === 'string') {
                acc[key] = translator(value);
            }
            // Conserver les autres types de valeurs tels quels
            else {
                acc[key] = value;
            }
            return acc;
        }, {});
    }
};

function serviceModal() {
    return {
        activeService: null,
        isLoading: false,
        error: null,

        get services() {
            try {
                if (!window.FanMa?.data?.get('services')) {
                    throw new Error('Services data not available');
                }

                const languageStore = Alpine.store('language');
                if (!languageStore?.t) {
                    throw new Error('Language store not available');
                }

                return window.FanMa.data.get('services').map(service => {
                    if (!utils.validateService(service)) {
                        console.warn(`Invalid service data:`, service);
                        return null;
                    }

                    return {
                        ...service,
                        title: languageStore.t(service.title),
                        description: languageStore.t(service.description),
                        icon: window.FanMa.data.getImageUrl(service.icon),
                        content: utils.translateContent(service.content, languageStore.t.bind(languageStore))
                    };
                }).filter(Boolean); // Filtrer les services invalides

            } catch (error) {
                console.error('Error loading services:', error);
                return [];
            }
        },

        init() {
            this.setupEventListeners();
        },

        setupEventListeners() {
            // Écouter les changements de langue
            document.addEventListener('language-changed', () => {
                this.updateActiveService();
            });

            // Gérer la fermeture avec Escape
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.closeService();
            });
        },

        showService(index) {
            this.isLoading = true;
            this.error = null;

            try {
                if (!utils.isValidIndex(index, this.services)) {
                    throw new Error(`Invalid service index: ${index}`);
                }

                this.activeService = index;
                this.updateActiveService();
            } catch (error) {
                this.error = error.message;
                console.error(error);
            } finally {
                this.isLoading = false;
            }
        },

        closeService() {
            this.activeService = null;
            this.error = null;
        },

        updateActiveService() {
            if (this.activeService !== null) {
                // Forcer la mise à jour du service actif
                const currentIndex = this.activeService;
                this.activeService = null;
                this.$nextTick(() => {
                    this.showService(currentIndex);
                });
            }
        },

        getActiveService() {
            if (this.error) return { error: this.error };
            if (this.isLoading) return { loading: true };
            
            const service = utils.isValidIndex(this.activeService, this.services)
                ? this.services[this.activeService]
                : null;

            return service || { content: {} };
        },

        // Méthodes utilitaires pour les templates
        hasContent(service) {
            return service && service.content && Object.keys(service.content).length > 0;
        },

        getContentSections(service) {
            if (!this.hasContent(service)) return [];
            return CONFIG.CONTENT_FIELDS.filter(field => 
                service.content[field] && 
                (Array.isArray(service.content[field]) ? 
                    service.content[field].length > 0 : 
                    Object.keys(service.content[field]).length > 0)
            );
        }
    };
}

// Export global
window.serviceModal = serviceModal;

// Export pour module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { serviceModal, utils };
}