"use client";
import { login, signup } from "@/lib/actions/auth/auth.methods";
import { useRef } from "react";

export default function SignupPage() {
  const errorRef = useRef(null); // Utilisation de useRef pour gérer l'erreur

  const handleSubmit = async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page
    const formData = {
      username: event.target.pseudo.value,
      email: event.target.email.value,
      password: event.target.password.value,
      confirmPassword: event.target.repeatPassword.value,
    };
    console.log(formData);
    

    // Vérifie si les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      errorRef.current.textContent = "Passwords do not match";
      return;
    }

   // J'ai les erreurs serveurs qui apparaissent ici, ce n'est pas bon.
    try {
     // Appel direct à la fonction signup sans utiliser de constante
     await signup({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

      // Si l'inscription réussit, appelle la méthode login pour connecter l'utilisateur
      // await login({ email: formData.email, password: formData.password });
    } catch (err) {
      errorRef.current.textContent = err.message || "Signup failed";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <label className="block text-gray-700 text-md font-semibold mb-2" htmlFor="pseudo">
        Name or pseudo
      </label>
      <input
        className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
        id="pseudo"
        name="pseudo"  // Ajout de name ici
        type="text"
        placeholder="Name or pseudo"
        required
      />

      <label className="block text-gray-700 text-md font-semibold mb-2" htmlFor="email">
        E-mail
      </label>
      <input
        className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
        id="email"
        name="email"  // Ajout de name ici
        type="email"
        placeholder="E-mail"
        required
      />

      <label className="block text-gray-700 text-md font-semibold mb-2" htmlFor="password">
        Password
      </label>
      <input
        className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
        id="password"
        name="password"  // Ajout de name ici
        type="password"
        placeholder="Your password"
        required
      />

      <label className="block text-gray-700 text-md font-semibold mb-2" htmlFor="repeatPassword">
        Confirm password
      </label>
      <input
        className="mb-14 shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="repeatPassword"
        name="repeatPassword"  // Ajout de name ici
        type="password"
        placeholder="Confirm password"
        required
      />

      <p ref={errorRef} className="text-red-500 mb-4"></p> {/* Affiche l'erreur ici */}

      <button type="submit" className="w-full self-end bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded border-none">
        Submit
      </button>
    </form>
  );
}
