document.addEventListener('DOMContentLoaded', () => {
    // 1. Authentication Protection
    const authStatus = localStorage.getItem('dormatrix_auth');
    const userStr = localStorage.getItem('dormatrix_user');
    
    // Redirect if not logged in
    if (!authStatus || !userStr) {
        window.location.href = 'index.html';
        return;
    }

    const currentUser = JSON.parse(userStr);
    
    // 2. Populate Header UI Elements
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    const userRoomDisplay = document.getElementById('userRoomDisplay');

    if (userNameEl) userNameEl.textContent = currentUser.name || "User";
    
    if (userRoleEl) {
        userRoleEl.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    }

    if (userRoomDisplay && currentUser.room) {
        userRoomDisplay.textContent = currentUser.room;
    }

    // 3. Handle Logout Trigger
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Clear mock session
            localStorage.removeItem('dormatrix_auth');
            localStorage.removeItem('dormatrix_user');
            
            // Send back to portal login
            window.location.href = 'index.html';
        });
    }

    // 4. Render Admin Chart (Only available on admin_dashboard.html)
    const chartCanvas = document.getElementById('votingChart');
    if (chartCanvas && typeof Chart !== 'undefined') {
        new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: ['Breakfast', 'Lunch', 'Dinner'],
                datasets: [{
                    label: 'Approval Rating (%)',
                    data: [82, 65, 95], /* Mock visualization data */
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.8)', // Indigo
                        'rgba(245, 158, 11, 0.8)', // Amber
                        'rgba(16, 185, 129, 0.8)'  // Emerald
                    ],
                    borderRadius: 6,
                    borderWidth: 0,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0F172A',
                        padding: 12,
                        titleFont: { size: 14, family: 'Inter' },
                        bodyFont: { size: 13, family: 'Inter' }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        max: 100,
                        grid: {
                            color: 'rgba(0,0,0,0.05)',
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    }
                }
            }
        });
    }
});
