export default class AppError extends Error {
  constructor(message = "Une erreur est survenue") {
    super(message);
    this.name = "AppError"; 
  }
}

// Oui, c'est une exception au comportement normal des classes : Error ajoute automatiquement stack à l'instance sans qu'on ait besoin de le passer explicitement à super(). 🚀

// 📌 Pourquoi ?

// Error est une classe spéciale native en JavaScript.
// Dès que son constructeur est appelé via super(), le moteur JS capture la stack trace et l'attache à l'instance.
// Dans V8 (Chrome, Node.js), c'est fait via Error.captureStackTrace(this), ce qui ne nécessite pas de passer stack en argument.
// 🔥 Donc oui, c'est un cas particulier, et stack est généré automatiquement grâce au moteur JS ! 🚀



/*
on hérite de la classe native Error
on est obligé de prendre message pour ajouter la prop aux objets créés et que le stack soit bien rempli
le stack est automatiquement rajouté avec cette classe native, il décrit la trace d'execution au moment où l'erreur a été levé, ce qui aconduit a cette erreur
this.name peut être utile dans certains cas,le stack peut le lire dynamique, pas 
*/