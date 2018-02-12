"use strict";
//document.body.addEventListener("load", ()=> {

var require_required = false;
setupGrid();
function setupGrid() {

if( !("require" in window) ) {
	if( !require_required ) {
		var script = document.createElement( "SCRIPT" );
		script.src = "/util/require.js";
		document.body.appendChild( script );
		require_required = true;
	}
	setTimeout( setupGrid, 10 );
	return;
}
if( !window.require ) {
	setTimeout( setupGrid, 10 );
	return;
}


const JSON6 = window.require( "1:/util/json6.js" );
JSON.parse = JSON6.parse;

console.log( "loaded" );

var root = document.documentElement;
console.log( root );


//var toolbox_window = window.open("toolbox.js");
if( !location.pathname.includes( "editor/toolbox.html" ) ) {
	console.log( "something..." );
	var toolbox_window = window.open("/editor/toolbox.html", "editor_toolbox" );
	//var
	//toolbox_window._origin = toolbox_window.location.href;

	window.addEventListener( 'message', ProcessChildMessage );
	//.toolbox_window.
	function ProcessChildMessage(message) {
		// do something with the message
		console.log( "Parent Message:", message );
		try {
			var msg = message.data;
			if( msg.op == "Hello" ) {
				postDivs(toolbox_window);
			}
			if( msg.op === "select" ) {
				selected_control = allControls[msg.index];
			}
			if( msg.op === "setLayout" ) {
				selected_control = allControls[msg.index];
				if( msg.layout.left )
					selected_control.element.style.left = msg.layout.left;
				if( msg.layout.top )
					selected_control.element.style.top = msg.layout.top;
				if( msg.layout.width )
					selected_control.element.style.width = msg.layout.width;
				if( msg.layout.height )
					selected_control.element.style.height = msg.layout.height;
			}
			toolbox_window.postMessage( '{op:"connected"}', toolbox_window.location.href );

		} catch(err) {
		}
	}

}

var gameContainer = document.createElement( "div" );
gameContainer.style.border = 0;
gameContainer.style.position = "absolute";
gameContainer.style.left = 0;
gameContainer.style.top = 0;
gameContainer.style.width = "100%";
gameContainer.style.height = "100%";


var editmesh = document.createElement( "canvas" );


gameContainer.appendChild( editmesh );
editmesh.style.objectFit = "cover";
editmesh.style.width = "100%";
editmesh.style.height = "100%";
editmesh.width = 1920;
editmesh.height = 1080;
editmesh.style.border = 0;

var visible = false;
gameContainer.style.visibility = "hidden";

function setupKeyPress() {
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
				gameContainer.style.visibility = "visible"; 
				visible = true;
				drawControls();
			}
		
	} );
}

setupKeyPress();



var mouse_drag;
var mouse_size;
var mouse_over;
var selected_control;

editmesh.addEventListener( "mousedown", (event) => {
    console.log( "Mouse Event : ", event );
	event.preventDefault();
	mouse_drag = locateTarget( controls, event, 0 );
	if( mouse_drag && mouse_drag.nearEdge )  {
		mouse_size = mouse_drag;
		mouse_drag = null;
	}
  })

