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

    const API_URL = 'http://localhost:5000/api/complaints';
    const form = document.getElementById('complaintForm');
    const tableBody = document.getElementById('complaintTableBody');
    const submitBtn = document.getElementById('submitBtn');

    // Fetch Complaints
    const fetchComplaints = async () => {
        try {
            const res = await fetch(`${API_URL}/tenant/${userData.email}`);
            const data = await res.json();
            renderTable(data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Failed to load complaints. Ensure backend is running.</td></tr>`;
        }
    };

    const renderTable = (complaints) => {
        tableBody.innerHTML = '';
        if (complaints.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No complaints filed yet.</td></tr>';
            return;
        }

        complaints.forEach(c => {
            const tr = document.createElement('tr');
            
            const dateStr = new Date(c.createdAt).toLocaleDateString();
            const slaStr = new Date(c.slaDeadline).toLocaleString();
            const priorityClass = `priority-${c.priority}`;
            const statusClass = `status-${c.status.replace(' ', '-')}`;

            tr.innerHTML = `
                <td>${dateStr}</td>
                <td>
                    <strong>${c.title}</strong>
                    <div style="font-size: 0.8rem; color: #64748b;">${c.description}</div>
                </td>
                <td><span class="priority-badge ${priorityClass}">${c.priority}</span></td>
                <td><span class="status-badge ${statusClass}">${c.status}</span></td>
                <td>${slaStr}</td>
            `;
            tableBody.appendChild(tr);
        });
    };

    // Submit complaint
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('cTitle').value;
            const priority = document.getElementById('cPriority').value;
            const description = document.getElementById('cDescription').value;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tenantId: userData.email,
                        tenantName: userData.name,
                        room: userData.room || 'Unassigned',
                        title,
                        description,
                        priority
                    })
                });

                if (res.ok) {
                    form.reset();
                    alert('Complaint submitted successfully!');
                    fetchComplaints();
                } else {
                    alert('Submission failed.');
                }
            } catch (err) {
                console.error(err);
                alert('Backend connection error.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Complaint';
            }
        });
    }

    // Initial Fetch
    fetchComplaints();
});
