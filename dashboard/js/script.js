// Data RSVP Demo (Initial State)
let rsvpData = [
  { id: 1, name: "Budi Santoso", status: "Hadir", count: 2, message: "Selamat untuk Romeo dan Julia! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah." },
  { id: 2, name: "Siti Rahma", status: "Hadir", count: 1, message: "Happy wedding ya! Semoga bahagia selalu sampai kakek nenek." },
  { id: 3, name: "Andi Wijaya", status: "Tidak Hadir", count: 0, message: "Mohon maaf belum bisa hadir karena ada tugas luar kota. Happy wedding!" },
  { id: 4, name: "Dewi Lestari", status: "Ragu-ragu", count: 1, message: "Insya Allah diusahakan hadir yaa, selamat!" },
  { id: 5, name: "Eko Prasetyo", status: "Hadir", count: 2, message: "Selamat menempuh hidup baru kawankuu!" }
];

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
  renderTables();
  generateQRCode();
  updateBridePreview();
});

// Navigation Switch
function showTab(tabId) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  
  // Show target tab
  document.getElementById(`tab-${tabId}`).classList.add('active');
  
  // Update nav active button
  const activeBtn = Array.from(document.querySelectorAll('.nav-item')).find(btn => btn.getAttribute('onclick').includes(tabId));
  if (activeBtn) activeBtn.classList.add('active');

  // Dynamic titles
  const titles = {
    'dashboard': ['Overview Dashboard', 'Ringkasan kehadiran dan aktivitas tamu undangan Anda'],
    'rsvp': ['Data RSVP & Ucapan', 'Kelola konfirmasi kehadiran dan pesan ucapan tamu'],
    'qr': ['Pengaturan QR Code', 'Atur QR Code untuk amplop digital atau konfirmasi WhatsApp'],
    'pengantin': ['Edit Nama Pengantin', 'Ubah informasi mempelai dan orang tua yang tampil di web'],
    'musik': ['Pengaturan Musik', 'Pilih atau unggah lagu latar untuk web undangan Anda']
  };

  document.getElementById('pageTitle').textContent = titles[tabId][0];
  document.getElementById('pageSubtitle').textContent = titles[tabId][1];
}

// Render Dashboard & Full RSVP Tables
function renderTables() {
  // Stats calculation
  const total = rsvpData.length;
  const hadir = rsvpData.filter(d => d.status === 'Hadir').reduce((acc, curr) => acc + curr.count, 0);
  const absen = rsvpData.filter(d => d.status === 'Tidak Hadir').length;
  const ragu = rsvpData.filter(d => d.status === 'Ragu-ragu').length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statHadir').textContent = hadir + ' orang';
  document.getElementById('statAbsen').textContent = absen + ' orang';
  document.getElementById('statRagu').textContent = ragu + ' orang';

  // Render Dashboard Table (Top 4)
  const dashTableBody = document.getElementById('dashRsvpTable');
  dashTableBody.innerHTML = rsvpData.slice(0, 4).map(item => `
    <tr>
      <td style="font-weight: 600;">${item.name}</td>
      <td><span class="badge badge-${getBadgeClass(item.status)}">${item.status}</span></td>
      <td>${item.count} orang</td>
      <td style="color: var(--text-muted); font-size: 0.85rem;">"${item.message}"</td>
    </tr>
  `).join('');

  // Render Full RSVP Table
  filterRsvpTable();
}

