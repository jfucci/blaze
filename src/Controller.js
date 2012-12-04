/*global $:true, document:true, blaze:true, _:true, window:true*/
(function() {
	"use strict";

	$(document).ready(function() {
		$.ajax({
			type: "GET",
			url: "levels.csv", 
			dataType: "text",
			success: function(data) {
				new blaze.Controller(data);
			}
		});
	});

	blaze.Controller = function(data) {
		this.stepDelay    = 50; //#of millis to delay between steps
		this.interval     = null;
		this.tries        = 0;
		this.levelScores  = [];
		this.level        = 0;
		this.winPercent   = 30;
		var levelSelector = document.getElementById("levels");
		var levels        = [];
		var i             = 0;

		$("#seed").val("level 1"); //necessary to reset the seed when the user reloads the page in firefox
		var previousSeed  = $("#seed").val();

		//set up the levels:
		_.each(_.rest(data.split("\n"), 2), function(line) {
			levels.push([]);
			_.each(line.split(","), function(val) {
				levels[i].push(Number(val));
			}, this);
			i++;
			$("#levels").append("<option id=" + i + " style=\"display: none;\">Level " + i + "</option>");
		}, this);

		$("#1").show();

		//create the model and view:
		this.model = new blaze.Model(levels[0]);
		this.view  = new blaze.View(this.model);

		//restart button:
		$("#restart").click(_.bind(function() {
			this.model.newBoard($("#seed").val());
			$("#message .value").text("");
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
			$("#restart").click();
		}, this));

		//invert button:
		$("#invert").click(_.bind(function() {
			this.model.inverted = !this.model.inverted;
			this.view.update();
		}, this));

		//disable double click selection:
		$("canvas").bind("mousedown.disableTextSelect", function() {
			return false;
		});

		//level selector:
		$("#levels").click(_.bind(function() {
			this.setupLevel(levels, levelSelector.selectedIndex);
			this.level = levelSelector.selectedIndex;
			$("#seed").val("level " + (this.level + 1));
			$("#restart").click();
			if(this.levelScores[this.level]) {
				this.displayScore();
			} else {
				this.blankScore();
			}
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
				this.setupLevel(levels, this.level);

				if(this.levelScores[this.level]) {
					this.displayScore();
				} else {
					this.blankScore();
				}

				$("#seed").val("level " + (this.level + 1));
				$("#restart").click();
				this.view.update();
			} else {
				$("#message .value").text("Congratulations! You have finished the game!");
			}
		}, this));

		//initialize:
		this.model.newBoard($("#seed").val());
		this.view.update();
	};

	blaze.Controller.prototype.setupLevel = function(levels, level) {
		this.model.getFlammability  = _.constant(levels[level][4]);
		this.model.getWaterTankSize = _.constant(levels[level][5]);
		this.model.getFFNeighbors   = _.constant(levels[level][6]);
	};

	blaze.Controller.prototype.step = function() {
		this.model.step();
		if(!this.model.isBurning) {
			window.clearInterval(this.interval);
			this.interval = null;
			this.model.copterSquare = {};
			if(Number($("#burned .value").text()) < this.winPercent) {
				//store the score:
				if(!this.levelScores[this.level] || this.levelScores[this.level][1] > Number($("#burned .value").text())) {
					this.levelScores[this.level] = [Number($("#water .value").text()),
						Number($("#burned .value").text()), this.tries];
					this.displayScore();
				}
				//show the next level button:
				$("#nextLevel").show();
			} else {
				$("#message .value").text("You must save at least 70% of the forest!");
			}
		}
		this.view.update();
	};

	blaze.Controller.prototype.displayScore = function() {
		$("#score .water").text(this.levelScores[this.level][0]);
		$("#score .trees").text(this.levelScores[this.level][1]);
		$("#score .tries").text(this.levelScores[this.level][2]);
	};

	blaze.Controller.prototype.blankScore = function() {
		$("#score .water").text("--");
		$("#score .trees").text("--");
		$("#score .tries").text("--");
	};
}());