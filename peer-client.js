import {Peer} from "https://esm.sh/peerjs@1.5.4?bundle-deps";
import {hostIDDisplay, userIDDisplay} from "/client.js"

const PEER = new Peer();
const hostId = sessionStorage.getItem('input-host-id');
var hostConn = undefined;
console.log('load peer client');

PEER.on('open', id=>{
    userIDDisplay.innerText = id;
    hostConn = PEER.connect(hostId);

    hostConn.on('open', ()=>{
        hostIDDisplay.innerText = hostId;
    })

    
})