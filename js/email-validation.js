(function () {
  "use strict";

  var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var DEBOUNCE_MS = 250;

  function debounce(fn, wait) {
    var timeoutId;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () {
        fn.apply(ctx, args);
      }, wait);
    };
  }

  function initEmailValidation() {
    var form = document.getElementById("changeEmailForm");
    var input = document.getElementById("email");
    var wrapper = document.getElementById("emailFieldWrapper");
    var errorEl = document.getElementById("emailError");

    if (!form || !input || !wrapper || !errorEl) return;

    function setBorderState(state) {
      wrapper.classList.remove("is-valid", "is-invalid");
      if (state === "valid") {
        wrapper.classList.add("is-valid");
      } else if (state === "invalid") {
        wrapper.classList.add("is-invalid");
      }
    }

    function isValidEmail() {
      var value = input.value.trim();
      return value !== "" && EMAIL_REGEX.test(value);
    }

    function updateBorder() {
      var value = input.value.trim();
      if (!value) {
        setBorderState("neutral");
      } else {
        setBorderState(isValidEmail() ? "valid" : "invalid");
      }
      errorEl.style.display = "none";
    }

    input.addEventListener("input", debounce(updateBorder, DEBOUNCE_MS));
    input.addEventListener("blur", updateBorder);

    form.addEventListener("submit", function (e) {
      if (!isValidEmail()) {
        e.preventDefault();
        setBorderState("invalid");
        errorEl.style.display = "block";
        input.focus();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEmailValidation);
  } else {
    initEmailValidation();
  }
})();
