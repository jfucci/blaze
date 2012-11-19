/*global _:true, blaze:true */
(function() {
	"use strict";

	blaze.Model = function(setup) {
		this.getGridSize      = _.constant(setup.gridSize);
		this.getWaterTankSize = _.constant(setup.waterTankSize);
		this.getFlammability  = _.constant(setup.flammability);
		this.getBurnRate      = _.constant(setup.burnRate);
		this.trees            = 0;
		this.isBurning        = false;
		this.smallForestNum = 10;
		var coordinates = _.product(_.repeat(_.range(this.smallForestNum), 2));
		this.forestArray = {};
		this.smallForestWidth  = this.getGridSize() / this.smallForestNum;
		_.each(coordinates, function(coordinate) {
			this.forestArray[coordinate] = new blaze.SmallForest(coordinate[0], coordinate[1], this.smallForestWidth, this.smallForestNum, setup);
		}, this);
		this.inverted = false;
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

	blaze.Model.prototype.newBoard = function() {
		this.copterSquare = [];
		this.isBurning = true;
		this.waterLevel = 100;
		_.each(this.forestArray, function(smallForest) {
			smallForest.newForest();
		}, this);
	};

	blaze.Model.prototype.restart = function() {
		this.copterSquare = [];
		this.isBurning = true;
		this.waterLevel = 100;
		_.each(this.forestArray, function(smallForest) {
			smallForest.resetTrees();
		}, this);
	};

	blaze.Model.prototype.burn = function(square) {
		_.each(square.neighbors, function(neighbor) {
			if(this.forestArray[neighbor[0] + "," + neighbor[1]].squares[neighbor[2] + ","  + neighbor[3]].flammable && Math.random() < this.getFlammability()) {
				this.forestArray[neighbor[0] + "," + neighbor[1]].squares[neighbor[2] + ","  + neighbor[3]].percentBurned += this.getBurnRate();
				this.forestArray[neighbor[0] + "," + neighbor[1]].squares[neighbor[2] + ","  + neighbor[3]].flammable = false;
			}
		}, this);
	};

	blaze.Square = function(x, y, smallForestX, smallForestY, smallForestWidth, smallForestNum) {
		this.getX = _.constant(x);
		this.getY = _.constant(y);
		this.neighbors = [];
		for(var xx = this.getX() - 1; xx <= this.getX() + 1; xx++) {
			for(var yy = this.getY() - 1; yy <= this.getY() + 1; yy++) {
				if(xx !== this.getX() || yy !== this.getY()) {
					var newX = xx;
					var newY = yy;
					var newSmForestX = smallForestX;
					var newSmForestY = smallForestY;
					if(xx >= smallForestWidth) {
						newX = 0;
						if(smallForestX + 1 < smallForestNum) {
							newSmForestX++;
						} else { continue; }
					} else if(xx < 0) {
						newX = smallForestWidth - 1;
						if(smallForestX - 1 >= 0) {
							newSmForestX--;
						} else { continue; }
					}
					if(yy >= smallForestWidth) {
						newY = 0;
						if(smallForestY + 1 < smallForestNum) {
							newSmForestY++;
						} else { continue; }
					} else if(yy < 0) {
						newY = smallForestWidth - 1;
						if(smallForestY - 1 >= 0) {
							newSmForestY--;
						} else { continue; }
					}
					this.neighbors.push([newSmForestX, newSmForestY, newX, newY]);
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


	blaze.SmallForest = function(x, y, width, num, setup) {
		this.getGridSize      = _.constant(setup.gridSize);
		this.getBurnRate      = _.constant(setup.burnRate);
		this.density = Math.random();
		this.trees = 0;
		this.x = x;
		this.y = y;
		var coordinates = _.product(_.repeat(_.range(width), 2));
		this.squares = {};
		_.each(coordinates, function(coordinate) {
			this.squares[coordinate] = new blaze.Square(coordinate[0], coordinate[1], x, y, width, num);
		}, this);
		this.grow(width);
	};

	blaze.SmallForest.prototype.grow = function(width) {
		_.each(this.squares, function(square) {
			if(Math.random() < this.density) {
				square.isATree = true;
				this.trees++;
				this.growTree(square);
			}
		}, this);
	};

	blaze.SmallForest.prototype.growTree = function(square) {
		if(square.getX() === 0 && this.x === 0) {
			square.percentBurned += this.getBurnRate();
		} else {
			square.flammable = true;
		}
	};

	blaze.SmallForest.prototype.resetTrees = function() {
		_.each(this.squares, function(square) {
			square.setup(false);
			if(square.isATree) {
				this.growTree(square);
			}
		}, this);
	};

	blaze.SmallForest.prototype.newForest = function() {
		this.density = Math.random();
		this.trees = 0;
		_.each(this.squares, function(square) {
			square.setup(true);
			if(Math.random() > this.density) {
				square.isATree = true;
				this.trees++;
				this.growTree(square);
			}
		}, this);
	};
}());