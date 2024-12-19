const ENTER_ROOM_FORM = document.getElementById('enter-room');
const HOST_ROOM_BUT = document.getElementById('host-room');

ENTER_ROOM_FORM.addEventListener('submit', (event)=>{
    event.preventDefault();
    const form = new FormData(ENTER_ROOM_FORM);
    const hostID = form.get('host-id');

    sessionStorage.setItem('host-or-join', 'join');
    sessionStorage.setItem('input-host-id', hostID);
    window.location.href = '/room';
});

HOST_ROOM_BUT.addEventListener('mousedown', (event)=>{
    sessionStorage.setItem('host-or-join', 'host');
    sessionStorage.setItem('input-host-id', null);
    window.location.href = './room';
});