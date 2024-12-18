//import {Peer} from "https://esm.sh/peerjs@1.5.4?bundle-deps";

const PEER_CLIENT_SCRIPT = document.createElement('script');
PEER_CLIENT_SCRIPT.type = 'module';
PEER_CLIENT_SCRIPT.src = `../peer-client.js`;

const HOST_CLIENT_SCRIPT = document.createElement('script');
HOST_CLIENT_SCRIPT.type = 'module';
HOST_CLIENT_SCRIPT.src = `../host-client.js`;

//get if player is a host or peer
switch(sessionStorage.getItem('host-or-join')){
    case 'host':document.body.appendChild(HOST_CLIENT_SCRIPT);break;
    case 'join':document.body.appendChild(PEER_CLIENT_SCRIPT);break;
}