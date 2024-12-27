// component-loader.js
function loadComponent(elementId, componentPath) {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
        console.warn(`Element with id '${elementId}' not found. Skipping component load.`);
        return;
    }

    fetch(componentPath)
        .then(response => response.text())
        .then(html => {
            targetElement.innerHTML = html;
            // Réinitialiser Alpine.js pour les nouveaux éléments
            if (typeof Alpine !== 'undefined') {
                Alpine.initTree(targetElement);
            }
        })
        .catch(error => console.error('Error loading component:', error));
}

function loadAllComponents() {
    const components = [
        { id: 'header-container', path: 'header.html' },
        { id: 'footer-container', path: 'footer.html' }
        // Ajoutez d'autres composants ici si nécessaire
    ];

    components.forEach(component => {
        loadComponent(component.id, component.path);
    });
}

// Attendre que le DOM soit complètement chargé avant de charger les composants
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllComponents);
} else {
    loadAllComponents();
}