editmesh.addEventListener( "mouseup", (event) => {
    console.log( "Mouse Event : ", event );
	event.preventDefault();
	mouse_drag = null;//locateTarget( document.body.childNodes, event );
	mouse_size = null;//locateTarget( document.body.childNodes, event );
  })


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
      //console.log( "mouse is ", event.clientX, event.clientY, " in " , c.rect )
	if( "getBoundingClientRect" in c  
		|| "clientHeight" in c ) 
	{

	//var rect = c.getBoundingClientRect();
	var ofs = getOffset( c );
	var rect = { top:ofs.top, left:ofs.left, bottom:ofs.top+c.clientHeight, right:ofs.left+c.clientWidth };
	var nearEdge = 0;
      if( //c.id 
	 event.clientX >= rect.left
        && event.clientX < rect.right
        && event.clientY >= rect.top
        && event.clientY < rect.bottom ) {
	var result;
	console.log( "in element: ", rect );
	if( ( event.clientX - rect.left ) < 10 ) {
		nearEdge |= 1;
	}
	if( ( event.clientY - rect.top ) < 10 )
		nearEdge |= 2;
	if( ( rect.bottom - event.clientY ) < 10 )
		nearEdge |= 4;
	if( ( rect.right - event.clientX ) < 10 )
		nearEdge |= 8;

	 if( !(result=locateTarget2( control.child, event, ++level )) ) {
	        //console.log( "in a control...")
	        return  { element : c, x: event.clientX, y:event.clientY, e : event, nearEdge : nearEdge, level:level };
	}
	else	 {
	        //console.log( "still in a control...")
		return result
	}
	}
      }
      //if( event.x)
    }
	return null;
        //if( event.x)
  }

	function mousePercent( event ) {
		
	}

	function getWidth( width, element ) {
		if( width.includes("px") )
			return parseInt( width.replace('px', ''), 10);
	 	
		if( width.includes("%") ) {
			
			return parseInt( width, 10);
		}
	}

	function readRect( mouseEvent, element ) {
		var r = { left: 0, width : 0, top: 0, height : 0, px : 0, py : 0 };
		var val;
		var parent = element.parentElement;
		val = element.style.left;
		if( val.includes("px") ) {
			r.left = 100 * getWidth( parent.style.width ) / ( parseInt( val.replace('px', ''), 10) ) ;
		} else if( val.includes( "%" ) ) {
			r.left = parseInt( val, 10 );
		}
		val = element.style.top;
		if( val.includes("px") ) {
			r.top = 100 * getWidth( parent.style.height ) / ( parseInt( val.replace('px', ''), 10) ) ;
		} else if( val.includes( "%" ) ) {
			r.top = parseInt( val, 10 );
		}
		val = element.style.width;
		if( val.includes("px") ) {
			r.width = 100 * getWidth( parent.style.width ) / ( parseInt( val.replace('px', ''), 10) ) ;
		} else if( val.includes( "%" ) ) {
			r.width = parseInt( val, 10 );
		}
		val = element.style.height;
		if( val.includes("px") ) {
			r.height = 100 * getWidth( parent.style.height ) / ( parseInt( val.replace('px', ''), 10) ) ;
		} else if( val.includes( "%" ) ) {
			r.height = parseInt( val, 10 );
		}
		return r;
	}


    editmesh.addEventListener( "mousemove", (event) => {
	mouse_over = locateTarget( controls, event, 0 );
        //console.log( "Mouse Move Event : ", (mouse_drag)?"DRAG":"" );
	if( mouse_size ) {
		event.preventDefault();
		var deltaX = event.clientX - mouse_size.x;
        	var deltaY = event.clientY - mouse_size.y;

		var rect = readRect( event, mouse_size.element );
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
		mouse_size.x = event.clientX;
		mouse_size.y = event.clientY;
	}
        if( mouse_drag ) {
		event.preventDefault();
		var deltaX = event.clientX - mouse_drag.x;
        	var deltaY = event.clientY - mouse_drag.y;
		var left = parseInt(mouse_drag.element.style.left.replace('px', ''), 10)||0;
		var top = parseInt(mouse_drag.element.style.top.replace('px', ''), 10)||0;
	        mouse_drag.element.style.left =left + event.clientX - mouse_drag.x;
        	mouse_drag.element.style.top = top+event.clientY - mouse_drag.y;

		mouse_drag.x = event.clientX;
		mouse_drag.y = event.clientY;

		// e is readonly...
	//mouse_drag.e.clientX = event.clientX;
	//mouse_drag.e.clientY = event.clientY;

        }
      })



var meshrect = editmesh.getBoundingClientRect();

var ctx=editmesh.getContext("2d");
ctx.beginPath();
ctx.moveTo(0,0);
ctx.lineTo(300,150);
ctx.stroke();

document.body.appendChild( gameContainer );


        //console.log( meshrect );
        //console.log( document.documentElement.childNodes );

        //document.documentElement.body.child
for( var a = 0; a < 1; a++ ) {
	var meshrect = editmesh.getBoundingClientRect();
        editmesh.width = meshrect.right - meshrect.left;
        editmesh.height = meshrect.bottom - meshrect.top;
        console.log( "First Init", meshrect );
}


