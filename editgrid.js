"use strict";
const _debug = false;

var arrScripts = document.getElementsByTagName('script');
var strScriptTagId = arrScripts[arrScripts.length - 1];
//debugger;
//console.log( "HELLO! I have Context?", strScriptTagId )

var origin;
if( strScriptTagId.origin ) 
	var origin = strScriptTagId.origin || location.origin;
else {
	// get relative origin to next thing....
	var filename = strScriptTagId.src.lastIndexOf( "/" );
	var origin = strScriptTagId.src.substr( 0, filename );
}

var ws = null;
if( "ws" in strScriptTagId ) {
	var handleMessageExport = null
	function handleMessages( ws, msg, _msg ) {
		handleMessageExport(ws,msg,_msg);
	}
	( ws = strScriptTagId.ws ).extraHandler = handleMessages;
	strScriptTagId.ws.send( '{"op":"sync"}' );
}

//var origin_addr = "http://localhost:45200/editgrid.js";
//var origin_addr = "https://localhost:45201/editgrid.js";
var origin_addr = origin + "/editgrid.js";

//document.body.addEventListener("load", ()=> {

var require_required = false;
setupGrid();
//---------------------------------------------------------------------------
// The remainider of this script is all within this function as a context.
//---------------------------------------------------------------------------


