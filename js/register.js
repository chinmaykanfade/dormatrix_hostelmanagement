document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = document.getElementById('btnLoader');
    
    // Toggle room number field based on role
    const roleRadios = document.querySelectorAll('input[name="role"]');
    const roomGroup = document.getElementById('roomGroup');
    
    roleRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if(e.target.value === 'admin') {
                roomGroup.style.display = 'none';
            } else {
                roomGroup.style.display = 'block';
            }
        });
    });

    if(registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            errorMessage.style.display = 'none';
            errorMessage.classList.remove('shake');

            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const roomNumber = document.getElementById('roomNumber').value.trim();
            const password = document.getElementById('password').value.trim();
            const role = document.querySelector('input[name="role"]:checked').value;

            if (!fullName || !email || !password) {
                showError('Please fill in all required fields.');
                return;
            }

            if (!validateEmail(email)) {
                showError('Please enter a valid email address.');
                return;
            }
            
            if (password.length < 6) {
                showError('Password must be at least 6 characters.');
                return;
            }

            startLoading();

            setTimeout(() => {
                stopLoading();

                // Get current users array or initialize an empty one
                let users = JSON.parse(localStorage.getItem('dormatrix_users')) || [];
                
                // Check if email already exists
                const userExists = users.some(u => u.email === email);
                if(userExists) {
                    showError('An account with this email already exists.');
                    return;
                }

                // Create new user object
                const newUser = {
                    name: fullName,
                    email: email,
                    password: password,
                    role: role,
                    room: role === 'tenant' ? roomNumber : null
                };
                
                // Save to mock database
                users.push(newUser);
                localStorage.setItem('dormatrix_users', JSON.stringify(users));

                alert('Account created successfully! Please sign in.');
                window.location.href = 'index.html';
                
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
});
