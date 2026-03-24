document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const authStatus = localStorage.getItem('dormatrix_auth');
    if (!authStatus) { window.location.href = 'index.html'; return; }
    
    const user = JSON.parse(localStorage.getItem('dormatrix_user'));
    if (user.role !== 'admin') {
        alert("Access Denied: Admins only.");
        window.location.href = 'index.html';
        return;
    }

    const tableBody = document.getElementById('adminGpTableBody');
    let currentFilter = 'All';

    // Logout logic
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('dormatrix_auth');
        localStorage.removeItem('dormatrix_user');
        window.location.href = 'index.html';
    });

    // Mock SMS function
    function sendParentSMS(tenantName, status) {
        // In a real app, this calls Fast2SMS or Twilio API
        console.log(`[Twilio/Fast2SMS MOCK]: SMS sent to parent of ${tenantName}. Gate Pass Status: ${status}`);
        // Create an alert to simulate the text message visually for the presentation
        setTimeout(() => {
            alert(`📱 SMS Notification Sent!\nTo: Parent of ${tenantName}\nMessage: The gate pass request for ${tenantName} has been ${status.toUpperCase()}.`);
        }, 500);
    }

    function getAllPasses() {
        return JSON.parse(localStorage.getItem('dormatrix_gp_all')) || [];
    }

    function saveAllPasses(passes) {
        localStorage.setItem('dormatrix_gp_all', JSON.stringify(passes));
        
        // We also need to sync back to the tenant's individual list so they see the status update
        // Group by tenantId
        const byTenant = {};
        passes.forEach(p => {
            if (!byTenant[p.tenantId]) byTenant[p.tenantId] = [];
            byTenant[p.tenantId].push(p);
        });

        // Save back to each tenant's key
        for (const [tenantId, tenantPasses] of Object.entries(byTenant)) {
            localStorage.setItem(`dormatrix_gp_${tenantId}`, JSON.stringify(tenantPasses));
        }
    }

    function renderTable() {
        const passes = getAllPasses();
        
        let filtered = passes;
        if (currentFilter !== 'All') {
            filtered = passes.filter(p => p.status === currentFilter);
        }

        tableBody.innerHTML = '';
        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No gate pass requests found.</td></tr>';
            return;
        }

        // Sort by newest first
        filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));

        filtered.forEach(pass => {
            const tr = document.createElement('tr');
            const dateStr = new Date(pass.date).toLocaleDateString('en-GB');
            
            let actionsHtml = '';
            if (pass.status === 'Pending') {
                actionsHtml = `
                    <button class="action-btn approve-btn" data-id="${pass.id}">Approve</button>
                    <button class="action-btn reject-btn" data-id="${pass.id}">Reject</button>
                `;
            } else {
                actionsHtml = `<span style="color:#94a3b8; font-size:0.8rem">Processed</span>`;
            }

            tr.innerHTML = `
                <td><strong>${pass.tenantName}</strong></td>
                <td>${dateStr}</td>
                <td>
                    <div style="font-size: 0.85rem">${pass.outTime} to</div>
                    <div style="font-size: 0.85rem">${pass.inTime}</div>
                </td>
                <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${pass.reason}">${pass.reason}</td>
                <td><span class="status-badge status-${pass.status}">${pass.status}</span></td>
                <td>${actionsHtml}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Handle Approve/Reject
    tableBody.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (!id) return;

        const passes = getAllPasses();
        const passIndex = passes.findIndex(p => p.id === id);
        
        if (passIndex > -1) {
            if (e.target.classList.contains('approve-btn')) {
                if(confirm('Approve this gate pass?')) {
                    passes[passIndex].status = 'Approved';
                    saveAllPasses(passes);
                    renderTable();
                    sendParentSMS(passes[passIndex].tenantName, 'Approved');
                }
            } else if (e.target.classList.contains('reject-btn')) {
                if(confirm('Reject this gate pass?')) {
                    passes[passIndex].status = 'Rejected';
                    saveAllPasses(passes);
                    renderTable();
                    sendParentSMS(passes[passIndex].tenantName, 'Rejected');
                }
            }
        }
    });

    // Handle Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderTable();
        });
    });

    // Initial load
    renderTable();
});
