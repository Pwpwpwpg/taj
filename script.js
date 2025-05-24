document.addEventListener('DOMContentLoaded', () => {
    const dataForm = document.getElementById('dataForm');
    const dataTableBody = document.querySelector('#dataTable tbody');
    const messageDiv = document.getElementById('message');
    // const summaryResultsDiv = document.getElementById('summaryResults'); // HAPUS INI
    const resetDataButton = document.getElementById('resetDataButton');
    const waktuKedatanganInput = document.getElementById('waktuKedatangan'); 
    const analyzeButton = document.getElementById('analyzeButton'); // Tombol analisis baru

    // <<<<< GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT ANDA DARI LANGKAH 2
    const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyEez6eTnoF0sYoPiBCbiWAVQKSg9Rimdcx1PEKlXmjBYijRTeUDdWlVJ7gjmcii9dT5A/exec';

// Fungsi untuk memformat waktu ke HH:MM (misal 6:50 -> 06:50)
function formatTimeInput(timeString) {
    if (!timeString) return ''; 

    const parts = timeString.split(':');
    if (parts.length < 2) {
         const singlePartNum = parseInt(parts[0], 10);
         if (!isNaN(singlePartNum) && singlePartNum >= 0 && singlePartNum <= 23) {
             return `${singlePartNum < 10 ? '0' + singlePartNum : singlePartNum}:00`; 
         }
         return timeString;
    }

    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return timeString; 
    }

    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${formattedHours}:${formattedMinutes}`;
}

// Fungsi untuk memuat data dari Google Sheets (hanya data mentah)
async function loadData() {
    try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_WEB_APP_URL}?action=getData`);
        const data = await response.json();

        if (data.status === 'error') {
            showMessage(`Error dari Apps Script: ${data.message}`, 'error');
            dataTableBody.innerHTML = ''; 
            return;
        }

        dataTableBody.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.Koridor}</td>
                <td>${row.Pengelola}</td>
                <td>${row.WaktuKedatangan}</td>
            `;
            dataTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading data:', error);
        showMessage('Gagal memuat data. Periksa konsol browser atau log Apps Script.', 'error');
    }
}

// Event listener untuk pengiriman data baru
dataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const koridor = document.getElementById('koridor').value;
    const pengelola = document.getElementById('pengelola').value;
    let waktuKedatangan = document.getElementById('waktuKedatangan').value;

    waktuKedatangan = formatTimeInput(waktuKedatangan);

    const formData = new FormData();
    formData.append('action', 'addData');
    formData.append('koridor', koridor);
    formData.append('pengelola', pengelola);
    formData.append('waktuKedatangan', waktuKedatangan);

    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.status === 'success') {
            showMessage('Data berhasil ditambahkan!', 'success');
            dataForm.reset();
            loadData(); 
        } else {
            showMessage(`Gagal menambahkan data: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error adding data:', error);
        showMessage('Terjadi kesalahan saat menambahkan data. Coba lagi.', 'error');
    }
});

// Event listener untuk tombol reset data
resetDataButton.addEventListener('click', async () => {
    if (confirm('Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
        try {
            const formData = new FormData();
            formData.append('action', 'resetData');

            const response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.status === 'success') {
                showMessage('Semua data berhasil dihapus!', 'success');
                loadData(); 
            } else {
                showMessage(`Gagal menghapus data: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error resetting data:', error);
            showMessage('Terjadi kesalahan saat mereset data.', 'error');
        }
    }
});

// Fungsi calculateAndDisplaySummary dan event listener analyzeButton dihapus

// Fungsi untuk menampilkan pesan temporer kepada pengguna
function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = `message ${type}`;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 5000); 
}

// Event listener untuk memformat waktu secara real-time saat pengguna mengetik/memilih
waktuKedatanganInput.addEventListener('change', () => {
    waktuKedatanganInput.value = formatTimeInput(waktuKedatanganInput.value);
});

// Muat data saat halaman pertama kali dimuat
loadData();
});