import {Peer} from "https://esm.sh/peerjs@1.5.4?bundle-deps";
import {hostIDDisplay, userIDDisplay} from "./client.js"

const oldId = sessionStorage.getItem('peer-id');
const PEER = new Peer(oldId);
const hostId = sessionStorage.getItem('input-host-id');
var hostConn = undefined;
console.log('load peer client');

PEER.on('open', id=>{
    sessionStorage.setItem('peer-id', id);

    userIDDisplay.innerText = id;
    hostConn = PEER.connect(hostId);

    hostConn.on('open', ()=>{
        hostIDDisplay.innerText = hostId;
    });
});

PEER.on('connection', conn=>{
    //if connection is not host?
    conn.close(); //close the connection to this peer?
});