function setupGrid() {

window.addEventListener( "resize", handleResize );

function handleResize() {
		for( var a = 0; a < 1; a++ ) {
			var meshrect = editmesh.getBoundingClientRect();
		        editmesh.width = meshrect.right - meshrect.left;
		        editmesh.height = meshrect.bottom - meshrect.top;
		        console.log( "First Init", meshrect );
		}
	for( var c = 0; c < controls.length; c++ )
		updateRects( controls[c] );
	if( editmesh )
		drawControls();

}

if( !("require" in window) ) {
	if( !require_required ) {
		var script = document.createElement( "SCRIPT" );
		script.src =  origin + "/util/require.js";
		//document.body.appendChild( script );
		require_required = true;

		script = document.createElement( "SCRIPT" );
		script.src =  origin + "/util/json6.js";
		document.body.appendChild( script );
		script.onload = ()=>{
			JSON.parse = JSON6.parse;
			console.log( "loaded" );
		}	
	}
	//setTimeout( setupGrid, 10 );
	//return;
}
//if( !window.require ) {
//	setTimeout( setupGrid, 10 );
//	return;
//}


var styles = []; // these are styles for the page.....
var allScripts = [];
var allControls = [];
var controls = []
var colors = [];

var undo = [];

var root = document.documentElement;
console.log( root );


//var toolbox_window = window.open("toolbox.js");
if( !location.pathname.includes( "editor/toolbox.html" ) ) {
	var toolbox_window = window.open( origin + "/toolbox.html", "editor_toolbox" );

	window.addEventListener( 'message', ProcessChildMessage );

	//toolbox_window.postMessage( '{op:"connected"}', toolbox_window.location.href );

	function ProcessChildMessage(message) {
		// do something with the message
		_debug && console.log( "Parent Message:", message );
		try {
			var msg = message.data;
			if( msg.op == "Hello" ) {
				postDivs(toolbox_window);
				postStyles(toolbox_window);
				postScripts(toolbox_window);
			}
			else if( msg.op === "select" ) {
				selected_control = allControls[msg.index];
			}
			else if( msg.op === "clearSelection" ) {
				selected_control = null;
			}
			else if( msg.op === "setId" ) {
				var tmp = allControls[msg.index];

				var undoRecord = { control: tmp, id: tmp.element.id };
				undo.push( undoRecord );

				tmp.element.id = msg.id;
                                
			}
			else if( msg.op === "setClass" ) {
				var tmp = allControls[msg.index];
				var undoRecord = { control: tmp, class: tmp.element.class };
				undo.push( undoRecord );
				tmp.element.class = msg.class;
			}
			else if( msg.op === "setHtml" ) {
				var tmp = allControls[msg.index];
				var undoRecord = { control: tmp, innerHtml: tmp.element.innerHtml };
				undo.push( undoRecord );
				tmp.element.innerHTML = msg.innerHtml;
			}
			else if( msg.op === "setText" ) {
				var tmp = allControls[msg.index];
				var undoRecord = { control: tmp, innerText: tmp.element.innerText };
				undo.push( undoRecord );
				tmp.element.innerText = msg.innerText;
			}
			else if( msg.op === "setSrc" ) {
				var tmp = allControls[msg.index];
				var undoRecord = { control: tmp, src: tmp.element.src };
				undo.push( undoRecord );
				tmp.element.src = msg.src;
			}
			else if( msg.op === "setLayout" ) {
				selected_control = allControls[msg.index];
				var undoRecord = { control: selected_control, layout :  readRect( selected_control.element ) };
				undo.push( undoRecord );
				if( msg.layout.left )
					selected_control.element.style.left = msg.layout.left;
				if( msg.layout.top )
					selected_control.element.style.top = msg.layout.top;
				if( msg.layout.width )
					selected_control.element.style.width = msg.layout.width;
				if( msg.layout.height )
					selected_control.element.style.height = msg.layout.height;
			} else if( msg.op === "createStyleRule" ) {
				if( document.styleSheets.length ) {
					document.styleSheets[0].addRule( selector, "" );
					styles.push( { index : styles.length, style:document.styleSheets[0].rules[document.styleSheets[0].rules.length-1], text:msg.style.selectorText } );
				}

				//var s = document.createElement( "
			} else if( msg.op === "setStyleRule" ) {
				var style = styles[msg.index];
				style.style.cssText = msg.style.cssText;
				
			}	

		} catch(err) {
		}
	}

}


var gameContainer;
var editmesh;
var visible = false;
var ctx;  // this is what to draw on...

var mouse_drag;
var mouse_size;
var mouse_over;
var selected_control;



function addEditor() {
	if( !gameContainer ) {
		gameContainer = document.createElement( "div" );
		gameContainer.style.border = 0;
		gameContainer.style.position = "absolute";
		gameContainer.style.left = 0;
		gameContainer.style.top = 0;
		gameContainer.style.width = "100%";
		gameContainer.style.height = "100%";
		gameContainer.style.zIndex = 10000;
	        
		editmesh = document.createElement( "canvas" );
	        
		gameContainer.appendChild( editmesh );
		editmesh.style.objectFit = "cover";
		editmesh.style.width = "100%";
		editmesh.style.height = "100%";
		editmesh.width = 1920;
		editmesh.height = 1080;
		editmesh.style.border = 0;

		ctx=editmesh.getContext("2d");

		editmesh.addEventListener( "mouseup", (event) => {
			if( !visible ) return;
			//console.log( "Mouse Event : ", event );
			event.preventDefault();
			mouse_drag = null;//locateTarget( document.body.childNodes, event );
			mouse_size = null;//locateTarget( document.body.childNodes, event );
		})

		editmesh.addEventListener( "mousedown", (event) => {
			//console.log( "Mouse Event : ", event );
			if( !visible ) return;
			event.preventDefault();
			if( selected_control ){
				var nearEdge = 0;
				if( ( event.clientX - selected_control.rect.left ) < 10 ) {
					nearEdge |= 1;
				}
				if( ( event.clientY - selected_control.rect.top ) < 10 )
					nearEdge |= 2;
				if( ( selected_control.rect.bottom - event.clientY ) < 10 )
					nearEdge |= 4;
				if( ( selected_control.rect.right - event.clientX ) < 10 )
					nearEdge |= 8;
				mouse_drag = { element : selected_control.element, control : selected_control, x: event.clientX, y:event.clientY, e : event, nearEdge : nearEdge, level:0 };
			} else {
				mouse_drag = locateTarget( controls, event, 0 );
				if( mouse_drag && !mouse_drag.element.id )
					mouse_drag = null;
			}
			console.log( "Mouse_drag has changed....", mouse_drag );
			if( mouse_drag && mouse_drag.nearEdge )  {
				mouse_size = mouse_drag;
				mouse_drag = null;
			}

			if( mouse_drag || mouse_size ) {
				var undoRecord = { selection: mouse_drag||mouse_size, firstEvent : event
				     , position: readRect( (mouse_drag||mouse_size).element )  };
				undo.push( undoRecord );
			}
		})

		editmesh.addEventListener( "mousemove", (event) => {
			if( !visible ) return;
			mouse_over = locateTarget( controls, event, 0 );
                        //console.log( "Mouse Move Event : ", (mouse_drag)?"DRAG":"" );
			if( mouse_size ) {
				event.preventDefault();
				var deltaX = 100*(event.clientX - mouse_size.x) / mouse_size.control.pr.width;
                        	var deltaY = 100*(event.clientY - mouse_size.y)/mouse_size.control.pr.height;

				var rect = readRect( mouse_size.element );
				if( mouse_size.nearEdge & 1 ) {
					mouse_size.element.style.left = rect.left + deltaX+ "%";
					mouse_size.element.style.width = rect.width - deltaX+ "%";
				}
				if( mouse_size.nearEdge & 2 ) {
					mouse_size.element.style.top = rect.top + deltaY+ "%";
					mouse_size.element.style.height = rect.height - deltaY+ "%";
				}
				if( mouse_size.nearEdge & 4 ) {
					//mouse_size.element.style.top = top + deltaY;
					mouse_size.element.style.height = rect.height + deltaY+ "%";
				}
				if( mouse_size.nearEdge & 8 ) {
					mouse_size.element.style.width = rect.width + deltaX + "%";
				}
				updateRects( mouse_size.control );
				if( editmesh )
					drawControls();

				mouse_size.x = event.clientX;
				mouse_size.y = event.clientY;
			}
                        if( mouse_drag ) {
				event.preventDefault();

				var deltaX = 100 * ( event.clientX - mouse_drag.x ) / mouse_drag.control.pr.width;
                        	var deltaY = 100 * ( event.clientY - mouse_drag.y ) / mouse_drag.control.pr.height;
				var left = Number(mouse_drag.element.style.left.replace('%', ''))||0;
				var top = Number(mouse_drag.element.style.top.replace('%', ''))||0;
				//var c = mousePercent( mouse_drag, event );

			        mouse_drag.element.style.left =(left +deltaX)+"%";//- ((mouse_drag.x-event.clientX)/10))+"%";
                        	mouse_drag.element.style.top = (top  +deltaY)+"%";//- ((mouse_drag.y-event.clientY) / 10))+"%";

				var staticRect = mouse_drag.element.getBoundingClientRect();
				var rect = { left:staticRect.left,top:staticRect.top,width:staticRect.width,height:staticRect.height, right:staticRect.right, bottom: staticRect.bottom };

				rect.left += mouse_drag.control.rectOffset.left;
				rect.top += mouse_drag.control.rectOffset.top;
				rect.right += mouse_drag.control.rectOffset.left;
				rect.bottom += mouse_drag.control.rectOffset.top;
                                Object.assign( mouse_drag.control.rect, rect );
				updateRects( mouse_drag.control.child );
				if( editmesh )
					drawControls();

			//console.log( "rect top:", mouse_drag.control.rect.top, mouse_drag.element.style.top, staticRect.top );

				mouse_drag.x = event.clientX;
				mouse_drag.y = event.clientY;

				// e is readonly...
			//mouse_drag.e.clientX = event.clientX;
			//mouse_drag.e.clientY = event.clientY;

                        }
		      })


		document.body.appendChild( gameContainer );
		handleResize();
		defaultRefresh();
	}        
	gameContainer.style.visibility = visible?"visible":"hidden";
}

function setupKeyPress( window ) {
	var collect = '';
	var lasttick = Date.now();
	window.addEventListener( "keydown", (key)=>{
		var now;
		if( ( now = Date.now() ) - lasttick > 500 ) 
			collect = '';
		lasttick = now;

		// -----   CTRL+ALT+C and Escape for edit keys
		if( key.key == 'Escape' ) {
			if( visible ) {
				visible = false;
				gameContainer.style.visibility = "hidden"; 
			}
		}

		if( key.ctrlKey && key.altKey ) {
			if( key.key == 'c' || key.key == 'C' )
			{
				collect = ''; 
				gameContainer.style.visibility = "visible"; 
				visible = true;
				drawControls();
			}
			console.log( "keydown..." );	
		}
	
		if( key.key == 'z' ) {
			if( key.ctrlKey ) {
				Undo();
			}
		}

		// ----- keystrokes 'edit' and 'done' to edit things.
		if( key.key == 'd' || key.key=='D' ) if( collect === '' ) collect += "d";
		if( key.key == 'o' || key.key=='O') if( collect === 'd' ) collect += "o";
		if( key.key == 'n' || key.key=='N') if( collect === 'do' ) collect += "n";
		if( key.key == 'e' || key.key=='E') {
			if( collect === 'don' ) { 
				visible = false;
				gameContainer.style.visibility = "hidden"; 
			}
		}


		if( key.key == 'e' || key.key=='E' ) if( collect === '' ) collect += "e";
		if( key.key == 'd' || key.key=='D') if( collect === 'e' ) collect += "d";
		if( key.key == 'i' || key.key=='I') if( collect === 'ed' ) collect += "i";
		if( key.key == 't' || key.key=='T') 
			if( collect === 'edi' ) { 
				collect = ''; 
				visible = true;
				addEditor();
				
			}
		
	} );
}

setupKeyPress( window );


function Undo() {
	var lastRec = undo.pop();
	if( lastRec ) {
		if( lastRec.selection ) {
			lastRec.selection.element.style.left = lastRec.position.left +"%";
			lastRec.selection.element.style.top = lastRec.position.top +"%";
			lastRec.selection.element.style.width = lastRec.position.width +"%";
			lastRec.selection.element.style.height = lastRec.position.height +"%";
			updateRects( lastRec.selection.control );
		}
		if( lastRec.control ) {
			if( lastRec.id )
				lastRec.control.element.id = lastRec.id;
			if( lastRec.class )
				lastRec.control.element.class = lastRec.class;
			if( lastRec.src )
				lastRec.control.element.src = lastRec.src;
			if( lastRec.innerHtml )
				lastRec.control.element.innerHtml = lastRec.innerHtml;
			if( lastRec.innerText )
				lastRec.control.element.innerText = lastRec.innerText;
		}
	}
}


function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}
	function locateTarget( controls, event, level ) {
		var result;
		//console.log( "------- FIND TARGET ----------- " );
		for( var n = 0; n < controls.length; n++ ) {
			result = locateTarget2( controls[n], event, level );
			if( result ) return result;
		}
		return result;
	}
  function locateTarget2( controls, event, level ) {
	if( !level ) level = 0;
	
    for( var control = controls; control; control = control.elder ) {
	var c = control.element;
	if( c === editmesh ) continue;
	if( c === gameContainer ) continue;

	//console.log( "mouse is ", event.clientX, event.clientY, " in " , control.rect )
	if( "getBoundingClientRect" in c  
		|| "clientHeight" in c ) 
	{

	//var rect = c.getBoundingClientRect();
	var ofs = getOffset( c );
	var rect = control.rect;//{ top:ofs.top, left:ofs.left, bottom:ofs.top+c.clientHeight, right:ofs.left+c.clientWidth };
      if( ( c.id || control.child )
	&& event.clientX >= rect.left
        && event.clientX < rect.right
        && event.clientY >= rect.top
        && event.clientY < rect.bottom ) {
	var result;
	//console.log( "in element: ", rect );
	var nearEdge = 0;
	if( ( event.clientX - rect.left ) < 10 ) {
		nearEdge |= 1;
	}
	if( ( event.clientY - rect.top ) < 10 )
		nearEdge |= 2;
	if( ( rect.bottom - event.clientY ) < 10 )
		nearEdge |= 4;
	if( ( rect.right - event.clientX ) < 10 )
		nearEdge |= 8;
	//console.log( "look for a deepr control..." );
	 if( !(result=locateTarget2( control.child, event, ++level )) ) {
	        //console.log( "not in a deeper control...")
		if( c.id ) 
		        return  { element : c, control : control, x: event.clientX, y:event.clientY, e : event, nearEdge : nearEdge, level:level };
		else
			return result;
	}
	else {
	        //console.log( "in a deeper control...", result)
		return result
	}
	}
      }
      //if( event.x)
    }
	return null;
        //if( event.x)
  }

	function mousePercent( c, event ) {
		var coord = { x: 0, y: 0 };
		coord.x = 100 * ( event.clientX - c.control.rect.left ) / c.control.pr.width;
		coord.y = 100 * ( event.clientY - c.control.rect.top ) / c.control.pr.height;
		return coord;
	}

	function getWidth( width, element ) {
		if( width.includes("px") )
			return Number( width.replace('px', ''));
	 	
		if( width.includes("%") ) {
			
			return Number( width );
		}
	}


	function readRect( element ) {
		var r = { left: 0, width : 0, top: 0, height : 0, px : 0, py : 0 };
		var val;
		var parent = element.parentElement;
		val = element.style.left;
		if( val.includes("px") ) {
			r.left = 100 * getWidth( parent.style.width ) / ( parseInt( val.replace('px', ''), 10) ) ;
		} else if( val.includes( "%" ) ) {
			r.left = parseFloat ( val, 10 );
		}
		val = element.style.top;
		if( val.includes("px") ) {
			r.top = 100 * getWidth( parent.style.height ) / ( parseInt( val.replace('px', ''), 10) ) ;
		} else if( val.includes( "%" ) ) {
			r.top = parseFloat ( val, 10 );
		}
		val = element.style.width;
		if( val.includes("px") ) {
			r.width = 100 * getWidth( parent.style.width ) / ( parseInt( val.replace('px', ''), 10) ) ;
		} else if( val.includes( "%" ) ) {
			r.width = parseFloat ( val, 10 );
		}
		val = element.style.height;
		if( val.includes("px") ) {
			r.height = 100 * getWidth( parent.style.height ) / ( parseInt( val.replace('px', ''), 10) ) ;
		} else if( val.includes( "%" ) ) {
			r.height = parseFloat ( val, 10 );
		}
		return r;
	}


	function updateRects( control ) {
		while( control ) {
			var staticRect = control.element.getBoundingClientRect();
			var rect = { left:staticRect.left,top:staticRect.top,width:staticRect.width,height:staticRect.height, right:staticRect.right, bottom: staticRect.bottom };
			rect.left += control.rectOffset.left;
			rect.top += control.rectOffset.top;
			rect.right += control.rectOffset.left;
			rect.bottom += control.rectOffset.top;
		
        	        Object.assign( control.rect, rect );
			if( control.child )
				updateRects( control.child )
			control = control.elder;
		}
		
	}


