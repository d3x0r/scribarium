

var require_required = false;
setupToolbox();
function setupToolbox() {

if( !("require" in window) ) {
	if( !require_required ) {
		var script = document.createElement( "SCRIPT" );
		script.src = "../util/require.js";
		document.body.appendChild( script );
		window.require = null;
		require_required = true;
	}
	setTimeout( setupToolbox, 10 );
	return;
}
if( !window.require ) {
	setTimeout( setupToolbox, 10 );
	return;
}


var controlMap = new Map();

const JSON6 = window.require( "1:/util/json6.js" );
JSON.parse = JSON6.parse


console.log( "How to connect back to other page?" );

window.opener.postMessage( {op:"Hello"}, "*" );

window.addEventListener( 'message', ProcessParentMessage , false);

// This function (available in the child code) will be called by the parent
function ProcessParentMessage(message) {
	// do something with the message
	console.log( "Child Message:", message );
	try {
		var msg = message.data;
		if( msg.op === "div" ) {
			//controlMap.set( 
			if( msg.id )  {
				addOption( namedDivs, msg );
				namedDivIDs.push( msg.index );
			}
			else {
				addOption( allDivs, msg );
				allDivIDs.push( msg.index );
			}
		}
	} catch( err ) {
		console.log( "Protocol Failure:", err );
	}
}

//---------------------------------------------------------------------
// Init the tool widgets - listboxes 
//-------------------------------------------------------------
var namedDivIDs = [];
var allDivIDs = [];

var namedDivs = document.getElementById( "namedDivs" );
var allDivs = document.getElementById( "allDivs" );

var rectInfo = { 
	left : document.getElementById( "leftCoord" ),
	top : document.getElementById( "topCoord" ),
	width : document.getElementById( "widthCoord" ),
	height : document.getElementById( "heightCoord" ),
	layoutLeft : document.getElementById( "leftLayoutCoord" ),
	layoutTop : document.getElementById( "topLayoutCoord" ),
	layoutWidth : document.getElementById( "widthLayoutCoord" ),
	layoutHeight : document.getElementById( "heightLayoutCoord" ),
}

var applyCoords = document.getElementById( "applyCoords" );
applyCoords.addEventListener( "click", ()=>{
	window.opener.postMessage( {op:"setLayout", index: selectedDiv._index
			, layout:{left:rectInfo.layoutLeft.value
				,top:rectInfo.layoutTop.value
				,width:rectInfo.layoutWidth.value
				,height:rectInfo.layoutHeight.value}}, "*" );
	
} );

var selectedDiv = null;

namedDivs.onchange = namedSelect
allDivs.onchange = allSelect

function addOption( list, opt ) {
	var option = document.createElement("option");

	option.text = opt.id || opt.altId;
	option._index = opt.index;
	option.rect = opt.rect;
	option.layout = opt.layout;
console.log( "option index : ", opt._index, option.text );
	list.add(option);
}

function namedSelect() {
	allDivs.selectedIndex = -1;
	selectedDiv = namedDivs.options[namedDivs.selectedIndex];
	console.log( "SELECTED:", selectedDiv );
	updateCoords();
	window.opener.postMessage( {op:"select", index: selectedDiv._index}, "*" );
}

function allSelect() {
	namedDivs.selectedIndex = -1;
	selectedDiv = allDivs.options[allDivs.selectedIndex];
	console.log( "SELECTED:", selectedDiv );
	updateCoords();
	window.opener.postMessage( {op:"select", index: selectedDiv._index}, "*" );
}


function updateCoords() {
	rectInfo.left.value = selectedDiv.rect.left;	
	rectInfo.top.value = selectedDiv.rect.top;	
	rectInfo.width.value = selectedDiv.rect.width;	
	rectInfo.height.value = selectedDiv.rect.height;	

	rectInfo.layoutLeft.value = selectedDiv.layout.left;	
	rectInfo.layoutTop.value = selectedDiv.layout.top;	
	rectInfo.layoutWidth.value = selectedDiv.layout.width;	
	rectInfo.layoutHeight.value = selectedDiv.layout.height;	
}


}

