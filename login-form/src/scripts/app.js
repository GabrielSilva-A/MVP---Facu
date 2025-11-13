document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!validateForm(username, password)) {
            if (errorMessage) errorMessage.textContent = 'Please enter a valid username and password.';
            return;
        }

        // Disable submit while processing
        if (submitBtn) submitBtn.disabled = true;

        try {
            // Enviar a la API (asume servidor en localhost:3000)
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok) {
                if (errorMessage) {
                    errorMessage.style.color = 'green';
                    errorMessage.textContent = 'Login successful!';
                }
                // Almacenar datos de usuario
                localStorage.setItem('user', JSON.stringify(data));
                localStorage.setItem('authToken', data.id);
                
                // Redirigir según rol
                const redirectUrl = data.role === 'admin' ? 'admin-dashboard.html' : 'dashboard.html';
                setTimeout(() => { window.location.href = redirectUrl; }, 1000);
            } else {
                if (errorMessage) {
                    errorMessage.style.color = '#c00';
                    errorMessage.textContent = data.error || 'Login failed.';
                }
            }
        } catch (err) {
            if (errorMessage) errorMessage.textContent = 'Network error: could not reach server.';
            console.error(err);
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });

    function validateForm(username, password) {
        return username.length > 0 && password.length > 0;
    }
});