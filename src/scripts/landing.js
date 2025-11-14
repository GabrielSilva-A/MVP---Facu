// ========================================
// CARGA DINÁMICA DE SECCIONES
// ========================================

const dynamicSection = document.getElementById('dynamicSection');
const navLinks = document.querySelectorAll('.nav-link');
const footerLinks = document.querySelectorAll('.footer-links a[data-section]');

// Función para cargar contenido de archivo HTML externo
async function loadSection(sectionName) {
    try {
        dynamicSection.innerHTML = '<div class="loading">Cargando...</div>';
        
        const response = await fetch(`sections/${sectionName}.html`);
        
        if (!response.ok) {
            throw new Error('No se pudo cargar la sección');
        }
        
        const content = await response.text();
        dynamicSection.innerHTML = content;
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
    } catch (error) {
        console.error('Error al cargar la sección:', error);
        dynamicSection.innerHTML = '<div class="error">Error al cargar el contenido</div>';
    }
}

// Event listener para enlaces de navegación
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const sectionName = link.getAttribute('data-section');
        
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        loadSection(sectionName);
        
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Event listener para enlaces del footer
footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const sectionName = link.getAttribute('data-section');
        
        navLinks.forEach(l => l.classList.remove('active'));
        const targetNav = document.querySelector(`.nav-link[data-section="${sectionName}"]`);
        if (targetNav) targetNav.classList.add('active');
        
        loadSection(sectionName);
    });
});

// Cargar la primera sección por defecto
document.addEventListener('DOMContentLoaded', () => {
    loadSection('home');
    navLinks[0].classList.add('active');
});

// ========================================
// NAVEGACIÓN RESPONSIVE (MENÚ HAMBURGUESA)
// ========================================

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// ========================================
// CAMBIO DE ESTILO DE NAVBAR AL HACER SCROLL
// ========================================

const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// ========================================
// CERRAR MENÚ AL HACER CLIC FUERA (MÓVILES)
// ========================================

document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});
