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

    // 5. Render Dynamic Notices (for Tenant Dashboard)
    const noticeBoardEl = document.getElementById('tenantNoticeBoard');
    if (noticeBoardEl) {
        fetch('http://localhost:5000/api/notices')
            .then(res => res.json())
            .then(notices => {
                noticeBoardEl.innerHTML = '<h3>Notice Board</h3>';
                if (notices.length === 0) {
                    noticeBoardEl.innerHTML += '<div style="text-align:center; padding: 1rem; color:#64748b;">No new notices.</div>';
                    return;
                }
                
                // Show up to 5 most recent
                notices.slice(0, 5).forEach((n, index) => {
                    const badge = index === 0 ? '<span class="badge new">New</span>' : '<span class="badge">Info</span>';
                    const dateStr = new Date(n.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                    
                    noticeBoardEl.innerHTML += `
                        <div class="notice-item">
                            ${badge}
                            <p><strong>${n.title}</strong><br>${n.content}</p>
                            <small>${dateStr} • By ${n.author}</small>
                        </div>
                    `;
                });
            })
            .catch(err => {
                console.error('Error fetching notices:', err);
                noticeBoardEl.innerHTML = '<h3>Notice Board</h3><div style="text-align:center; padding: 1rem; color:red;">Connection error.</div>';
            });
    }

    // 6. Notifications (Admin trigger Rent Reminders)
    const sendRemindersBtn = document.getElementById('sendRemindersBtn');
    if (sendRemindersBtn) {
        sendRemindersBtn.addEventListener('click', async () => {
            const originalText = sendRemindersBtn.innerHTML;
            sendRemindersBtn.innerHTML = 'Sending...';
            sendRemindersBtn.disabled = true;

            try {
                const res = await fetch('http://localhost:5000/api/notifications/remind-rent', {
                    method: 'POST'
                });
                if (res.ok) {
                    const data = await res.json();
                    alert(`Success: ${data.message} (${data.count} SMS sent via simulation)`);
                } else {
                    alert('Error sending reminders.');
                }
            } catch (err) {
                console.error(err);
                alert('Backend connection error.');
            } finally {
                sendRemindersBtn.innerHTML = originalText;
                sendRemindersBtn.disabled = false;
            }
        });
    }
});
