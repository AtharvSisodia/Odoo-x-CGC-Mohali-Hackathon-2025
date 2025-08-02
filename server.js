const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection (using SQLite for simplicity - no MySQL installation needed)
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let db;

// Initialize Database
async function initDB() {
  db = await open({
    filename: './quickdesk.db',
    driver: sqlite3.Database
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'end_user',
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#666666'
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'Open',
      priority TEXT DEFAULT 'Medium',
      category_id INTEGER,
      created_by INTEGER NOT NULL,
      assigned_to INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      vote_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(ticket_id, user_id)
    );
  `);

  // Insert sample data
  await insertSampleData();
}

// Insert sample data to match frontend
async function insertSampleData() {
  try {
    // Categories
    await db.run(`INSERT OR IGNORE INTO categories (id, name, description) VALUES 
      (1, 'IT Support', 'Hardware, software, and network issues'),
      (2, 'HR', 'Human resources related queries'),
      (3, 'Facilities', 'Office space and facility management'),
      (4, 'Finance', 'Accounting and financial matters'),
      (5, 'General', 'General inquiries and support')`);

    // Users (matching frontend data)
    const users = [
      {id: 1, name: 'Deep Goldfinch', email: 'deep.goldfinch@company.com', role: 'end_user', department: 'Engineering'},
      {id: 2, name: 'Absolute Aardvark', email: 'absolute.aardvark@company.com', role: 'support_agent', department: 'IT Support'},
      {id: 3, name: 'Distinct Rhinoceros', email: 'distinct.rhinoceros@company.com', role: 'support_agent', department: 'IT Support'},
      {id: 4, name: 'Adored Partridge', email: 'adored.partridge@company.com', role: 'admin', department: 'Administration'},
      {id: 5, name: 'Vital Trout', email: 'vital.trout@company.com', role: 'end_user', department: 'Marketing'},
      {id: 6, name: 'Nihari Shah', email: 'nihari.shah@company.com', role: 'admin', department: 'Administration'}
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db.run(`INSERT OR IGNORE INTO users (id, name, email, password_hash, role, department) 
                    VALUES (?, ?, ?, ?, ?, ?)`, 
                   [user.id, user.name, user.email, hashedPassword, user.role, user.department]);
    }

    // Sample tickets
    await db.run(`INSERT OR IGNORE INTO tickets (id, subject, description, status, priority, category_id, created_by, assigned_to) VALUES 
      (1, 'Is it good things to use AI for hackathon?', 'I am participating in online hackathon 2025 and wondering if using AI tools is acceptable and beneficial for the competition.', 'Open', 'Medium', 5, 1, 3),
      (2, 'Network connectivity issues in conference room', 'Unable to connect to WiFi in the main conference room during important client meetings.', 'In Progress', 'High', 1, 5, 2),
      (3, 'Request for new employee onboarding materials', 'Need updated onboarding documents and access cards for new team members joining next week.', 'Resolved', 'Medium', 2, 1, 4),
      (4, 'Printer maintenance required', 'The main office printer needs toner replacement and general maintenance service.', 'Open', 'Low', 3, 5, NULL)`);

    // Sample comments
    await db.run(`INSERT OR IGNORE INTO comments (id, ticket_id, user_id, content) VALUES 
      (1, 1, 3, 'This is a great question! AI tools can definitely be helpful in hackathons. Many competitions now explicitly allow and encourage the use of AI tools as long as you are transparent about their usage.'),
      (2, 1, 1, 'Thank you for the response! Could you provide some specific examples of AI tools that would be most beneficial?'),
      (3, 2, 2, 'I have identified the issue. The WiFi router in the conference room needs a firmware update. I will schedule this for tonight after business hours to avoid disruption.')`);

    // Sample votes
    await db.run(`INSERT OR IGNORE INTO votes (ticket_id, user_id, vote_type) VALUES 
      (1, 2, 'upvote'), (1, 4, 'upvote'), (1, 5, 'upvote'),
      (2, 1, 'upvote'), (2, 3, 'upvote'), (2, 4, 'upvote')`);

  } catch (error) {
    console.log('Sample data already exists or error:', error.message);
  }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// AUTH ROUTES
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    delete user.password_hash;
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'end_user', department]
    );
    
    res.status(201).json({ message: 'User created', userId: result.lastID });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// TICKET ROUTES
app.get('/api/tickets', authenticateToken, async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT t.*, 
             u.name as creator_name, 
             a.name as assignee_name, 
             c.name as category_name,
             (SELECT COUNT(*) FROM votes v WHERE v.ticket_id = t.id AND v.vote_type = 'upvote') as upvotes,
             (SELECT COUNT(*) FROM votes v WHERE v.ticket_id = t.id AND v.vote_type = 'downvote') as downvotes,
             (SELECT COUNT(*) FROM comments cm WHERE cm.ticket_id = t.id) as comment_count
      FROM tickets t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    
    if (category) {
      query += ' AND c.name = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (t.subject LIKE ? OR t.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Role-based filtering
    if (req.user.role === 'end_user') {
      query += ' AND t.created_by = ?';
      params.push(req.user.userId);
    }
    
    query += ' ORDER BY t.updated_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const tickets = await db.all(query, params);
    
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

app.post('/api/tickets', authenticateToken, async (req, res) => {
  try {
    const { subject, description, category_id, priority } = req.body;
    
    const result = await db.run(
      'INSERT INTO tickets (subject, description, category_id, priority, created_by) VALUES (?, ?, ?, ?, ?)',
      [subject, description, category_id, priority || 'Medium', req.user.userId]
    );
    
    const ticket = await db.get(`
      SELECT t.*, u.name as creator_name, c.name as category_name
      FROM tickets t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [result.lastID]);
    
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

app.get('/api/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await db.get(`
      SELECT t.*, 
             u.name as creator_name, 
             a.name as assignee_name, 
             c.name as category_name,
             (SELECT COUNT(*) FROM votes v WHERE v.ticket_id = t.id AND v.vote_type = 'upvote') as upvotes,
             (SELECT COUNT(*) FROM votes v WHERE v.ticket_id = t.id AND v.vote_type = 'downvote') as downvotes
      FROM tickets t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [req.params.id]);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Get comments
    const comments = await db.all(`
      SELECT c.*, u.name as user_name, u.role as user_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.ticket_id = ?
      ORDER BY c.created_at ASC
    `, [req.params.id]);
    
    ticket.comments = comments;
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

app.post('/api/tickets/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const ticketId = req.params.id;
    
    const result = await db.run(
      'INSERT INTO comments (ticket_id, user_id, content) VALUES (?, ?, ?)',
      [ticketId, req.user.userId, content]
    );
    
    // Update ticket timestamp
    await db.run('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [ticketId]);
    
    res.status(201).json({ message: 'Comment added', commentId: result.lastID });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

app.post('/api/tickets/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { vote_type } = req.body;
    const ticketId = req.params.id;
    
    await db.run(
      'INSERT OR REPLACE INTO votes (ticket_id, user_id, vote_type) VALUES (?, ?, ?)',
      [ticketId, req.user.userId, vote_type]
    );
    
    res.json({ message: 'Vote recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

app.patch('/api/tickets/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;
    
    await db.run(
      'UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, ticketId]
    );
    
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// CATEGORY ROUTES
app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await db.all('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// USER ROUTES
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const users = await db.all('SELECT id, name, email, role, department, created_at FROM users ORDER BY name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Initialize database and start server
initDB().then(() => {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 QuickDesk Backend running on http://localhost:${PORT}`);
    console.log('📝 Sample login credentials:');
    console.log('   Admin: adored.partridge@company.com / password123');
    console.log('   Agent: absolute.aardvark@company.com / password123');
    console.log('   User: deep.goldfinch@company.com / password123');
  });
}).catch(console.error);
