
var sack = require( "sack.vfs" );
var db = sack.Sqlite( "scribarium.db" );

const dbInterface = {
	loadPage : loadPage,
	storeControl : storeControl
};
module.exports = exports = dbInterface;

console.log( db.do( "select * from sqlite_master" ) );

db.makeTable( "create table pages ( page_id INTEGER PRIMARY KEY, url char )" );
// , index pagekey (page_id)
if( !db.makeTable( "create table controls ( page_control_id INTEGER PRIMARY KEY, page_id int, \`index\` int, id char, class char, innerHtml char, innerText char, src char, layout char, foreign key (page_id) references pages(page_id) )" ) )
	console.log( "Error making control table:", db.error );
db.do( "create index if not exists controlpagekey on controls(page_id)" );

if( !db.makeTable( "create table control_modification ( control_mod_id INTEGER PRIMARY KEY, page_control_id int, setFlags int, id char, class char, innerHtml char, innerText char, src char, layout char, foreign key (page_control_id) references controls(page_control_id))" ) )
	console.log( "Error making mod table:", db.error );
db.do( "create index if not exists pagecontrolkey on control_modification(page_control_id)" );

db.do( "pragma foreign_keys=on" );

function loadPage( url ) {
	var pages = db.do( `select page_id from pages where url='${url}'` );
	var page_id;
        if( pages && pages.length )
        	page_id = pages[0].page_id;
        else {
		console.log( "insert..." );
	        db.do( `insert into pages (url) values ('${url}')` );
        	page_id = db.do( `select last_insert_id() as page_id` );
		page_id = page_id[0].page_id;
	        //return page_id[0].page_id;
        }
        var page = {};
        page.page_id = page_id;
        page.controls = db.do( `select * from controls where page_id=${page_id}` );
        page.controls.forEach( control=>{
		control.layout = JSON.parse( control.layout );
        	control.mods = db.do( `select * from control_modification where page_control_id=${control.page_control_id}` );
        } );
	return page;
}


function storeControl( page, control ) {
	page.controls.push( control );
        db.do( `insert into controls (page_id,[index],id,class,innerHtml,innerText,src,layout)values
		(${page.page_id},${control.index}
		,'${db.escape(control.id)}'
		,'${db.escape(control.class)}'
		,'${db.escape(control.innerHtml)}'
		,'${db.escape(control.innerText)}'
		,'${db.escape(control.src)}'
		,'${db.escape(JSON.stringify(control.layout))}'
		)` );
}



