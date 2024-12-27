// Définir un namespace global pour notre application
window.FanMa = window.FanMa || {};

// Configuration des dépendances requises
const REQUIRED_DEPENDENCIES = {
    'Alpine': 'Alpine.js',
    'window.siteData': 'data.js',
    'window.siteData.services': 'data.js (services)',
    'window.translations': 'translations.js',
    'serviceModal': 'services.js'
};

// Fonction pour vérifier les dépendances
function checkDependencies() {
    const missingDependencies = [];
    
    for (const [key, name] of Object.entries(REQUIRED_DEPENDENCIES)) {
        if (!eval(`typeof ${key} !== 'undefined'`)) {
            missingDependencies.push(name);
            console.error(`Missing dependency: ${name}`);
        }
    }
    
    return missingDependencies.length === 0;
}

// Fonction d'initialisation principale
function initializeApplication() {
    try {
        // Vérifier toutes les dépendances
        if (!checkDependencies()) {
            throw new Error('Missing required dependencies');
        }

        // Initialiser Alpine.js si nécessaire
        if (!Alpine.version) {
            Alpine.start();
            console.log('Alpine.js initialized successfully');
        }

        // Initialiser le store de langue
        if (typeof Alpine.store('language') === 'undefined') {
            console.warn('Language store not initialized, waiting for Alpine init event');
        }

        // Déclencher un événement personnalisé quand tout est initialisé
        document.dispatchEvent(new CustomEvent('fanma-initialized'));

        return true;
    } catch (error) {
        console.error('Initialization failed:', error);
        return false;
    }
}

// Attendre le chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    // Définir un timeout pour l'initialisation
    const initTimeout = setTimeout(() => {
        console.error('Initialization timeout - some dependencies might be missing');
    }, 5000);

    // Tenter l'initialisation
    if (initializeApplication()) {
        clearTimeout(initTimeout);
    }

    // Écouter les erreurs globales
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
    });
});

// Export pour utilisation dans d'autres modules
window.FanMa.init = initializeApplication;