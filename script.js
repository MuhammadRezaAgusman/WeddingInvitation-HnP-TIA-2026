(function () {
  if (document.body.classList.contains("dashboard-page")) {
    return;
  }

  var $ = function (id) {
    return document.getElementById(id);
  };
  var invitationStorageKey = "ab-invitation-opened";
  var bgm = $("bgm");
  var soundToggle = $("sound-toggle");
  var invitationContent = Array.prototype.slice.call(
    document.querySelectorAll("main > section:not(.cv), footer")
  );

  function updateSoundToggle() {
    var soundEnabled = !bgm.paused && !bgm.muted;
    var label = soundEnabled ? "Matikan suara" : "Aktifkan suara";
    soundToggle.setAttribute("aria-label", label);
    soundToggle.setAttribute("aria-pressed", soundEnabled);
    soundToggle.title = label;
  }

  function playMusic() {
    bgm.muted = false;
    var playback = bgm.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function (error) {
        bgm.pause();
        bgm.muted = true;
        updateSoundToggle();
        console.error("Tidak dapat memutar musik undangan.", error);
      });
    }
    updateSoundToggle();
  }

  soundToggle.onclick = function () {
    if (!bgm.paused && !bgm.muted) {
      bgm.muted = true;
      updateSoundToggle();
      return;
    }

    playMusic();
  };
  bgm.addEventListener("play", updateSoundToggle);
  bgm.addEventListener("pause", updateSoundToggle);
  updateSoundToggle();

  function setInvitationContentInert(isInert) {
    invitationContent.forEach(function (element) {
      element.inert = isInert;
    });
  }

  function openInvitation(shouldScroll) {
    setInvitationContentInert(false);
    document.documentElement.classList.add("invitation-open");
    document.documentElement.classList.remove("invitation-opening");

    try {
      sessionStorage.setItem(invitationStorageKey, "true");
    } catch (error) {
      console.error("Tidak dapat menyimpan status undangan yang sudah dibuka.", error);
    }

    var aboutSection = $("about");
    var aboutUrl = new URL(window.location.href);
    aboutUrl.hash = "about";
    window.history.replaceState(null, "", aboutUrl);

    if (shouldScroll) {
      aboutSection.classList.add("invitation-entering");
      var prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      aboutSection.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      window.setTimeout(function () {
        aboutSection.classList.remove("invitation-entering");
      }, 700);
    }
  }

  var invitationWasOpened = false;
  try {
    invitationWasOpened = sessionStorage.getItem(invitationStorageKey) === "true";
  } catch (error) {
    console.error("Tidak dapat membaca status undangan yang sudah dibuka.", error);
  }

  if (invitationWasOpened) {
    openInvitation(false);
  } else {
    setInvitationContentInert(true);
  }

  $("cover-open").onclick = function () {
    if (document.documentElement.classList.contains("invitation-opening")) {
      return;
    }

    document.documentElement.classList.add("invitation-opening");
    this.disabled = true;
    playMusic();

    try {
      sessionStorage.setItem(invitationStorageKey, "true");
    } catch (error) {
      console.error("Tidak dapat menyimpan status undangan yang sudah dibuka.", error);
    }

    var transitionDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 600;
    window.setTimeout(function () {
      openInvitation(true);
    }, transitionDuration);
  };

  var weddingDate = new Date("2045-08-17T08:00:00+07:00");

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function updateCountdown() {
    var secondsRemaining = Math.max(
      0,
      Math.floor((weddingDate - new Date()) / 1000)
    );

    $("d").textContent = pad(Math.floor(secondsRemaining / 86400));
    $("h").textContent = pad(Math.floor((secondsRemaining % 86400) / 3600));
    $("m").textContent = pad(Math.floor((secondsRemaining % 3600) / 60));
    $("s").textContent = pad(secondsRemaining % 60);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  var themeToggle = $("theme-toggle");
  var themeStorageKey = "ab-theme";
  var systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  function isDarkTheme() {
    var preference = document.documentElement.getAttribute("data-theme");
    return preference === "dark" || (preference !== "light" && systemTheme.matches);
  }

  function updateThemeToggle() {
    var dark = isDarkTheme();
    var label = dark ? "Aktifkan mode terang" : "Aktifkan mode gelap";
    themeToggle.setAttribute("aria-label", label);
    themeToggle.setAttribute("aria-pressed", dark);
    themeToggle.title = label;
  }

  try {
    var savedTheme = localStorage.getItem(themeStorageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  } catch (error) {
    console.error("Tidak dapat membaca preferensi tema tersimpan.", error);
  }

  updateThemeToggle();
  if (systemTheme.addEventListener) {
    systemTheme.addEventListener("change", updateThemeToggle);
  } else {
    systemTheme.addListener(updateThemeToggle);
  }

  themeToggle.onclick = function () {
    var theme = isDarkTheme() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeToggle();

    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch (error) {
      console.error("Tidak dapat menyimpan preferensi tema.", error);
    }
  };

  var profileMenu = $("profile-menu");
  var profileTrigger = $("profile-trigger");
  var profileDropdown = $("profile-dropdown");
  var adminLoginDialog = $("admin-login-dialog");
  var adminSessionStorageKey = "ab-admin-demo-session";

  function setProfileDropdownOpen(isOpen) {
    profileDropdown.hidden = !isOpen;
    profileTrigger.setAttribute("aria-expanded", isOpen);
  }

  function updateAdminSession(isActive) {
    $("admin-session-status").textContent = isActive
      ? "Sesi demo aktif di tab ini."
      : "Belum masuk";
    $("admin-dashboard-link").hidden = !isActive;
    $("admin-login-button").hidden = isActive;
    $("admin-logout-button").hidden = !isActive;
  }

  var adminSessionActive = false;
  try {
    adminSessionActive =
      sessionStorage.getItem(adminSessionStorageKey) === "true";
  } catch (error) {
    console.error("Tidak dapat membaca status sesi admin demo.", error);
  }
  updateAdminSession(adminSessionActive);

  profileTrigger.onclick = function () {
    setProfileDropdownOpen(profileDropdown.hidden);
  };
  $("admin-login-button").onclick = function () {
    setProfileDropdownOpen(false);
    adminLoginDialog.showModal();
  };
  adminLoginDialog.addEventListener("click", function (event) {
    event.stopPropagation();
  });
  adminLoginDialog.addEventListener("close", function () {
    profileTrigger.focus();
  });
  $("admin-login-close").onclick = function () {
    adminLoginDialog.close();
  };
  $("admin-demo-login").onclick = function () {
    try {
      sessionStorage.setItem(adminSessionStorageKey, "true");
      adminSessionActive = true;
      updateAdminSession(true);
      adminLoginDialog.close();
      setProfileDropdownOpen(true);
    } catch (error) {
      console.error("Tidak dapat memulai sesi admin demo.", error);
      $("admin-session-status").textContent =
        "Penyimpanan sesi browser tidak tersedia.";
    }
  };
  $("admin-logout-button").onclick = function () {
    try {
      sessionStorage.removeItem(adminSessionStorageKey);
      adminSessionActive = false;
      updateAdminSession(false);
      setProfileDropdownOpen(false);
    } catch (error) {
      console.error("Tidak dapat mengakhiri sesi admin demo.", error);
      $("admin-session-status").textContent =
        "Sesi demo tidak dapat diakhiri di browser ini.";
    }
  };
  document.addEventListener("click", function (event) {
    if (!profileMenu.contains(event.target)) {
      setProfileDropdownOpen(false);
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !profileDropdown.hidden) {
      setProfileDropdownOpen(false);
      profileTrigger.focus();
    }
  });

  $("burger").onclick = function () {
    var isOpen = $("nav").classList.toggle("open");
    this.setAttribute("aria-expanded", isOpen);
  };
  $("nav").onclick = function () {
    this.classList.remove("open");
  };

  var slideCount = 6;
  var currentSlide = 0;
  var track = $("trk");
  var dots = $("dots");
  var carousel = $("car");
  var autoAdvance;

  function goToSlide(index) {
    currentSlide = (index + slideCount) % slideCount;
    track.style.transform = "translateX(-" + currentSlide * 100 + "%)";

    [].forEach.call(dots.children, function (dot, dotIndex) {
      dot.classList.toggle("on", dotIndex === currentSlide);
    });

    $("cc").textContent = currentSlide + 1 + " / " + slideCount;
  }

  function resetAutoAdvance() {
    clearInterval(autoAdvance);
    autoAdvance = setInterval(function () {
      goToSlide(currentSlide + 1);
    }, 5000);
  }

  for (var index = 0; index < slideCount; index++) {
    var slide = document.createElement("div");
    slide.className = "ph sl";
    var photo = document.createElement("img");
    var photoPath = "./assets/g" + (index + 1) + ".webp";
    slide.style.setProperty("--slide-image", 'url("' + photoPath + '")');
    photo.src = photoPath;
    photo.alt = "Foto " + (index + 1);
    photo.loading = "lazy";
    slide.appendChild(photo);
    track.appendChild(slide);

    var dot = document.createElement("button");
    dot.setAttribute("aria-label", "Foto " + (index + 1));
    dot.onclick = (function (slideIndex) {
      return function () {
        goToSlide(slideIndex);
        resetAutoAdvance();
      };
    })(index);
    dots.appendChild(dot);
  }

  $("pv").onclick = function () {
    goToSlide(currentSlide - 1);
    resetAutoAdvance();
  };
  $("nx").onclick = function () {
    goToSlide(currentSlide + 1);
    resetAutoAdvance();
  };

  carousel.onkeydown = function (event) {
    if (event.key === "ArrowLeft") {
      goToSlide(currentSlide - 1);
      resetAutoAdvance();
    }
    if (event.key === "ArrowRight") {
      goToSlide(currentSlide + 1);
      resetAutoAdvance();
    }
  };

  var touchStartX = null;
  carousel.addEventListener(
    "touchstart",
    function (event) {
      touchStartX = event.touches[0].clientX;
    },
    { passive: true }
  );
  carousel.addEventListener("touchend", function (event) {
    if (touchStartX === null) {
      return;
    }

    var distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 40) {
      goToSlide(currentSlide + (distance < 0 ? 1 : -1));
      resetAutoAdvance();
    }
    touchStartX = null;
  });

  goToSlide(0);
  resetAutoAdvance();

  var commentsKey = "ab-comments";
  var comments = [
    {
      n: "Ariq",
      m: "Selamat berbahagia, semoga sakinah mawaddah warahmah!",
      h: 1,
    },
    { n: "Reza", m: "Barakallah, lancar sampai hari H.", h: 1 },
    { n: "Agus", m: "Doa terbaik untuk kalian berdua.", h: 1 },
    {
      n: "Niki",
      m: "Wah, acaranya langsung hari kemerdekaan, keren!",
      h: 1,
    },
  ];

  try {
    var savedComments = JSON.parse(localStorage.getItem(commentsKey));
    if (Array.isArray(savedComments)) {
      comments = savedComments;
    }
  } catch (error) {}

  function saveComments() {
    try {
      localStorage.setItem(commentsKey, JSON.stringify(comments));
    } catch (error) {}
  }

  function renderComments() {
    var list = $("list");
    var attendingCount = 0;
    list.textContent = "";

    comments
      .slice()
      .reverse()
      .forEach(function (comment) {
        if (comment.h) {
          attendingCount++;
        }

        var item = document.createElement("div");
        item.className = "cm";

        var avatar = document.createElement("div");
        avatar.className = "av";
        avatar.textContent = (comment.n[0] || "?").toUpperCase();

        var content = document.createElement("div");
        var name = document.createElement("b");
        name.textContent = comment.n;

        var attendance = document.createElement("em");
        attendance.textContent = comment.h ? "Hadir" : "Tidak hadir";

        var message = document.createElement("p");
        message.textContent = comment.m;

        name.appendChild(attendance);
        content.appendChild(name);
        content.appendChild(message);
        item.appendChild(avatar);
        item.appendChild(content);
        list.appendChild(item);
      });

    $("nh").textContent = attendingCount;
    $("nt").textContent = comments.length - attendingCount;
    $("stat").textContent = comments.length + " komentar";
  }

  renderComments();

  $("f").onsubmit = function (event) {
    event.preventDefault();

    var name = $("nm").value.trim();
    var message = $("tx").value.trim();
    if (!name || !message) {
      return;
    }

    comments.push({
      n: name,
      m: message,
      h: +document.querySelector('input[name=h]:checked').value,
    });
    saveComments();
    renderComments();
    $("tx").value = "";
  };

  var invitationGuestName = new URLSearchParams(window.location.search).get("to");
  if (invitationGuestName && invitationGuestName.trim()) {
    $("to").textContent = invitationGuestName.trim();
  }
})();

