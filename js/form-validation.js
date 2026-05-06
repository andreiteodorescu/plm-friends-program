(function () {
  "use strict";

  var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var DEBOUNCE_MS = 250;
  var FORM_ID = "changeEmailForm";
  var FIELD_WRAPPER_SELECTOR = ".ce-field-wrapper";
  var CHECK_WRAPPER_SELECTOR = ".ce-form-checks-row";

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

  function setBorderState(wrapper, state) {
    if (!wrapper) return;
    wrapper.classList.remove("is-valid", "is-invalid");
    if (state === "valid" || state === "invalid") {
      wrapper.classList.add("is-" + state);
    }
  }

  function toggleError(errorEl, show) {
    if (errorEl) errorEl.style.display = show ? "block" : "none";
  }

  function isCheckable(el) {
    return el.type === "checkbox" || el.type === "radio";
  }

  function validateField(el) {
    if (isCheckable(el)) {
      return el.required ? el.checked : true;
    }
    var value = (el.value || "").trim();
    if (el.required && !value) return false;
    if (value && el.type === "email" && !EMAIL_REGEX.test(value)) return false;
    return true;
  }

  function buildField(el) {
    var errorId = el.getAttribute("aria-describedby");
    var checkable = isCheckable(el);
    var wrapperSelector = checkable
      ? CHECK_WRAPPER_SELECTOR
      : FIELD_WRAPPER_SELECTOR;
    return {
      el: el,
      wrapper: el.closest(wrapperSelector),
      errorEl: errorId ? document.getElementById(errorId) : null,
      isCheckable: checkable,
      isText:
        !checkable && (el.tagName === "INPUT" || el.tagName === "TEXTAREA"),
    };
  }

  function init() {
    var form = document.getElementById(FORM_ID);
    if (!form) return;

    var fieldEls = form.querySelectorAll(
      "input[required], select[required], textarea[required]"
    );
    if (!fieldEls.length) return;

    var fields = Array.prototype.map.call(fieldEls, buildField);

    fields.forEach(function (f) {
      function liveUpdate() {
        if (f.isCheckable) {
          if (validateField(f.el)) setBorderState(f.wrapper, null);
          return;
        }
        var value = (f.el.value || "").trim();
        if (!value) {
          setBorderState(f.wrapper, null);
        } else {
          setBorderState(f.wrapper, validateField(f.el) ? "valid" : "invalid");
        }
        toggleError(f.errorEl, false);
      }

      if (f.isText) {
        f.el.addEventListener("input", debounce(liveUpdate, DEBOUNCE_MS));
        f.el.addEventListener("blur", liveUpdate);
      } else {
        f.el.addEventListener("change", liveUpdate);
      }
    });

    form.addEventListener("submit", function (e) {
      var firstInvalid = null;
      fields.forEach(function (f) {
        var ok = validateField(f.el);
        if (f.isCheckable) {
          setBorderState(f.wrapper, ok ? null : "invalid");
        } else if (ok) {
          setBorderState(f.wrapper, "valid");
          toggleError(f.errorEl, false);
        } else {
          setBorderState(f.wrapper, "invalid");
          toggleError(f.errorEl, true);
        }
        if (!ok && !firstInvalid) firstInvalid = f.el;
      });
      if (firstInvalid) {
        e.preventDefault();
        firstInvalid.focus();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
