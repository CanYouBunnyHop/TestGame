import {Peer} from "https://esm.sh/peerjs@1.5.4?bundle-deps";
import {hostIDDisplay} from "/client.js"


const HOST = new Peer();
var peers = [];

console.log('load host client');

HOST.on('open', id=>{
    hostIDDisplay.innerText = id;
    HOST.on('connection', (conn)=>{
        console.log(conn);
        peers.push(conn);
        conn.on('disconnected', ()=>{
            peers.filter(peer => peer !== conn); //remove connection from peers after disconnection
        });
    });
});