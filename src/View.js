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

	blaze.View.prototype._mouseClick = function(event) {
		if(Math.floor(this.model.waterLevel) > 0) {
			var square = this.model.forestArray[this.model.copterSquare];
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
		var x = this.getCellXCoordinate(event);
		var y = this.getCellYCoordinate(event);
		this.model.copterSquare = [x, y];
	};
	blaze.View.prototype._mouseLeave = function() {
		this.model.copterSquare = [];
	};

	blaze.View.prototype.getCellXCoordinate = function(event) {
		var pixelX = event.pageX - this.canvas.offset().left;
		var x = 0;
		if(pixelX < this.canvas.width() && pixelX > 0) {
			var cellWidthInPixels = this.canvas.width() * this.cellSize;
			x = Math.floor(pixelX / cellWidthInPixels); //find the x index of the cell
		}
		return x;
	};

	blaze.View.prototype.getCellYCoordinate = function(event) {
		var pixelY = event.pageY - this.canvas.offset().top;
		var y = 0;
		if(pixelY < this.canvas.height() && pixelY > 0) {
			var cellHeightInPixels = this.canvas.height() * this.cellSize;
			y = Math.floor(pixelY / cellHeightInPixels); //find the y index of the cell
		}
		return y;
	};

	blaze.View.prototype.update = function() {
		var treesBurned = 0;
		var treesCompletelyBurned = 0;
		var displayCellSize = this.cellSize + this.pixel;

		_.each(this.model.forestArray, function(square) {
			var color = "#703300";
			if(square.getX() === this.model.copterSquare[0] && square.getY() === this.model.copterSquare[1]) {
				color = "yellow";
			} else if(square.watered === true) {
				if(square.isATree) {
					color = "#3333FF";
				} else {
					color = "blue";
				}
			} else if(square.flammable === true) {
				color = "green";
			} else if(square.percentBurned > 0) {
				treesBurned++;
				if(square.percentBurned === 1) {
					treesCompletelyBurned++;
					color = "gray";
				} else {
					color = "red";
				}
			}
			this.ctx.fillStyle = color;
			this.ctx.fillRect(square.getX() * this.cellSize, square.getY() * this.cellSize, displayCellSize, displayCellSize);
		}, this);

		if(treesCompletelyBurned === treesBurned) {
			this.model.isBurning = false;
		}

		$("#water .value").text(Math.floor(this.model.waterLevel));
		treesBurned = Math.floor((treesBurned / this.model.trees) * 100);
		$("#burned .value").text(treesBurned);
	};
}());