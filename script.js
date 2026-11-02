(function () {
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