var controlOffset = { left:0, top:0 };
var virtualParent = undefined;
function Control( element, rect, rectOffset ) {
	var c = { element:element
	        , rect : rect
		, rectOffset : rectOffset
          , child : undefined
          , parent : undefined
          , elder : undefined
	  , index : 0
	, level : 0
          };
        c.index = allControls.length;
	allControls.push( c );
	//console.log( "Addint a control at: ", rect.top, c.index, element.nodeName, element.id );

	// set current pixel correds into relative coords.
	fixLayout( c );

	//console.log( "New Control is: ", c, Object.keys( Object.getPrototypeOf( element) ))
	for( var n = 0; n < controls.length; n++ ) {
		var x = controls[n];
		//console.log( "parent node : ", element.parentNode)
		//console.log( "element : ", x.element )
		function findParent( x, element ) {
			var parent;
			for( parent = element.parentNode; parent; parent = parent.parentNode ) {
				if( x.element == parent ) {
					for( var child = x.child; child; child = child.elder ) {
						var _child = findParent( child, element );
						if( _child ) 
							return _child;
							
					}
					return x;
				}
			}
			return null;
		}
		x = findParent( x, element );
		if( x ) {
			// parent already in control list; don't add this to controls.
		      //console.log( "Found parent for this....");
		      c.parent = x;
		      c.elder = x.child;
		      x.child = c;
		      c.level = x.level+1;
		      return c;
		}
	}

	for( var n = 0; n < controls.length; n++ ) {
		var x = controls[n];
		//console.log( "parent node : ", element.parentNode)
		//console.log( "element : ", x.element )
		var parent;
		for( parent = x.element.parentNode; parent; parent = parent.parentNode ) {
			if( element == parent )
				break;
		}
		if( parent ) {
			controls.splice( n, 1 );
			controls.push( c );
				
		      //console.log( "Found parent for this....");
			while( x && x.parent ) x = x.parent;
			x.parent = c;
			x.elder = x.child;
			c.child = x;
			c.level = x.level-1;
			return c;
		}
	}
	if( virtualParent && !c.parent ) {
		c.parent = virtualParent;
		c.elder = virtualParent.child;
		virtualParent.child = c;
		c.level = virtualParent.level+1;
	} else {
		// no parent or child found in list already.
		//console.log( "added ", c.element )
		c.level = 0;
		controls.push( c );
	}
	return c;
}

