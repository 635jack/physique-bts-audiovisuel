/* ==========================================================================
   Réglages du site du cours. C'est le seul fichier à modifier.
   Les trois pages le chargent, ainsi que site.js qui l'applique.
   ========================================================================== */

window.SITE = {

  /* Mesure d'audience, GoatCounter.
     Mets ici le code du compte, sans le reste de l'adresse.
     Exemple : si ton tableau de bord est https://physique-bts.goatcounter.com,
     écris "physique-bts". Laisse vide pour ne rien mesurer du tout. */
  goatcounter: "jacquesgastebois",

  /* Date de retrait, au format AAAA-MM-JJ.
     Passé cette date, les pages n'affichent plus que le message ci-dessous.
     Laisse vide pour que le site reste en ligne sans limite.
     Attention : ceci masque la page au visiteur, mais le fichier reste servi.
     Le vrai retrait est fait par le robot GitHub décrit dans HEBERGEMENT.md. */
  expire: "2026-10-06",

  /* Ce qui s'affiche après la date de retrait. */
  messageExpire: "Ce site de cours n'est plus en ligne.",
  contact: "j.gastebois@gmail.com"

};
