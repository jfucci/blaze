/*global _:true, blaze:true */
(function() {
	"use strict";

	blaze.Model = function(setup) {
		this.getGridSize      = _.constant(setup.gridSize);
		this.getPercentGreen  = _.constant(setup.percentGreen);
		this.getWaterTankSize = _.constant(setup.waterTankSize);
		this.getFlammability  = _.constant(setup.flammability);
		this.getBurnRate      = _.constant(setup.burnRate);
		this.trees            = 0;
		this.isBurning        = false;
		var coordinates = _.product(_.repeat(_.range(this.getGridSize()), 2));
		this.forestArray = {};
		_.each(coordinates, function(coordinate) {
			this.forestArray[coordinate] = new blaze.Square(coordinate[0], coordinate[1], this.getGridSize());
		}, this);
	};

	blaze.Model.prototype.restart = function() {
		this.copterSquare = [];
		this.isBurning = true;
		this.waterLevel = 100;
	};

	blaze.Model.prototype.resetTrees = function() {
		_.each(this.forestArray, function(square) {
			square.setup(false);
			if(square.isATree) {
				this.growTree(square);
			}
		}, this);
	};

	blaze.Model.prototype.newBoard = function() {
		this.restart();
		this.trees = 0;
		_.each(this.forestArray, function(square) {
			square.setup(true);
			if(Math.random() > this.getPercentGreen()) {
					square.isATree = true;
					this.trees++;
					this.growTree(square);
				}
		}, this);
	};

	blaze.Model.prototype.growTree = function(square) {
		if(square.getX() === 0) {
			square.percentBurned += this.getBurnRate();
		} else {
			square.flammable = true;
		}
	};

	blaze.Model.prototype.step = function() {
		_.each(this.forestArray, function(square) {
			if(square.percentBurned > 1) {
				square.percentBurned = 1;
			} else if(square.percentBurned > 0 && square.percentBurned < 1) {
				square.percentBurned += this.getBurnRate();
				this.burn(square.getX(), square.getY());
			}
		}, this);
	};

	blaze.Model.prototype.burn = function(x, y) {
		_.each(this.forestArray[[x, y]].neighbors, function(neighbor) {
			if(this.forestArray[neighbor].flammable && Math.random() < this.getFlammability()) {
				this.forestArray[neighbor].percentBurned += this.getBurnRate();
				this.forestArray[neighbor].flammable = false;
			}
		}, this);
	};

	blaze.Square = function(x, y, gridSize) {
		this.getX = _.constant(x);
		this.getY = _.constant(y);
		this.neighbors = [];
		for(var xx = this.getX() - 1; xx <= this.getX() + 1; xx++) {
			for(var yy = this.getY() - 1; yy <= this.getY() + 1; yy++) {
				if(xx >= 0 && yy >= 0 && xx < gridSize && yy < gridSize) {
					this.neighbors.push([xx, yy]);
				}
			}
		}
	};

	blaze.Square.prototype.setup = function(newBoard) {
		this.flammable     = false;
		this.percentBurned = 0;
		this.watered       = false;
		if(newBoard) {
			this.isATree = false;
		}
	};
}());