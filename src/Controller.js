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
		
		this.stepDelay    = 50; //#of millis to delay between steps
		this.model        = new blaze.Model(setup);
		this.view         = new blaze.View(this.model);
		this.interval     = null;
		this.tries        = 0;
		this.levelScores  = [];
		this.level        = 0;
		var previousSeed  = $("#seed").val();
		var levelSelector = document.getElementById("levels");

		//restart button:
		$("#restart").click(_.bind(function() {
			this.model.newBoard($("#seed").val());
			if(this.interval === null) {
				this.interval = window.setInterval(_.bind(this.step, this), this.stepDelay);
			}
			if($("#seed").val() === previousSeed) {
				$("#tries .value").text(++this.tries);
			} else {
				$("#tries .value").text(this.tries = 1);
				previousSeed = $("#seed").val();
			}
		}, this));

		//new board button:
		$("#newBoard").click(_.bind(function() {
			$("#seed").val(Math.pow(10e+17, Math.random()) + "");
			this.model.newBoard($("#seed").val());
			if(this.interval === null) {
				this.interval = window.setInterval(_.bind(this.step, this), this.stepDelay);
			}
			$("#tries .value").text(this.tries = 1);
			previousSeed = $("#seed").val();
		}, this));

		//invert button:
		$("#invert").click(_.bind(function() {
			this.model.inverted = !this.model.inverted;
			this.view.update();
		}, this));

		//disable double click selection
		$("canvas").bind("mousedown.disableTextSelect", function() {
			return false;
		});

		//level selector:
		for(var iii = 2; iii <= levelSelector.length; iii++) {
			$("#" + iii).hide();
		}

		$("#levels").click(_.bind(function() {
			this.setupLevel(setup, levelSelector.selectedIndex);
			this.level = levelSelector.options[levelSelector.selectedIndex].id - 1;
			$("#seed").val("level " + (this.level + 1));
			$("#restart").click();
			previousSeed = $("#seed").val();
			this.view.update();
		}, this));


		//hidden next level button:
		$("#nextLevel").hide();

		$("#nextLevel").click(_.bind(function() {
			this.level++;
			$("#nextLevel").hide();
			
			if(this.level < levelSelector.length) {
				$("#" + (this.level + 1)).show();
				levelSelector.selectedIndex = this.level;
				this.setupLevel(setup, this.level);
			
				$("#seed").val("level " + (this.level + 1));
				$("#restart").click();
				previousSeed = $("#seed").val();
				this.view.update();
			}
			else {
				$("#end .value").text("Congratulations! You have finished the game!");
			}
		}, this));

		//initialize
		this.model.newBoard($("#seed").val());
		this.view.update();
	};

	blaze.Controller.prototype.setupLevel = function(setup, level) {
		this.model.getFlammability  = _.constant(setup.flammability[level]);
		this.model.getWaterTankSize = _.constant(setup.waterTankSize[level]);
		this.model.getFFNeighbors   = _.constant(setup.floodFillNeighbors[level]);
	};

	blaze.Controller.prototype.step = function() {
		this.model.step();
		if(!this.model.isBurning) {
			window.clearInterval(this.interval);
			this.interval = null;
			this.model.copterSquare = {};
			if(this.model.checkWinner()) {

				if(!this.levelScores[this.level] || this.levelScores[this.level][1] > Number($("#burned .value").text())) {
					this.levelScores[this.level] = [Number($("#water .value").text()),  
						 Number($("#burned .value").text()), this.tries];
					$("#level" + (this.level + 1) + " .value").text("Water Left: " + this.levelScores[this.level][0] + 
					"% , Trees Burned: " + this.levelScores[this.level][1] + "% , Tries: " + 
					this.levelScores[this.level][2]);
				}

				$("#nextLevel").show();
			}
		}
		this.view.update();
	};

}());