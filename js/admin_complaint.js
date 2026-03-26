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

    const API_URL = 'http://localhost:5000/api/complaints';
    const tableBody = document.getElementById('adminComplaintTableBody');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let allComplaints = [];

    const fetchComplaints = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            allComplaints = data;
            renderTable(data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Failed to load complaints. Ensure backend is running.</td></tr>`;
        }
    };

    const renderTable = (complaints) => {
        tableBody.innerHTML = '';
        if (complaints.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No complaints found.</td></tr>';
            return;
        }

        complaints.forEach(c => {
            const tr = document.createElement('tr');
            
            const slaStr = new Date(c.slaDeadline).toLocaleString();
            const priorityClass = `priority-${c.priority}`;
            const statusClass = `status-${c.status.replace(' ', '-')}`;

            const isResolved = c.status === 'Resolved';

            tr.innerHTML = `
                <td>
                    <strong>${c.tenantName}</strong>
                    <div style="font-size: 0.8rem; color: #64748b;">${c.tenantId}</div>
                    <div style="font-size: 0.8rem; color: #64748b;">Room: ${c.room}</div>
                </td>
                <td>
                    <strong>${c.title}</strong>
                    <div class="desc-text" title="${c.description}">${c.description}</div>
                </td>
                <td><span class="priority-badge ${priorityClass}">${c.priority}</span></td>
                <td>${slaStr}</td>
                <td><span class="status-badge ${statusClass}">${c.status}</span></td>
                <td>
                    <select class="action-select" data-id="${c._id}" ${isResolved ? 'disabled' : ''}>
                        <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="Escalated" ${c.status === 'Escalated' ? 'selected' : ''}>Escalated</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Add event listeners to selects
        document.querySelectorAll('.action-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const newStatus = e.target.value;
                await updateStatus(id, newStatus);
            });
        });
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                // Refresh data to get newly calculated statuses
                fetchComplaints();
            } else {
                alert('Failed to update status.');
            }
        } catch (error) {
            console.error(error);
            alert('Backend connection error.');
        }
    };

    // Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const filter = e.target.getAttribute('data-filter');
            if (filter === 'All') {
                renderTable(allComplaints);
            } else {
                const filtered = allComplaints.filter(c => c.status === filter);
                renderTable(filtered);
            }
        });
    });

    fetchComplaints();
});