function fixLayout(c) {
	var e = c.element;
	var p = e.parentElement;
	var er = e.getBoundingClientRect();
	var pr = p.getBoundingClientRect();

	c.pr = pr;
	c.er = er;

	if( !e.style.left || !e.style.left.endsWith( "%" ) ) {
		//e.style.left = 100 * er.left / pr.width + "%";
		e.style.left = 100 * e.clientLeft / p.clientWidth + "%";
	}
	if( !e.style.top || !e.style.top.endsWith( "%" ) ) {
		//e.style.top = 100 * er.top / pr.height + "%";
		e.style.top = 100 * e.clientTop / p.clientHeight + "%";
	}
	if( !e.style.width || !e.style.width.endsWith( "%" ) ) {
		//e.style.width = 100 * er.width / pr.width + "%";
		e.style.width = 100 * e.clientWidth / p.clientWidth + "%";
	}
	if( !e.style.height || !e.style.height.endsWith( "%" ) ) {
		//e.style.height = 100 * er.height / pr.height + "%";
		e.style.height = 100 * e.clientHeight / p.clientHeight + "%";
	}
	//	e.style.width
}


function packDiv( control ) {
			var id = control.element.id;
			var altId = control.element.nodeName + " " + control.element.style.width + " x " + control.element.style.height;

	return {op:"div",
					id:id,
					nChild : (control.child?control.child.index:-1),
					nParent : (control.parent?control.parent.index:-1),
					nElder :(control.elder?control.elder.index:-1),
					altId:altId,
					level:control.level,
					rect:control.rect,
					layout : { left : control.element.style.left,
						top :control.element.style.top, 
						width:control.element.style.width ,
						height : control.element.style.height },
					innerHtml : control.child?"":control.element.innerHTML,
					innerText : control.element.innerText,
					class : control.element.class,
					style : control.element.style.cssText,
					src : control.element.src,
					index:control.index
				}
}

