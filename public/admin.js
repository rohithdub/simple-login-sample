const form = document.getElementById('adminLoginForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = 'Signing in...';

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Login failed.');

    window.location.href = '/admin/dashboard';
  } catch (error) {
    message.textContent = error.message;
  }
});
