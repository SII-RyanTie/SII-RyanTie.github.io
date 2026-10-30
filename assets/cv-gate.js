// The CV is stored encrypted (AES-GCM, key from PBKDF2). It is decrypted in the browser
// after the visitor enters the password; the password is never sent anywhere.
(function () {
  var open = document.getElementById("cv-open");
  var dialog = document.getElementById("cv-dialog");
  var form = document.getElementById("cv-form");
  var input = document.getElementById("cv-password");
  var msg = document.getElementById("cv-msg");
  var cancel = document.getElementById("cv-cancel");
  if (!open || !dialog || !form) return;

  open.addEventListener("click", function () {
    msg.textContent = "";
    input.value = "";
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute("open", "");
    input.focus();
  });
  cancel.addEventListener("click", function () { dialog.close(); });

  function fail() { msg.textContent = dialog.getAttribute("data-wrong"); }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    msg.textContent = dialog.getAttribute("data-working");
    // Open the tab inside the click gesture so popup blockers allow it.
    var tab = window.open("", "_blank");
    try {
      var res = await fetch("/assets/cv.enc?v=1");
      var data = new Uint8Array(await res.arrayBuffer());
      var salt = data.slice(0, 16), iv = data.slice(16, 28), ct = data.slice(28);
      var base = await crypto.subtle.importKey("raw", new TextEncoder().encode(input.value), "PBKDF2", false, ["deriveKey"]);
      var key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: 600000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      var pdf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ct);
      var url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
      if (tab) { tab.location.href = url; } else {
        var a = document.createElement("a"); a.href = url; a.download = "CV_Ruian_Tie.pdf"; a.click();
      }
      dialog.close();
    } catch (err) {
      if (tab) tab.close();
      fail();
    }
  });
})();