function postDivs( w ) {
	controls.forEach( postDiv );
	function postDiv(control){
		if( !control ) return;
		if( control.elder )
			postDiv( control.elder );

		try {
			w.postMessage( packDiv( control ), origin_addr );
		}catch( err ) {
			console.log ("POST MESSAGE PUKED:", err );
		}
		postDiv( control.child );
	}	
}

function postStyles( w ) {
	styles.forEach( postStyle );
	function postStyle(style){
		try {
			w.postMessage( {op:"style", 
				index : style.index,
				cssText : style.style.cssText,
				selectorText : style.style.selectorText,
			}, origin_addr );
		}catch( err ) {
			console.log ("POST MESSAGE PUKED:", err );
		}
	}	
}

function postScripts( w ) {
	allScripts.forEach( postScript );
	function postScript(script){
		try {
			w.postMessage( {op:"script", 
				src : script.src,
			}, origin_addr );
		}catch( err ) {
			console.log ("POST MESSAGE PUKED:", err );
		}
	}	
}


function drawControls() {
	if( !visible ) return;

	ctx.clearRect(0, 0, editmesh.width, editmesh.height);

	function forall( root, cb ) {
		for( var a = root; a; a = a.elder) cb( a );
	}
	var stroke = [ "black","black","black","black" ];
	var stroke_width = 1;

	controls.forEach( drawControl );


function drawControl(control){
	if( !control ) return;
	//control.rect = control.element.getBoundingClientRect();
	var rect = control.rect;
	if( selected_control === control ) {
		stroke_width = 4;
			if( mouse_over && mouse_over.nearEdge & 1 ) 
				stroke[0] = "white";
			else
				stroke[0] = "red";
			if( mouse_over && mouse_over.nearEdge & 2 ) 
				stroke[1] = "yellow";
			else
				stroke[1] = "red";
			if( mouse_over && mouse_over.nearEdge & 4 ) 
				stroke[2] = "yellow";
			else
				stroke[2] = "red";
			if( mouse_over && mouse_over.nearEdge & 8 ) 
				stroke[3] = "yellow";
			else
				stroke[3] = "red";
	}
	if( ( mouse_drag && ( mouse_drag.control == control ) ) 
	  || ( mouse_size && ( mouse_size.control == control ) ) ) {
		var thisControl = mouse_drag || mouse_size;
		stroke_width = 4;
			if( thisControl && thisControl.nearEdge & 1 ) 
				stroke[0] = "white";
			else
				stroke[0] = "blue";
			if( thisControl && thisControl.nearEdge & 2 ) 
				stroke[1] = "yellow";
			else
				stroke[1] = "blue";
			if( thisControl && thisControl.nearEdge & 4 ) 
				stroke[2] = "yellow";
			else
				stroke[2] = "blue";
			if( thisControl && thisControl.nearEdge & 8 ) 
				stroke[3] = "yellow";
			else
				stroke[3] = "blue";
	}
	else if( ( !selected_control && !mouse_drag ) && mouse_over && mouse_over.element === control.element )  {
		stroke_width = 3;
		if( mouse_over.nearEdge ) {
			if( mouse_over.nearEdge & 1 ) 
				stroke[0] = "yellow";
			else
				stroke[0] = "green";
			if( mouse_over.nearEdge & 2 ) 
				stroke[1] = "yellow";
			else
				stroke[1] = "green";
			if( mouse_over.nearEdge & 4 ) 
				stroke[2] = "yellow";
			else
				stroke[2] = "green";
			if( mouse_over.nearEdge & 8 ) 
				stroke[3] = "yellow";
			else
				stroke[3] = "green";
		} else {
			stroke[0] = "green";
			stroke[1] = "green";
			stroke[2] = "green";
			stroke[3] = "green";
		}
	} else if( mouse_drag !== selected_control 
		&& mouse_over !== selected_control 
		&& selected_control !== control ) {
		stroke_width = 0.5;
			stroke[0] = "black";
			stroke[1] = "black";
			stroke[2] = "black";
			stroke[3] = "black";
	}
	
	for( var n = 0; n < 2; n++ ) {
		ctx.lineWidth = (n==0)?5:stroke_width;
		ctx.strokeStyle = (n==0)?"white":stroke[1];
		ctx.beginPath();
		ctx.moveTo(rect.left-((n==0)?2:0), rect.top + (4 * control.level));
		ctx.lineTo(rect.right+((n==0)?2:0), rect.top + (4 * control.level));
		ctx.stroke();
	        
		ctx.strokeStyle = (n==0)?"white":stroke[2];
		ctx.beginPath();
		ctx.moveTo(rect.left-((n==0)?2:0),rect.bottom - (4 * control.level));
		ctx.lineTo(rect.right-((n==0)?2:0), rect.bottom  - (4 * control.level));
		ctx.stroke();
	        
		ctx.strokeStyle = (n==0)?"white":stroke[0];
		ctx.beginPath();
		ctx.moveTo(rect.left + (4 * control.level),rect.top);
		ctx.lineTo(rect.left + (4 * control.level), rect.bottom);
		ctx.stroke();
	        
		ctx.strokeStyle = (n==0)?"white":stroke[3];
		ctx.beginPath();
		ctx.moveTo(rect.right - (4 * control.level),rect.top);
		ctx.lineTo(rect.right - (4 * control.level), rect.bottom);
		ctx.stroke();
	}

	ctx.font = '24px serif';
	ctx.fillStyle = 'black';
	ctx.fillText( control.element.tagName + "#" + control.element.id, rect.left+2,rect.top+2 );
	ctx.fillStyle = 'white';
	ctx.fillText( control.element.tagName + "#" + control.element.id, rect.left,rect.top );
	drawControl( control.elder );
	drawControl( control.child );
};

}

