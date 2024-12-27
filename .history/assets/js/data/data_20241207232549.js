// Namespace global pour FanMa
window.FanMa = window.FanMa || {};

// Configuration de base
const CONFIG = {
    REQUIRED_FIELDS: ['services', 'about', 'history', 'contactInfo', 'socialMedia'],
    DEFAULT_LANGUAGE: 'fr',
    SUPPORTED_LANGUAGES: ['fr', 'en'],
    IMAGE_BASE_PATH: '/assets/images/',
};

// Validation des chemins d'images
const validateImagePath = (path) => {
    if (!path) return '';
    return path.startsWith('images/') 
        ? `${CONFIG.IMAGE_BASE_PATH}${path.replace('images/', '')}` 
        : path;
};

// Validation des données
const validateData = (data) => {
    const errors = [];

    // Vérification des champs requis
    CONFIG.REQUIRED_FIELDS.forEach(field => {
        if (!data[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    });

    // Validation des services
    if (!Array.isArray(data.services)) {
        errors.push('Services must be an array');
    } else {
        data.services.forEach((service, index) => {
            if (!service.id || !service.title) {
                errors.push(`Service at index ${index} missing required fields (id or title)`);
            }
            if (service.icon) {
                service.icon = validateImagePath(service.icon);
            }
        });
    }

    // Validation des médias sociaux
    if (data.socialMedia) {
        ['linkedin', 'twitter', 'facebook'].forEach(platform => {
            if (!data.socialMedia[platform]) {
                errors.push(`Missing social media URL for: ${platform}`);
            }
        });
    }

    return errors;
};

// Données du site
window.FanMa.siteData = {
    meta: {
        description: 'meta_description',
        company: {
            name: 'FanMa',
            tagline: 'Expert-conseil en Codes et normes | Gestion de projet | Conception mécanique',
            introduction: 'FanMa est une firme d\'expert-conseil renommée, forte de plus de 15 ans d\'expérience dans la réalisation des projets complexes dans divers secteurs, notamment :'
        }
    },

    expertiseAreas: [
        'Codes et normes (bâtiment)',
        'Secteur manufacturier',
        'Aéronautique',
        'Gestion de projet'
    ],

    services: [
        {
            id: 'codes_normes',
            title: 'service_codes_title',
            description: 'service_codes_description',
            icon: validateImagePath('images/code_et_norme.webp'),
            content: {
                intro: 'service_codes_intro',
                sections: [
                    {
                        title: 'service_codes_subtitle1',
                        content: ['service_codes_intro1', 'service_codes_intro2']
                    },
                    {
                        title: 'service_codes_expertise_title',
                        areas: [
                            {
                                title: 'service_codes_fire_safety',
                                subitems: [
                                    'service_codes_fire_alarm',
                                    'service_codes_sprinkler',
                                    'service_codes_travel_distance',
                                    'service_codes_simulation',
                                    'service_codes_others'
                                ]
                            },
                            { title: 'service_codes_seismic' },
                            { title: 'service_codes_green_roof' },
                            { title: 'service_codes_others' }
                        ]
                    },
                    {
                        title: 'service_codes_subtitle2',
                        content: ['service_codes_interpretation']
                    }
                ]
            }
        },
        {
            id: 'project_management',
            title: 'service_project_management_title',
            description: 'service_project_management_description',
            icon: validateImagePath('images/gestion_projet.webp'),
            content: {
                paragraphs: [
                    'service_project_management_paragraph1',
                    'service_project_management_paragraph2'
                ]
            }
        },
        {
            id: 'conception_mecanique',
            title: 'service_conception_title',
            description: 'service_conception_description',
            icon: validateImagePath('images/conception_mecanique.webp'),
            content: {
                intro: 'service_conception_intro',
                areas: [
                    'service_conception_manufacturing',
                    'service_conception_building',
                    'service_conception_aeronautics',
                    'service_conception_oil'
                ]
            }
        }
    ],

    about: {
        title: 'about_title',
        paragraphs: [
            'about_paragraph1',
            'about_paragraph2',
            'about_paragraph3'
        ]
    },

    history: {
        title: 'history_title',
        paragraphs: [
            'history_paragraph1',
            'history_paragraph2'
        ]
    },

    founder: {
        name: 'founder_name',
        bio: 'founder_bio',
        image: validateImagePath('images/fanny_mgb.webp'),
        history: 'founder_history',
        title: 'founder_history_title',
        qualifications: [
            'founder_qualification_1',
            'founder_qualification_2',
            'founder_qualification_3',
            'founder_qualification_4',
            'founder_qualification_5',
            'founder_qualification_6',
            'founder_qualification_7',
            'founder_qualification_8',
            'founder_qualification_9',
            'founder_qualification_10'
        ]
    },

    contact: {
        address: 'company_address',
        phone: 'company_phone',
        email: 'company_email'
    },

    socialMedia: {
        linkedin: 'https://www.linkedin.com/company/fanma-expert-conseil',
        twitter: 'https://twitter.com/FaMaInc',
        facebook: 'https://www.facebook.com/FaMaInc'
    },
    contactInfo: {
        address: {
            street: '13450 Rue Simetin',
            city: 'Mirabel',
            province: 'QC',
            postalCode: 'J7N 0Z8',
            country: 'Canada'
        },
        phone: '+1 514-577-8578',
        email: 'info@fanma.ca',
        hours: {
            weekdays: '8:30-16:30',
            weekend: 'Fermé'
        }
    }
};

// Validation et initialisation
(() => {
    try {
        const errors = validateData(window.FanMa.siteData);
        
        if (errors.length > 0) {
            console.error('Site data validation errors:', errors);
            throw new Error('Site data validation failed');
        }

        // Copier les données vers window.siteData pour la compatibilité
        window.siteData = window.FanMa.siteData;

        // Notification que les données sont prêtes
        document.dispatchEvent(new CustomEvent('siteDataReady', {
            detail: {
                timestamp: new Date().toISOString(),
                status: 'success'
            }
        }));

        console.log('Site data loaded successfully');
    } catch (error) {
        console.error('Error initializing site data:', error);
        document.dispatchEvent(new CustomEvent('siteDataError', {
            detail: {
                error: error.message,
                timestamp: new Date().toISOString()
            }
        }));
    }
})();

// API publique
window.FanMa.data = {
    get: (path) => {
        try {
            return path.split('.').reduce((obj, key) => obj[key], window.FanMa.siteData);
        } catch (error) {
            console.warn(`Failed to get data path: ${path}`);
            return null;
        }
    },
    getImageUrl: validateImagePath
};