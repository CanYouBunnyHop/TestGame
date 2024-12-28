import { Application } from "../pixi.mjs";
(async ()=>{
    const app = new Application();
    await app.init();
    document.body.appendChild(app.canvas);




})();

// const app = new Application();
// document.body.appendChild(app.canvas);


// /**@type {HTMLCanvasElement|null} */
//  const canvas = document.getElementById('game-canvas');
//  const ctx = canvas.getContext('2d');