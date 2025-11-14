// ========================================
// CARGA DINÁMICA DE SECCIONES DESDE ARCHIVOS HTML
// ========================================

// Contenedor donde se cargará el contenido
const dynamicSection = document.getElementById('dynamicSection');
const navLinks = document.querySelectorAll('.nav-link');

// Función para cargar contenido de archivo HTML externo
async function loadSection(sectionName) {
    try {
        // Mostrar indicador de carga
        dynamicSection.innerHTML = '<div class="loading">Cargando...</div>';
        
        // Fetch del archivo HTML de la sección
        const response = await fetch(`${sectionName}.html`);
        
        if (!response.ok) {
            throw new Error('No se pudo cargar la sección');
        }
        
        // Obtener el contenido HTML
        const content = await response.text();
        
        // Insertar el contenido en la sección dinámica
        dynamicSection.innerHTML = content;
        
        // Scroll suave al inicio de la sección
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
    } catch (error) {
        console.error('Error al cargar la sección:', error);
        dynamicSection.innerHTML = '<div class="error">Error al cargar el contenido</div>';
    }
}

// Event listener para cada enlace de navegación
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Obtener el nombre de la sección desde el atributo data-section
        const sectionName = link.getAttribute('data-section');
        
        // Remover clase activa de todos los enlaces
        navLinks.forEach(l => l.classList.remove('active'));
        
        // Agregar clase activa al enlace clickeado
        link.classList.add('active');
        
        // Cargar la sección correspondiente
        loadSection(sectionName);
        
        // Cerrar menú móvil si está abierto
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Cargar la primera sección por defecto al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    loadSection('seccion1');
    navLinks[0].classList.add('active'); // Marcar el primer enlace como activo
});


// ========================================
// NAVEGACIÓN RESPONSIVE (MENÚ HAMBURGUESA)
// ========================================

// Seleccionar elementos del DOM
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// Función para toggle del menú en móviles
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animación del icono hamburguesa
    hamburger.classList.toggle('active');
});


// ========================================
// CAMBIO DE ESTILO DE NAVBAR AL HACER SCROLL
// ========================================

const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    // Agregar sombra al navbar cuando se hace scroll
    if (window.pageYOffset > 100) {
        navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});


// ========================================
// BOTÓN DE INICIAR SESIÓN
// ========================================

const btnLogin = document.getElementById('btnLogin');

// Event listener para el botón (actualmente sin funcionalidad)
btnLogin.addEventListener('click', () => {
    // Placeholder para funcionalidad futura
    console.log('Botón de iniciar sesión clickeado');
    
    // Feedback visual temporal
    btnLogin.textContent = 'Cargando...';
    
    setTimeout(() => {
        btnLogin.textContent = 'Iniciar sesión';
        // Aquí se podrá agregar redirección o modal en el futuro
    }, 1000);
});


// ========================================
// CERRAR MENÚ AL HACER CLIC FUERA (MÓVILES)
// ========================================

document.addEventListener('click', (e) => {
    // Verificar si el clic fue fuera del menú y del botón hamburguesa
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});