function defaultRefresh() {
	if( !visible ) 
		return;
	drawControls();
	setTimeout( defaultRefresh, 250 );
}


function setupStyles() {
	for( var n = 0; n < document.styleSheets.length; n++ ) {
		var sheet = document.styleSheets[n];
		if( sheet.rules )
		for( var m = 0; m < sheet.rules.length; m++ ) {
			var rule = sheet.rules[m];
			styles.push( { index : styles.length, style:rule, text:rule.selectorText } );
		}
	} 

}
setupStyles();

var idle_count = 0;
var loading = true;
function setupControls() {
	loading = false;
	function addControls( parent, element ) {
		if( !element ) { loading = true; return false; }
		//console.log( "Looking at element:", element );
		if( element === editmesh ) return false;
		if( element === gameContainer ) return false;
		if( "IFRAME" === element.nodeName ) {
			var priorOffset = controlOffset;
			controlOffset = element.getBoundingClientRect();
			try {
			if( !element.contentWindow.document.body )
				element.contentWindow.document.addEventListener( "load", 
					()=> {
						var priorOffset = controlOffset;
						controlOffset = element.getBoundingClientRect();
					console.log( "This is a load event:", created );
						virtualParent = created;
						addControls( parent, element.contentWindow.document.body ) 
						controlOffset = priorOffset;
					}
				);
			else {
				virtualParent = parent;//controls[0];
				 if( addControls( parent, element.contentWindow.document.body ) ) {
					setupKeyPress( element.contentWindow );
				}
			}
			} catch ( err ) {
				console.log( "Probably a security fence....", err );
			}
			controlOffset = priorOffset;
		}
		if( "STYLE" === element.nodeName ) {
		}
		if( "SCRIPT" === element.nodeName ) {
			if( element.src ) {
				var existing = allScripts.find( c=>c.src === element.src );	
				if( !existing ) 
		                	allScripts.push( { index : allScripts.length, src : element.src, origin: element.origin } );
		
			}
		}
		var created = false;
		if( ["BODY","DIV","IMG","SPAN"].find( tag=>tag === element.nodeName ) ){
			var existing = allControls.find( c=>c.element === element );	
			if( !existing ) {
				var staticRect = element.getBoundingClientRect();
				var rect = { left:staticRect.left,top:staticRect.top,width:staticRect.width,height:staticRect.height, right:staticRect.right, bottom: staticRect.bottom };
				
				rect.left += controlOffset.left;
				rect.top += controlOffset.top;
				rect.right += controlOffset.left;
				rect.bottom += controlOffset.top;
				created = Control( element, rect, controlOffset );
			}
			else
				created = existing;
        	}
		var children = element.children;
		if( children.length ) {
			//console.log( "Children of:", element, children );
			for( var c = 0; c < children.length; c++ ) 
				addControls( created||parent, children[c] );
			//console.log( "this created is an array:", created );
		}
		return created;
	}
	addControls( controls[0], document.body );
	if( loading )
		setTimeout( setupControls, 500 );
	else if( idle_count++ < 3 ) 
		setTimeout( setupControls, 500 ) ;

}
setupControls();

