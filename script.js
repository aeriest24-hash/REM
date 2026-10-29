(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-nav");

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
      navigation.classList.remove("is-open");
    }
  });

  const weddingAudio = document.querySelector("#wedding-audio");
  const musicToggle = document.querySelector("#music-toggle");
  weddingAudio.volume = 0.65;

  function updateMusicToggle() {
    const isPlaying = !weddingAudio.paused;
    musicToggle.textContent = isPlaying ? "♫ Music on" : "♫ Play music";
    musicToggle.setAttribute("aria-label", isPlaying ? "Pause wedding music" : "Play wedding music");
    musicToggle.setAttribute("aria-pressed", String(isPlaying));
  }

  musicToggle.addEventListener("click", async () => {
    if (!weddingAudio.paused) {
      weddingAudio.pause();
      return;
    }

    try {
      await weddingAudio.play();
    } catch (error) {
      musicToggle.textContent = "♫ Music unavailable";
      musicToggle.setAttribute("aria-label", "Wedding music could not be played");
      console.error("Unable to play wedding music.", error);
    }
  });
  weddingAudio.addEventListener("play", updateMusicToggle);
  weddingAudio.addEventListener("pause", updateMusicToggle);
  weddingAudio.addEventListener("error", () => {
    musicToggle.textContent = "♫ Music unavailable";
    musicToggle.setAttribute("aria-label", "Wedding music could not be loaded");
    console.error("Unable to load wedding music.", weddingAudio.error);
  });
  weddingAudio.play().catch(() => {
    updateMusicToggle();
  });

  const targetDate = new Date(
    WEDDING_CONFIG.date.year,
    WEDDING_CONFIG.date.month,
    WEDDING_CONFIG.date.day,
    0, 0, 0, 0,
  );
  const countdownUnits = {
    days: document.querySelector("#days"),
    hours: document.querySelector("#hours"),
    minutes: document.querySelector("#minutes"),
    seconds: document.querySelector("#seconds"),
  };
  const finishedMessage = document.querySelector("#countdown-finished");

  let countdownTimer;

  function updateCountdown() {
    const remaining = Math.max(0, targetDate.getTime() - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    countdownUnits.days.textContent = String(Math.floor(totalSeconds / 86400)).padStart(3, "0");
    countdownUnits.hours.textContent = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0");
    countdownUnits.minutes.textContent = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    countdownUnits.seconds.textContent = String(totalSeconds % 60).padStart(2, "0");

    if (remaining === 0) {
      finishedMessage.hidden = false;
      if (countdownTimer) window.clearInterval(countdownTimer);
    }
  }

  updateCountdown();
  if (targetDate.getTime() > Date.now()) {
    countdownTimer = window.setInterval(updateCountdown, 1000);
  }

  const monthName = targetDate.toLocaleString(undefined, { month: "long" });
  const fullDate = `${monthName} ${WEDDING_CONFIG.date.day}, ${WEDDING_CONFIG.date.year}`;
  const coupleTitle = `${WEDDING_CONFIG.couple} | Wedding Invitation`;
  const invitationDescription = `Join ${WEDDING_CONFIG.couple} as they celebrate their wedding on ${fullDate}. Explore the invitation, wedding details, families, gallery, and RSVP.`;
  document.title = coupleTitle;
  document.querySelector('meta[property="og:title"]').content = coupleTitle;
  document.querySelector('meta[name="description"]').content = invitationDescription;
  document.querySelector('meta[property="og:description"]').content = invitationDescription;
  document.querySelector("#couple-name").textContent = WEDDING_CONFIG.couple;
  document.querySelector("#closing-couple-name").textContent = WEDDING_CONFIG.couple;
  document.querySelector("#hero-date").textContent = `${monthName} ${WEDDING_CONFIG.date.day} · ${WEDDING_CONFIG.date.year}`;
  document.querySelectorAll(".wedding-date").forEach((element) => { element.textContent = fullDate; });
  document.querySelector("#ceremony-venue").textContent = WEDDING_CONFIG.ceremony.venue;
  document.querySelector("#reception-venue").textContent = WEDDING_CONFIG.reception.venue;
  document.querySelector('[data-location="ceremony"]').href = WEDDING_CONFIG.ceremony.mapsUrl;
  document.querySelector('[data-location="reception"]').href = WEDDING_CONFIG.reception.mapsUrl;

  document.querySelector("#groom-parent-one").textContent = WEDDING_CONFIG.families.groom[0];
  document.querySelector("#groom-parent-two").textContent = WEDDING_CONFIG.families.groom[1];
  document.querySelector("#bride-parent-one").textContent = WEDDING_CONFIG.families.bride[0];
  document.querySelector("#bride-parent-two").textContent = WEDDING_CONFIG.families.bride[1];

  const entourageGrid = document.querySelector("#entourage-grid");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  WEDDING_CONFIG.entourage.forEach((group, groupIndex) => {
    const card = document.createElement("article");
    card.className = `entourage-card${group.featured ? " entourage-featured" : ""}`;
    card.setAttribute("role", "group");
    card.setAttribute("aria-roledescription", "slide");
    card.setAttribute("aria-label", `${groupIndex + 1} of ${WEDDING_CONFIG.entourage.length}`);

    const heading = document.createElement("div");
    heading.className = "entourage-card-heading";
    const role = document.createElement("div");
    role.className = "entourage-role";
    const title = document.createElement("h3");
    title.textContent = group.title;
    role.append(title);
    heading.append(role);

    const divider = document.createElement("span");
    divider.className = "mini-divider";
    divider.setAttribute("aria-hidden", "true");
    const memberList = document.createElement("ul");
    memberList.className = "entourage-member-list";
    memberList.setAttribute("aria-label", `${group.title} members`);
    group.names.forEach((name) => {
      const listItem = document.createElement("li");
      listItem.textContent = name;
      memberList.append(listItem);
    });
    card.append(heading, divider, memberList);

    entourageGrid.append(card);
  });

  const entourageCarousel = document.querySelector("#entourage-carousel");
  const entourageCards = [...entourageGrid.children];
  const entourageCounter = document.querySelector("#entourage-counter");
  const entourageToggle = document.querySelector("#entourage-toggle");
  let entourageIndex = 0;
  let entouragePlaying = !prefersReducedMotion;
  let entouragePaused = false;
  let entourageTimer;

  function showEntouragePanel(index) {
    entourageIndex = (index + entourageCards.length) % entourageCards.length;
    entourageGrid.style.transform = `translateX(-${entourageIndex * 100}%)`;
    entourageCounter.textContent = entourageCards[entourageIndex].querySelector("h3").textContent;
    entourageCards.forEach((card, cardIndex) => {
      card.setAttribute("aria-label", `${cardIndex + 1} of ${entourageCards.length}`);
      card.setAttribute("aria-hidden", String(cardIndex !== entourageIndex));
      card.inert = cardIndex !== entourageIndex;
    });
  }

  function updateEntouragePlayback() {
    window.clearInterval(entourageTimer);
    entourageToggle.textContent = entouragePlaying ? "Ⅱ" : "▶";
    entourageToggle.setAttribute("aria-label", `${entouragePlaying ? "Pause" : "Play"} entourage carousel`);
    if (entouragePlaying && !entouragePaused && document.visibilityState === "visible") {
      entourageTimer = window.setInterval(() => showEntouragePanel(entourageIndex + 1), 6500);
    }
  }

  document.querySelector("#entourage-previous").addEventListener("click", () => showEntouragePanel(entourageIndex - 1));
  document.querySelector("#entourage-next").addEventListener("click", () => showEntouragePanel(entourageIndex + 1));
  entourageToggle.addEventListener("click", () => {
    entouragePlaying = !entouragePlaying;
    updateEntouragePlayback();
  });
  entourageCarousel.addEventListener("pointerenter", () => {
    entouragePaused = true;
    updateEntouragePlayback();
  });
  entourageCarousel.addEventListener("pointerleave", () => {
    entouragePaused = false;
    updateEntouragePlayback();
  });
  entourageCarousel.addEventListener("focusin", () => {
    entouragePaused = true;
    updateEntouragePlayback();
  });
  entourageCarousel.addEventListener("focusout", (event) => {
    if (!entourageCarousel.contains(event.relatedTarget)) {
      entouragePaused = false;
      updateEntouragePlayback();
    }
  });
  showEntouragePanel(0);
  updateEntouragePlayback();

  document.addEventListener("visibilitychange", updateEntouragePlayback);

  const galleryGrid = document.querySelector("#gallery-grid");
  const galleryCarousel = document.querySelector("#gallery-carousel");
  const galleryCounter = document.querySelector("#gallery-counter");
  const galleryToggle = document.querySelector("#gallery-toggle");
  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");
  const lightboxCaption = document.querySelector("#lightbox-caption");
  const gallerySlides = [];
  let galleryIndex = 0;
  let galleryPlaying = !prefersReducedMotion;
  let galleryPaused = false;
  let galleryTimer;
  let activeImageIndex = 0;

  function showGallerySlide(index) {
    galleryIndex = (index + WEDDING_CONFIG.gallery.length) % WEDDING_CONFIG.gallery.length;
    galleryGrid.style.transform = `translateX(-${galleryIndex * 100}%)`;
    galleryCounter.textContent = `${String(galleryIndex + 1).padStart(2, "0")} / ${String(gallerySlides.length).padStart(2, "0")}`;
    gallerySlides.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", String(slideIndex !== galleryIndex));
      slide.inert = slideIndex !== galleryIndex;
    });
  }

  function updateGalleryPlayback() {
    window.clearInterval(galleryTimer);
    galleryToggle.textContent = galleryPlaying ? "Ⅱ" : "▶";
    galleryToggle.setAttribute("aria-label", `${galleryPlaying ? "Pause" : "Play"} photo carousel`);
    if (galleryPlaying && !galleryPaused && !lightbox.open && document.visibilityState === "visible") {
      galleryTimer = window.setInterval(() => showGallerySlide(galleryIndex + 1), 6500);
    }
  }

  function showLightboxImage(index) {
    activeImageIndex = (index + WEDDING_CONFIG.gallery.length) % WEDDING_CONFIG.gallery.length;
    showGallerySlide(activeImageIndex);
    const image = WEDDING_CONFIG.gallery[activeImageIndex];
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.label;
  }

  WEDDING_CONFIG.gallery.forEach((image, index) => {
    const button = document.createElement("button");
    button.className = "gallery-item photo-fallback";
    button.type = "button";
    button.setAttribute("aria-label", `Open photo ${index + 1} of ${WEDDING_CONFIG.gallery.length}: ${image.label}`);
    button.setAttribute("aria-roledescription", "slide");

    const photo = document.createElement("img");
    photo.src = image.src;
    photo.alt = image.alt;
    photo.loading = index === 0 ? "eager" : "lazy";
    photo.decoding = "async";
    const caption = document.createElement("span");
    caption.className = "gallery-caption";
    caption.textContent = image.label;

    photo.addEventListener("error", () => button.classList.add("image-unavailable"));
    button.addEventListener("click", () => {
      showLightboxImage(index);
      lightbox.showModal();
      updateGalleryPlayback();
    });
    button.append(photo, caption);
    galleryGrid.append(button);
    gallerySlides.push(button);
  });

  document.querySelector("#gallery-previous").addEventListener("click", () => showGallerySlide(galleryIndex - 1));
  document.querySelector("#gallery-next").addEventListener("click", () => showGallerySlide(galleryIndex + 1));
  galleryToggle.addEventListener("click", () => {
    galleryPlaying = !galleryPlaying;
    updateGalleryPlayback();
  });
  galleryCarousel.addEventListener("pointerenter", () => {
    galleryPaused = true;
    updateGalleryPlayback();
  });
  galleryCarousel.addEventListener("pointerleave", () => {
    galleryPaused = false;
    updateGalleryPlayback();
  });
  galleryCarousel.addEventListener("focusin", () => {
    galleryPaused = true;
    updateGalleryPlayback();
  });
  galleryCarousel.addEventListener("focusout", (event) => {
    if (!galleryCarousel.contains(event.relatedTarget)) {
      galleryPaused = false;
      updateGalleryPlayback();
    }
  });
  document.querySelector("#gallery-counter").textContent = `01 / ${String(gallerySlides.length).padStart(2, "0")}`;
  showGallerySlide(0);
  updateGalleryPlayback();
  document.addEventListener("visibilitychange", updateGalleryPlayback);
  lightbox.addEventListener("close", updateGalleryPlayback);

  document.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  document.querySelector(".lightbox-prev").addEventListener("click", () => showLightboxImage(activeImageIndex - 1));
  document.querySelector(".lightbox-next").addEventListener("click", () => showLightboxImage(activeImageIndex + 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showLightboxImage(activeImageIndex - 1);
    if (event.key === "ArrowRight") showLightboxImage(activeImageIndex + 1);
    if (event.key === "Escape") lightbox.close();
  });

  const rsvpStatus = document.querySelector("#rsvp-status");
  const rsvpFormWrap = document.querySelector("#rsvp-form-wrap");
  const rsvpForm = document.querySelector("#rsvp-google-form");
  const isRsvpConfigured = RSVP_GOOGLE_FORM_URL && !RSVP_GOOGLE_FORM_URL.includes("PASTE_YOUR_GOOGLE_FORM_LINK_HERE");
  if (isRsvpConfigured) {
    rsvpForm.src = RSVP_GOOGLE_FORM_URL;
  } else {
    rsvpFormWrap.hidden = true;
    rsvpStatus.hidden = false;
  }

  document.querySelectorAll(".hero-photo img").forEach((image) => {
    image.addEventListener("error", () => image.closest(".photo-fallback").classList.add("image-unavailable"));
  });

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    document.documentElement.classList.add("js-enabled");
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal, .entourage-card").forEach((element) => revealObserver.observe(element));
  }
})();
