function serviceModal() {
    return {
        activeService: null,
        get services() {
            if (typeof window.siteData === 'undefined' || !Array.isArray(window.siteData.services)) {
                console.warn('window.siteData.services is not available or not an array');
                return [];
            }
            return window.siteData.services.map(service => {
                const languageStore = Alpine.store('language');
                const t = key => languageStore && typeof languageStore.t === 'function' 
                    ? languageStore.t(key) 
                    : key;

                return {
                    ...service,
                    title: t(service.title),
                    description: t(service.description),
                    content: service.content ? {
                        ...service.content,
                        subTitle1: t(service.content.subTitle1),
                        intro1: t(service.content.intro1),
                        intro2: t(service.content.intro2),
                        expertiseTitle: t(service.content.expertiseTitle),
                        expertiseAreas: Array.isArray(service.content.expertiseAreas) 
                            ? service.content.expertiseAreas.map(area => ({
                                ...area,
                                title: t(area.title),
                                subitems: Array.isArray(area.subitems) 
                                    ? area.subitems.map(subitem => t(subitem))
                                    : []
                            }))
                            : [],
                        subTitle2: t(service.content.subTitle2),
                        interpretation: t(service.content.interpretation)
                    } : null
                };
            });
        },
        showService(index) {
            if (index >= 0 && index < this.services.length) {
                this.activeService = index;
            } else {
                console.warn(`Invalid service index: ${index}`);
            }
        },
        closeService() {
            this.activeService = null;
        },
        getActiveService() {
            return this.activeService !== null && this.activeService < this.services.length
                ? this.services[this.activeService]
                : { content: {} }; // Retourne un objet vide si aucun service n'est actif
        }
    };
}

// À la fin de votre fichier services.js
window.serviceModal = serviceModal;