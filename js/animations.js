// animations.js

window.onerror = function (message, source, lineno, colno, error) {
    console.error('Une erreur s\'est produite :', message, 'à la ligne', lineno, 'colonne', colno, 'dans le fichier', source);
    console.error('Détails de l\'erreur :', error);
    return true;
};


// Écouteur d'événement pour s'assurer que le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser GSAP ScrollTrigger si disponible
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initScrollAnimations();
    }

    // Appeler les fonctions d'initialisation
    initHeaderShrink();
    initSmoothScroll();
    initBackToTopButton();
});

// Ajoutez ceci à votre fichier JavaScript principal
window.addEventListener("load", function () {
    window.cookieconsent.initialise({
        "palette": {
            "popup": {
                "background": "#000"
            },
            "button": {
                "background": "#f1d600"
            }
        },
        "theme": "classic",
        "position": "bottom-right",
        "type": "opt-in",
        "content": {
            "message": "Ce site utilise des cookies pour améliorer votre expérience.",
            "deny": "Refuser",
            "allow": "Accepter",
            "link": "En savoir plus",
            "href": "https://fanma.ca/politique-de-confidentialite"
        },
        onInitialise: function (status) {
            var type = this.options.type;
            var didConsent = this.hasConsented();
            if (type == 'opt-in' && didConsent) {
                // enable cookies
            }
            if (type == 'opt-out' && !didConsent) {
                // disable cookies
            }
        },
        onStatusChange: function (status, chosenBefore) {
            var type = this.options.type;
            var didConsent = this.hasConsented();
            if (type == 'opt-in' && didConsent) {
                // enable cookies
            }
            if (type == 'opt-out' && !didConsent) {
                // disable cookies
            }
        },
        onRevokeChoice: function () {
            var type = this.options.type;
            if (type == 'opt-in') {
                // disable cookies
            }
            if (type == 'opt-out') {
                // enable cookies
            }
        }
    })
});

// Fonction pour initialiser les animations au défilement
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length === 0) return;

    animatedElements.forEach((element) => {
        gsap.from(element, {
            y: 50,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });
    });
}

// Fonction pour gérer le rétrécissement de l'en-tête
function initHeaderShrink() {
    const header = document.querySelector('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            header.classList.add("shrink");
        } else {
            header.classList.remove("shrink");
        }
    });
}

// Fonction pour initialiser le défilement fluide
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            // Gérer le cas du bouton "Retour en haut"
            if (targetId === '#') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }

            // Pour les autres liens internes
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Fonction pour initialiser le bouton "Retour en haut"
function initBackToTopButton() {
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        backToTopButton.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Afficher/masquer le bouton en fonction du défilement
        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
    }
}
// Fonction pour le formulaire de contact (à utiliser avec Alpine.js)
window.contactForm = function() {
    return {
        form: {
            name: '',
            email: '',
            message: '',
            file: null
        },
        errors: {
            name: '',
            email: '',
            message: '',
            file: ''
        },
        isSubmitting: false,
        isValidEmail(email) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailPattern.test(email);
        },
        validateForm() {
            this.errors = {
                name: '',
                email: '',
                message: '',
                file: ''
            };
            
            if (!this.form.name.trim()) {
                this.errors.name = this.$store.language.t('name_required');
            }
            if (!this.isValidEmail(this.form.email)) {
                this.errors.email = this.$store.language.t('invalid_email');
            }
            if (!this.form.message.trim()) {
                this.errors.message = this.$store.language.t('message_required');
            }
            
            return Object.values(this.errors).every(error => error === '');
        },
        async handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const maxSize = 5 * 1024 * 1024; // 5 MB
            const allowedTypes = {
                'application/pdf': [0x25, 0x50, 0x44, 0x46],
                'application/msword': [0xD0, 0xCF, 0x11, 0xE0],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4B, 0x03, 0x04],
                'text/plain': [0x0D, 0x0A]
            };

            // Vérification de la taille
            if (file.size > maxSize) {
                this.errors.file = this.$store.language.t('file_size_error');
                return;
            }

            // Vérification de l'extension et du type MIME
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];
            if (!allowedExtensions.includes(fileExtension) || !Object.keys(allowedTypes).includes(file.type)) {
                this.errors.file = this.$store.language.t('file_type_error');
                return;
            }

            // Vérification de la signature du fichier (Magic Numbers)
            const buffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);
            const fileSignature = Array.from(uint8Array.slice(0, 4));
            const expectedSignature = allowedTypes[file.type];
            if (!fileSignature.every((byte, index) => byte === expectedSignature[index])) {
                this.errors.file = this.$store.language.t('file_content_error');
                return;
            }

            // Vérification du nom de fichier
            const invalidChars = /[<>:"/\\|?*\u0000-\u001F]/g;
            if (invalidChars.test(file.name)) {
                this.errors.file = this.$store.language.t('file_name_error');
                return;
            }

            // Si toutes les vérifications sont passées
            this.errors.file = '';
            this.form.file = file;
        },
        async submitForm() {
            if (!this.validateForm()) {
                return;
            }

            this.isSubmitting = true;

            const formData = new FormData();
            formData.append('name', this.form.name);
            formData.append('email', this.form.email);
            formData.append('message', this.form.message);
            if (this.form.file) {
                formData.append('file', this.form.file);
            }

            try {
                const response = await fetch('send_email.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    alert(this.$store.language.t('form_success_message')); // Vous pouvez remplacer ceci par une notification plus élégante
                    this.form = { name: '', email: '', message: '', file: null };
                    this.errors = { name: '', email: '', message: '', file: '' };
                } else {
                    throw new Error(result.message || 'Form submission failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert(this.$store.language.t('form_error_message')); // Vous pouvez remplacer ceci par une notification plus élégante
            } finally {
                this.isSubmitting = false;
            }
        }
    };
}


// Fonction pour la gestion de l'en-tête (à utiliser avec Alpine.js)
window.headerBehavior = function () {
    return {
        isScrolled: false,
        initScroll() {
            window.addEventListener('scroll', () => {
                this.isScrolled = window.pageYOffset > 20;
            });
        }
    }
}

// Fonction d'initialisation principale
function initFadeAnimations() {
    // Vérifier si l'initialisation a déjà été effectuée
    if (window.fadeAnimationsInitialized) {
        console.warn('Fade animations already initialized');
        return;
    }

    const faders = document.querySelectorAll('.fade-in-section');

    const appearOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -100px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('is-visible');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // Marquer l'initialisation comme effectuée
    window.fadeAnimationsInitialized = true;
}

// Exécuter l'initialisation une fois que le DOM est chargé
document.addEventListener('DOMContentLoaded', initFadeAnimations);



