var mycode = function() {
	'use strict';
	//define variables
	var canvas = scrawl.canvas.mycanvas,
		head = document.getElementsByTagName('head')[0],
		icon,
		link,
		newlink,
		choke = 100,
		chokeTime = Date.now();

	//no need for the canvas generating the icon to be visible ...
	canvas.style.display = 'none';
	scrawl.pad.mycanvas.set({
		backgroundColor: 'lightblue',
	});

	//generate DOM link element for icon image
	link = document.createElement('link');
	link.type = 'image/png';
	link.rel = 'shortcut icon';
	head.appendChild(link);

	//define sprite(s)
	icon = scrawl.newGroup({
		name: 'mysprites',
	});
	scrawl.newBlock({
		name: 'blocky',
		width: 60,
		height: 12,
		fillStyle: 'purple',
		handleX: 'center',
		handleY: 'center',
		startX: 32,
		startY: 32,
		group: 'mysprites',
	});
	scrawl.newWheel({
		name: 'wheely',
		radius: 10,
		fillStyle: 'red',
		method: 'fill',
		group: 'mysprites',
		pivot: 'blocky',
		handleY: 20,
	}).clone({
		handleY: -20,
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			//use a choke to limit speed of animation
			if (Date.now() > chokeTime + choke) {
				//animate sprite
				icon.updateSpritesBy({
					roll: 2,
				});
				//render canvas
				scrawl.render();
				//regenerate link element
				newlink = document.createElement('link');
				newlink.type = 'image/png';
				newlink.rel = 'shortcut icon';
				newlink.href = canvas.toDataURL();
				head.replaceChild(newlink, link);
				//prepare for next iteration
				link = newlink;
				chokeTime = Date.now();
			}
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['block', 'wheel', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});