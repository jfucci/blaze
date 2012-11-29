/*global $:true, document:true, blaze:true, _:true, window:true*/
(function() {
	"use strict";

	$(document).ready(function() {
		new blaze.Controller();
	});

	blaze.Controller = function() {
		var setup = {
			gridSize: 50,
			//number of small forests horizonal in the forest array
			smallForestNum: 10,
			//probability of a tree burning if an adjacent tree is burning
			flammability: [0.015, 0.02, 0.025, 0.03],
			//1/burnRate = # of steps for trees to burn completely
			burnRate: 0.0025,
			//number of times water can be droppped
			waterTankSize: [40, 35, 30, 25],
			//porbabilty of a square being flammable when the game starts
			percentGreen: 0.5,
			//number of neighbors that are filled when clicking on a watered square
			floodFillNeighbors: [6, 5, 3, 2]
		};
		//#of millis to delay between steps
		this.stepDelay = 50;

		this.model    = new blaze.Model(setup);
		this.view     = new blaze.View(this.model);
		this.interval = null;
		this.tries    = 0;
		this.level    = 0;
		this.seed     = $("#seed").val();

		$("#restart").click(_.bind(function() {
			this.model.newBoard($("#seed").val());
			if(this.interval === null) {
				this.interval = window.setInterval(_.bind(this.step, this), this.stepDelay);
			}
			if($("#seed").val() === this.seed) {
				$("#tries .value").text(++this.tries);
			} else {
				$("#tries .value").text(this.tries = 1);
				this.seed = $("#seed").val();
			}
		}, this));


		$("#newBoard").click(_.bind(function() {
			$("#seed").val(Math.pow(10e+17, Math.random()) + "")
			this.model.newBoard($("#seed").val());
			if(this.interval === null) {
				this.interval = window.setInterval(_.bind(this.step, this), this.stepDelay);
			}
			$("#tries .value").text(this.tries = 1);
			this.seed = $("#seed").val();
		}, this));

		$("#invert").click(_.bind(function() {
			this.model.inverted = !this.model.inverted;
			this.view.update();
		}, this));

		//disable double click selection
		$("canvas").bind("mousedown.disableTextSelect", function() {
			return false;
		});

		//$("#nextLevel").hide();
		$("#nextLevel").click(_.bind(function() {

			$("#nextLevel").hide();
			this.level++;

			this.model.getFlammability  = _.constant(setup.flammability[this.level]);
			this.model.getWaterTankSize = _.constant(setup.waterTankSize[this.level]);
			this.model.getFFNeighbors   = _.constant(setup.floodFillNeighbors[this.level]);
			
			this.seed = $("#seed").val("level" + (this.level + 1));
			
			this.model.newBoard(this.seed);
			this.view.update();
		}, this));

		//initialize
		this.model.newBoard($("#seed").val());
		this.view.update();
	};

	blaze.Controller.prototype.step = function() {
		this.model.step();
		if(!this.model.isBurning) {
			window.clearInterval(this.interval);
			this.interval = null;
			this.model.copterSquare = {};
			if(this.model.checkWinner()) {
				$("#nextLevel").show();
			}
		}
		this.view.update();
	};

}());