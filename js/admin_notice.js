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

    const API_URL = 'http://localhost:5000/api/notices';
    const noticeForm = document.getElementById('noticeForm');
    const noticesList = document.getElementById('noticesList');
    const submitBtn = document.getElementById('postNoticeBtn');
    
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editNoticeForm');

    const fetchNotices = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            renderNotices(data);
        } catch (error) {
            console.error('Error fetching notices:', error);
            noticesList.innerHTML = `<div style="text-align: center; color: red;">Failed to load notices.</div>`;
        }
    };

    const renderNotices = (notices) => {
        noticesList.innerHTML = '';
        if (notices.length === 0) {
            noticesList.innerHTML = '<div style="text-align: center; color: #64748b;">No published notices.</div>';
            return;
        }

        notices.forEach(n => {
            const div = document.createElement('div');
            div.className = 'notice-card';
            
            const dateStr = new Date(n.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            
            div.innerHTML = `
                <div class="notice-content">
                    <h3>${n.title}</h3>
                    <p>${n.content}</p>
                    <div class="notice-meta">Posted by ${n.author} • ${dateStr}</div>
                </div>
                <div class="action-btns">
                    <button class="btn-edit" data-id="${n._id}">Edit</button>
                    <button class="btn-delete" data-id="${n._id}">Delete</button>
                </div>
            `;
            noticesList.appendChild(div);
        });

        // Attach Edit
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const notice = notices.find(x => x._id === id);
                document.getElementById('editId').value = notice._id;
                document.getElementById('editTitle').value = notice.title;
                document.getElementById('editContent').value = notice.content;
                editModal.style.display = 'flex';
            });
        });

        // Attach Delete
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Are you sure you want to delete this notice?')) return;
                
                const id = btn.getAttribute('data-id');
                btn.disabled = true;
                try {
                    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    if (res.ok) fetchNotices();
                    else alert('Failed to delete');
                } catch (err) {
                    console.error(err);
                    alert('Backend connection error');
                    btn.disabled = false;
                }
            });
        });
    };

    if (noticeForm) {
        noticeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('nTitle').value;
            const content = document.getElementById('nContent').value;
            const author = userData.name;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Posting...';

            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content, author })
                });

                if (res.ok) {
                    noticeForm.reset();
                    fetchNotices();
                } else {
                    alert('Failed to post notice.');
                }
            } catch (err) {
                console.error(err);
                alert('Backend connection error.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publish Notice';
            }
        });
    }
    
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editId').value;
            const title = document.getElementById('editTitle').value;
            const content = document.getElementById('editContent').value;
            
            const btn = editForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            
            try {
                const res = await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content })
                });

                if (res.ok) {
                    editModal.style.display = 'none';
                    fetchNotices();
                } else {
                    alert('Failed to update notice.');
                }
            } catch (err) {
                console.error(err);
                alert('Backend connection error.');
            } finally {
                btn.disabled = false;
            }
        });
    }

    fetchNotices();
});
