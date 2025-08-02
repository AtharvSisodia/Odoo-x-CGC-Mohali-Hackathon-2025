// Application Data
let currentUser = null;
let currentTickets = [];
let currentPage = 1;
const itemsPerPage = 6;

// Sample data from the provided JSON
const users = [
    {
        "id": 1,
        "name": "Deep Goldfinch",
        "email": "deep.goldfinch@company.com",
        "role": "end_user",
        "avatar": "DG",
        "department": "Engineering"
    },
    {
        "id": 2,
        "name": "Absolute Aardvark",
        "email": "absolute.aardvark@company.com",
        "role": "support_agent",
        "avatar": "AA",
        "department": "IT Support"
    },
    {
        "id": 3,
        "name": "Distinct Rhinoceros",
        "email": "distinct.rhinoceros@company.com",
        "role": "support_agent",
        "avatar": "DR",
        "department": "IT Support"
    },
    {
        "id": 4,
        "name": "Adored Partridge",
        "email": "adored.partridge@company.com",
        "role": "admin",
        "avatar": "AP",
        "department": "Administration"
    },
    {
        "id": 5,
        "name": "Vital Trout",
        "email": "vital.trout@company.com",
        "role": "end_user",
        "avatar": "VT",
        "department": "Marketing"
    },
    {
        "id": 6,
        "name": "Nihari Shah",
        "email": "nihari.shah@company.com",
        "role": "admin",
        "avatar": "NS",
        "department": "Administration"
    }
];

let categories = [
    {
        "id": 1,
        "name": "IT Support",
        "description": "Hardware, software, and network issues"
    },
    {
        "id": 2,
        "name": "HR",
        "description": "Human resources related queries"
    },
    {
        "id": 3,
        "name": "Facilities",
        "description": "Office space and facility management"
    },
    {
        "id": 4,
        "name": "Finance",
        "description": "Accounting and financial matters"
    },
    {
        "id": 5,
        "name": "General",
        "description": "General inquiries and support"
    }
];

let tickets = [
    {
        "id": 1,
        "subject": "Is it good things to use AI for hackathon?",
        "description": "I am participating in online hackathon 2025 and wondering if using AI tools is acceptable and beneficial for the competition.",
        "status": "Open",
        "priority": "Medium",
        "category": "General",
        "createdBy": 1,
        "assignedTo": 3,
        "createdAt": "2025-08-02T10:30:00Z",
        "updatedAt": "2025-08-02T10:30:00Z",
        "replies": 21,
        "upvotes": 5,
        "downvotes": 1
    },
    {
        "id": 2,
        "subject": "Network connectivity issues in conference room",
        "description": "Unable to connect to WiFi in the main conference room during important client meetings.",
        "status": "In Progress",
        "priority": "High",
        "category": "IT Support",
        "createdBy": 5,
        "assignedTo": 2,
        "createdAt": "2025-08-01T14:20:00Z",
        "updatedAt": "2025-08-02T09:15:00Z",
        "replies": 8,
        "upvotes": 12,
        "downvotes": 0
    },
    {
        "id": 3,
        "subject": "Request for new employee onboarding materials",
        "description": "Need updated onboarding documents and access cards for new team members joining next week.",
        "status": "Resolved",
        "priority": "Medium",
        "category": "HR",
        "createdBy": 1,
        "assignedTo": 4,
        "createdAt": "2025-07-30T11:45:00Z",
        "updatedAt": "2025-08-01T16:30:00Z",
        "replies": 15,
        "upvotes": 8,
        "downvotes": 2
    },
    {
        "id": 4,
        "subject": "Printer maintenance required",
        "description": "The main office printer needs toner replacement and general maintenance service.",
        "status": "Open",
        "priority": "Low",
        "category": "Facilities",
        "createdBy": 5,
        "assignedTo": null,
        "createdAt": "2025-08-02T08:15:00Z",
        "updatedAt": "2025-08-02T08:15:00Z",
        "replies": 3,
        "upvotes": 2,
        "downvotes": 0
    }
];

