"use strict";

// Personaliza aquí los datos de tu perfil.
const profile = {
  name: "Jonathan",
  username: "@CalmIndifferent",
  avatar: "https://i.pinimg.com/736x/9c/f5/2a/9cf52a9416c047f4ed5d6da288e6c8e4.jpg" 
};

const nameElement = document.getElementById("profile-name");
const usernameElement = document.getElementById("profile-username");
const avatarElement = document.getElementById("avatar");

nameElement.textContent = profile.name;
usernameElement.textContent = profile.username;
avatarElement.textContent = profile.name
  .trim()
  .split(/\s+/)
  .map(word => word[0])
  .join("")
  .slice(0, 2)
  .toUpperCase() + ".";

if (profile.avatar.trim()) {
  const image = document.createElement("img");
  image.src = profile.avatar;
  image.alt = `Foto de perfil de ${profile.name}`;
  image.onerror = () => {
    image.remove();
    avatarElement.textContent = profile.name
      .trim()
      .split(/\s+/)
      .map(word => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() + ".";
  };
  avatarElement.textContent = "";
  avatarElement.appendChild(image);
}

document.getElementById("year").textContent =
  new Date().getFullYear();

document.getElementById("back-top").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
  