var allControls = []
var controls = []
var colors = [];

function Control( element, rect ) {
	var c = { element:element
	        , rect : rect
          , child : undefined
          , parent : undefined
          , elder : undefined
	  , index : 0
          };
        c.index = allControls.length;
	console.log( "something: ", c.index, element.nodeName, element.id );
	allControls.push( c );

	fixLayout( c );

	console.log( c, Object.keys( Object.getPrototypeOf( element) ))
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
		      return;
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
			return;
		}
	}
	// no parent or child found in list already.
  //console.log( "added ", c.element )
  controls.push( c );
  return c;
}

function fixLayout(c) {
var e = c.element;
var p = e.parentElement;
var er = e.getBoundingClientRect();
var pr = p.getBoundingClientRect();

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

function postDivs( w ) {
	controls.forEach( postDiv );
	function postDiv(control){
		if( !control ) return;
try {
	var id = control.element.id;
	var altId = control.element.nodeName + " " + control.element.style.width + " x " + control.element.style.height;
		w.postMessage( {op:"div",
			id:id,
			altId:altId,
			gen:control.level,
			rect:control.rect,
			layout : { left : control.element.style.left,
				top :control.element.style.top, 
				width:control.element.style.width ,
				height : control.element.style.height },
			index:control.index}
			, w.location.href );
}catch( err ) {
	console.log ("POST MESSAGE PUKED:", err );
}
		postDiv( control.elder );
		postDiv( control.child );
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
	control.rect = control.element.getBoundingClientRect();
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
	if( selected_control === mouse_drag ) {
		stroke_width = 4;
			if( mouse_over && mouse_over.nearEdge & 1 ) 
				stroke[0] = "white";
			else
				stroke[0] = "blue";
			if( mouse_over && mouse_over.nearEdge & 2 ) 
				stroke[1] = "yellow";
			else
				stroke[1] = "blue";
			if( mouse_over && mouse_over.nearEdge & 4 ) 
				stroke[2] = "yellow";
			else
				stroke[2] = "blue";
			if( mouse_over && mouse_over.nearEdge & 8 ) 
				stroke[3] = "yellow";
			else
				stroke[3] = "blue";
	}
	if( ( selected_control === mouse_drag ) && mouse_over && mouse_over.element === control.element )  {
		stroke_width = 2;
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
	ctx.lineWidth = stroke_width;
	ctx.strokeStyle = stroke[1];
	ctx.beginPath();
	ctx.moveTo(rect.left,rect.top);
	ctx.lineTo(rect.right, rect.top);
	ctx.stroke();

	ctx.strokeStyle = stroke[2];
	ctx.beginPath();
	ctx.moveTo(rect.left,rect.bottom);
	ctx.lineTo(rect.right, rect.bottom);
	ctx.stroke();

	ctx.strokeStyle = stroke[0];
	ctx.beginPath();
	ctx.moveTo(rect.left,rect.top);
	ctx.lineTo(rect.left, rect.bottom);
	ctx.stroke();

	ctx.strokeStyle = stroke[3];
	ctx.beginPath();
	ctx.moveTo(rect.right,rect.top);
	ctx.lineTo(rect.right, rect.bottom);
	ctx.stroke();

	ctx.font = '24px serif';
	ctx.fillStyle = 'blue';
	ctx.fillText( control.element.tagName + "#" + control.element.id, rect.left,rect.top );
	drawControl( control.elder );
	drawControl( control.child );
};
	setTimeout( drawControls, 250 );

}


function setupControls() {
var all = document.getElementsByTagName("*");
//console.log( "document has ", all );

for( var a = 0; a < all.length; a++ ) {
 	let element = all[a];
	//if( !element.id ) continue;
	if( !["BODY","DIV","IMG","SPAN"].find( tag=>tag === element.nodeName ) )
		continue;
	var rect = element.getBoundingClientRect();
		Control( element, rect );
        }
//drawControls();
      //  */

// });
//   setTimeout( tick, 500 );

}
setupControls();

//setInterval( tick, 3000 );
setTimeout( drawControls, 500 );

}