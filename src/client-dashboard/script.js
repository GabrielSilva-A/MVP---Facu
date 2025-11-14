// Script principal del dashboard de cliente
const dynamicSection = document.getElementById('dynamicSection');
const navLinks = document.querySelectorAll('.nav-link');
const navMenu = document.getElementById('navMenu');
const hamburger = document.getElementById('hamburger');
let currentUser = null;

function ensureAuth() {
  const userStr = localStorage.getItem('user');
  if (!userStr) { window.location.href = 'login.html'; return false; }
  currentUser = JSON.parse(userStr);
  if (currentUser.role === 'admin') { window.location.href = 'admin-dashboard.html'; return false; }
  return true;
}

async function loadSection(sectionName) {
  try {
    dynamicSection.innerHTML = '<div class="loading">Cargando...</div>';
    const response = await fetch(`client-dashboard/sections/${sectionName}.html`);
    if (!response.ok) throw new Error('No se pudo cargar la sección');
    const html = await response.text();
    dynamicSection.innerHTML = html;
    if (sectionName === 'seccion2') { loadCourses(); loadPurchasedCourses(); }
    if (sectionName === 'seccion3') { fillPerfil(); }
    wireCtas();
    window.scrollTo({ top:0, behavior:'smooth' });
  } catch (e) {
    console.error(e); dynamicSection.innerHTML = '<div class="error">Error al cargar</div>';
  }
}

function fillPerfil() {
  if (!currentUser) return;
  const u = currentUser;
  const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.textContent=val; };
  set('perfil-username', u.username);
  set('perfil-email', u.email);
  set('perfil-role', u.role);
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const sectionName = link.getAttribute('data-section');
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    loadSection(sectionName);
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  if (!ensureAuth()) return;
  // Mostrar nombre usuario
  const userNameSpan = document.getElementById('userName');
  if (userNameSpan) userNameSpan.textContent = currentUser.username;
  // Cargar sección inicial
  loadSection('seccion1');
  navLinks[0].classList.add('active');
});

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  hamburger.classList.toggle('active');
});

window.addEventListener('click', e => {
  if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
  }
});

function wireCtas(){
  const btn = document.getElementById('goToCursosBtn');
  if (btn) {
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      // activar la pestaña de cursos (seccion2)
      const target = Array.from(navLinks).find(l => l.getAttribute('data-section') === 'seccion2');
      if (target) {
        navLinks.forEach(l => l.classList.remove('active'));
        target.classList.add('active');
      }
      loadSection('seccion2');
    });
  }
}

function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  window.location.href = 'index.html';
}

// ====== Cursos ======
async function loadCourses() {
  const container = document.getElementById('coursesContainer');
  if (!container) return;
  try {
    const res = await fetch('http://localhost:3000/api/courses');
    const courses = await res.json();
    const purchasedRes = await fetch(`http://localhost:3000/api/user-courses/${currentUser.id}`);
    const purchasedCourses = await purchasedRes.json();
    const purchasedIds = purchasedCourses.map(c => c.id);
    if (!courses.length) { container.innerHTML = '<p>No hay cursos disponibles.</p>'; return; }
    container.innerHTML = courses.map(c => `
      <div class='course-card'>
        <h3>${c.title}</h3>
        <p>${(c.description||'Sin descripción').substring(0,90)}</p>
        <div class='course-price'>$${parseFloat(c.price).toFixed(2)}</div>
        <button class='buy-btn ${purchasedIds.includes(c.id)?'purchased':''}' ${purchasedIds.includes(c.id)?'disabled':''} onclick='buyCourse(${c.id})'>${purchasedIds.includes(c.id)?'Comprado':'Comprar'}</button>
      </div>
    `).join('');
  } catch (e) {
    console.error(e); container.innerHTML = '<p class="error">Error al cargar cursos</p>';
  }
}

async function loadPurchasedCourses() {
  const container = document.getElementById('purchasedCoursesContainer');
  if (!container) return;
  try {
    const res = await fetch(`http://localhost:3000/api/user-courses/${currentUser.id}`);
    const courses = await res.json();
    if (!courses.length) { container.innerHTML = '<p>Aún no has comprado cursos.</p>'; return; }
    container.innerHTML = courses.map(c => `
      <div class='course-card'>
        <h3>${c.title}</h3>
        <p>${(c.description||'Sin descripción').substring(0,90)}</p>
        <div class='course-price'>$${parseFloat(c.price).toFixed(2)}</div>
        <button class='buy-btn' style='background:#17a2b8' onclick='viewCourse(${c.id})'>Ver Curso</button>
      </div>
    `).join('');
  } catch (e) {
    console.error(e); container.innerHTML = '<p class="error">Error al cargar tus cursos</p>';
  }
}

async function buyCourse(courseId) {
  try {
    const res = await fetch('http://localhost:3000/api/purchase', {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ user_id: currentUser.id, course_id: courseId })
    });
    const data = await res.json();
    if (res.ok) {
      showMessage('¡Compra exitosa!', 'success');
      loadCourses();
      loadPurchasedCourses();
    } else {
      showMessage(data.error || 'Error al comprar', 'error');
    }
  } catch (e) { console.error(e); showMessage('Error de red', 'error'); }
}

function viewCourse(id){ alert('Visualizador del curso '+id+' próximamente'); }

function showMessage(text,type){
  const div = document.getElementById('message');
  if (!div) return;
  div.innerHTML = `<div class="message ${type}">${text}</div>`;
  setTimeout(()=>{ div.innerHTML=''; }, 4500);
}

// Expose needed functions globally for inline HTML buttons
window.buyCourse = buyCourse;
window.viewCourse = viewCourse;
window.logout = logout;
