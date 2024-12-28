export const hostIDDisplay = document.getElementById('host-id');
export const userIDDisplay = document.getElementById('user-id');

const copyButtons = document.querySelectorAll('.copybut');
copyButtons.forEach(but=>but.onclick=()=>{
    navigator.clipboard.writeText(but.previousElementSibling.innerText)
});