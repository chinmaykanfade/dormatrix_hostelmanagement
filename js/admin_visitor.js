document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    if (localStorage.getItem('dormatrix_auth') !== 'true') {
        window.location.href = 'index.html';
    }

    const userData = JSON.parse(localStorage.getItem('dormatrix_user'));
    if (!userData || userData.role !== 'admin') {
        window.location.href = 'index.html';
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('dormatrix_auth');
            localStorage.removeItem('dormatrix_user');
            window.location.href = 'index.html';
        });
    }

    const API_URL = 'http://localhost:5000/api/visitors';
    const visitorForm = document.getElementById('visitorForm');
    const tableBody = document.getElementById('visitorTableBody');
    const submitBtn = document.getElementById('addVisitorBtn');

    const fetchVisitors = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            renderTable(data);
        } catch (error) {
            console.error('Error fetching visitors:', error);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Failed to load visitors. Ensure backend is running.</td></tr>`;
        }
    };

    const renderTable = (visitors) => {
        tableBody.innerHTML = '';
        if (visitors.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No visitors recorded.</td></tr>';
            return;
        }

        visitors.forEach(v => {
            const tr = document.createElement('tr');
            
            const entryStr = new Date(v.entryTime).toLocaleString();
            const statusClass = `status-${v.status}`;
            const isActive = v.status === 'Active';

            let exitOrActionStr = isActive
                ? `<button class="exit-btn" data-id="${v._id}">Mark Exit</button>`
                : `<span style="font-size: 0.8rem; color: #64748b;">${new Date(v.exitTime).toLocaleString()}</span>`;

            tr.innerHTML = `
                <td><strong>${v.visitorName}</strong></td>
                <td>
                    ${v.studentName}<br>
                    <span style="font-size: 0.8rem; color: #64748b;">${v.roomNo}</span>
                </td>
                <td>${entryStr}</td>
                <td><span class="code-pill">${v.passCode}</span></td>
                <td><span class="status-badge ${statusClass}">${v.status}</span></td>
                <td>${exitOrActionStr}</td>
            `;
            tableBody.appendChild(tr);
        });

        // Attach Mark Exit Event Listeners
        document.querySelectorAll('.exit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                btn.disabled = true;
                btn.textContent = '...';
                
                try {
                    const res = await fetch(`${API_URL}/${id}/exit`, { method: 'PUT' });
                    if (res.ok) fetchVisitors();
                    else {
                        alert('Operation failed');
                        btn.disabled = false;
                        btn.textContent = 'Mark Exit';
                    }
                } catch (err) {
                    console.error(err);
                    alert('Backend connection error');
                    btn.disabled = false;
                    btn.textContent = 'Mark Exit';
                }
            });
        });
    };

    if (visitorForm) {
        visitorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const visitorName = document.getElementById('vName').value;
            const studentName = document.getElementById('sName').value;
            const roomNo = document.getElementById('rNo').value;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Generating...';

            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ visitorName, studentName, roomNo })
                });

                if (res.ok) {
                    const data = await res.json();
                    visitorForm.reset();
                    alert(`Pass generated successfully!\nPass Code: ${data.passCode}`);
                    fetchVisitors();
                } else {
                    alert('Failed to register visitor.');
                }
            } catch (err) {
                console.error(err);
                alert('Backend connection error.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register Entry & Generate Pass';
            }
        });
    }

    fetchVisitors();
});
