// The initial language is set by the inline script in <head>; this only handles toggling.
document.getElementById("lang-toggle").addEventListener("click", function () {
  var next = document.documentElement.lang === "zh" ? "en" : "zh";
  document.documentElement.lang = next;
  localStorage.setItem("lang", next);
});
