/*global _:true, blaze:true, $:true */
(function () {
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
		if (this.model.waterLevel > 0) {
			var x = this.getCellXCoordinate(event);
			var y = this.getCellYCoordinate(event);
			this.model.forestArray[x][y] = "blue";
			this.model.waterLevel -= Math.floor(100 / this.model.getWaterTankSize());
			if (this.model.waterLevel < 0) {
				this.model.waterLevel = 0;
			}
			this.update();
		}
	};

	blaze.View.prototype._mouseMove = function(event) {
		
	};
	blaze.View.prototype._mouseLeave = function(event) {
		
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
		
		$("#water .value").text(this.model.waterLevel);
		var treesBurned = 0;

		for (var x = 0; x < this.model.getGridSize(); x++) {
			for (var y = 0; y <= this.model.getGridSize(); y++) {
				var color = this.model.forestArray[x][y]
				if (color === "red" || color === "gray") {
					treesBurned++;
				}
				this.ctx.fillStyle = color;
				this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
			}
		}
		treesBurned = Math.floor(treesBurned / this.model.trees);
		$("#burned .value").text(treesBurned);
	};
}());