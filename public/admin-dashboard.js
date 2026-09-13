const usersBody = document.getElementById('usersBody');
const message = document.getElementById('message');
const logoutButton = document.getElementById('logoutButton');

async function loadUsers() {
  message.textContent = 'Loading...';

  try {
    const response = await fetch('/api/admin/users');
    if (response.status === 401) {
      window.location.href = '/admin';
      return;
    }

    const users = await response.json();
    if (!response.ok) throw new Error(users.error || 'Could not load users.');

    usersBody.innerHTML = '';

    for (const user of users) {
      const row = document.createElement('tr');
      for (const value of [user.id, user.name, user.age, user.email, user.created_at]) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      }
      usersBody.appendChild(row);
    }

    message.textContent = `${users.length} user${users.length === 1 ? '' : 's'} found.`;
  } catch (error) {
    message.textContent = error.message;
  }
}

logoutButton.addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  window.location.href = '/admin';
});

loadUsers();
