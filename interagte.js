// Login
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'deep.goldfinch@company.com', password: 'password123' })
});

const { token, user } = await response.json();

// Get tickets
const ticketsResponse = await fetch('http://localhost:3001/api/tickets?status=Open', {
  headers: { 'Authorization': `Bearer ${token}` }
});
