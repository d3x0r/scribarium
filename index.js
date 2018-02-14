const _debug = true;

var sack = require( "sack.vfs" );
var vol = sack.Volume();

//------ setup websocket compatibility
const WS = sack.WebSocket.readyStates; // WS.OPEN, WS.OPENING, WS.CLOSED,...
const WebSocket = sack.WebSocket.Client;
const WebSocketServer = sack.WebSocket.Server;

var http_server = require( "./serve.js" );

var option = {
       	port : 45200
}
var server = WebSocketServer( option );
initSocket( server );

var getCert = require( "./getcert.js" );
console.log( "Starting ws:... Port:", option.port );
getCert( option );
option.port++;
console.log( "Starting wss:... Port:", option.port );
var wss_server = WebSocketServer( option );
initSocket( wss_server );

function initSocket(server ) {
server.on("close",()=>{
	console.log( "SERVER SOCKET HAS CLOSED?" );s
})
server.on( "request", (req, res) => {
	console.log( "got request" + req.url );
	if( http_server )
		return http_server( req, res );
	console.log( "fail." );
	res.writeHead(404);
	res.end('<HTML><head><title>No resource</head><BODY>No Resource</BODY></HTML>');
});
server.on('accept', (ws)=>{validateWebSock(server,ws)} ) // ws NPM
server.on('connect', (ws)=>{webSockConnected(server,ws)} );
}

function validateWebSock( server, ws ) {
	//console.log( "got vaiidate" + ws );
	var proto = ws.headers['Sec-WebSocket-Protocol'];
	// ws.protocol should be a protocol handler of sorts... 

	//_debug && console.log( "Just accepting, but this is the proto it asked for:", proto, " And this is the thing itself.", ws );
	server.accept();
}

function webSockConnected( server, ws ) {
	var p = ws.protocol;
	var ip = ( ws.headers && ws.headers['x-forwarded-for'] ) ||
		 ws.connection.remoteAddress ||
		 ws.socket.remoteAddress ||
		 ws.connection.socket.remoteAddress;
	ws.clientAddress = ip;
	//_debug&&console.log( "ws Connected from:", ip , p, ws.protocol, ws.headers['Sec-WebSocket-Protocol']);
	ws.on( "message", handleMessage );
	//if( p ) {
	//	p.connect();
	//}
}

function handleMessage( msg ) {
	console.log( "GOT:", typeof msg, msg );
	msg = sack.JSON6.parse( msg );
	if( msg.op === "loadEditor" ) 
		this.send( `{"op":"script","code":${JSON.stringify(vol.read( "editgrid.js" ).toString())}}`);
	if( msg.op === "save" ) {
	}
}



