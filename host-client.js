import {Peer} from "https://esm.sh/peerjs@1.5.4?bundle-deps";
import {hostIDDisplay} from "./client.js"

const oldId = sessionStorage.getItem('host-id');
const HOST = new Peer(oldId);
var peers = [];

console.log('load host client');

HOST.on('open', id=>{
    sessionStorage.setItem('host-id', id);


    hostIDDisplay.innerText = id;
    HOST.on('connection', (conn)=>{
        peers.push(conn);
        console.log(conn.peer, " has joined");
        conn.on('disconnected', ()=>{
            peers = peers.filter(peer => peer !== conn); //remove connection from peers after disconnection
            console.log(peers);
        });
        conn.on('close', ()=>{
            peers = peers.filter(peer =>peer !== conn); //remove connection from peers after disconnection
            console.log(peers);
        });
    });
});