// Filter and Search RSVP Table
function filterRsvpTable() {
  const search = document.getElementById('rsvpSearch').value.toLowerCase();
  const filter = document.getElementById('rsvpFilter').value;
  const tableBody = document.getElementById('fullRsvpTable');

  const filteredData = rsvpData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search);
    const matchesFilter = (filter === 'all') || (item.status === filter);
    return matchesSearch && matchesFilter;
  });

  if (filteredData.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #999; padding: 20px;">Tidak ada data RSVP ditemukan</td></tr>`;
    return;
  }

  tableBody.innerHTML = filteredData.map(item => `
    <tr>
      <td style="font-weight: 600;">${item.name}</td>
      <td><span class="badge badge-${getBadgeClass(item.status)}">${item.status}</span></td>
      <td>${item.count} orang</td>
      <td>"${item.message}"</td>
      <td style="text-align: center;">
        <button class="btn btn-danger" style="padding: 6px 10px; font-size: 0.78rem;" onclick="deleteRsvp(${item.id})">
          <i class="fa-solid fa-trash"></i> Hapus
        </button>
      </td>
    </tr>
  `).join('');
}

// Delete RSVP Item
function deleteRsvp(id) {
  if (confirm("Apakah Anda yakin ingin menghapus ucapan/RSVP ini?")) {
    rsvpData = rsvpData.filter(item => item.id !== id);
    renderTables();
  }
}

function getBadgeClass(status) {
  if (status === 'Hadir') return 'hadir';
  if (status === 'Tidak Hadir') return 'absen';
  return 'ragu';
}

// Generate & Update QR Code
let qrCodeInstance = null;

function generateQRCode() {
  const type = document.getElementById('qrType').value;
  const title = document.getElementById('qrTitle').value;
  const val = document.getElementById('qrValue').value;
  const note = document.getElementById('qrNote').value;

  document.getElementById('prevQrTitle').textContent = title;
  document.getElementById('prevQrValue').textContent = val;
  document.getElementById('prevQrNote').textContent = note;

  if (type === 'wa') {
    document.getElementById('prevQrTypeTitle').textContent = 'Konfirmasi WhatsApp';
    document.getElementById('prevQrSub').textContent = 'Scan QR di bawah untuk menghubungi WhatsApp Admin';
  } else {
    document.getElementById('prevQrTypeTitle').textContent = 'Amplop Digital';
    document.getElementById('prevQrSub').textContent = 'Scan QR di bawah untuk mengirim hadiah / angpao';
  }

  // Clear previous QR
  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = "";

  const qrContent = type === 'wa' ? `https://wa.me/${val}` : `BANK:${title}|NO:${val}`;

  qrCodeInstance = new QRCode(qrContainer, {
    text: qrContent,
    width: 150,
    height: 150,
    colorDark: "#6B1D2F",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

// Update Bride & Groom Preview
function updateBridePreview() {
  const gNick = document.getElementById('groomNickname').value || 'Romeo';
  const bNick = document.getElementById('brideNickname').value || 'Julia';
  const gFull = document.getElementById('groomFullname').value || 'Romeo Montague, S.Kom';
  const bFull = document.getElementById('brideFullname').value || 'Julia Capulet, S.T';
  const gParents = document.getElementById('groomParents').value;
  const bParents = document.getElementById('brideParents').value;

  document.getElementById('prevCoupleTitle').textContent = `${gNick} & ${bNick}`;
  document.getElementById('prevGroomFull').textContent = gFull;
  document.getElementById('prevGroomParents').textContent = gParents;
  document.getElementById('prevBrideFull').textContent = bFull;
  document.getElementById('prevBrideParents').textContent = bParents;
}

// Audio Settings Logic
function changePresetAudio() {
  const select = document.getElementById('presetAudio');
  const audioPlayer = document.getElementById('bgAudioPlayer');
  const audioSource = document.getElementById('audioSource');
  const title = document.getElementById('currentSongTitle');

  const selectedOption = select.options[select.selectedIndex];
  audioSource.src = selectedOption.value;
  title.textContent = selectedOption.text;
  
  audioPlayer.load();
}

function handleAudioUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const audioPlayer = document.getElementById('bgAudioPlayer');
    const audioSource = document.getElementById('audioSource');
    const title = document.getElementById('currentSongTitle');

    const fileURL = URL.createObjectURL(file);
    audioSource.src = fileURL;
    title.textContent = file.name;

    audioPlayer.load();
    audioPlayer.play();
  }
}
