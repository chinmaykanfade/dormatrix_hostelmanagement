function initializeDB() {
    if (!localStorage.getItem('dormatrix_users')) {
        const defaultUsers = [
            { name: 'Hostel Warden', email: 'admin@dormatrix.com', password: 'admin123', role: 'admin' },
            { name: 'John Student', email: 'tenant@dormatrix.com', password: 'tenant123', role: 'tenant', room: 'A-101' }
        ];
        localStorage.setItem('dormatrix_users', JSON.stringify(defaultUsers));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeDB();

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = document.getElementById('btnLoader');

    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            errorMessage.style.display = 'none';
            errorMessage.classList.remove('shake');

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const role = document.querySelector('input[name="role"]:checked').value;

            if (!email || !password) {
                showError('Please fill in both email and password.');
                return;
            }

            if (!validateEmail(email)) {
                showError('Please enter a valid email address.');
                return;
            }

            startLoading();

            setTimeout(() => {
                stopLoading();

                // Fetch database from localStorage
                const users = JSON.parse(localStorage.getItem('dormatrix_users'));
                
                // Find matching user
                const user = users.find(u => u.email === email && u.password === password && u.role === role);

                if (user) {
                    loginUser(user, `${role}_dashboard.html`);
                } else {
                    showError(`Invalid ${role} credentials. Please try again or sign up.`);
                }
            }, 1200);
        });
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.style.display = 'block';
        void errorMessage.offsetWidth;
        errorMessage.classList.add('shake');
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function startLoading() {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
    }

    function stopLoading() {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }

    function loginUser(userData, redirectUrl) {
        localStorage.setItem('dormatrix_user', JSON.stringify({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            room: userData.room || null
        }));
        localStorage.setItem('dormatrix_auth', 'true');
        
        alert(`Successfully logged in as ${userData.name} (${userData.role}). Redirecting...`);
        window.location.href = redirectUrl; 
    }
});
