
const vfs = require( "sack.vfs" );
//vfs.TLS.seed( )
module.exports = exports = function (intoThis) {

const os = require( "os" );

function getLocation() {
	var i = os.networkInterfaces();
	var i2 = [];
	for( var int in i ) {
        	var placed = false;
        	for( var int2 in i2 ) {
                	if( i2[int2][0].mac > i[int][0].mac ) {
                                i2.splice( int2, 0, i[int] );
                                placed = true;
                                break;
                        }
                }
                if( !placed ) i2.push( i[int] );
        }
        i = i2;
	var result = [];
 	for( var int in i ) i[int].forEach( i=>{
		if( i.address.startsWith( 'fe80' ) )
			return true;
		result.push( i.address );
	} );
	return result;
}
//console.log( "Addresses?:", getLocation() )




var key = vfs.TLS.genkey( 1024);
var cert = vfs.TLS.gencert( { 
	country:"US", 
	state:"NV", 
	locality:"Las Vegas", 
	org:"Freedom Collective", 
	unit:"IT", 
	name:"Root Cert", 
	serial: 1001, 
	key:key, 
	expire: 7, 
} );


var key2 = vfs.TLS.genkey( 1024 );
var cert2 = vfs.TLS.genreq( { 
	country:"US", 
	state:"NV", 
	locality:"Las Vegas", 
	org:"Freedom Collective", 
	unit:"IT", 
	name:"CA Cert", 
	key:key2 
} );

var signedCert2 = vfs.TLS.signreq( { 
	request:cert2, 
	signer:cert, 
	key:key, 
	serial: 1003, 
	expire: 100, 
} );


var key3 = vfs.TLS.genkey( 1024 );
var cert3 = vfs.TLS.genreq( { 
	country:"US", 
	state:"Conscious", 
	locality:"C-316", 
	org:"Yes", 
	unit:"Super",
	name:"www.common.name",
	key:key3, 
	subject:{ 
		DNS:["localhost"], 
		IP:getLocation()
	} 
} );

//console.log( cert3 );
var signedCert3 = vfs.TLS.signreq( { 
	request:cert3, 
	signer:signedCert2, 
	key:key2, 
	serial: 1005, 
	expire: 100 
} );

//console.log( signedCert3 );

//if( vfs.TLS.validate( {cert:signedCert3, chain:signedCert2+cert} ) )
//	console.log( "Chain is valid." );

intoThis.cert = signedCert3;
intoThis.ca = signedCert2;//+cert;
intoThis.rootCert = cert;
intoThis.key = key3;
//console.log( "DumpKeys:", intoThis );
return {cert:signedCert3, ca:signedCert2+cert, key:key3};

}