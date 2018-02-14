
# Scrimarium

From the latin 'Scrib-' or about writing, and '-arium' or a location for doing something.

### Installation

```
npm install scribarium

### or ###

git clone https://github.com/d3x0r/scribarium 
cd scribarium
npm install .
```


### Startup

```
npm start
```

Default service is on ports 45200(http) and 45201(https).


## Usage

### from script, append to existing page

```
	var peer = "https://localhost:45201";
	var script = document.createElement("script");
	//script.src = location.origin + "/editor/editgrid.js";
	script.src = "https://localhost:45201/geteditgrid.js";
	document.body.appendChild(script);
```

### Alterntively

```
	<SCRIPT SRC "https://localhost:45201/geteditgrid.js">
```





2 parts....
a server which keeps track of changes.
a client loader which loads the utility scripts and communicates with the server.
Initially the client will download the server's idea of the page, and adjust the page accordingly.
Then edit features may be triggered on the page 
