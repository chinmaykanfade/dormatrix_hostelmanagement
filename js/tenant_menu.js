document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    if (localStorage.getItem('dormatrix_auth') !== 'true') {
        window.location.href = 'index.html';
    }

    const userData = JSON.parse(localStorage.getItem('dormatrix_user'));
    if (!userData || userData.role !== 'tenant') {
        window.location.href = 'index.html';
    }

    // Set User Profile
    const roleSpan = document.getElementById('userRole');
    if (roleSpan) roleSpan.textContent = userData.name.charAt(0);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('dormatrix_auth');
            localStorage.removeItem('dormatrix_user');
            window.location.href = 'index.html';
        });
    }

    const API_URL = 'http://localhost:5000/api/menu';
    const noMenuMsg = document.getElementById('noMenuMessage');
    const menuContent = document.getElementById('menuContent');
    const todayDateStr = document.getElementById('todayDateStr');
    
    let currentMenuId = null;

    // Get today's local date in YYYY-MM-DD
    const localDate = new Date();
    const offset = localDate.getTimezoneOffset() * 60000;
    const today = new Date(localDate.getTime() - offset).toISOString().split('T')[0];

    todayDateStr.textContent = `Menu for ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`;

    const fetchMenu = async () => {
        try {
            const res = await fetch(`${API_URL}/date/${today}`);
            if (res.ok) {
                const data = await res.json();
                currentMenuId = data._id;
                
                document.getElementById('bItems').textContent = data.breakfast;
                document.getElementById('lItems').textContent = data.lunch;
                document.getElementById('dItems').textContent = data.dinner;
                
                // Pre-fill user's previous vote if exists
                if (data.votes) {
                    const myVotes = data.votes.filter(v => v.tenantId === userData.email);
                    myVotes.forEach(v => {
                        const mType = v.mealType.charAt(0).toLowerCase(); // 'b', 'l', or 'd'
                        const radio = document.getElementById(`star${v.rating}-${mType}`);
                        if (radio) radio.checked = true;
                    });
                }

                noMenuMsg.style.display = 'none';
                menuContent.style.display = 'block';
            } else {
                noMenuMsg.style.display = 'block';
                menuContent.style.display = 'none';
            }
        } catch (err) {
            console.error('Error fetching menu:', err);
            noMenuMsg.style.display = 'block';
            noMenuMsg.querySelector('p').textContent = 'Backend connection error.';
            menuContent.style.display = 'none';
        }
    };

    // Submitting votes
    const voteForms = document.querySelectorAll('.voteForm');
    voteForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentMenuId) return;

            const mealType = form.getAttribute('data-meal');
            const prefix = mealType.charAt(0).toLowerCase();
            const ratingInput = form.querySelector(`input[name="rating-${prefix}"]:checked`);
            
            if (!ratingInput) {
                alert('Please select a star rating first.');
                return;
            }

            const rating = parseInt(ratingInput.value);
            const btn = form.querySelector('.rate-btn');
            
            btn.disabled = true;
            btn.textContent = '...';

            try {
                const res = await fetch(`${API_URL}/${currentMenuId}/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tenantId: userData.email,
                        tenantName: userData.name,
                        mealType,
                        rating
                    })
                });

                if (res.ok) {
                    btn.textContent = 'Voted!';
                    setTimeout(() => { btn.textContent = 'Submit'; btn.disabled = false; }, 2000);
                } else {
                    alert('Failed to submit vote.');
                    btn.disabled = false;
                    btn.textContent = 'Submit';
                }
            } catch (err) {
                console.error(err);
                alert('Backend connection error.');
                btn.disabled = false;
                btn.textContent = 'Submit';
            }
        });
    });

    fetchMenu();
});
