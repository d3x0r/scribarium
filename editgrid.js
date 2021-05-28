"use strict";
const _debug = false;

window.editGrid = {
    toolbox : null,
    setToolbox( toolbox ) {
        	editGrid.toolbox = toolbox;
        	console.log( "Toolbox thinks it wants to add itself:", toolbox );
    },

    };

{
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    //link.id   = cssId;
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = './node_modules/@d3x0r/popups/styles.css';
    link.media = 'all';
    head.appendChild(link);
}

import {Popup, popups} from "./node_modules/@d3x0r/popups/popups.mjs";

var arrScripts = document.getElementsByTagName('script');
var strScriptTagId = arrScripts[arrScripts.length - 1];
//debugger;
//console.log( "HELLO! I have Context?", strScriptTagId )

var origin;
if( strScriptTagId.origin )  {
	console.log( "had a origin from external:", strScriptTagId.origin );
	var origin = strScriptTagId.origin || location.origin;
} else {
	// get relative origin to next thing....
	console.log( "Have to figure it out from src?", strScriptTagId.src );
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
var origin_addr = origin.replace( "wss:", "https:" ).replace( "ws:", "http:" ) + "/editgrid.js";

console.log( "ORigin:", origin, origin_addr );
//document.body.addEventListener("load", ()=> {

var require_required = false;
setupGrid();
//---------------------------------------------------------------------------
// The remainider of this script is all within this function as a context.
//---------------------------------------------------------------------------
import {JSOX} from "./node_modules/jsox/lib/jsox.mjs"
JSON = JSOX;


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


var styles = []; // these are styles for the page.....
var allScripts = [];
var allControls = [];
var controls = []
var colors = [];

var undo = [];

var root = document.documentElement;
console.log( root );

const toolbox = popups.makeFromURL(  "./toolbox.html" );
toolbox.divFrame.style.zIndex = 50;

if( !location.pathname.includes( "editor/toolbox.html" ) ) {
	origin = origin.replace( "wss:", "https:" );
	origin = origin.replace( "ws:", "http:" );
	console.log( "origin is now:", origin );

	//var toolbox_window = window.open( origin + "/toolbox.html", "editor_toolbox" );

	//window.addEventListener( 'message', ProcessChildMessage );

	window.editGrid.send = ProcessChildMessage;
	//window.editGrid.toolbox.post( {op:"connected"}, toolbox_window.location.href );

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
				mouse.selected_control = allControls[msg.index];
			}
			else if( msg.op === "clearSelection" ) {
				mouse.selected_control = null;
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
				mouse.selected_control = allControls[msg.index];
				var undoRecord = { control: mouse.selected_control, layout :  readRect( mouse.selected_control.element ) };
				undo.push( undoRecord );
				if( msg.layout.left )
					mouse.selected_control.element.style.left = msg.layout.left;
				if( msg.layout.top )
					mouse.selected_control.element.style.top = msg.layout.top;
				if( msg.layout.width )
					mouse.selected_control.element.style.width = msg.layout.width;
				if( msg.layout.height )
					mouse.selected_control.element.style.height = msg.layout.height;
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
var visible = true;
var ctx;  // this is what to draw on...

const mouse = {
    drag: false,
        size:false,
        over:false,
        selected_control:null,
        selectRect:false,
        selectedRect : false,
        pos:{x:0,y:0},
        rect:{ x:0,y:0,xto:0,yto:0 }
        }


addEditor();

function addEditor() {
	if( !gameContainer ) {
		gameContainer = document.createElement( "div" );
		gameContainer.style.border = 0;
		gameContainer.style.position = "absolute";
		gameContainer.style.left = 0;
		gameContainer.style.top = 0;
		gameContainer.style.width = "100%";
		gameContainer.style.height = "100%";
		gameContainer.style.zIndex = 10;
	        
		editmesh = document.createElement( "canvas" );
	        
		gameContainer.appendChild( editmesh );
		editmesh.style.objectFit = "cover";
		editmesh.style.width = "100%";
		editmesh.style.height = "100%";
		editmesh.width = 1920;
		editmesh.height = 1080;
		editmesh.style.border = 0;

		ctx=editmesh.getContext("2d");

                const popup = popups.createMenu();
                popup.addItem("Create Div", ()=>{
			const r = { left: mouse.rect.x, top:mouse.rect.y, width:mouse.rect.xto-mouse.rect.x, height:mouse.rect.yto-mouse.rect.y };
                        const l = {left: mouse.rect.x/19.2, top:mouse.rect.y/10.8, width:r.width/19.2, height:r.height/10.8 };
			const div = document.createElement( "div" )
			div.className = "scribariumDiv";
                        div.style.position = "absolute";
                        div.style.left = l.left+"%";
                        div.style.top = l.top+"%";
                        div.style.width = l.width+"%";
                        div.style.height = l.height+"%";
                        gameContainer.appendChild( div );
                        mouse.selectedRect = false;
			const c = Control( div, r, {left: mouse.rect.x/19.2, top:mouse.rect.y/10.8, width:r.width/19.2, height:r.height/10.8 } )
                        mouse.selected_control = c;
                        fixLayout(c);
                        window.editGrid.toolbox.post( packDiv( c ), origin_addr );
                        drawControls();
		} );


		editmesh.addEventListener( "mouseup", (event) => {
			if( !visible ) return;
			//console.log( "Mouse Event : ", event );
			event.preventDefault();
                        if( mouse.selectRect ) {
	                        mouse.selectRect = false;
	                        mouse.selectedRect = true;
                                drawControls();
                        }
			mouse.drag = null;//locateTarget( document.body.childNodes, event );
			mouse.size = null;//locateTarget( document.body.childNodes, event );
		})

		editmesh.addEventListener( "contextmenu", (event)=>{
			event.preventDefault();
                        if( mouse.selectedRect ) {
	                        if( mouse.pos.x >= mouse.rect.x && mouse.pos.x <= mouse.rect.xto ) {
	                        if( mouse.pos.y >= mouse.rect.y && mouse.pos.y <= mouse.rect.yto ) {
                                    	popup.show();
                                    }
        	                }
                        }
		} );
		editmesh.addEventListener( "mousedown", (event) => {
			//console.log( "Mouse Event : ", event );
			if( !visible ) return;
			event.preventDefault();

			if( mouse.selected_control ){
				var nearEdge = 0;
				if( ( event.clientX - mouse.selected_control.rect.left ) < 10 ) {
					nearEdge |= 1;
				}
				if( ( event.clientY - mouse.selected_control.rect.top ) < 10 )
					nearEdge |= 2;
				if( ( mouse.selected_control.rect.bottom - event.clientY ) < 10 )
					nearEdge |= 4;
				if( ( mouse.selected_control.rect.right - event.clientX ) < 10 )
					nearEdge |= 8;
				mouse.drag = { element : mouse.selected_control.element, control : mouse.selected_control, x: event.clientX, y:event.clientY, e : event, nearEdge : nearEdge, level:0 };
			} else {
				mouse.drag = locateTarget( controls, event, 0 );
				if( mouse.drag && !mouse.drag.element.id )
					mouse.drag = null;
			}

			console.log( "Mouse_drag has changed....", mouse.drag );
			if( mouse.drag && mouse.drag.nearEdge )  {
				mouse.size = mouse.drag;
				mouse.drag = null;
			}

			if( mouse.drag || mouse.size ) {
				var undoRecord = { selection: mouse.drag||mouse.size, firstEvent : event
				     , position: readRect( (mouse.drag||mouse.size).element )  };
				undo.push( undoRecord );
			}else {
                            if( !mouse.selectedRect ) {
                            	mouse.selectRect = true;
	                            mouse.selectedRect = false;
        	                    mouse.rect.x = event.clientX;
                	            mouse.rect.y = event.clientY;
                        	    mouse.rect.xto = event.clientX;
	                            mouse.rect.yto = event.clientY;
				defaultRefresh();
                            }
                        }
		})

		editmesh.addEventListener( "mousemove", (event) => {
			if( !visible ) return;

                        mouse.pos.x = event.clientX;
                        mouse.pos.y = event.clientY;
                        if( mouse.selectRect ) {
                            	event.preventDefault();
	                        mouse.rect.xto = event.clientX;
        	                mouse.rect.yto = event.clientY;
				drawControls();
                            	return;
                        }
			mouse.over = locateTarget( controls, event, 0 );
                        //console.log( "Mouse Move Event : ", (mouse.drag)?"DRAG":"" );
			if( mouse.size ) {
				event.preventDefault();
				var deltaX = 100*(event.clientX - mouse.size.x) / mouse.size.control.pr.width;
                        	var deltaY = 100*(event.clientY - mouse.size.y)/mouse.size.control.pr.height;

				var rect = readRect( mouse.size.element );
				if( mouse.size.nearEdge & 1 ) {
					mouse.size.element.style.left = rect.left + deltaX+ "%";
					mouse.size.element.style.width = rect.width - deltaX+ "%";
				}
				if( mouse.size.nearEdge & 2 ) {
					mouse.size.element.style.top = rect.top + deltaY+ "%";
					mouse.size.element.style.height = rect.height - deltaY+ "%";
				}
				if( mouse.size.nearEdge & 4 ) {
					//mouse.size.element.style.top = top + deltaY;
					mouse.size.element.style.height = rect.height + deltaY+ "%";
				}
				if( mouse.size.nearEdge & 8 ) {
					mouse.size.element.style.width = rect.width + deltaX + "%";
				}
				updateRects( mouse.size.control );
				if( editmesh )
					drawControls();

				mouse.size.x = event.clientX;
				mouse.size.y = event.clientY;
			}
                        if( mouse.drag ) {
				event.preventDefault();

				var deltaX = 100 * ( event.clientX - mouse.drag.x ) / mouse.drag.control.pr.width;
                        	var deltaY = 100 * ( event.clientY - mouse.drag.y ) / mouse.drag.control.pr.height;
				var left = Number(mouse.drag.element.style.left.replace('%', ''))||0;
				var top = Number(mouse.drag.element.style.top.replace('%', ''))||0;
				//var c = mousePercent( mouse.drag, event );

			        mouse.drag.element.style.left =(left +deltaX)+"%";//- ((mouse.drag.x-event.clientX)/10))+"%";
                        	mouse.drag.element.style.top = (top  +deltaY)+"%";//- ((mouse.drag.y-event.clientY) / 10))+"%";

				var staticRect = mouse.drag.element.getBoundingClientRect();
				var rect = { left:staticRect.left,top:staticRect.top,width:staticRect.width,height:staticRect.height, right:staticRect.right, bottom: staticRect.bottom };

				rect.left += mouse.drag.control.rectOffset.left;
				rect.top += mouse.drag.control.rectOffset.top;
				rect.right += mouse.drag.control.rectOffset.left;
				rect.bottom += mouse.drag.control.rectOffset.top;
                                Object.assign( mouse.drag.control.rect, rect );
				updateRects( mouse.drag.control.child );
				if( editmesh )
					drawControls();

			//console.log( "rect top:", mouse.drag.control.rect.top, mouse.drag.element.style.top, staticRect.top );

				mouse.drag.x = event.clientX;
				mouse.drag.y = event.clientY;

				// e is readonly...
			//mouse.drag.e.clientX = event.clientX;
			//mouse.drag.e.clientY = event.clientY;

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
                        console.log( "control's rect:", staticRect );
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
	//fixLayout( c );

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
	//console.log( "Applying FixLayout to:", c.element.id, c.element.className );
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

		      w.post( packDiv( control ), origin_addr );
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
			w.post( {op:"style", 
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
			w.post( {op:"script", 
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

        if( mouse.selectRect ) {
                const minx = (mouse.rect.x < mouse.rect.xto) ? mouse.rect.x : mouse.rect.xto;
                const miny = (mouse.rect.y < mouse.rect.yto) ? mouse.rect.y : mouse.rect.yto;
                ctx.fillStyle = "#30303030";
            	ctx.fillRect( minx, miny, Math.abs(mouse.rect.x - mouse.rect.xto ), Math.abs(mouse.rect.y - mouse.rect.yto ) );
        }
        if( mouse.selectedRect ) {
                const minx = (mouse.rect.x < mouse.rect.xto) ? mouse.rect.x : mouse.rect.xto;
                const miny = (mouse.rect.y < mouse.rect.yto) ? mouse.rect.y : mouse.rect.yto;
                if( mouse.rect.x != minx ){
                    	const tmpx = mouse.rect.x;
	                mouse.rect.x = minx;
                        mouse.rect.xto = tmpx;
                }
                if( mouse.rect.y != miny ){
                    	const tmpy = mouse.rect.y;
	                mouse.rect.y = miny;
                        mouse.rect.yto = tmpy;
                }

                ctx.fillStyle = "#00600030";
            	ctx.fillRect( minx, miny, Math.abs(mouse.rect.x - mouse.rect.xto ), Math.abs(mouse.rect.y - mouse.rect.yto ) );
        }

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
	if( mouse.selected_control === control ) {
		stroke_width = 4;
			if( mouse.over && mouse.over.nearEdge & 1 ) 
				stroke[0] = "white";
			else
				stroke[0] = "red";
			if( mouse.over && mouse.over.nearEdge & 2 ) 
				stroke[1] = "yellow";
			else
				stroke[1] = "red";
			if( mouse.over && mouse.over.nearEdge & 4 ) 
				stroke[2] = "yellow";
			else
				stroke[2] = "red";
			if( mouse.over && mouse.over.nearEdge & 8 ) 
				stroke[3] = "yellow";
			else
				stroke[3] = "red";
	}
	if( ( mouse.drag && ( mouse.drag.control == control ) ) 
	  || ( mouse.size && ( mouse.size.control == control ) ) ) {
		var thisControl = mouse.drag || mouse.size;
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
	else if( ( !mouse.selected_control && !mouse.drag ) && mouse.over && mouse.over.element === control.element )  {
		stroke_width = 3;
		if( mouse.over.nearEdge ) {
			if( mouse.over.nearEdge & 1 ) 
				stroke[0] = "yellow";
			else
				stroke[0] = "green";
			if( mouse.over.nearEdge & 2 ) 
				stroke[1] = "yellow";
			else
				stroke[1] = "green";
			if( mouse.over.nearEdge & 4 ) 
				stroke[2] = "yellow";
			else
				stroke[2] = "green";
			if( mouse.over.nearEdge & 8 ) 
				stroke[3] = "yellow";
			else
				stroke[3] = "green";
		} else {
			stroke[0] = "green";
			stroke[1] = "green";
			stroke[2] = "green";
			stroke[3] = "green";
		}
	} else if( mouse.drag !== mouse.selected_control 
		&& mouse.over !== mouse.selected_control
		&& mouse.selected_control !== control ) {
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
                if( element === toolbox.divFrame ) return false;

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
        /*
	if( loading )
		setTimeout( setupControls, 500 );
	else if( idle_count++ < 3 ) 
		setTimeout( setupControls, 500 ) ;
	*/

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

