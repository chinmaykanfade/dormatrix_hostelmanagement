document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const authStatus = localStorage.getItem('dormatrix_auth');
    if (!authStatus) { window.location.href = 'index.html'; return; }
    
    const user = JSON.parse(localStorage.getItem('dormatrix_user'));
    if (user.role !== 'tenant') {
        alert("Access Denied: Tenants only.");
        window.location.href = 'index.html';
        return;
    }

    const API_URL = 'http://localhost:5000/api/gatepass';
    const form = document.getElementById('gatePassForm');
    const tableBody = document.getElementById('gpTableBody');
    const submitBtn = document.getElementById('submitGpBtn');

    // Logout logic
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('dormatrix_auth');
        localStorage.removeItem('dormatrix_user');
        window.location.href = 'index.html';
    });

    // Fetch and display user's gate passes
    function loadGatePasses() {
        const passes = JSON.parse(localStorage.getItem(`dormatrix_gp_${user.id}`)) || [];
        renderTable(passes);
    }

    function renderTable(passes) {
        tableBody.innerHTML = '';
        if (passes.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No gate pass requests found.</td></tr>';
            return;
        }

        passes.forEach(pass => {
            const tr = document.createElement('tr');
            // Format date nicely
            const dateStr = new Date(pass.date).toLocaleDateString('en-GB');
            tr.innerHTML = `
                <td>${dateStr}</td>
                <td>${pass.outTime}</td>
                <td>${pass.inTime}</td>
                <td>${pass.reason}</td>
                <td><span class="status-badge status-${pass.status}">${pass.status}</span></td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Submit new request
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const requestData = {
            id: Date.now().toString(),
            tenantId: user.id,
            tenantName: user.name || 'Tenant',
            date: document.getElementById('gpDate').value,
            outTime: document.getElementById('gpOutTime').value,
            inTime: document.getElementById('gpInTime').value,
            reason: document.getElementById('gpReason').value,
            status: 'Pending'
        };

        // Save to tenant's personal list
        const fallbackData = JSON.parse(localStorage.getItem(`dormatrix_gp_${user.id}`)) || [];
        fallbackData.push(requestData);
        localStorage.setItem(`dormatrix_gp_${user.id}`, JSON.stringify(fallbackData));
        
        // Save to global pool for admin
        const adminFallback = JSON.parse(localStorage.getItem('dormatrix_gp_all')) || [];
        adminFallback.push(requestData);
        localStorage.setItem('dormatrix_gp_all', JSON.stringify(adminFallback));
        
        alert('Gate pass requested successfully!');
        form.reset();
        loadGatePasses();

        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Request';
    });

    // Initial load
    loadGatePasses();
});