let comments = [
    {
        "id": 1,
        "ticketId": 1,
        "userId": 3,
        "content": "This is a great question! AI tools can definitely be helpful in hackathons. Many competitions now explicitly allow and encourage the use of AI tools as long as you're transparent about their usage.",
        "createdAt": "2025-08-02T11:00:00Z",
        "type": "agent_reply"
    },
    {
        "id": 2,
        "ticketId": 1,
        "userId": 1,
        "content": "Thank you for the response! Could you provide some specific examples of AI tools that would be most beneficial?",
        "createdAt": "2025-08-02T11:30:00Z",
        "type": "user_reply"
    },
    {
        "id": 3,
        "ticketId": 2,
        "userId": 2,
        "content": "I've identified the issue. The WiFi router in the conference room needs a firmware update. I'll schedule this for tonight after business hours to avoid disruption.",
        "createdAt": "2025-08-02T09:15:00Z",
        "type": "agent_reply"
    }
];

// Utility Functions
function getUserById(id) {
    return users.find(user => user.id === id);
}

function getCategoryByName(name) {
    return categories.find(cat => cat.name === name);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusClass(status) {
    return status.toLowerCase().replace(' ', '-');
}

function getPriorityClass(priority) {
    return priority.toLowerCase();
}

// Authentication Functions
function login(email) {
    console.log('Attempting login with email:', email);
    const user = users.find(u => u.email === email);
    console.log('Found user:', user);
    
    if (user) {
        currentUser = user;
        console.log('Login successful, currentUser set to:', currentUser);
        showMainApp();
        return true;
    }
    console.log('Login failed - user not found');
    return false;
}

function logout() {
    currentUser = null;
    showLoginScreen();
}

function showLoginScreen() {
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (loginScreen && mainApp) {
        loginScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }
}

function showMainApp() {
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (loginScreen && mainApp) {
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        
        // Initialize the main app
        updateUserInterface();
        populateFilters(); // Make sure this runs first
        showSection('dashboard');
        loadTickets();
    }
}

function updateUserInterface() {
    if (!currentUser) return;
    
    // Update user info in header
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    if (userAvatar) userAvatar.textContent = currentUser.avatar;
    if (userName) userName.textContent = currentUser.name;
    
    // Update profile section
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileRole = document.getElementById('profileRole');
    
    if (profileAvatar) profileAvatar.textContent = currentUser.avatar;
    if (profileName) profileName.textContent = currentUser.name;
    if (profileEmail) profileEmail.textContent = currentUser.email;
    if (profileRole) profileRole.textContent = currentUser.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Show/hide role-specific elements
    const adminElements = document.querySelectorAll('.admin-only');
    const agentElements = document.querySelectorAll('.agent-only');
    
    adminElements.forEach(el => {
        if (currentUser.role === 'admin') {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
    
    agentElements.forEach(el => {
        if (currentUser.role === 'support_agent' || currentUser.role === 'admin') {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

// Navigation Functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to corresponding nav button
    const navBtn = document.querySelector(`[data-section="${sectionId}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
    
    // Load section-specific data
    if (sectionId === 'users' && currentUser && currentUser.role === 'admin') {
        loadUsers();
    } else if (sectionId === 'categories' && currentUser && currentUser.role === 'admin') {
        loadCategories();
    } else if (sectionId === 'create-ticket') {
        // Ensure categories are populated when showing create ticket form
        populateTicketCategories();
    }
}

// Ticket Functions
function loadTickets() {
    let filteredTickets = [...tickets];
    
    // Apply role-based filtering
    if (currentUser && currentUser.role === 'end_user') {
        // End users see only their own tickets
        filteredTickets = filteredTickets.filter(ticket => ticket.createdBy === currentUser.id);
    }
    
    // Apply search filter
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    if (searchTerm) {
        filteredTickets = filteredTickets.filter(ticket => 
            ticket.subject.toLowerCase().includes(searchTerm) ||
            ticket.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply status filter
    const statusFilter = document.getElementById('statusFilter');
    const statusValue = statusFilter ? statusFilter.value : '';
    if (statusValue) {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === statusValue);
    }
    
    // Apply category filter
    const categoryFilter = document.getElementById('categoryFilter');
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    if (categoryValue) {
        filteredTickets = filteredTickets.filter(ticket => ticket.category === categoryValue);
    }
    
    // Apply sorting
    const sortFilter = document.getElementById('sortFilter');
    const sortValue = sortFilter ? sortFilter.value : 'recent';
    filteredTickets.sort((a, b) => {
        switch (sortValue) {
            case 'replies':
                return b.replies - a.replies;
            case 'upvotes':
                return b.upvotes - a.upvotes;
            case 'recent':
            default:
                return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
    });
    
    currentTickets = filteredTickets;
    renderTickets();
    renderPagination();
}

function renderTickets() {
    const grid = document.getElementById('ticketsGrid');
    if (!grid) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageTickets = currentTickets.slice(startIndex, endIndex);
    
    if (pageTickets.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>No tickets found</h3><p>Try adjusting your filters or create a new ticket.</p></div>';
        return;
    }
    
    grid.innerHTML = pageTickets.map(ticket => {
        const creator = getUserById(ticket.createdBy);
        const assignee = ticket.assignedTo ? getUserById(ticket.assignedTo) : null;
        
        return `
            <div class="ticket-card" onclick="openTicketModal(${ticket.id})">
                <div class="ticket-header">
                    <h3 class="ticket-title">${ticket.subject}</h3>
                </div>
                <div class="ticket-meta">
                    <span class="status-badge ${getStatusClass(ticket.status)}">${ticket.status}</span>
                    <span class="priority-badge ${getPriorityClass(ticket.priority)}">${ticket.priority}</span>
                    <span class="category-badge">${ticket.category}</span>
                </div>
                <div class="ticket-description">${ticket.description}</div>
                <div class="ticket-stats">
                    <div class="ticket-info-left">
                        <span class="stat">
                            <span class="stat-icon">💬</span>
                            ${ticket.replies}
                        </span>
                        <span class="stat">
                            <span class="stat-icon">👍</span>
                            ${ticket.upvotes}
                        </span>
                        <span class="stat">
                            <span class="stat-icon">👎</span>
                            ${ticket.downvotes}
                        </span>
                    </div>
                    <div class="ticket-date">
                        ${formatDate(ticket.updatedAt)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(currentTickets.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Previous</button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    // Next button
    paginationHTML += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next</button>`;
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(currentTickets.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTickets();
        renderPagination();
    }
}

function populateFilters() {
    console.log('Populating filters with categories:', categories);
    
    // Populate category filter for dashboard
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        const categoryOptions = categories.map(cat => 
            `<option value="${cat.name}">${cat.name}</option>`
        ).join('');
        categoryFilter.innerHTML = '<option value="">All Categories</option>' + categoryOptions;
        console.log('Dashboard category filter populated');
    }
    
    // Populate ticket category dropdown for new ticket form
    populateTicketCategories();
}

function populateTicketCategories() {
    console.log('Populating ticket categories dropdown');
    const ticketCategory = document.getElementById('ticketCategory');
    if (ticketCategory) {
        const categoryOptions = categories.map(cat => 
            `<option value="${cat.name}">${cat.name}</option>`
        ).join('');
        ticketCategory.innerHTML = '<option value="">Select Category</option>' + categoryOptions;
        console.log('Ticket category dropdown populated with options:', ticketCategory.innerHTML);
    } else {
        console.log('Ticket category dropdown not found');
    }
}

// Modal Functions
function openTicketModal(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // Populate modal with ticket data
    const elements = {
        modalTicketSubject: ticket.subject,
        modalTicketStatus: ticket.status,
        modalTicketPriority: ticket.priority,
        modalTicketCategory: ticket.category,
        modalTicketDescription: ticket.description,
        modalTicketReplies: ticket.replies,
        modalTicketUpvotes: ticket.upvotes,
        modalTicketDownvotes: ticket.downvotes
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
    
    // Set badge classes
    const statusBadge = document.getElementById('modalTicketStatus');
    const priorityBadge = document.getElementById('modalTicketPriority');
    
    if (statusBadge) {
        statusBadge.className = `status-badge ${getStatusClass(ticket.status)}`;
    }
    if (priorityBadge) {
        priorityBadge.className = `priority-badge ${getPriorityClass(ticket.priority)}`;
    }
    
    // Set status update dropdown
    const statusUpdate = document.getElementById('statusUpdate');
    if (statusUpdate) {
        statusUpdate.value = ticket.status;
    }
    
    // Load comments
    loadComments(ticketId);
    
    // Show modal
    const ticketModal = document.getElementById('ticketModal');
    if (ticketModal) {
        ticketModal.classList.remove('hidden');
        ticketModal.setAttribute('data-ticket-id', ticketId);
    }
}

function closeTicketModal() {
    const ticketModal = document.getElementById('ticketModal');
    if (ticketModal) {
        ticketModal.classList.add('hidden');
    }
}

function loadComments(ticketId) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    const ticketComments = comments.filter(c => c.ticketId === ticketId);
    
    if (ticketComments.length === 0) {
        commentsList.innerHTML = '<div class="empty-state"><p>No comments yet. Be the first to reply!</p></div>';
        return;
    }
    
    commentsList.innerHTML = ticketComments.map(comment => {
        const author = getUserById(comment.userId);
        return `
            <div class="comment ${comment.type}">
                <div class="comment-header">
                    <span class="comment-author">${author ? author.name : 'Unknown User'}</span>
                    <span class="comment-date">${formatDate(comment.createdAt)}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
            </div>
        `;
    }).join('');
}

// Ticket Creation
function createTicket(subject, category, priority, description) {
    const newTicket = {
        id: tickets.length + 1,
        subject,
        description,
        status: 'Open',
        priority,
        category,
        createdBy: currentUser.id,
        assignedTo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: 0,
        upvotes: 0,
        downvotes: 0
    };
    
    tickets.push(newTicket);
    loadTickets();
    showSection('dashboard');
    
    // Show success message
    alert('Ticket created successfully!');
}

// Admin Functions
function loadUsers() {
    const grid = document.getElementById('usersGrid');
    if (!grid) return;
    
    grid.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-header">
                <div class="user-info-card">
                    <div class="user-avatar">${user.avatar}</div>
                    <div class="user-details">
                        <h4>${user.name}</h4>
                        <p>${user.email}</p>
                        <p>${user.department}</p>
                    </div>
                </div>
                <span class="role-badge">${user.role.replace('_', ' ')}</span>
            </div>
        </div>
    `).join('');
}

function loadCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    
    grid.innerHTML = categories.map(category => `
        <div class="category-card">
            <div class="category-header">
                <h4>${category.name}</h4>
            </div>
            <p>${category.description}</p>
        </div>
    `).join('');
}

function addCategory(name, description) {
    const newCategory = {
        id: categories.length + 1,
        name,
        description
    };
    
    categories.push(newCategory);
    loadCategories();
    populateFilters();
    closeCategoryModal();
    
    alert('Category added successfully!');
}

function openCategoryModal() {
    const categoryModal = document.getElementById('categoryModal');
    if (categoryModal) {
        categoryModal.classList.remove('hidden');
    }
}

function closeCategoryModal() {
    const categoryModal = document.getElementById('categoryModal');
    const addCategoryForm = document.getElementById('addCategoryForm');
    
    if (categoryModal) {
        categoryModal.classList.add('hidden');
    }
    if (addCategoryForm) {
        addCategoryForm.reset();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            const emailInput = document.getElementById('email');
            const email = emailInput ? emailInput.value : '';
            console.log('Email from form:', email);
            
            if (login(email)) {
                console.log('Login successful');
            } else {
                alert('User not found. Please try with a demo user.');
            }
        });
    }
    
    // Demo user buttons
    document.querySelectorAll('.demo-user-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Demo user button clicked');
            const email = this.getAttribute('data-email');
            console.log('Demo user email:', email);
            
            // Set email in form field
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.value = email;
            }
            
            // Attempt login
            if (login(email)) {
                console.log('Demo login successful');
            } else {
                console.log('Demo login failed');
                alert('Login failed. Please try again.');
            }
        });
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Search and filters
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentPage = 1;
            loadTickets();
        });
    }
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentPage = 1;
            loadTickets();
        });
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentPage = 1;
            loadTickets();
        });
    }
    
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            currentPage = 1;
            loadTickets();
        });
    }
    
    // Create ticket form
    const createTicketForm = document.getElementById('createTicketForm');
    if (createTicketForm) {
        createTicketForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const subject = document.getElementById('ticketSubject').value;
            const category = document.getElementById('ticketCategory').value;
            const priority = document.getElementById('ticketPriority').value;
            const description = document.getElementById('ticketDescription').value;
            
            if (!category) {
                alert('Please select a category');
                return;
            }
            
            createTicket(subject, category, priority, description);
            this.reset();
        });
    }
    
    const cancelTicket = document.getElementById('cancelTicket');
    if (cancelTicket) {
        cancelTicket.addEventListener('click', function() {
            const form = document.getElementById('createTicketForm');
            if (form) form.reset();
            showSection('dashboard');
        });
    }
    
    // Modal close buttons
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeTicketModal);
    }
    
    const closeCategoryModalBtn = document.getElementById('closeCategoryModal');
    if (closeCategoryModalBtn) {
        closeCategoryModalBtn.addEventListener('click', closeCategoryModal);
    }
    
    // Modal overlay clicks
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function() {
            this.parentElement.classList.add('hidden');
        });
    });
    
    // Reply form
    const replyForm = document.getElementById('replyForm');
    if (replyForm) {
        replyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const ticketModal = document.getElementById('ticketModal');
            const ticketId = ticketModal ? parseInt(ticketModal.getAttribute('data-ticket-id')) : null;
            const replyContent = document.getElementById('replyContent');
            const content = replyContent ? replyContent.value : '';
            
            if (ticketId && content && currentUser) {
                const newComment = {
                    id: comments.length + 1,
                    ticketId,
                    userId: currentUser.id,
                    content,
                    createdAt: new Date().toISOString(),
                    type: currentUser.role === 'support_agent' || currentUser.role === 'admin' ? 'agent_reply' : 'user_reply'
                };
                
                comments.push(newComment);
                
                // Update ticket replies count
                const ticket = tickets.find(t => t.id === ticketId);
                if (ticket) {
                    ticket.replies++;
                    ticket.updatedAt = new Date().toISOString();
                }
                
                loadComments(ticketId);
                loadTickets();
                this.reset();
            }
        });
    }
    
    // Status update
    const updateStatusBtn = document.getElementById('updateStatusBtn');
    if (updateStatusBtn) {
        updateStatusBtn.addEventListener('click', function() {
            const ticketModal = document.getElementById('ticketModal');
            const ticketId = ticketModal ? parseInt(ticketModal.getAttribute('data-ticket-id')) : null;
            const statusUpdate = document.getElementById('statusUpdate');
            const newStatus = statusUpdate ? statusUpdate.value : '';
            
            if (ticketId && newStatus) {
                const ticket = tickets.find(t => t.id === ticketId);
                if (ticket) {
                    ticket.status = newStatus;
                    ticket.updatedAt = new Date().toISOString();
                    
                    // Update modal display
                    const modalTicketStatus = document.getElementById('modalTicketStatus');
                    if (modalTicketStatus) {
                        modalTicketStatus.textContent = newStatus;
                        modalTicketStatus.className = `status-badge ${getStatusClass(newStatus)}`;
                    }
                    
                    loadTickets();
                    alert('Ticket status updated successfully!');
                }
            }
        });
    }
    
    // Upvote/Downvote buttons
    const upvoteBtn = document.getElementById('upvoteBtn');
    if (upvoteBtn) {
        upvoteBtn.addEventListener('click', function() {
            const ticketModal = document.getElementById('ticketModal');
            const ticketId = ticketModal ? parseInt(ticketModal.getAttribute('data-ticket-id')) : null;
            
            if (ticketId) {
                const ticket = tickets.find(t => t.id === ticketId);
                if (ticket) {
                    ticket.upvotes++;
                    const modalTicketUpvotes = document.getElementById('modalTicketUpvotes');
                    if (modalTicketUpvotes) {
                        modalTicketUpvotes.textContent = ticket.upvotes;
                    }
                    loadTickets();
                }
            }
        });
    }
    
    const downvoteBtn = document.getElementById('downvoteBtn');
    if (downvoteBtn) {
        downvoteBtn.addEventListener('click', function() {
            const ticketModal = document.getElementById('ticketModal');
            const ticketId = ticketModal ? parseInt(ticketModal.getAttribute('data-ticket-id')) : null;
            
            if (ticketId) {
                const ticket = tickets.find(t => t.id === ticketId);
                if (ticket) {
                    ticket.downvotes++;
                    const modalTicketDownvotes = document.getElementById('modalTicketDownvotes');
                    if (modalTicketDownvotes) {
                        modalTicketDownvotes.textContent = ticket.downvotes;
                    }
                    loadTickets();
                }
            }
        });
    }
    
    // Add category button
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', openCategoryModal);
    }
    
    // Add category form
    const addCategoryForm = document.getElementById('addCategoryForm');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const categoryName = document.getElementById('categoryName');
            const categoryDescription = document.getElementById('categoryDescription');
            const name = categoryName ? categoryName.value : '';
            const description = categoryDescription ? categoryDescription.value : '';
            
            if (name) {
                addCategory(name, description);
            }
        });
    }
    
    const cancelCategory = document.getElementById('cancelCategory');
    if (cancelCategory) {
        cancelCategory.addEventListener('click', closeCategoryModal);
    }
    
    // Initialize app
    console.log('Showing login screen...');
    showLoginScreen();
});

// Global functions for inline event handlers
window.openTicketModal = openTicketModal;
window.changePage = changePage;