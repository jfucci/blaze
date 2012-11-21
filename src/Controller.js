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
			percentGreen: 0.5,
			//number of small forests horizonal in the forest array
			smallForestNum: 10,
			//number of neighbors that are filled when clicking on a watered square
			floodFillNeighbors: 4
		};
		//#of millis to delay between steps
		this.stepDelay = 50;

		this.model = new blaze.Model(setup);
		this.view = new blaze.View(this.model);
		this.interval = null;
		this.tries = 0;
		this.seed = $("#seed").val();

		$('#restart').click(_.bind(function() {
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


		$('#newBoard').click(_.bind(function() {
			$("#seed").val(Math.random() + "");
			this.model.newBoard($("#seed").val());
			if(this.interval === null){
				this.interval = window.setInterval(_.bind(this.step, this), this.stepDelay);
			}
			$("#tries .value").text(this.tries = 1);
			this.seed = $("#seed").val();
		}, this));

		$('#invert').click(_.bind(function() {
			this.model.inverted = !this.model.inverted;
			this.view.update();
		}, this));

		//disable double click selection
		$("canvas").bind('mousedown.disableTextSelect', function() {
			return false;
		});

		//initialize
		this.model.newBoard($("#seed").val());
		this.view.update();
	};

	blaze.Controller.prototype.step = function() {
		this.model.step();
		if(!this.model.isBurning){
			window.clearInterval(this.interval);
			this.interval = null;
			this.model.copterSquare = [];
			if(this.model.checkWinner()) {
				alert("you win!");
			}
		}
		this.view.update();
	};

}());