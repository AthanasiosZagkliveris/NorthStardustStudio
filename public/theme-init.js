// (Its own file, not inline in index.html, so the desktop app's Content Security Policy can allow only the app's own scripts.)
// The theme -- light, sepia or dark -- set before the first paint
// so the app never flashes the wrong one. The same choice and rule
// as ThemeService.ts (key "northstardust-theme"; Auto, the
// default, follows the system's light or dark), which takes over
// once React starts.
(function () {
  var choice = "auto";
  try {
    var stored = localStorage.getItem("northstardust-theme");
    if (stored === "light" || stored === "sepia" || stored === "dark" || stored === "auto") choice = stored;
  } catch (error) {}
  var theme = choice !== "auto" ? choice
    : (!!window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();
