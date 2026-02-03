const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "pink";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "black";
ctx.font = "20px Arial";
ctx.fillText("GitHub Pages работает", 50, 300);
