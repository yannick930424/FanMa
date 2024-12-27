// Namespace pour FanMa
window.FanMa = window.FanMa || {};

class ComponentLoader {
    constructor() {
        // Configuration intégrée dans la classe
        this.config = {
            COMPONENT_BASE_PATH: '/components/',
            CACHE_DURATION: 1000 * 60 * 5, // 5 minutes
            LOAD_TIMEOUT: 5000, // 5 secondes
            RETRY_ATTEMPTS: 2,
            RETRY_DELAY: 1000 // 1 seconde
        };

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
                critical: true
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

    async loadComponent(component, retryCount = 0) {
        const targetElement = document.getElementById(component.id);
        if (!targetElement) {
            throw new Error(`Target element #${component.id} not found`);
        }

        const cached = this.getFromCache(component.path);
        if (cached) {
            this.renderComponent(targetElement, cached, component);
            return;
        }

        try {
            const htmlContent = await this.fetchWithTimeout(
                `${this.config.COMPONENT_BASE_PATH}${component.path}`
            );

            this.cache.set(component.path, {
                content: htmlContent,
                timestamp: Date.now()
            });

            await this.renderComponent(targetElement, htmlContent, component);

        } catch (error) {
            if (retryCount < this.config.RETRY_ATTEMPTS) {
                await this.delay(this.config.RETRY_DELAY);
                return this.loadComponent(component, retryCount + 1);
            }
            throw error;
        }
    }

    async loadComponentScript(scriptPath) {
        const script = document.createElement('script');
        script.src = `${this.config.COMPONENT_BASE_PATH}${scriptPath}`;
        script.async = true;

        const loadPromise = new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
        });

        document.head.appendChild(script);
        this.componentScripts.set(scriptPath, true);

        await loadPromise;
    }

    async fetchWithTimeout(url, timeout = this.config.LOAD_TIMEOUT) {
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

        if (Date.now() - cached.timestamp > this.config.CACHE_DURATION) {
            this.cache.delete(path);
            return null;
        }

        return cached.content;
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