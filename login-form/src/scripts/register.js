document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const errorMessage = document.getElementById('errorMessage');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirm = confirmInput.value.trim();

        // Simple validations
        if (!username || !email || !password || !confirm) {
            if (errorMessage) errorMessage.textContent = 'Please fill in all fields.';
            return;
        }
        if (password !== confirm) {
            if (errorMessage) errorMessage.textContent = 'Passwords do not match.';
            return;
        }

        // Disable submit while processing
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        try {
            // Enviar a la API (asume servidor en localhost:3000)
            const res = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();
            if (res.ok) {
                if (errorMessage) {
                    errorMessage.style.color = 'green';
                    errorMessage.textContent = 'Registration successful! You can now log in.';
                }
                // Opcional: redirigir al login tras un breve retraso
                setTimeout(() => { window.location.href = 'index.html'; }, 1400);
            } else {
                if (errorMessage) {
                    errorMessage.style.color = '#c00';
                    errorMessage.textContent = data.error || 'Registration failed.';
                }
            }
        } catch (err) {
            if (errorMessage) errorMessage.textContent = 'Network error: could not reach server.';
            console.error(err);
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
});
