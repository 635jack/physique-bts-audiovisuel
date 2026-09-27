/* ==========================================================================
   Mesure d'audience et date de retrait.
   Rien à modifier ici : tout se règle dans config.js.

   Ce qui est mesuré, par GoatCounter, sans cookie et sans identifiant de
   visiteur : les pages vues, le temps réellement passé à lire (par paliers),
   la lecture jusqu'au bas de page, l'ouverture des corrections, l'usage de la
   simulation, et les liens suivis vers l'extérieur.
   ========================================================================== */
(function () {
  "use strict";

  var S = window.SITE || {};
  var expire = S.expire && new Date().toISOString().slice(0, 10) > S.expire;

  /* ---------- 1. Date de retrait ---------------------------------------- */
  /* On masque la page tout de suite, avant qu'elle ne s'affiche, puis on
     remplace son contenu dès que le corps du document existe. */
  if (expire) {
    var cache = document.createElement("style");
    cache.textContent = "body{visibility:hidden}";
    document.head.appendChild(cache);
    quandPret(function () {
      document.title = "Page retirée";
      document.body.setAttribute("style", [
        "visibility:visible", "margin:0", "min-height:100vh", "display:grid",
        "place-items:center", "padding:24px", "box-sizing:border-box",
        "background:var(--paper,#FBFBF9)", "color:var(--ink,#1B2233)",
        'font:400 1.05rem/1.6 Georgia,"Times New Roman",serif'
      ].join(";"));
      document.body.innerHTML =
        '<div style="max-width:36ch;text-align:center">' +
        "<p>" + texte(S.messageExpire || "Ce site n'est plus en ligne.") + "</p>" +
        (S.contact
          ? '<p><a style="color:var(--accent,#005AAA)" href="mailto:' +
            texte(S.contact) + '">' + texte(S.contact) + "</a></p>"
          : "") +
        "</div>";
    });
  }

  /* ---------- 2. GoatCounter --------------------------------------------- */
  if (!S.goatcounter) return;

  var fichier = document.createElement("script");
  fichier.async = true;
  fichier.src = "https://gc.zgo.at/count.js";
  fichier.setAttribute("data-goatcounter",
    "https://" + S.goatcounter + ".goatcounter.com/count");
  document.head.appendChild(fichier);

  var attente = [];
  fichier.addEventListener("load", function () {
    attente.splice(0).forEach(function (e) { evenement(e[0], e[1]); });
  });

  function evenement(nom, titre) {
    var gc = window.goatcounter;
    if (gc && typeof gc.count === "function") {
      gc.count({ path: nom, title: titre || nom, event: true });
    } else {
      attente.push([nom, titre]);
    }
  }

  var page = (location.pathname.split("/").pop() || "index").replace(/\.html?$/, "") || "index";
  var faits = Object.create(null);
  function unefois(nom, titre) {
    if (faits[nom]) return;
    faits[nom] = true;
    evenement(nom, titre);
  }

  /* Une page consultée après son retrait : bon à savoir. */
  if (expire) {
    evenement("apres-retrait/" + page, "Visite après retrait : " + page);
    return;
  }

  /* ---------- 3. Temps de lecture réel, par paliers ---------------------- */
  var secondes = 0, horloge = null;
  var paliers = [[30, "30 s"], [120, "2 min"], [300, "5 min"], [600, "10 min"]];

  function tic() {
    secondes += 5;
    for (var i = 0; i < paliers.length; i++) {
      if (secondes >= paliers[i][0]) {
        unefois("duree/" + page + "/" + paliers[i][1],
          "Temps de lecture, " + page + " : " + paliers[i][1]);
      }
    }
  }
  function reglerHorloge() {
    if (document.visibilityState === "visible") {
      if (!horloge) horloge = setInterval(tic, 5000);
    } else if (horloge) {
      clearInterval(horloge);
      horloge = null;
    }
  }
  document.addEventListener("visibilitychange", reglerHorloge);
  reglerHorloge();

  /* ---------- 4. Ce que le visiteur fait --------------------------------- */
  document.addEventListener("toggle", function (e) {
    if (e.target.tagName === "DETAILS" && e.target.open) {
      var s = e.target.querySelector("summary");
      var t = (s ? s.textContent : "").trim().slice(0, 60);
      unefois("correction-ouverte/" + t, "Correction ouverte : " + t);
    }
  }, true);

  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;

    var defi = e.target.closest("[data-defi]");
    if (defi) {
      unefois("simulation/defi-" + defi.getAttribute("data-defi"),
        "Simulation, défi " + defi.getAttribute("data-defi"));
    }

    var lien = e.target.closest("a[href]");
    if (lien && /^https?:/i.test(lien.getAttribute("href") || "")) {
      var hote;
      try { hote = new URL(lien.href).hostname.replace(/^www\./, ""); }
      catch (err) { return; }
      if (hote && hote !== location.hostname) {
        evenement("sortie/" + hote, "Lien suivi vers " + hote);
      }
    }
  }, true);

  /* ---------- 5. Lecture jusqu'au bas de page, et usage de la simulation -- */
  quandPret(function () {
    var simu = document.getElementById("sim");
    if (simu) {
      simu.addEventListener("input", function () {
        unefois("simulation/manipulee", "Simulation manipulée");
      }, { once: true });
    }

    var blocs = document.querySelectorAll("main section, main > h2");
    var derniere = blocs[blocs.length - 1];
    if (derniere && "IntersectionObserver" in window) {
      var oeil = new IntersectionObserver(function (entrees) {
        for (var i = 0; i < entrees.length; i++) {
          if (entrees[i].isIntersecting) {
            unefois("lu-jusqu-au-bout/" + page, "Lu jusqu'au bout : " + page);
            oeil.disconnect();
          }
        }
      }, { threshold: 0.35 });
      oeil.observe(derniere);
    }
  });

  /* ---------- Utilitaires ------------------------------------------------ */
  function quandPret(f) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", f);
    } else {
      f();
    }
  }
  function texte(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
})();
