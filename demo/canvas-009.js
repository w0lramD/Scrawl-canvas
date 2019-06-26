import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


/*
Google Analytics code - loaded in the normal way through markup in the canvas-009.html file (lines 11-21)

Create a new tracker to handle canvas interaction, and set some attributes on it. 

We can then incorporate the tracker's functionality in our various hook functions defined further down in this script
*/ 
let ga = window[window['GoogleAnalyticsObject'] || 'ga'],
	myTracker;

ga('create', 'UA-000000-0', 'auto', 'demoCanvasTracker');

ga(function() {
	myTracker = ga.getByName('demoCanvasTracker');
	myTracker.set('transport', 'beacon');
	myTracker.set('campaignKeyword', 'Scrawl-canvas demo');
});


// Scene setup
let canvas = scrawl.library.artefact.mycanvas;


// Get images from DOM
scrawl.importDomImage('.mypatterns');


// Create Pattern styles using imported images
scrawl.makePattern({

	name: 'brick-pattern',
	asset: 'brick',

}).clone({

	name: 'leaves-pattern',
	asset: 'leaves',

});

// Create Pattern styles dynamically
scrawl.makePattern({

	name: 'water-pattern',
	imageSource: 'img/water.png',

}).clone({

	name: 'marble-pattern',
	imageSource: 'img/marble.png',

});

// Create a canvas-based Cell pattern
canvas.buildCell({

	name: 'cell-pattern',

	width: 50,
	height: 50,

	backgroundColor: 'lightblue',

	shown: false,
});

canvas.base.set({

	compileOrder: 1,
});

// Create a Block entity to display in the new Cell pattern
scrawl.makeBlock({

	name: 'cell-pattern-block',
	group: 'cell-pattern',

	width: 40,
	height: 40,

	startX: 'center',
	startY: 'center',

	handleX: 'center',
	handleY: 'center',

	method: 'fill',

	fillStyle: 'water-pattern',

	delta: {
		roll: -0.3
	},
});


// Create Block entitys for the main display
scrawl.makeBlock({

	name: 'water-in-leaves',
	group: canvas.base.name,

	width: '40%',
	height: '40%',

	startX: '25%',
	startY: '25%',

	handleX: 'center',
	handleY: 'center',

	lineWidth: 20,
	lineJoin: 'round',

	method: 'fillThenDraw',

	fillStyle: 'cell-pattern',
	strokeStyle: 'leaves-pattern',

	shadowOffsetX: 5,
	shadowOffsetY: 5,
	shadowBlur: 3,
	shadowColor: 'black',

	// Defining an anchor (href) link which can be tied to user interaction (in this case, mouse clicks on the canvas element) through events defined further down in this script
	anchor: {
		name: 'wikipedia-water-link',
		href: 'https://en.wikipedia.org/wiki/Water',
		description: 'Link to the Wikipedia article on water (opens in new tab)',

		/*
		The clickAction attribute is a fallback, for cases where the user 'clicks' on the anchor element hidden at the top of the web page using the keyboard (tab, return) or other assistive technology, rather than by clicking on the canvas block entity itself.

		The function returns a string which Scrawl-canvas will add to the anchor's 'onclick' attribute when it creates the anchor element dynamically and adds it to the DOM.
		*/
		clickAction: function () {
			return `ga('send', 'event', 'Outbound link', 'click', '${this.href}')`;
		},
	},

	// Defining additional accessibility functionality to be used by event functions defined below in response to user activity - this time moving the mouse cursor across the &lt;canvas> element. Note that 'this' refers to the entity object
	onEnter: function () {

		this.set({
			lineWidth: 30,
		});

		canvas.set({
			title: `${this.name} tile`,
			label: this.get('anchorDescription'),
		});

		myTracker.send('event', 'Canvas Entity', 'hover start', `${this.name} ${this.type}`);
	},

	onLeave: function () {

		this.set({
			lineWidth: 20,
		});

		canvas.set({
			title: '',
			label: `${canvas.name} canvas element`,
		});

		myTracker.send('event', 'Canvas Entity', 'hover end', `${this.name} ${this.type}`);
	},

	// Used by the Scrawl-canvas click event, below
	onUp: function () {

		myTracker.send('event', 'Canvas Entity Link', 'click', `${this.name} ${this.type} ${this.anchor.href}`);

		this.clickAnchor();
	},

}).clone({

	name: 'leaves-in-brick',

	startX: '75%',

	fillStyle: 'leaves-pattern',
	strokeStyle: 'brick-pattern',

	anchor: {
		name: 'wikipedia-leaf-link',
		href: 'https://en.wikipedia.org/wiki/Leaf',
		description: 'Link to the Wikipedia article on leaves (opens in new tab)',
	},

}).clone({
	
	name: 'brick-in-marble',

	startY: '75%',

	fillStyle: 'brick-pattern',
	strokeStyle: 'marble-pattern',

	anchor: {
		name: 'wikipedia-brick-link',
		href: 'https://en.wikipedia.org/wiki/Brick',
		description: 'Link to the Wikipedia article on bricks (opens in new tab)',
	},

}).clone({
	
	name: 'marble-in-water',

	startX: '25%',

	fillStyle: 'marble-pattern',
	strokeStyle: 'water-pattern',

	anchor: {
		name: 'wikipedia-marble-link',
		href: 'https://en.wikipedia.org/wiki/Marble',
		description: 'Link to the Wikipedia article on marble (opens in new tab)',
	},
});


/*
Demonstrate zoned actions on a canvas element as a result of user interaction

* Available cascadeEventAction arguments are: 'enter', 'leave', 'down', or 'up'

* Also, the 'move' argument will trigger enter and leave actions on the entitys, as appropriate to each

In this case, moving the mouse cursor over a block entity will increase its line width, as specified in the __onEnter__ and __onLeave__ functions in the block factories above. 

Additionally, it will update the &lt;canvas> element's title attribute (for tool tips) and its ARIA label value (for accessibility)

The cascadeEventAction function returns an Array of name Strings for the entitys at the current mouse cursor coordinates 
*/ 
let interactionResults;
let interactions = function () {

	if (canvas.here.active) interactionResults = canvas.cascadeEventAction('move');
	else interactionResults = '';
};
scrawl.addListener('move', interactions, canvas.domElement);


/*
Demonstrate entity-based anchor (href links) functionality

In this case, clicking on one of the tiles will open a related Wikipedia page in a new browser tab - as defined in the  __onUp__ function in the block factories above
*/ 
let mylinks = function () {

	if (canvas.here.active) canvas.cascadeEventAction('up');
};
scrawl.addListener('up', mylinks, canvas.domElement);


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

	let testTicker = Date.now(),
		testTime, testNow,
		testMessage = document.querySelector('#reportmessage');

	return function () {

		testNow = Date.now();
		testTime = testNow - testTicker;
		testTicker = testNow;

		testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Hits: ${interactionResults}
Pools - cell: ${scrawl.cellPoolLength()}; coordinate: ${scrawl.coordinatePoolLength()}; vector: ${scrawl.vectorPoolLength()}; quaternion: ${scrawl.quaternionPoolLength()}`;
	};
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	target: canvas,
	afterShow: report,
});

console.log(scrawl.library);