//setInterval( tick, 3000 );


function initialPage( page ) {

	allControls.forEach( control=>{
		var pagecon = page.controls.find( old=>old.index === control.index );
		if( !pagecon ) {
			if( ws ) {
				ws.send( JSON.stringify(packDiv( control )) );
			}
		}
	} );

	page.controls.forEach( savedControl=>{
        	var mod = savedControl.mods[0];
		if( !mod ) return;
                var control = controls[savedControl.index];
                switch( true ) {
        	case (mod.setFlags & 1)!=0 :
                	control.element.id = mod.id;
                	break;
        	case (mod.setFlags & 2)!=0 :
                	control.element.class = mod.class;
                	break;
        	case (mod.setFlags & 4)!=0 :
                	control.element.style.left = mod.layout.left;
                	control.element.style.top = mod.layout.top;
                	control.element.style.width = mod.layout.width;
                	control.element.style.height = mod.layout.height;
                	break;
        	case (mod.setFlags & 8)!=0 :
                	control.element.src = mod.src;
                	break;
        	case (mod.setFlags & 16)!=0 :
                	control.element.innerHTML = mod.innerHtml;
                	break;
        	case (mod.setFlags & 32)!=0 :
                	control.element.innerText = mod.innerText;
                	break;
                }
        } );
        
}

function handleMessages( ws, msg, _msg ) {
	if( msg.op === "page" ) {
        	initialPage( msg.page );
	} 
}

handleMessageExport = handleMessages;
} // setupGrid()

