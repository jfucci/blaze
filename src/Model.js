/*global _:true, blaze:true */
(function() {
	"use strict";

	blaze.Model = function(initLevel) {
		this.getGridSize       = _.constant(initLevel[0]);
		this.getSmallForestNum = _.constant(initLevel[1]);
		this.getBurnRate       = _.constant(initLevel[2]);
		this.getPercentGreen   = _.constant(initLevel[3]);
		this.getFlammability   = _.constant(initLevel[4]);
		this.getWaterTankSize  = _.constant(initLevel[5]);
		this.getFFNeighbors    = _.constant(initLevel[6]);
		this.smallForestWidth  = this.getGridSize() / this.getSmallForestNum();
		this.trees             = 0;
		this.isBurning         = false;
		this.inverted          = false;
		var coordinates        = _.product(_.repeat(_.range(this.getSmallForestNum()), 2));
		this.forestArray       = {};
		_.each(coordinates, function(coordinate) {
			this.forestArray[coordinate] = new blaze.SmallForest(coordinate[0], coordinate[1], this);
		}, this);
		this.getNeighbors();
	};

	//the only function that still needs to be cleaned up:
	blaze.Model.prototype.getNeighbors = function() {
		var coordinates = _.chain(_.range(-1,2)).repeat(2).product().reject(_.bind(_.isEqual,null,[0,0])).value();

		_.each(this.forestArray, function(smallForest) {
			_.each(smallForest.squares, function(square) {
				_.each(coordinates, function(coordinate) {
					var x = square.getX() + coordinate[0];
					var y = square.getY() + coordinate[1];
					var smForestX = smallForest.getX();
					var smForestY = smallForest.getY();
					
					if(x >= this.smallForestWidth) {
						x = 0;
						if(smallForest.getX() + 1 < this.getSmallForestNum()) {
							smForestX++;
						} else {
							return true;
						}
					} else if(x < 0) {
						x = this.smallForestWidth - 1;
						if(smallForest.getX() - 1 >= 0) {
							smForestX--;
						} else {
							return true;
						}
					}

					if(y >= this.smallForestWidth) {
						y = 0;
						if(smallForest.getY() + 1 < this.getSmallForestNum()) {
							smForestY++;
						} else {
							return true;
						}
					} else if(y < 0) {
						y = this.smallForestWidth - 1;
						if(smallForest.getY() - 1 >= 0) {
							smForestY--;
						} else {
							return true;
						}
					}
					square.neighbors.push(this.forestArray[smForestX + "," + smForestY].squares[x + "," + y]);
				}, this);
			}, this);
		}, this);
	};

	blaze.Model.prototype.step = function() {
		_.each(this.forestArray, function(smallForest) {
			_.each(smallForest.squares, function(square) {
				if(square.percentBurned > 1) {
					square.percentBurned = 1;
				} else if(square.percentBurned > 0 && square.percentBurned < 1) {
					square.percentBurned += this.getBurnRate();
					this.burn(square);
				}
			}, this);
		}, this);
	};

	blaze.Model.prototype.newBoard = function(seed) {
		Math.seedrandom(seed);
		this.restart();
		_.each(this.forestArray, function(smallForest) {
			smallForest.newForest();
		});
		Math.seedrandom();
	};

	blaze.Model.prototype.restart = function() {
		this.copterSquare = {};
		this.isBurning    = true;
		this.waterLevel   = 100;
	};

	blaze.Model.prototype.burn = function(square) {
		_.each(square.neighbors, function(neighbor) {
			if(neighbor.flammable && Math.random() < this.getFlammability()) {
				neighbor.percentBurned += this.getBurnRate();
				neighbor.flammable = false;
			}
		}, this);
	};

	blaze.Model.prototype.walk = function(start, visited) {
		if(_.contains(visited, start) || (!start.isATree && !start.watered)) {
			return;
		}
		visited.push(start);
		if(start.watered) {
			_.each(start.neighbors, function(neighbor) {
				this.walk(neighbor, visited);
			}, this);
		}

	};

	blaze.Square = function(x, y) {
		this.getX      = _.constant(x);
		this.getY      = _.constant(y);
		this.neighbors = [];
	};

	blaze.Square.prototype.water = function() {
		this.watered       = true;
		this.flammable     = false;
		this.percentBurned = 0;
	};

	blaze.Square.prototype.setup = function() {
		this.percentBurned = 0;
		this.flammable     = false;
		this.watered       = false;
		this.isATree       = false;
	};

	blaze.SmallForest = function(x, y, model) {
		this.getX       = _.constant(x);
		this.getY       = _.constant(y);
		this.density    = model.getPercentGreen();
		this.burnRate   = model.getBurnRate();
		this.trees      = 0;
		var coordinates = _.product(_.repeat(_.range(model.smallForestWidth), 2));
		this.squares    = {};
		_.each(coordinates, function(coordinate) {
			this.squares[coordinate] = new blaze.Square(coordinate[0], coordinate[1]);
		}, this);
		this.newForest();
	};

	blaze.SmallForest.prototype.growTree = function(square) {
		if(square.getX() === 0 && this.getX() === 0) {
			square.percentBurned += this.burnRate;
		} else {
			square.flammable = true;
		}
	};

	blaze.SmallForest.prototype.newForest = function() {
		this.trees = 0;
		_.each(this.squares, function(square) {
			square.setup();
			if(Math.random() < this.density - (Math.random() / 5) + (Math.random() / 4)) {
				square.isATree = true;
				this.trees++;
				this.growTree(square);
			}
		}, this);
	};

}());