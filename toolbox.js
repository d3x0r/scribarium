

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
	//console.log( "Child Message:", message.data );
	try {
		var msg = message.data;
		if( msg.op === "style" ) {
			addStyleOption( allStyles, msg );
		} else if( msg.op === "div" ) {
			//controlMap.set( 
			if( msg.id )  {
				addOption( namedDivs, msg );
				addOption( allDivs, msg );
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
var allStyleIDs = [];

var namedDivs = document.getElementById( "namedDivs" );
var allDivs = document.getElementById( "allDivs" );
var allStyles = document.getElementById( "styles" );
var currentStyle = document.getElementById( "currentStyle" );

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

var clearSelection = document.getElementById( "clearSelection" );
clearSelection.addEventListener( "click", ()=>{
	window.opener.postMessage( {op:"clearSelection"}, "*" );
	allDivs.selectedIndex = -1;
	namedDivs.selectedIndex = -1;
	selectedDiv = null;
	
} );

var textProps = [];
function addSetThing( op, altop ) {
	var idControl = {		
		button : document.getElementById( op ),
		textarea : document.getElementById( altop )
	};
	textProps.push( idControl );
	idControl.button.addEventListener( "click", ()=>{
		window.opener.postMessage( {op:op,index:selectedDiv._index,[altop]:idControl.textarea.value}, "*" );
	
	} );
}

addSetThing( "setId", "id" );
addSetThing( "setHtml", "innerHtml" );
addSetThing( "setText", "innerText" );
addSetThing( "setSrc", "src" );
addSetThing( "setClass", "class" );


var clearSelection = document.getElementById( "clearSelection" );
clearSelection.addEventListener( "click", ()=>{
	window.opener.postMessage( {op:"clearSelection"}, "*" );
	
} );

var applyCoords = document.getElementById( "applyCoords" );
applyCoords.addEventListener( "click", ()=>{
	window.opener.postMessage( {op:"setLayout", index: selectedDiv._index
			, layout:{left:rectInfo.layoutLeft.value
				,top:rectInfo.layoutTop.value
				,width:rectInfo.layoutWidth.value
				,height:rectInfo.layoutHeight.value}}, "*" );
	
} );

var selectedDiv = null;
var selectedStyle = null;
allStyles.onchange = styleSelect
namedDivs.onchange = namedSelect
allDivs.onchange = allSelect

function addStyleOption( list, opt ) {
	var option = document.createElement("option");
	//console.log( "Add style:", opt );
	option.text = opt.selectorText;
	option.opt = opt;
	//console.log( "option index : ", opt._index, option.text );
	list.add(option);
}

function addOption( list, opt ) {
	var option = document.createElement("option");
	var leader = "";
	for( n = 0; n < opt.level;n++ )
		leader += "...";
	option.text = leader + ( opt.id || opt.altId );
	option._index = opt.index;
	option.rect = opt.rect;
	option.layout = opt.layout;
	option.opt = opt;
	//console.log( "option index : ", opt._index, option.text );
	list.add(option);
}

function styleSelect() {
	selectedStyle = allStyles.options[allStyles.selectedIndex];
	//console.log( "SELECTED:", selectedDiv );
	//updateStyle();
	currentStyle.value = selectedStyle.opt.cssText;
	//window.opener.postMessage( {op:"select", index: selectedDiv._index}, "*" );
}

function namedSelect() {
	allDivs.selectedIndex = -1;
	selectedDiv = namedDivs.options[namedDivs.selectedIndex];
	//console.log( "SELECTED:", selectedDiv );
	updateCoords();
	window.opener.postMessage( {op:"select", index: selectedDiv._index}, "*" );
}

function allSelect() {
	namedDivs.selectedIndex = -1;
	selectedDiv = allDivs.options[allDivs.selectedIndex];
	//console.log( "SELECTED:", selectedDiv );
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

	for( var n = 0; n < textProps.length; n++ ) 
		textProps[n].textarea.value = selectedDiv.opt[textProps[n].textarea.id];
}


}

