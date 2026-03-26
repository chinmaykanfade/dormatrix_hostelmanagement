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

    const API_URL = 'http://localhost:5000/api/menu';
    const menuForm = document.getElementById('menuForm');
    const chartDate = document.getElementById('chartDate');
    let chartInstance = null;

    // Set today as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('menuDate').value = today;
    chartDate.value = today;

    // Load menu into form if editing
    document.getElementById('menuDate').addEventListener('change', async (e) => {
        const date = e.target.value;
        try {
            const res = await fetch(`${API_URL}/date/${date}`);
            if (res.ok) {
                const data = await res.json();
                document.getElementById('mBreakfast').value = data.breakfast;
                document.getElementById('mLunch').value = data.lunch;
                document.getElementById('mDinner').value = data.dinner;
            } else {
                document.getElementById('mBreakfast').value = '';
                document.getElementById('mLunch').value = '';
                document.getElementById('mDinner').value = '';
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Save menu
    menuForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const date = document.getElementById('menuDate').value;
        const breakfast = document.getElementById('mBreakfast').value;
        const lunch = document.getElementById('mLunch').value;
        const dinner = document.getElementById('mDinner').value;
        const btn = document.getElementById('saveMenuBtn');
        
        btn.disabled = true;
        btn.textContent = 'Saving...';

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, breakfast, lunch, dinner })
            });

            if (res.ok) {
                alert('Menu saved successfully!');
                if (date === chartDate.value) loadChartData(date);
            } else {
                alert('Failed to save menu.');
            }
        } catch (err) {
            console.error(err);
            alert('Backend connection error.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Save / Update Menu';
        }
    });

    // Chart logic
    chartDate.addEventListener('change', (e) => loadChartData(e.target.value));

    const loadChartData = async (date) => {
        try {
            const res = await fetch(`${API_URL}/date/${date}`);
            if (res.ok) {
                const data = await res.json();
                renderChart(data.votes);
            } else {
                renderChart([]);
            }
        } catch (err) {
            console.error(err);
            renderChart([]);
        }
    };

    const renderChart = (votes) => {
        let bSum = 0, bCount = 0;
        let lSum = 0, lCount = 0;
        let dSum = 0, dCount = 0;

        if (votes && votes.length > 0) {
            votes.forEach(v => {
                if (v.mealType === 'Breakfast') { bSum += v.rating; bCount++; }
                if (v.mealType === 'Lunch') { lSum += v.rating; lCount++; }
                if (v.mealType === 'Dinner') { dSum += v.rating; dCount++; }
            });
        }

        const bAvg = bCount > 0 ? (bSum / bCount).toFixed(1) : 0;
        const lAvg = lCount > 0 ? (lSum / lCount).toFixed(1) : 0;
        const dAvg = dCount > 0 ? (dSum / dCount).toFixed(1) : 0;

        const ctx = document.getElementById('votingChart').getContext('2d');
        
        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Breakfast', 'Lunch', 'Dinner'],
                datasets: [{
                    label: 'Average Rating (out of 5)',
                    data: [bAvg, lAvg, dAvg],
                    backgroundColor: [
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(79, 70, 229, 0.7)'
                    ],
                    borderColor: [
                        'rgb(245, 158, 11)',
                        'rgb(16, 185, 129)',
                        'rgb(79, 70, 229)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5
                    }
                }
            }
        });
    };

    // Initial triggers
    document.getElementById('menuDate').dispatchEvent(new Event('change'));
    loadChartData(today);
});
