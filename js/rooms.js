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

    // Initialize Rooms Mock Database
    if (!localStorage.getItem('dormatrix_rooms')) {
        const defaultRooms = [
            { id: '1', number: 'A-101', capacity: 2, occupants: ['John Student'] },
            { id: '2', number: 'A-102', capacity: 3, occupants: [] },
            { id: '3', number: 'B-201', capacity: 1, occupants: ['Jane Doe'] }
        ];
        localStorage.setItem('dormatrix_rooms', JSON.stringify(defaultRooms));
    }

    const roomsTableBody = document.getElementById('roomsTableBody');
    const roomModal = document.getElementById('roomModal');
    const roomForm = document.getElementById('roomForm');
    
    function getRooms() { return JSON.parse(localStorage.getItem('dormatrix_rooms')) || []; }
    function saveRooms(rooms) { localStorage.setItem('dormatrix_rooms', JSON.stringify(rooms)); }

    function renderRooms() {
        const rooms = getRooms();
        roomsTableBody.innerHTML = '';
        
        rooms.forEach((room) => {
            const isFull = room.occupants.length >= room.capacity;
            const statusClass = isFull ? 'status-full' : 'status-available';
            const statusText = isFull ? 'Full' : 'Available';
            
            // Limit occupants preview string nicely
            const occNames = room.occupants.length > 0 ? room.occupants.join(', ') : '<span style="color:#94a3b8">Vacant</span>';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${room.number}</strong></td>
                <td>${room.capacity} Beds</td>
                <td>
                    <div style="font-weight: 600; font-size: 0.85rem">${room.occupants.length} / ${room.capacity} Filled</div>
                    <div style="font-size: 0.85rem; color: #64748b; margin-top: 0.25rem;">${occNames}</div>
                </td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="action-btn edit" data-id="${room.id}">Edit</button>
                    ${!isFull ? `<button class="action-btn assign" data-id="${room.id}">Assign</button>` : `<button class="action-btn" disabled style="opacity:0.3; cursor:not-allowed">Assign</button>`}
                    <button class="action-btn delete" data-id="${room.id}">Delete</button>
                </td>
            `;
            roomsTableBody.appendChild(tr);
        });
    }

    // Initial render
    renderRooms();

    // Modal Operations
    document.getElementById('openAddRoomModal').addEventListener('click', () => {
        document.getElementById('editRoomId').value = '';
        document.getElementById('modalTitle').textContent = 'Add New Room';
        roomForm.reset();
        roomModal.classList.add('active');
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        roomModal.classList.remove('active');
    });

    // Form Submit (Add/Update Room)
    roomForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editRoomId').value;
        const number = document.getElementById('roomNumberInput').value.trim();
        const capacity = parseInt(document.getElementById('roomCapacityInput').value);

        if (!number) return;

        const rooms = getRooms();
        
        if (id) {
            // Edit existing
            const roomIndex = rooms.findIndex(r => r.id === id);
            if (roomIndex > -1) {
                // Ensure capacity is not dropped below current occupants
                if (capacity < rooms[roomIndex].occupants.length) {
                    alert('Cannot reduce capacity below the number of current occupants!');
                    return;
                }
                rooms[roomIndex].number = number;
                rooms[roomIndex].capacity = capacity;
            }
        } else {
            // Add new
            // Basic check for uniqueness
            if(rooms.some(r => r.number.toLowerCase() === number.toLowerCase())) {
                alert('Room number already exists!');
                return;
            }
            rooms.push({ id: Date.now().toString(), number, capacity, occupants: [] });
        }
        
        saveRooms(rooms);
        renderRooms();
        roomModal.classList.remove('active');
    });

    // Delegated actions for table buttons
    roomsTableBody.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (!id) return;

        const rooms = getRooms();
        const roomIndex = rooms.findIndex(r => r.id === id);
        if (roomIndex === -1) return;

        // Delete Room
        if (e.target.classList.contains('delete')) {
            if (rooms[roomIndex].occupants.length > 0) {
                alert('Cannot delete a room that still has occupants assigned. Reassign them first.');
                return;
            }
            if (confirm(`Are you sure you want to delete room ${rooms[roomIndex].number}?`)) {
                rooms.splice(roomIndex, 1);
                saveRooms(rooms);
                renderRooms();
            }
        } 
        // Edit Room
        else if (e.target.classList.contains('edit')) {
            const room = rooms[roomIndex];
            document.getElementById('editRoomId').value = room.id;
            document.getElementById('roomNumberInput').value = room.number;
            document.getElementById('roomCapacityInput').value = room.capacity;
            document.getElementById('modalTitle').textContent = 'Edit Room details';
            roomModal.classList.add('active');
        } 
        // Mock Assign Tenant
        else if (e.target.classList.contains('assign')) {
            const tenantName = prompt(`Please enter the tenant's full name to assign to ${rooms[roomIndex].number}:`);
            if (tenantName) {
                if(rooms[roomIndex].occupants.length >= rooms[roomIndex].capacity) {
                    alert('Action failed: Room is at full capacity!');
                } else {
                    rooms[roomIndex].occupants.push(tenantName.trim());
                    saveRooms(rooms);
                    renderRooms();
                }
            }
        }
    });
});
