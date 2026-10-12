// Loaded in <head> so a saved theme applies before first paint. Shared by every page.
(function () {
  var key = "outloop.theme";
  function read() { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function write(value) { try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key); } catch (e) {} }
  function apply(value) {
    if (value === "light" || value === "dark") document.documentElement.setAttribute("data-theme", value);
    else document.documentElement.removeAttribute("data-theme");
  }
  apply(read());
  document.documentElement.classList.add("js");

  document.addEventListener("DOMContentLoaded", function () {
    var buttons = document.querySelectorAll("[data-theme-choice]");
    function sync() {
      var current = read() || "auto";
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.themeChoice === current)); });
    }
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        var choice = b.dataset.themeChoice;
        write(choice === "auto" ? null : choice);
        apply(choice);
        sync();
      });
    });
    sync();

    var nav = document.querySelector(".nav");
    if (nav) {
      var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  });
})();
