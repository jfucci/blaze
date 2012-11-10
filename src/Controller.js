/*global $:true, document:true, blaze:true, _:true, window:true*/
(function() {
	"use strict";

	$(document).ready(function() {
		new blaze.Controller();
	});

	blaze.Controller = function() {
		var setup = {
			gridSize: 50,
			//probability of a tree burning if an adjacent tree is burning
			flammability: 0.025,
			//1/burnRate = # of steps for trees to burn completely
			burnRate: 0.0025,
			//number of times water can be droppped
			waterTankSize: 30,
			//porbabilty of a square being flammable when the game starts
			percentGreen: 0.5
		};
		//#of millis to delay between steps
		this.stepDelay = 50;

		this.model = new blaze.Model(setup);
		this.view = new blaze.View(this.model);
		this.interval = null;

		$('#restart').click(_.bind(function() {
			this.model.restart();
			if(this.interval === null) {
				this.interval = window.setInterval(_.bind(this.step, this), this.stepDelay);
			}
		}, this));

		//disable double click selection
		$(document).bind('mousedown.disableTextSelect', function() {
			return false;
		});

		//initialize
		this.model.restart();
		this.view.update();
	};

	blaze.Controller.prototype.step = function() {
		this.model.step();
		if(!this.model.isBurning) {
			window.clearInterval(this.interval);
			this.interval = null;
			this.model.copterSquare = [];
		}
		this.view.update();
	};

}());