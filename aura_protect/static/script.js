// AuraProtect v0.dev - JavaScript for frontend logic including mock auth

// --- Mock User Data Store (Client-Side) ---
// In a real app, this would be managed by a backend and server-side sessions.
// For simulation, we use sessionStorage to persist login state across page loads in the same tab.
let mockClientSession = {
    currentUser: null, // Will store user object { fullname, email, account_type }
    isAuthenticated: false
};

// --- Mock Backend API Calls (Simulated) ---
// These functions mimic what would be API calls to a Python backend.
// They interact with a conceptual `auth_logic.py` which is not directly callable from JS.
// For this simulation, we'll hardcode some responses or use simplified logic.

// In-memory store for users, mimicking MOCK_USERS_DB from auth_logic.py
// This is separate from the server-side MOCK_USERS_DB and only for client-side simulation.
let clientSideUserStore = [];

function mockApiRegisterUser(fullname, email, password, account_type) {
    return new Promise((resolve) => {
        setTimeout(() => { // Simulate network delay
            // Check if email exists in clientSideUserStore
            if (clientSideUserStore.find(user => user.email === email)) {
                resolve({ success: false, message: "Email already registered (Client Mock)." });
                return;
            }
            // Simulate password hashing
            const password_hash = `${password}_hashed_client_mock`;
            const newUser = { id: `client-${Date.now()}`, fullname, email, password_hash, account_type };
            clientSideUserStore.push(newUser);
            console.log("Client-side registered users:", clientSideUserStore);
            resolve({ success: true, message: "Registration successful! Please login. (Client Mock)" });
        }, 500);
    });
}

function mockApiLoginUser(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => { // Simulate network delay
            const user = clientSideUserStore.find(u => u.email === email);
            if (user && user.password_hash === `${password}_hashed_client_mock`) {
                const userSessionData = { fullname: user.fullname, email: user.email, account_type: user.account_type };
                sessionStorage.setItem('currentUser', JSON.stringify(userSessionData));
                mockClientSession.currentUser = userSessionData;
                mockClientSession.isAuthenticated = true;
                resolve({ success: true, message: "Login successful! (Client Mock)", user: userSessionData });
            } else {
                resolve({ success: false, message: "Invalid email or password (Client Mock)." });
            }
        }, 500);
    });
}

function mockApiLogoutUser() {
    return new Promise((resolve) => {
        setTimeout(() => {
            sessionStorage.removeItem('currentUser');
            mockClientSession.currentUser = null;
            mockClientSession.isAuthenticated = false;
            resolve({ success: true, message: "Logout successful (Client Mock)." });
        }, 200);
    });
}

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("AuraProtect JavaScript Loaded for Auth Simulation");

    // Attempt to load session from sessionStorage
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        mockClientSession.currentUser = JSON.parse(storedUser);
        mockClientSession.isAuthenticated = true;
        console.log("Restored session for:", mockClientSession.currentUser);
    }
    updateNavigation(); // Update nav based on loaded session

    // --- Registration Form ---
    const registerForm = document.getElementById('registrationForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirm_password = document.getElementById('confirm_password').value;
            const account_type = document.getElementById('account_type').value;
            const terms = document.getElementById('terms').checked;
            const messageEl = document.getElementById('registrationMessage');

            messageEl.textContent = ''; // Clear previous messages
            messageEl.className = 'form-message';


            if (password !== confirm_password) {
                messageEl.textContent = "Passwords do not match.";
                messageEl.classList.add('error');
                return;
            }
            if (!terms) {
                messageEl.textContent = "You must agree to the terms and conditions.";
                messageEl.classList.add('error');
                return;
            }

            // Simulate API call
            const result = await mockApiRegisterUser(fullname, email, password, account_type);
            if (result.success) {
                messageEl.textContent = result.message;
                messageEl.classList.add('success');
                registerForm.reset();
                 // setTimeout(() => { window.location.href = '/login'; }, 2000); // Optional redirect
            } else {
                messageEl.textContent = result.message;
                messageEl.classList.add('error');
            }
        });
    }

    // --- Login Form ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageEl = document.getElementById('loginMessage');

            messageEl.textContent = ''; // Clear previous messages
            messageEl.className = 'form-message';

            // Simulate API call
            const result = await mockApiLoginUser(email, password);
            if (result.success) {
                messageEl.textContent = result.message;
                messageEl.classList.add('success');
                // loginForm.reset(); // Don't reset on success, redirect instead
                updateNavigation();
                // Redirect to dashboard or homepage after a short delay
                setTimeout(() => {
                    if (mockClientSession.currentUser.account_type === 'creator') {
                        window.location.href = '/creator/dashboard'; // Placeholder path
                    } else {
                        window.location.href = '/'; // Placeholder path
                    }
                }, 1000);
            } else {
                messageEl.textContent = result.message;
                messageEl.classList.add('error');
            }
        });
    }

    // --- Logout Link/Button ---
    // This will be handled by updateNavigation which creates the logout link

    // --- General UI Updates ---
    applyButtonMicrointeractions();
});


// --- Navigation Update Function ---
function updateNavigation() {
    const navUl = document.querySelector('header nav ul');
    const welcomeMessageEl = document.getElementById('navWelcomeMessage'); // Assuming an element for this

    if (!navUl) return;

    // Clear existing dynamic links (Login, Register, Logout, Dashboard, Welcome)
    const dynamicLinks = navUl.querySelectorAll('.dynamic-nav-item');
    dynamicLinks.forEach(link => link.remove());

    if (welcomeMessageEl) welcomeMessageEl.innerHTML = ''; // Clear previous welcome message

    if (mockClientSession.isAuthenticated && mockClientSession.currentUser) {
        // User is logged in
        if (welcomeMessageEl) {
            welcomeMessageEl.innerHTML = `Welcome, ${mockClientSession.currentUser.fullname}! `;
        }
        // No need for the fallback li creation as navWelcomeMessage div is guaranteed by base.html

        if (mockClientSession.currentUser.account_type === 'creator') {
            const dashboardLi = document.createElement('li');
            dashboardLi.className = 'dynamic-nav-item';
            dashboardLi.innerHTML = `<a href="/creator/dashboard">Creator Dashboard</a>`; // Placeholder path
            navUl.appendChild(dashboardLi);
        }

        const logoutLi = document.createElement('li');
        logoutLi.className = 'dynamic-nav-item';
        logoutLi.innerHTML = `<a href="#" id="logoutLink">Logout</a>`;
        navUl.appendChild(logoutLi);

        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', async function(event) {
                event.preventDefault();
                await mockApiLogoutUser();
                updateNavigation();
                window.location.href = '/'; // Redirect to home on logout
            });
        }
    } else {
        // User is logged out
        const loginLi = document.createElement('li');
        loginLi.className = 'dynamic-nav-item';
        loginLi.innerHTML = `<a href="/login">Login</a>`; // Placeholder path
        navUl.appendChild(loginLi);

        const registerLi = document.createElement('li');
        registerLi.className = 'dynamic-nav-item';
        registerLi.innerHTML = `<a href="/register">Register</a>`; // Placeholder path
        navUl.appendChild(registerLi);
    }
}


// --- Micro-interaction for buttons ---
function applyButtonMicrointeractions() {
    const buttons = document.querySelectorAll('.button, button');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });
        button.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        button.addEventListener('mouseleave', function() { // In case mouse leaves while pressed
            this.style.transform = 'scale(1)';
        });
    });
}
