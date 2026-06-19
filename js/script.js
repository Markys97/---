(function () {
  "use strict";

  var burgerBtn = document.getElementById("burgerBtn");
  var menuCloseBtn = document.getElementById("menuCloseBtn");
  var menuPanel = document.getElementById("menuPanel");
  var menuBackdrop = document.getElementById("menuBackdrop");
  var menuLinks = document.querySelectorAll("[data-menu-link]");

  function openMenu() {
    menuPanel.classList.add("is-open");
    menuBackdrop.classList.add("is-open");
  }

  function closeMenu() {
    menuPanel.classList.remove("is-open");
    menuBackdrop.classList.remove("is-open");
  }

  burgerBtn.addEventListener("click", openMenu);
  menuCloseBtn.addEventListener("click", closeMenu);
  menuBackdrop.addEventListener("click", closeMenu);
  menuLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  var contactForm = document.getElementById("contactForm");
  var contactSuccess = document.getElementById("contactSuccess");
  var contactFormError = document.getElementById("contactFormError");
  var contactSubmitBtn = contactForm.querySelector(".contact-form__submit");
  var nameInput = contactForm.querySelector('input[name="name"]');
  var phoneInput = contactForm.querySelector('input[name="phone"]');

  var PHONE_HINT = "Введите номер телефона в российском формате, например +7 (965) 068-48-74.";

  var SERVER_ERROR_MESSAGES = {
    missing_fields: "Заполните имя и телефон.",
    invalid_phone: PHONE_HINT,
    fields_too_long: "Слишком длинный текст в одном из полей.",
    mail_failed: "Не удалось отправить письмо. Попробуйте ещё раз или позвоните нам напрямую.",
    method_not_allowed: "Техническая ошибка. Позвоните нам напрямую.",
  };
  var DEFAULT_ERROR_MESSAGE = "Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам напрямую.";

  // Принимает номер в любом написании (пробелы, скобки, дефисы, с +7/8 или
  // без) и возвращает канонический +7XXXXXXXXXX, либо null. Должна совпадать
  // по логике с normalizeRussianPhone() в php/send.php.
  function normalizeRussianPhone(raw) {
    var digits = (raw || "").replace(/\D/g, "");
    if (digits.length === 11 && (digits.charAt(0) === "7" || digits.charAt(0) === "8")) {
      return "+7" + digits.slice(1);
    }
    if (digits.length === 10 && digits.charAt(0) !== "0") {
      return "+7" + digits;
    }
    return null;
  }

  function showError(message, invalidInput) {
    contactFormError.textContent = message;
    contactFormError.classList.remove("is-hidden");
    if (invalidInput) {
      invalidInput.classList.add("is-invalid");
      invalidInput.focus();
    }
  }

  function clearErrors() {
    contactFormError.classList.add("is-hidden");
    nameInput.classList.remove("is-invalid");
    phoneInput.classList.remove("is-invalid");
  }

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();

    var name = (nameInput.value || "").trim();
    var normalizedPhone = normalizeRussianPhone(phoneInput.value);

    if (!name) {
      showError("Введите ваше имя.", nameInput);
      return;
    }
    if (!normalizedPhone) {
      showError(PHONE_HINT, phoneInput);
      return;
    }

    phoneInput.value = normalizedPhone;
    contactSubmitBtn.disabled = true;

    fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { Accept: "application/json" },
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok || !data.ok) {
            throw new Error(SERVER_ERROR_MESSAGES[data.error] || DEFAULT_ERROR_MESSAGE);
          }
        });
      })
      .then(function () {
        contactForm.classList.add("is-hidden");
        contactSuccess.classList.remove("is-hidden");
      })
      .catch(function (err) {
        showError(err.message || DEFAULT_ERROR_MESSAGE, null);
        contactSubmitBtn.disabled = false;
      });
  });

  var header = document.querySelector(".site-header");
  function onScroll() {
    if (window.scrollY > 8) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty("--reveal-i", Math.min(i, 6));
      revealEls.push(child);
    });
  });

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
