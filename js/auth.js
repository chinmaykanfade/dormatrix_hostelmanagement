document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = document.getElementById('btnLoader');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Hide previous error
        errorMessage.style.display = 'none';
        errorMessage.classList.remove('shake');

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const role = document.querySelector('input[name="role"]:checked').value;

        // Basic frontend validation
        if (!email || !password) {
            showError('Please fill in both email and password.');
            return;
        }

        if (!validateEmail(email)) {
            showError('Please enter a valid email address.');
            return;
        }

        // Simulate network loading
        startLoading();

        setTimeout(() => {
            stopLoading();

            // Mock login logic mapped to requirements
            if (role === 'admin') {
                if (email === 'admin@dormatrix.com' && password === 'admin123') {
                    // Success, mock authentication by saving to localStorage
                    loginUser({ role: 'admin', email, name: 'Hostel Warden' }, 'module2_dashboard_admin.html');
                } else {
                    showError('Invalid admin credentials. (Hint: admin@dormatrix.com / admin123)');
                }
            } else {
                if (email === 'tenant@dormatrix.com' && password === 'tenant123') {
                    // Success, mock authentication by saving to localStorage
                    loginUser({ role: 'tenant', email, name: 'John Student', room: 'A-101' }, 'module2_dashboard_tenant.html');
                } else {
                    showError('Invalid tenant credentials. (Hint: tenant@dormatrix.com / tenant123)');
                }
            }
        }, 1200); // 1.2s realistic loading delay
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.style.display = 'block';
        
        // Trigger reflow to restart animation
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
        // Persist session locally
        localStorage.setItem('dormatrix_user', JSON.stringify(userData));
        localStorage.setItem('dormatrix_auth', 'true');
        
        // Because we don't have the dashboards yet, just alert for now or try to redirect
        // Later modules will have these pages.
        alert(`Successfully logged in as ${userData.name} (${userData.role}). Redirecting...`);
        // window.location.href = redirectUrl; // Uncomment when pages exist
    }
});
