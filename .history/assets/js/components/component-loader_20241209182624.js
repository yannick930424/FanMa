// Namespace pour FanMa
window.FanMa = window.FanMa || {};

class ComponentLoader {
    constructor() {
        // Bind des méthodes
        this.loadComponents = this.loadComponents.bind(this);
        this.loadComponent = this.loadComponent.bind(this);
        this.init = this.init.bind(this);

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
        document.addEventListener('language-changed', () => {
            this.clearCache();
            this.loadComponents();
        });

        window.addEventListener('error', (event) => {
            console.error('Global error in component:', event.error);
            this.handleError(event.error);
        });
    }

    // Ajout de la méthode loadComponents manquante
    async loadComponents() {
        try {
            const loadPromises = this.components.map(component => 
                this.loadComponent(component).catch(error => {
                    if (component.critical) {
                        throw error;
                    }
                    console.warn(`Non-critical component ${component.id} failed to load:`, error);
                    return null;
                })
            );

            await Promise.all(loadPromises);
            this.dispatchEvent('components-loaded');
        } catch (error) {
            console.error('Failed to load critical components:', error);
            this.dispatchEvent('components-error', { error });
            throw error;
        }
    }

    async loadComponent(component, retryCount = 0) {
        const targetElement = document.getElementById(component.id);
        if (!targetElement) {
            throw new Error(`Target element #${component.id} not found`);
        }

        const cached = this.getFromCache(component.path);
        if (cached) {
            await this.renderComponent(targetElement, cached, component);
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

    async renderComponent(element, html, component) {
        element.innerHTML = html;

        if (component.script && !this.componentScripts.has(component.script)) {
            await this.loadComponentScript(component.script);
        }

        if (window.Alpine) {
            window.Alpine.initTree(element);
        }

        this.dispatchEvent('component-rendered', { componentId: component.id });
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