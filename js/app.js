/**
 * ContextForge Application Logic
 * Interactive IDE Terminal Player, Modal Controller, Clipboard Copy, and Toasts
 */

document.addEventListener("DOMContentLoaded", () => {
  initIdePlayer();
  initStarterKit();
  initModals();
  initSmoothScroll();
  initMobileNav();
});

/* ==========================================================================
   1. Interactive IDE Terminal Player
   ========================================================================== */
function initIdePlayer() {
  const steps = COURSE_DATA.ideSteps;
  if (!steps || !steps.length) return;

  let currentStepIdx = 0;
  let isPlaying = true;
  let timer = null;
  const STEP_DURATION = 4200; // ms per step
  let progressStart = Date.now();
  let progressRaf = null;

  // DOM Elements
  const tabsContainer = document.getElementById("ide-step-tabs");
  const stepNumEl = document.getElementById("ide-step-num");
  const stepTitleEl = document.getElementById("ide-step-title");
  const stepDescEl = document.getElementById("ide-step-desc");
  const termCmdEl = document.getElementById("ide-term-cmd");
  const fileTabEl = document.getElementById("ide-active-file");
  const codeBlockEl = document.getElementById("ide-code-content");
  const statusTextEl = document.getElementById("ide-status-text");
  const statusBadgeEl = document.getElementById("ide-status-badge");
  const playPauseBtn = document.getElementById("ide-play-pause-btn");
  const nextBtn = document.getElementById("ide-next-btn");
  const prevBtn = document.getElementById("ide-prev-btn");
  const progressBar = document.getElementById("ide-progress-fill");

  if (!tabsContainer || !codeBlockEl) return;

  // Render Tabs
  tabsContainer.innerHTML = steps.map((s, idx) => `
    <button class="ide-tab-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}" aria-label="Шаг ${s.number}: ${s.title}">
      <span class="mono">${s.number}</span>
      <span>${s.title.split(' ')[0]}</span>
    </button>
  `).join("");

  const tabBtns = tabsContainer.querySelectorAll(".ide-tab-btn");

  function renderStep(idx) {
    const s = steps[idx];
    currentStepIdx = idx;

    // Update active tab
    tabBtns.forEach((btn, i) => {
      btn.classList.toggle("active", i === idx);
    });

    // Update step info
    if (stepNumEl) stepNumEl.textContent = `Шаг ${s.number} из 05 • ${s.badge}`;
    if (stepTitleEl) stepTitleEl.textContent = s.title;
    if (stepDescEl) stepDescEl.textContent = s.subtitle;
    if (termCmdEl) termCmdEl.textContent = `$ ${s.terminalCmd}`;
    if (fileTabEl) fileTabEl.textContent = s.fileTab;
    if (codeBlockEl) codeBlockEl.textContent = s.code;
    if (statusTextEl) statusTextEl.innerHTML = `<span class="pulse-dot"></span> ${s.status}`;
    if (statusBadgeEl) statusBadgeEl.textContent = s.badge;

    // Reset progress
    progressStart = Date.now();
  }

  function advanceStep() {
    const nextIdx = (currentStepIdx + 1) % steps.length;
    renderStep(nextIdx);
  }

  function startAutoplay() {
    isPlaying = true;
    if (playPauseBtn) {
      playPauseBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      `;
      playPauseBtn.setAttribute("aria-label", "Пауза демонстрации");
    }

    clearInterval(timer);
    timer = setInterval(advanceStep, STEP_DURATION);
    animateProgressBar();
  }

  function pauseAutoplay() {
    isPlaying = false;
    clearInterval(timer);
    cancelAnimationFrame(progressRaf);
    if (progressBar) progressBar.style.width = "0%";
    if (playPauseBtn) {
      playPauseBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;
      playPauseBtn.setAttribute("aria-label", "Запустить демонстрацию");
    }
  }

  function animateProgressBar() {
    if (!isPlaying || !progressBar) return;
    const elapsed = Date.now() - progressStart;
    const pct = Math.min(100, (elapsed / STEP_DURATION) * 100);
    progressBar.style.width = `${pct}%`;

    if (pct < 100) {
      progressRaf = requestAnimationFrame(animateProgressBar);
    } else {
      progressStart = Date.now();
      progressRaf = requestAnimationFrame(animateProgressBar);
    }
  }

  // Event Listeners for IDE
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      pauseAutoplay();
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      renderStep(idx);
    });
  });

  if (playPauseBtn) {
    playPauseBtn.addEventListener("click", () => {
      if (isPlaying) pauseAutoplay();
      else startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      pauseAutoplay();
      renderStep((currentStepIdx + 1) % steps.length);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      pauseAutoplay();
      renderStep((currentStepIdx - 1 + steps.length) % steps.length);
    });
  }

  // Initial render & check prefers-reduced-motion
  renderStep(0);
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!mediaQuery.matches) {
    startAutoplay();
  } else {
    pauseAutoplay();
  }
}

/* ==========================================================================
   2. Starter Kit & Clipboard Copy
   ========================================================================== */
function initStarterKit() {
  const codeBody = document.getElementById("starter-rules-code");
  const copyBtn = document.getElementById("starter-copy-btn");

  if (codeBody && COURSE_DATA.cursorrulesSample) {
    codeBody.textContent = COURSE_DATA.cursorrulesSample;
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(COURSE_DATA.cursorrulesSample);
        showToast("✓ Конфигурация .cursorrules скопирована в буфер!");
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = `<span>✓ Скопировано</span>`;
        copyBtn.style.color = "var(--accent-code)";
        setTimeout(() => {
          copyBtn.innerHTML = originalHtml;
          copyBtn.style.color = "";
        }, 2500);
      } catch (err) {
        showToast("Выделите текст и нажмите Ctrl+C для копирования");
      }
    });
  }
}

/* ==========================================================================
   3. Modal Controllers
   ========================================================================== */
function initModals() {
  const workshopModal = document.getElementById("modal-workshop");
  const legalModal = document.getElementById("modal-legal");
  const openWorkshopBtns = document.querySelectorAll("[data-open-modal='workshop']");
  const openLegalBtns = document.querySelectorAll("[data-open-modal='legal']");
  const closeBtns = document.querySelectorAll(".modal-close-btn, [data-modal-close]");

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const firstInput = modal.querySelector("input, button");
    if (firstInput) firstInput.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openWorkshopBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(workshopModal);
    });
  });

  openLegalBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(legalModal);
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      closeModal(workshopModal);
      closeModal(legalModal);
    });
  });

  // Close on outside click
  [workshopModal, legalModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal(workshopModal);
      closeModal(legalModal);
    }
  });

  // Workshop Form submission handling (Demo mode safe)
  const workshopForm = document.getElementById("workshop-form");
  if (workshopForm) {
    workshopForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = workshopForm.querySelector("input[type='email']");
      const email = emailInput ? emailInput.value : "";
      
      // Showcase success state
      workshopForm.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem;">
          <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--accent-glow); color: var(--accent-primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem;">✓</div>
          <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Приглашение отправлено!</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem;">
            Ссылка на 40-минутный воркшоп и репозиторий с шаблонами высланы на <strong>${email || 'ваш email'}</strong>.
          </p>
          <button type="button" class="btn btn-secondary" data-modal-close style="width: 100%;">Закрыть окно</button>
        </div>
      `;

      const newCloseBtn = workshopForm.querySelector("[data-modal-close]");
      if (newCloseBtn) {
        newCloseBtn.addEventListener("click", () => closeModal(workshopModal));
      }

      showToast("✓ Доступ к материалам воркшопа открыт!");
    });
  }
}

/* ==========================================================================
   4. Toast System
   ========================================================================== */
function showToast(message) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Remove after 3.5s
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ==========================================================================
   5. Smooth Scroll & Mobile Nav
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === "#" || targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile drawer if open
        const mobileDrawer = document.getElementById("mobile-drawer");
        if (mobileDrawer && mobileDrawer.classList.contains("active")) {
          mobileDrawer.classList.remove("active");
        }
      }
    });
  });
}

function initMobileNav() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const mobileDrawer = document.getElementById("mobile-drawer");

  if (toggleBtn && mobileDrawer) {
    toggleBtn.addEventListener("click", () => {
      mobileDrawer.classList.toggle("active");
    });
  }
}
