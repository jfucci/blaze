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
			var visited = [];

			if(this.model.copterSquare.isATree) {
				this.model.walk(this.model.copterSquare, visited);

				_.chain(visited).shuffle().reject(function(square) {
					return square.watered;
				}).first(this.model.getFFNeighbors()).each(function(square) {
					square.water();
				});

			} else {
				this.model.copterSquare.water();
			}

			this.model.waterLevel -= 100 / this.model.getWaterTankSize();

			if(this.model.waterLevel < 0) {
				this.model.waterLevel = 0;
			}
			this.update();
		}
	};

	blaze.View.prototype._mouseMove = function(event) {
		var smallForest = this.getCoordinates(event, "smallForest");
		var mouse = this.getCoordinates(event, "cell");
		this.model.copterSquare = this.model.forestArray[smallForest[0] + "," + 
			smallForest[1]].squares[mouse[0] + "," + mouse[1]];
	};

	blaze.View.prototype._mouseLeave = function() {
		this.model.copterSquare = {};
	};

	blaze.View.prototype.getCoordinates = function(event, area) {
		var pixelX = event.pageX - this.canvas.offset().left;
		var pixelY = event.pageY - this.canvas.offset().top;
		var x, y;

		if(pixelX < this.canvas.width() && pixelX > 0 && pixelY < this.canvas.height() && pixelY > 0) {
			if(area === "cell") {
				var cellSizeInPixels = this.canvas.width() * this.cellSize;
				x = Math.floor(pixelX / cellSizeInPixels) % this.model.smallForestWidth;
				y = Math.floor(pixelY / cellSizeInPixels) % this.model.smallForestWidth;
			} else if(area === "smallForest") {
				var smallForestSizeInPixels = this.canvas.width() * (1 / this.model.getSmallForestNum());
				x = Math.floor(pixelX / smallForestSizeInPixels);
				y = Math.floor(pixelY / smallForestSizeInPixels);
			}
		}
		return [x, y];
	};

	blaze.View.prototype.update = function() {
		var treesBurned           = 0;
		var trees                 = 0;
		var treesCompletelyBurned = 0;
		var displayCellSize       = this.cellSize + this.pixel;

		_.each(this.model.forestArray, function(smallForest) {
			trees += smallForest.trees;
			_.each(smallForest.squares, function(square) {
				var color = "rgb(112,51,0)";
				if(square === this.model.copterSquare) {
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
					} else if(square.percentBurned >= 0.5) {
						color = "rgb(" + this.getBurnColor(square.percentBurned, 256, -1, 1) +
							"," + this.getBurnColor(square.percentBurned, 256, 1, 0) + 
							"," + this.getBurnColor(square.percentBurned, 256, 1, 0) + ")";
					} else {
						color = "rgb(" + this.getBurnColor(square.percentBurned, 510, 1, 0.5) + 
							"," + this.getBurnColor(square.percentBurned, 256, -1, 0) + ",0)";
					}
				}
				if(this.model.inverted) {
					color = this.invertColor(color);
				}
				this.ctx.fillStyle = color;
				this.ctx.fillRect(square.getX() * this.cellSize + smallForest.getX() * 
					(1 / this.model.getSmallForestNum()), square.getY() * this.cellSize + smallForest.getY() *
					(1 / this.model.getSmallForestNum()), displayCellSize, displayCellSize);
			}, this);
		}, this);

		if(treesCompletelyBurned === treesBurned) {
			this.model.isBurning = false;
		}

		$("#water .value").text(Math.floor(this.model.waterLevel));
		treesBurned = Math.floor((treesBurned / trees) * 100);
		$("#burned .value").text(treesBurned);
	};

	blaze.View.prototype.getBurnColor = function(percentBurned, p1, p2, p3) {
		return Math.round(p1 * (p2 * 0.5 * Math.pow(2 * percentBurned - 1, 7) + p3 + (Math.random() - 0.5) * 0.3));
	};

	blaze.View.prototype.invertColor = function(color) {
		var oldColor = color.split("(")[1].split(")")[0].split(",");
		var invertedColor = [];
		for(var iii = 0; iii < oldColor.length; iii++) {
			invertedColor[iii] = 255 - Number(oldColor[iii]);
		}
		color = "rgb(" + invertedColor[0] + "," + invertedColor[1] + "," + invertedColor[2] + ")";
		return color;
	};
}());