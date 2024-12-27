// Namespace pour FanMa
window.FanMa = window.FanMa || {};

// Configuration
const CONFIG = {
    COMPONENT_BASE_PATH: '/components/',
    CACHE_DURATION: 1000 * 60 * 5, // 5 minutes
    LOAD_TIMEOUT: 5000, // 5 secondes
    RETRY_ATTEMPTS: 2,
    RETRY_DELAY: 1000 // 1 seconde
};

class ComponentLoader {
    constructor() {
        this.cache = new Map();
        this.loadingComponents = new Map();
        this.componentScripts = new Map();
        this.initialized = false;

        // Liste des composants
        this.components = [
            { 
                id: 'header-container', 
                path: 'header/header.html',
                script: 'header/header.js',
                critical: true // Composant critique qui doit être chargé
            },
            { 
                id: 'footer-container', 
                path: 'footer/footer.html',
                script: 'footer/footer.js',
                critical: true
            }
        ];
    }

    init() {
        if (this.initialized) {
            console.warn('ComponentLoader already initialized');
            return;
        }

        this.initialized = true;
        this.loadComponents();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Écouter les changements de langue
        document.addEventListener('language-changed', () => {
            this.clearCache();
            this.loadComponents();
        });

        // Écouter les erreurs globales
        window.addEventListener('error', (event) => {
            console.error('Global error in component:', event.error);
            this.handleError(event.error);
        });
    }

    async loadComponents() {
        const loadPromises = this.components.map(component => 
            this.loadComponent(component).catch(error => {
                if (component.critical) {
                    throw error;
                }
                console.warn(`Non-critical component ${component.id} failed to load:`, error);
                return null;
            })
        );

        try {
            await Promise.all(loadPromises);
            this.dispatchEvent('components-loaded');
        } catch (error) {
            console.error('Failed to load critical components:', error);
            this.dispatchEvent('components-error', { error });
        }
    }

    async loadComponent(component, retryCount = 0) {
        const targetElement = document.getElementById(component.id);
        if (!targetElement) {
            throw new Error(`Target element #${component.id} not found`);
        }

        // Vérifier le cache
        const cached = this.getFromCache(component.path);
        if (cached) {
            this.renderComponent(targetElement, cached, component);
            return;
        }

        try {
            // Charger le HTML
            const htmlContent = await this.fetchWithTimeout(
                `${CONFIG.COMPONENT_BASE_PATH}${component.path}`
            );

            // Mettre en cache
            this.cache.set(component.path, {
                content: htmlContent,
                timestamp: Date.now()
            });

            // Rendre le composant
            await this.renderComponent(targetElement, htmlContent, component);

        } catch (error) {
            if (retryCount < CONFIG.RETRY_ATTEMPTS) {
                await this.delay(CONFIG.RETRY_DELAY);
                return this.loadComponent(component, retryCount + 1);
            }
            throw error;
        }
    }

    async renderComponent(element, html, component) {
        // Injecter le HTML
        element.innerHTML = html;

        // Charger le script associé si nécessaire
        if (component.script && !this.componentScripts.has(component.script)) {
            await this.loadComponentScript(component.script);
        }

        // Initialiser Alpine.js
        if (window.Alpine) {
            window.Alpine.initTree(element);
        }

        this.dispatchEvent('component-rendered', { 
            componentId: component.id 
        });
    }

    async loadComponentScript(scriptPath) {
        const script = document.createElement('script');
        script.src = `${CONFIG.COMPONENT_BASE_PATH}${scriptPath}`;
        script.async = true;

        const loadPromise = new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
        });

        document.head.appendChild(script);
        this.componentScripts.set(scriptPath, true);

        await loadPromise;
    }

    async fetchWithTimeout(url, timeout = CONFIG.LOAD_TIMEOUT) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.text();
        } finally {
            clearTimeout(timeoutId);
        }
    }

    getFromCache(path) {
        const cached = this.cache.get(path);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > CONFIG.CACHE_DURATION) {
            this.cache.delete(path);
            return null;
        }

        return cached.content;
    }

    clearCache() {
        this.cache.clear();
        console.log('Component cache cleared');
    }

    dispatchEvent(name, detail = {}) {
        document.dispatchEvent(new CustomEvent(`fanma-${name}`, { 
            detail: {
                ...detail,
                timestamp: new Date().toISOString()
            }
        }));
    }

    handleError(error) {
        // Log error to analytics or monitoring service
        console.error('ComponentLoader error:', error);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Créer et exporter l'instance
window.FanMa.componentLoader = new ComponentLoader();

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.FanMa.componentLoader.init();
});

// API publique
window.FanMa.components = {
    reload: () => window.FanMa.componentLoader.loadComponents(),
    clearCache: () => window.FanMa.componentLoader.clearCache()
};