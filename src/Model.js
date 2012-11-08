/*global _:true, blaze:true */
(function () {
    "use strict";

	blaze.Model = function(setup) {
		this.getGridSize = _.constant(setup.gridSize);
		this.getPercentGreen = _.constant(setup.percentGreen);
		this.getWaterTankSize = _.constant(setup.waterTankSize);
		this.trees = 0;
	};

	blaze.Model.prototype.restart = function() {
		this.waterLevel = 100;
		this.trees = 0;
		this.forestArray = [];
		for (var x = 0; x < this.getGridSize(); x++) {
			this.forestArray[x] = [];
			for (var y = 0; y <= this.getGridSize(); y++) {
				if(Math.random() > this.getPercentGreen()) {
					this.trees++;
					if(x === 0) {
						this.forestArray[x][y] = "red";
					}
					else {
						this.forestArray[x][y] = "green";
					}
				}
				else {
					this.forestArray[x][y] = "#993300"; //brown
				}
			}
		}
	};

	blaze.Model.prototype.isBurning = function() {
	};

	blaze.Model.prototype.step = function() {
	};

	blaze.Square = function(x, y) {
		this.getX = _.constant(x);
		this.getY = _.constant(y);
	};

}());