(function () {
  if (!document.body.classList.contains("dashboard-page")) {
    return;
  }

  var guests = [
    { id: 1, name: "Budi Santoso", category: "Keluarga", status: "Hadir", pax: 2, phone: "628123456789" },
    { id: 2, name: "Siti Nurhaliza", category: "Teman SMA", status: "Hadir", pax: 1, phone: "628987654321" },
    { id: 3, name: "Ahmad Rizky", category: "Rekan Kerja", status: "Tidak Hadir", pax: 0, phone: "" },
    { id: 5, name: "Dr. Hendra", category: "VIP", status: "Belum Konfirmasi", pax: 0, phone: "" },
  ];

  var wishes = [
    { name: "Andi Pratama", text: "Selamat ya Habib & Peby! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.", time: "10 mnt lalu" },
    { name: "Rina & Suami", text: "Selamat menempuh hidup baru. Doa terbaik untuk kalian.", time: "1 jam lalu" },
    { name: "Dito", text: "Lancar-lancar sampai hari H! Sampai ketemu di resepsi.", time: "3 jam lalu" },
  ];

  var rsvpData = [
    { id: 1, name: "Budi Santoso", status: "Hadir", count: 2, message: "Selamat untuk Habib & Peby! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah." },
    { id: 2, name: "Siti Nurhaliza", status: "Hadir", count: 1, message: "Happy wedding! Semoga bahagia selalu." },
    { id: 3, name: "Ahmad Rizky", status: "Tidak Hadir", count: 0, message: "Mohon maaf belum bisa hadir. Selamat menempuh hidup baru!" },
    { id: 5, name: "Eko Prasetyo", status: "Hadir", count: 2, message: "Selamat menempuh hidup baru!" },
  ];
  var uploadedMusicUrl = null;

  function syncGuestsWithResponses() {
    function updateGuest(name, status) {
      var normalizedName = name.trim().toLowerCase();
      if (!normalizedName) {
        return;
      }

      var guest = guests.find(function (item) {
        return item.name.trim().toLowerCase() === normalizedName;
      });
      if (guest) {
        guest.status = status;
        return;
      }

      guests.unshift({
        id: Date.now() + guests.length,
        name: name.trim(),
        category: "Lainnya",
        status: status,
        pax: 0,
        phone: "",
      });
    }

    rsvpData.forEach(function (response) {
      updateGuest(response.name, response.status);
    });

    try {
      var publicResponses = JSON.parse(localStorage.getItem("ab-comments") || "[]");
      if (Array.isArray(publicResponses)) {
        publicResponses.forEach(function (response) {
          var attendance = response ? Number(response.h) : NaN;
          if (
            response &&
            typeof response.n === "string" &&
            (attendance === 0 || attendance === 1)
          ) {
            updateGuest(response.n, attendance === 1 ? "Hadir" : "Tidak Hadir");
          }
        });
      }
    } catch (error) {
      console.error("Tidak dapat memuat RSVP dari halaman undangan.", error);
    }
  }

  function getElement(id) {
    var element = document.getElementById(id);
    if (!element) {
      throw new Error('Elemen dashboard "' + id + '" tidak ditemukan.');
    }
    return element;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[character];
    });
  }

  function getStatusBadge(status) {
    switch (status) {
      case "Hadir":
        return '<span class="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">Hadir</span>';
      case "Tidak Hadir":
        return '<span class="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-semibold">Tidak Hadir</span>';
      default:
        return '<span class="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">Belum Konfirmasi</span>';
    }
  }

  function updateDashboardStats() {
    var hadir = rsvpData
      .filter(function (entry) {
        return entry.status === "Hadir";
      })
      .reduce(function (sum, entry) {
        return sum + entry.count;
      }, 0);
    var absen = rsvpData.filter(function (entry) {
      return entry.status === "Tidak Hadir";
    });
    getElement("stat-total").textContent = rsvpData.length;
    getElement("stat-hadir").textContent = hadir;
    getElement("stat-absen").textContent = absen.length + " orang";
  }

  function renderDashboardTables() {
    getElement("dashboard-recent-wishes").innerHTML = wishes
      .slice(0, 3)
      .map(function (wish) {
        return (
          '<div class="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">' +
          '<div class="flex justify-between items-center mb-1">' +
          '<span class="font-bold text-gray-700">' + escapeHtml(wish.name) + "</span>" +
          '<span class="text-gray-400">' + escapeHtml(wish.time) + "</span>" +
          "</div>" +
          '<p class="text-gray-600">' + escapeHtml(wish.text) + "</p>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderGuestList() {
    var search = getElement("search-guest").value.trim().toLowerCase();
    var filter = getElement("filter-status").value;
    var filtered = guests.filter(function (guest) {
      return (
        guest.name.toLowerCase().includes(search) &&
        (filter === "ALL" || guest.status === filter)
      );
    });
    var body = getElement("guest-table-body");

    if (!filtered.length) {
      body.innerHTML =
        '<tr><td colspan="3" class="p-4 text-center text-gray-400">Tamu tidak ditemukan</td></tr>';
      return;
    }

    body.innerHTML = filtered
      .map(function (guest) {
        return (
          '<tr class="hover:bg-gray-50/50">' +
          '<td class="p-3 font-medium text-gray-800">' + escapeHtml(guest.name) + "</td>" +
          '<td class="p-3 text-gray-500">' + escapeHtml(guest.category) + "</td>" +
          '<td class="p-3">' + getStatusBadge(guest.status) + "</td></tr>"
        );
      })
      .join("");
  }

  function switchTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(function (section) {
      section.classList.add("hidden");
    });
    var activeSection = document.getElementById("tab-" + tabId);
    if (!activeSection) {
      return;
    }
    activeSection.classList.remove("hidden");

    document
      .querySelectorAll("#sidebar-nav button")
      .forEach(function (button) {
        button.classList.remove("active-tab");
      });
    var activeButton = document.getElementById("nav-" + tabId);
    if (activeButton) {
      activeButton.classList.add("active-tab");
    }
    var titles = {
      dashboard: "Dashboard Utama",
      rsvp: "Data RSVP & Ucapan",
      amplop: "Amplop Digital",
      pengantin: "Edit Nama Pengantin",
      musik: "Pengaturan Musik",
      settings: "Pengaturan Web Undangan",
    };
    getElement("header-title").textContent = titles[tabId] || "Dashboard";
  }

  function toggleMobileMenu() {
    getElement("mobile-menu").classList.toggle("hidden");
  }

  function showToast(message) {
    var toast = getElement("toast");
    getElement("toast-message").textContent = message;
    toast.classList.remove("translate-y-20", "opacity-0");
    window.setTimeout(function () {
      toast.classList.add("translate-y-20", "opacity-0");
    }, 3000);
  }

  function getRsvpBadge(status) {
    if (status === "Hadir") {
      return '<span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">Hadir</span>';
    }
    if (status === "Tidak Hadir") {
      return '<span class="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-semibold">Tidak Hadir</span>';
    }
    return '<span class="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">Belum RSVP</span>';
  }

  function renderRsvpList() {
    var search = getElement("rsvp-search").value.trim().toLowerCase();
    var filter = getElement("rsvp-filter").value;
    var filtered = rsvpData.filter(function (entry) {
      var matchesSearch =
        entry.name.toLowerCase().includes(search) ||
        entry.message.toLowerCase().includes(search);
      return matchesSearch && (filter === "all" || entry.status === filter);
    });

    var body = getElement("rsvp-table-body");
    if (!filtered.length) {
      body.innerHTML =
        '<tr><td colspan="4" class="p-4 text-center text-gray-400">Tidak ada data RSVP ditemukan</td></tr>';
      return;
    }

    body.innerHTML = filtered
      .map(function (entry) {
        return (
          "<tr>" +
          '<td class="p-3 font-semibold text-gray-800">' + escapeHtml(entry.name) + "</td>" +
          '<td class="p-3">' + getRsvpBadge(entry.status) + "</td>" +
          '<td class="p-3 text-gray-600">' + escapeHtml(entry.message) + "</td>" +
          '<td class="p-3 text-center"><button type="button" data-delete-rsvp="' +
          entry.id +
          '" class="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100">Hapus</button></td>' +
          "</tr>"
        );
      })
      .join("");

    body.querySelectorAll("[data-delete-rsvp]").forEach(function (button) {
      button.addEventListener("click", function () {
        var id = Number(button.dataset.deleteRsvp);
        var entry = rsvpData.find(function (item) {
          return item.id === id;
        });
        if (!entry || !window.confirm("Hapus RSVP dari " + entry.name + "?")) {
          return;
        }
        rsvpData = rsvpData.filter(function (item) {
          return item.id !== id;
        });
        renderRsvpList();
        updateDashboardStats();
      });
    });
  }

  function updateQrPreview() {
    var type = getElement("qr-type").value;
    var title = getElement("qr-title").value.trim();
    var value = getElement("qr-value").value.trim();
    var note = getElement("qr-note").value.trim();
    var isWhatsApp = type === "wa";
    var content = isWhatsApp ? "https://wa.me/" + value.replace(/\D/g, "") : value;

    getElement("qr-preview-type").textContent = isWhatsApp
      ? "Konfirmasi WhatsApp"
      : "Amplop Digital";
    getElement("qr-preview-description").textContent = isWhatsApp
      ? "Scan QR untuk menghubungi WhatsApp admin."
      : "Scan QR untuk melihat informasi hadiah digital.";
    getElement("qr-preview-title").textContent = title || "Judul QR";
    getElement("qr-preview-value").textContent = value || "Nomor belum diisi";
    getElement("qr-preview-note").textContent = note;

    var container = getElement("qr-code");
    container.replaceChildren();
    if (!content) {
      container.textContent = "Isi nomor untuk membuat QR.";
      return;
    }
    if (typeof window.QRCode === "undefined") {
      container.textContent = "Pustaka QR belum dapat dimuat.";
      return;
    }
    new window.QRCode(container, {
      text: content,
      width: 144,
      height: 144,
      colorDark: "#6e1b2a",
      colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel.H,
    });
  }

  function updateCouplePreview() {
    var groomNickname = getElement("groom-nickname").value.trim() || "Habib";
    var brideNickname = getElement("bride-nickname").value.trim() || "Peby";
    getElement("couple-preview-title").textContent =
      groomNickname + " & " + brideNickname;
    getElement("groom-preview-name").textContent =
      getElement("groom-fullname").value.trim();
    getElement("groom-preview-parents").textContent =
      getElement("groom-parents").value.trim();
    getElement("bride-preview-name").textContent =
      getElement("bride-fullname").value.trim();
    getElement("bride-preview-parents").textContent =
      getElement("bride-parents").value.trim();
  }

  function saveCouplePreview() {
    updateCouplePreview();
    showToast("Pratinjau mempelai diperbarui. Belum diterapkan ke undangan publik.");
  }

  function previewEventSettings() {
    var couple = getElement("event-couple").value.trim();
    var location = getElement("event-location").value.trim();
    var akadDate = formatEventDate(getElement("event-akad-date").value);
    var resepsiDate = formatEventDate(getElement("event-resepsi-date").value);
    var akadTime = getElement("event-akad-time").value.trim();
    var resepsiTime = getElement("event-resepsi-time").value.trim();
    var intro = getElement("event-intro").value.trim();
    var feedback = getElement("event-settings-feedback");
    getElement("event-preview-couple").textContent = couple || "Nama mempelai";
    getElement("event-preview-akad").textContent =
      "Akad: " + akadDate + (akadTime ? " · " + akadTime : "");
    getElement("event-preview-resepsi").textContent =
      "Resepsi: " + resepsiDate + (resepsiTime ? " · " + resepsiTime : "");
    getElement("event-preview-location").textContent =
      location || "Lokasi belum diisi";
    getElement("event-preview-intro").textContent =
      intro || "Kata pengantar belum diisi";
    feedback.textContent =
      "Pratinjau diperbarui di browser ini. Perubahan belum disimpan atau diterapkan ke undangan publik.";
    showToast("Pratinjau acara diperbarui.");
  }

  function formatEventDate(value) {
    if (!value) {
      return "Tanggal belum dipilih";
    }
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value + "T12:00:00"));
  }

  function previewPresetMusic() {
    if (uploadedMusicUrl) {
      URL.revokeObjectURL(uploadedMusicUrl);
      uploadedMusicUrl = null;
    }
    var select = getElement("music-preset");
    getElement("music-player").src = select.value;
    getElement("music-preview-title").textContent =
      select.options[select.selectedIndex].text;
    getElement("music-preview-message").textContent =
      "Memutar contoh lagu yang tersedia di proyek; belum diterapkan ke undangan publik.";
  }

  function previewUploadedMusic(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("audio/")) {
      event.target.value = "";
      showToast("Pilih file audio yang valid.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      event.target.value = "";
      showToast("Ukuran file audio maksimal 10 MB.");
      return;
    }
    if (uploadedMusicUrl) {
      URL.revokeObjectURL(uploadedMusicUrl);
    }
    uploadedMusicUrl = URL.createObjectURL(file);
    getElement("music-player").src = uploadedMusicUrl;
    getElement("music-preview-title").textContent = file.name;
    getElement("music-preview-message").textContent =
      "File lokal diputar sebagai pratinjau saja; tidak diunggah atau disimpan.";
  }

  function copyLink(name) {
    var invitationUrl = new URL("index.html", window.location.href);
    invitationUrl.searchParams.set("to", name);

    navigator.clipboard.writeText(invitationUrl.href).then(
      function () {
        showToast("Link undangan berhasil disalin!");
      },
      function (error) {
        console.error("Tidak dapat menyalin link undangan.", error);
        window.prompt("Salin link undangan secara manual:", invitationUrl.href);
      }
    );
  }

  function openAddGuestModal() {
    getElement("modal-add-guest").classList.remove("hidden");
  }

  function closeAddGuestModal() {
    getElement("modal-add-guest").classList.add("hidden");
  }

  function handleAddGuest(event) {
    event.preventDefault();
    var name = getElement("input-guest-name").value.trim();
    var phone = getElement("input-guest-phone").value.trim().replace(/\D/g, "");
    guests.unshift({
      id: Date.now(),
      name: name,
      category: getElement("input-guest-category").value,
      status: "Belum Konfirmasi",
      pax: 0,
      phone: phone.startsWith("0") ? "62" + phone.slice(1) : phone,
    });

    updateDashboardStats();
    renderDashboardTables();
    renderGuestList();
    closeAddGuestModal();
    showToast(name + " berhasil ditambahkan.");
    getElement("form-add-guest").reset();
  }

  window.switchTab = switchTab;
  window.toggleMobileMenu = toggleMobileMenu;
  window.showToast = showToast;
  window.renderGuestList = renderGuestList;
  window.renderRsvpList = renderRsvpList;
  window.updateQrPreview = updateQrPreview;
  window.updateCouplePreview = updateCouplePreview;
  window.saveCouplePreview = saveCouplePreview;
  window.previewEventSettings = previewEventSettings;
  window.previewPresetMusic = previewPresetMusic;
  window.previewUploadedMusic = previewUploadedMusic;
  window.openAddGuestModal = openAddGuestModal;
  window.closeAddGuestModal = closeAddGuestModal;
  window.handleAddGuest = handleAddGuest;

  if (typeof window.lucide === "undefined") {
    throw new Error("Lucide Icons gagal dimuat untuk dashboard.");
  }

  lucide.createIcons();
  syncGuestsWithResponses();
  renderRsvpList();
  updateQrPreview();
  updateCouplePreview();
  previewPresetMusic();
  updateDashboardStats();
  renderDashboardTables();
  renderGuestList();
})();
