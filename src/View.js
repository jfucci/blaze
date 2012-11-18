/*global _:true, blaze:true, $:true */
(function() {
	"use strict";

	blaze.View = function(model) {
		this.model = model;
		this.canvas = $("#canvas");

		//resize canvas to correct height
		var canvas_wrap = $("#canvas_wrap");
		var height = canvas_wrap.innerHeight() - 20;
		this.canvas[0].width = height;
		this.canvas[0].height = height;
		canvas_wrap.height(height);

		this.ctx = this.canvas[0].getContext("2d");

		var width = this.canvas.width();

		this.ctx.scale(width, height);

		this.pixel = 1 / width;

		this.canvas.click(_.bind(this._mouseClick, this));
		this.canvas.mousemove(_.bind(this._mouseMove, this));
		this.canvas.mouseleave(_.bind(this._mouseLeave, this));

		this.cellSize = 1 / this.model.getGridSize();
	};

	blaze.View.prototype._mouseClick = function() {
		if(Math.floor(this.model.waterLevel) > 0) {
			var square = this.model.forestArray[this.model.copterSquare[0]+ "," + this.model.copterSquare[1]].squares[this.model.copterSquare[2] + "," + this.model.copterSquare[3]];
			square.watered = true;
			square.percentBurned = 0;
			square.flammable = false;

			this.model.waterLevel -= 100 / this.model.getWaterTankSize();

			if(this.model.waterLevel < 0) {
				this.model.waterLevel = 0;
			}
			this.update();
		}
	};

	blaze.View.prototype._mouseMove = function(event) {
		var forestX = this.getSmForestXCoordinate(event);
		var forestY = this.getSmForestYCoordinate(event);
		var x = this.getCellXCoordinate(event);
		var y = this.getCellYCoordinate(event);
		this.model.copterSquare = [forestX, forestY, x, y];
	};

	blaze.View.prototype._mouseLeave = function() {
		this.model.copterSquare = [];
	};

	blaze.View.prototype.getCellXCoordinate = function(event) {
		var pixelX = event.pageX - this.canvas.offset().left;
		var x = 0;
		if(pixelX < this.canvas.width() && pixelX > 0) {
			var cellWidthInPixels = this.canvas.width() * this.cellSize;
			x = Math.floor(pixelX / cellWidthInPixels) % this.model.smallForestWidth; //find the x index of the cell
		}
		return x;
	};

	blaze.View.prototype.getCellYCoordinate = function(event) {
		var pixelY = event.pageY - this.canvas.offset().top;
		var y = 0;
		if(pixelY < this.canvas.height() && pixelY > 0) {
			var cellHeightInPixels = this.canvas.height() * this.cellSize;
			y = Math.floor(pixelY / cellHeightInPixels) % this.model.smallForestWidth; //find the y index of the cell
		}
		return y;
	};

	blaze.View.prototype.getSmForestXCoordinate = function(event) {
		var pixelX = event.pageX - this.canvas.offset().left;
		var x = 0;
		if(pixelX < this.canvas.width() && pixelX > 0) {
			var smallForestWidthInPixels = this.canvas.width() * (1 / this.model.smallForestNum);
			x = Math.floor(pixelX / smallForestWidthInPixels); //find the x index of the smForest
		}
		return x;
	};

	blaze.View.prototype.getSmForestYCoordinate = function(event) {
		var pixelY = event.pageY - this.canvas.offset().top;
		var y = 0;
		if(pixelY < this.canvas.height() && pixelY > 0) {
			var smallForestHeightInPixels = this.canvas.height() * (1 / this.model.smallForestNum);
			y = Math.floor(pixelY / smallForestHeightInPixels); //find the y index of the smForest
		}
		return y;
	};

	blaze.View.prototype.update = function() {
		var treesBurned = 0;
		var trees = 0;
		var treesCompletelyBurned = 0;
		var displayCellSize = this.cellSize + this.pixel;

		//equation for color change: .5(2x-1)^3 + .5

		_.each(this.model.forestArray, function(smallForest) {
			trees += smallForest.trees;
			_.each(smallForest.squares, function(square) {
				var color = "rgb(112,51,0)";
				if(smallForest.x === this.model.copterSquare[0] && smallForest.y === this.model.copterSquare[1] 
					&& square.getX() === this.model.copterSquare[2] && square.getY() === this.model.copterSquare[3]) {
					color = "rgb(255,255,0)";
				} else if(square.watered === true) {
					if(square.isATree) {
						color = "rgb(51,51,255)";
					} else {
						color = "rgb(0,0,255)";
					}
				} else if(square.flammable === true) {
					color = "rgb(0,128,0)";
				} else if(square.percentBurned > 0) {
					treesBurned++;
					if(square.percentBurned >= 1) {
						treesCompletelyBurned++;
						color = "rgb(128,128,128)";
					} else if(square.percentBurned >= .5) {
						color = "rgb(" + Math.round(((-.5*Math.pow(2*square.percentBurned-1, 3) + 1) + (Math.random()-.5) * .2) * 256)
							+ "," + Math.round((.5*(Math.pow((2*square.percentBurned-1), 3)) + (Math.random()-.5) * .2) * 256) 
							+ "," + Math.round((.5*(Math.pow((2*square.percentBurned-1), 3)) + (Math.random()-.5) * .2) * 256) + ")";
					} else {
						color = "rgb(" + Math.round(((.5*Math.pow(2*square.percentBurned-1, 3) + .5) + (Math.random()-.5) * .2) * 510) 
							+ "," + Math.round((-.5*(Math.pow((2*square.percentBurned-1), 3)) + (Math.random()-.5) * .2) * 256) + ",0)";
					}
				}
				if(this.model.inverted) {
					color = this.invertColor(color);
				}
				this.ctx.fillStyle = color;
				this.ctx.fillRect(square.getX() * this.cellSize + smallForest.x * (1/ this.model.smallForestNum), 
					square.getY() * this.cellSize + (1/ this.model.smallForestNum) * smallForest.y, 
					displayCellSize, displayCellSize);
			}, this);
		}, this);

		if(treesCompletelyBurned === treesBurned) {
			this.model.isBurning = false;
		}

		$("#water .value").text(Math.floor(this.model.waterLevel));
		treesBurned = Math.floor((treesBurned / trees) * 100);
		$("#burned .value").text(treesBurned);
	};

	blaze.View.prototype.invertColor = function(color) {
		var oldColor = color.split('(')[1].split(')')[0].split(','); 
		var invertedColor = []; 
		for(var iii = 0; iii < oldColor.length; iii++){ 
			invertedColor[iii] = 255 - Number(oldColor[iii]); 
		}
		color = "rgb(" + invertedColor[0] + "," + invertedColor[1] + "," + invertedColor[2] + ")";
		return color;
	} 

}());