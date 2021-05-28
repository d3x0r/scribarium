

var require_required = false;


import {JSOX} from "./node_modules/jsox/lib/jsox.mjs";
JSON = JSOX;

setupToolbox();
function setupToolbox() {



var controlMap = new Map();


console.log( "How to connect back to other page?" );

window.editGrid.setToolbox( {
text:"This Toolbox Loaded:) ",
post:ProcessParentMessage,
                          });
//window.editGrid.send( {op:"Hello"}, "*" );

//window.addEventListener( 'message', ProcessParentMessage , false);

// This function (available in the child code) will be called by the parent
function ProcessParentMessage(message) {
	// do something with the message
	//console.log( "Child Message:", message.data );
	try {
		var msg = message;//.data;
		if( msg.op === "style" ) {
			addStyleOption( allStyles, msg );
		} else if( msg.op === "script" ) {
			addScriptOption( allScripts, msg );
		} else if( msg.op === "div" ) {
			//controlMap.set( 
			if( msg.id )  {
				addOption( namedDivs, msg );
				addOption( allDivs, msg );
			}
			else {
				addOption( allDivs, msg );
			}
		}
	} catch( err ) {
		console.log( "Protocol Failure:", err );
	}
}

//---------------------------------------------------------------------
// Init the tool widgets - listboxes 
//-------------------------------------------------------------

var namedDivs = document.getElementById( "namedDivs" );
var allDivs = document.getElementById( "allDivs" );
var allStyles = document.getElementById( "styles" );
var allScripts = document.getElementById( "scripts" );
var currentStyle = document.getElementById( "currentStyle" );
var currentScript = document.getElementById( "currentScript" );

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
	window.editGrid.send( {op:"clearSelection"}, "*" );
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
    		if( selectedDiv )
		window.editGrid.send( {op:op,index:selectedDiv._index,[altop]:idControl.textarea.value}, "*" );
	
	} );
}

addSetThing( "setId", "id" );
addSetThing( "setHtml", "innerHtml" );
addSetThing( "setText", "innerText" );
addSetThing( "setSrc", "src" );
addSetThing( "setClass", "class" );
addSetThing( "setStyle", "style" );

var createStyle = document.getElementById( "createStyle" );
createStyle.addEventListener( "click", ()=>{
	var val = prompt( "Enter new style selector", "" );
	if( val ) {
		var style;
		addStyleOption( allStyles, style = { selectorText : val, cssText : "" } );
		window.editGrid.send( {op:"createStyleRule", style:style }, "*" );
	}
} );

var updateStyle = document.getElementById( "updateStyle" );
updateStyle.addEventListener( "click", ()=>{
	if( selectedStyle ) {
		selectedStyle.opt.cssText = currentStyle.value;
		window.editGrid.send( {op:"setStyleRule", style:selectedStyle.opt }, "*" );
	}
} );

// ---------- create Script

var createStyle = document.getElementById( "createScript" );
createStyle.addEventListener( "click", ()=>{
	var val = prompt( "Enter new script src", "" );
	if( val ) {
		var style;
		addScriptOption( allScripts, script = { src : val } );
		window.editGrid.send( {op:"createScript", src:script.src }, "*" );
	}
} );

var updateStyle = document.getElementById( "updateScript" );
updateStyle.addEventListener( "click", ()=>{
	if( selectedStyle ) {
		selectedScript.opt.src = currentScript.value;
		window.editGrid.send( {op:"setScriptsrc", style:selectedStyle.opt }, "*" );
	}
} );


var clearSelection = document.getElementById( "clearSelection" );
clearSelection.addEventListener( "click", ()=>{
	window.editGrid.send( {op:"clearSelection"}, "*" );
	
} );

var applyCoords = document.getElementById( "applyCoords" );
applyCoords.addEventListener( "click", ()=>{
    		if( selectedDiv )
	window.editGrid.send( {op:"setLayout", index: selectedDiv._index
			, layout:{left:rectInfo.layoutLeft.value
				,top:rectInfo.layoutTop.value
				,width:rectInfo.layoutWidth.value
				,height:rectInfo.layoutHeight.value}}, "*" );
	
} );

var selectedDiv = null;
var selectedStyle = null;
allScripts.onchange = scriptSelect
allStyles.onchange = styleSelect
namedDivs.onchange = namedSelect
allDivs.onchange = allSelect
allDivs.oninput = allSelect

function addScriptOption( list, opt ) {
	var option = document.createElement("option");
	//console.log( "Add style:", opt );
	option.text = opt.src;
	option.opt = opt;
	//console.log( "option index : ", opt._index, option.text );
	list.add(option);
}


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
	for( let n = 0; n < opt.level;n++ )
		leader += "...";
	option.text = leader + ( opt.id || opt.altId );
	option._index = opt.index;
	option.rect = opt.rect;
	option.layout = opt.layout;
	option.opt = opt;
        option.setAttribute( "selected", true );

	selectedDiv = option;
        updateCoords();
	//console.log( "option index : ", opt._index, option.text );
	list.add(option);
}

function scriptSelect() {
	selectedScript = allScripts.options[allScripts.selectedIndex];
	currentScript.value = selectedScript.opt.src;
}

function styleSelect() {
	selectedStyle = allStyles.options[allStyles.selectedIndex];
	//console.log( "SELECTED:", selectedDiv );
	//updateStyle();
	currentStyle.value = selectedStyle.opt.cssText;
	//window.editGrid.send( {op:"select", index: selectedDiv._index}, "*" );
}

function namedSelect() {
	allDivs.selectedIndex = -1;
	selectedDiv = namedDivs.options[namedDivs.selectedIndex];
	//console.log( "SELECTED:", selectedDiv );
	updateCoords();
	window.editGrid.send( {op:"select", index: selectedDiv._index}, "*" );
}

function allSelect() {
	namedDivs.selectedIndex = -1;
	selectedDiv = allDivs.options[allDivs.selectedIndex];
	console.log( "SELECTED:", selectedDiv );
	updateCoords();
	window.editGrid.send( {op:"select", index: selectedDiv._index}, "*" );
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

