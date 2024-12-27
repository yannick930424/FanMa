document.addEventListener('DOMContentLoaded', () => {
    if (typeof Alpine === 'undefined') {
        console.error('Alpine.js not loaded');
        return;
    }

    if (typeof window.siteData === 'undefined' || !window.siteData.services) {
        console.error('Site data not available. Check data.js');
        return;
    }

    if (typeof window.translations === 'undefined') {
        console.error('Translations not available. Check translations.js');
        return;
    }

    if (typeof serviceModal !== 'function') {
        console.error('serviceModal function not defined. Check services.js');
        return;
    }

    // Initialiser Alpine.js
    if (!Alpine.version) {
        Alpine.start();
        console.log('Alpine.js initialized successfully');
    } else {
        console.log('Alpine.js already initialized');
    }
});