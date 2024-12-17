import {Peer} from "https://esm.sh/peerjs@1.5.4?bundle-deps";

socket.on('connect',()=>{
    console.log('socket is connected');
})

const enterRoom = document.getElementById('enter-room');
const hostIDDisplay = document.getElementById('host-id');
const userIDDisplay = document.getElementById('user-id');
const chat = document.getElementById('chat');
const copyButtons = document.querySelectorAll('.copybut');
const msgInput = document.getElementById('msg');
copyButtons.forEach(but=>but.onclick=()=>{navigator.clipboard.writeText(but.previousElementSibling.innerText)});

var peer = new Peer();
var peerID = '';
var peers = [];

//this solution sucks and it does not work
var isHost = true;

peer.on('open', id=>{
    hostIDDisplay.innerText=id;
    userIDDisplay.innerText=id; 
    peerID = id
});

var connToHost = undefined;

enterRoom.addEventListener('submit', (event)=>{
    event.preventDefault(); //dont refresh
    const form = new FormData(enterRoom);
    const hostID = form.get('host-id');
    hostIDDisplay.innerText = hostID;
    enterRoom.reset(); 

    connToHost = peer.connect(hostID);
    //waiting for connection to connect
    connToHost.on('error', ()=>{
        sendMessage('Failed to Connect to host, hostID may be invalid');
    });
    connToHost.on('open', ()=>{
        peers.push(connToHost);
        sendMessage('Connection established: '+ hostID, false);
        isHost = false;
        connToHost.send(peerID +" has joined");
    });
    connToHost.on('data', (_msg)=>{
        sendMessage(_msg, isHost); //if not host, dont broadcast
    })
});

msgInput.addEventListener('submit', (event)=>{
    event.preventDefault();
    const form = new FormData(msgInput);
    const msg = form.get('msg');
    sendMessage(msg);
})

//when another peer joins the host
peer.on('connection', (conn)=>{
    peers.push(conn);
    conn.on('data',(_msg)=>{
        sendMessage(_msg, !isHost); //if is host, dont broadcast
    })
});

function sendMessage(_msg, broadcast = true){
    const msg = document.createElement('li');
    msg.innerText = _msg;
    chat.appendChild(msg);
    if(broadcast === false) return;
    peers.forEach(conn=>{conn.send(_msg)});
}


document.debug = debug;

function debug(){
    for (let peerId in peer.connections){
        console.log(peerId);
    }
}


// var myPeer = new Peer();
// var myUserID = '';
// //when your peer open
// myPeer.on('open', (id)=>{
//     myUserID = id;
//     console.log(myUserID);
// });
