// Définition du composant header
if (typeof window.headerComponent === 'undefined') {

    window.headerComponent = function() {
        return {
            mobileMenuOpen: false,
            isScrolled: false,
            
            navigationItems: [
                { key: 'home', translationKey: 'nav_home', path: '/' },
                { key: 'services', translationKey: 'nav_services', path: '/services.html' },
                { key: 'about', translationKey: 'nav_about', path: (lang) => `/${lang === 'fr' ? 'a-propos' : 'about'}.html` },
                { key: 'contact', translationKey: 'nav_contact', path: '/contact.html' }
            ],
    
            languages: [
                { code: 'fr', label: 'Passer en français' },
                { code: 'en', label: 'Switch to English' }
            ],

        init() {
            this.initScrollWatcher();
            this.watchLanguageChanges();
            this.watchRouteChanges();
        },

        initScrollWatcher() {
            window.addEventListener('scroll', () => {
                this.isScrolled = window.pageYOffset > 20;
            }, { passive: true });
        },

        watchLanguageChanges() {
            document.addEventListener('language-changed', () => {
                this.closeMobileMenu();
                this.updateActiveNavigation();
            });
        },

        watchRouteChanges() {
            // Pour une future implémentation de router
            window.addEventListener('popstate', () => {
                this.updateActiveNavigation();
            });
        },

        getHomeUrl() {
            const lang = this.$store.language.current;
            return `/lang/${lang}/`;
        },

        getNavUrl(item) {
            const lang = this.$store.language.current;
            const basePath = `/lang/${lang}`;
            const itemPath = typeof item.path === 'function' 
                ? item.path(lang) 
                : item.path;
            return `${basePath}${itemPath}`;
        },

        isCurrentPage(key) {
            const currentPath = window.location.pathname;
            const lang = this.$store.language.current;
            const navItem = this.navigationItems.find(item => item.key === key);
            if (!navItem) return false;

            const itemPath = typeof navItem.path === 'function'
                ? navItem.path(lang)
                : navItem.path;
            
            const fullPath = `/lang/${lang}${itemPath}`;
            return currentPath.startsWith(fullPath.replace('.html', ''));
        },

        getLanguageButtonClasses(langCode) {
            const isActive = this.$store.language.current === langCode;
            return {
                'bg-blue-600 text-white': isActive,
                'bg-gray-200 text-gray-800 hover:bg-gray-300': !isActive
            };
        },

        toggleMobileMenu() {
            this.mobileMenuOpen = !this.mobileMenuOpen;
        },

        closeMobileMenu() {
            this.mobileMenuOpen = false;
        },

        handleMobileNavClick() {
            this.closeMobileMenu();
        },

        switchLanguage(langCode) {
            this.$store.language.setLanguage(langCode);
            this.closeMobileMenu();
        },

        updateActiveNavigation() {
            // Pour une future implémentation de router
            this.navigationItems.forEach(item => {
                this.isCurrentPage(item.key);
            });
        }
    };
};
}