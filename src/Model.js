/*global _:true, blaze:true */
(function() {
	"use strict";

	blaze.Model = function(setup) {
		this.getGridSize = _.constant(setup.gridSize);
		this.getPercentGreen = _.constant(setup.percentGreen);
		this.getWaterTankSize = _.constant(setup.waterTankSize);
		this.getFlammability = _.constant(setup.flammability);
		this.getBurnRate = _.constant(setup.burnRate);
		this.trees = 0;
	};

	blaze.Model.prototype.restart = function() {
		this.waterLevel = 100;
		this.trees = 0;
		this.forestArray = [];
		for(var x = 0; x < this.getGridSize(); x++) {
			this.forestArray[x] = [];
			for(var y = 0; y <= this.getGridSize(); y++) {
				this.forestArray[x][y] = new blaze.Square(x, y);
				if(Math.random() > this.getPercentGreen()) {
					this.trees++;
					if(x === 0) {
						this.forestArray[x][y].percentBurned += this.getBurnRate();
					} else {
						this.forestArray[x][y].flammable = true;
					}
				}
			}
		}
	};

	blaze.Model.prototype.isBurning = function() {
		for(var x = 0; x < this.getGridSize(); x++) {
			for(var y = 0; y < this.getGridSize(); y++) {
				if(this.forestArray[x][y].percentBurned > 0 && this.forestArray[x][y].percentBurned < 1) {
					return true;
				}
			}
		}
		return false;
	};

	blaze.Model.prototype.step = function() {
		for(var x = 0; x < this.getGridSize(); x++) {
			for(var y = 0; y < this.getGridSize(); y++) {
				if(this.forestArray[x][y].percentBurned > 1) {
					this.forestArray[x][y].percentBurned = 1;
				} else if(this.forestArray[x][y].percentBurned > 0 && this.forestArray[x][y].percentBurned < 1) {
					this.forestArray[x][y].percentBurned += this.getBurnRate();
					this.burn(x, y);
				}
			}
		}
	};

	blaze.Model.prototype.burn = function(x, y) {
		for(var xx = x - 1; xx <= x + 1; xx++) {
			for(var yy = y - 1; yy <= y + 1; yy++) {
				if(this.forestArray[xx] && this.forestArray[xx][yy]) {
					if(this.forestArray[xx][yy].flammable && Math.random() < this.getFlammability()) {
						this.forestArray[xx][yy].percentBurned += this.getBurnRate();
						this.forestArray[xx][yy].flammable = false;
					}
				}
			}
		}
	};

	blaze.Square = function(x, y) {
		this.getX = _.constant(x);
		this.getY = _.constant(y);
		this.flammable = false;
		this.percentBurned = 0;
		this.watered = false;
	};
}());