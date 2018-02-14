
var np = (p)=>{ location.assign(p) };

var peer;
var usePort = 45200;
if ("WebSocket" in window) {                                   
	if( location.protocol === "https:" ) {
		peer = `wss://${location.hostname}:45201/`;
		usePort = 45201
	} else
		peer = `ws://${location.hostname}:45200/`;
  	openSocket( "scribarium", 0 );
} else {
  // the browser doesn't support WebSocket.
	if( !location.host.length )
		np("../nosupport.html");
	else
		np("nosupport.html");
}


function openSocket( protocol, step ) {
	var connected = false;
        //setStatus( "connecting..." );
        try {
		ws = new WebSocket(peer, protocol);
        } catch( err ) {
        	console.log( "CONNECTION ERROR?", err );
		return;
        }

	ws.onopen = function() {
        	connected = true;
       		ws.send( '{op:"loadEditor"}' );
	};
	ws.onmessage = function (evt) {
		var msg = JSON.parse( evt.data );
                if( msg.op === "script" ) {
                	var script = document.createElement( "script" );
                        script.appendChild(document.createTextNode(msg.code));
			script.id = "editgrid.js";
			script.ws = ws;
			script.origin = `${location.protocol}//${location.hostname}:${usePort}`;;
                        document.body.appendChild( script );
                } else if( msg.op === "userStatus" ) {
		} else if( msg.op === "newLogin" ) {
		}
	};
        ws.onerror = function(err) {
        	console.log( "Can I get anything from err?", err );
        }
	ws.onclose = function(code,reason) {
		setTimeout( ()=>{openSocket(protocol,step)}, 5000 );
	};
}

