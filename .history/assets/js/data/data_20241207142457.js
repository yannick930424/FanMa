window.siteData = window.siteData || {};

window.siteData = {
    meta_description: 'meta_description',
    companyName: 'FanMa',
    tagline: 'Expert-conseil en Codes et normes | Gestion de projet | Conception mécanique',
    introduction: 'FanMa est une firme d\'expert-conseil renommée, forte de plus de 15 ans d\'expérience dans la réalisation des projets complexes dans divers secteurs, notamment :',
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
            icon: 'images/code_et_norme.webp',
            content: {
                intro: 'service_codes_intro',
                subTitle1: 'service_codes_subtitle1',
                intro1: 'service_codes_intro1',
                intro2: 'service_codes_intro2',
                expertiseTitle: 'service_codes_expertise_title',
                expertiseAreas: [
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
                ],
                subTitle2: 'service_codes_subtitle2',
                interpretation: 'service_codes_interpretation'
            }
        },
        {
            id: 'project_management',
            title: 'service_project_management_title',
            description: 'service_project_management_description',
            icon: 'images/gestion_projet.webp',
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
            icon: 'images/conception_mecanique.webp',
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
            'history_paragraph2',
            'history_paragraph3'
        ]
    },
    founderInfo: {
        name: 'founder_name',
        bio: 'founder_bio',
        image: 'images/fanny_mgb.webp',
        history: 'founder_history',
        history_title: 'founder_history_title'
    },
    founderQualifications: [
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
    ],
    contactInfo: {
        address: 'company_address',
        phone: 'company_phone',
        email: 'company_email'
    },
    socialMedia: {
        linkedin: 'https://www.linkedin.com/company/fanma-expert-conseil',
        twitter: 'https://twitter.com/FaMaInc',
        facebook: 'https://www.facebook.com/FaMaInc'
    }
};

// Vérification de l'intégrité des données
if (!Array.isArray(window.siteData.services) || window.siteData.services.length === 0) {
    console.warn('Les services ne sont pas correctement définis dans data.js');
}

// Notification que les données sont prêtes
console.log('Données du site chargées avec succès');

// Déclenchement d'un événement personnalisé pour signaler que les données sont prêtes
document.dispatchEvent(new CustomEvent('siteDataReady'));