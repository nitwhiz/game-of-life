window.onload = function() {
	var ctx = document.getElementById("screen").getContext("2d"),
		timeNow = new Date().getTime(),
		timeLast = timeNow,
		interval = -1,
		settings = {
			delay:100,
			paused:true,
			toroidal:false,
			radius:1,
			loneliness:2,
			overpop:3,
			gmin:3,
			gmax:3,
			gridSize:50,
			canvasSize:800
		},
		blockSize = settings.canvasSize / settings.gridSize,
		cells = [],
		cPos, cellsCopy, neighbours,
		currGen = 0;
	
	ctx.canvas.width = ctx.canvas.height = settings.canvasSize;
	
	function toIndex(x, y) {
		return settings.gridSize * y + x;
	}
	
	function toXY(i) {
		var x = i % settings.gridSize;
		
		return {
			x:x,
			y:(i - x) / settings.gridSize
		};
	}
	
	function clearCells() {
		for(var i = 0, l = settings.gridSize * settings.gridSize; i < l; i++) {
			cells[i] = 0;
		}
		
		currGen = 0;
	}
	
	function randomCells() {
		for(var i = 0, l = settings.gridSize * settings.gridSize; i < l; i++) {
			cells[i] = Math.floor(Math.random() + .5);
		}
		
		currGen = 0;
	}
	
	function getPointsInRadius(i) {
		var p = toXY(i),
			rx, ry,
			result = [];
		
		for(var x = -settings.radius; x <= settings.radius; x++) {
			for(var y = -settings.radius; y <= settings.radius; y++) {				
				if((x * x + y * y <= settings.radius * settings.radius)
				|| (settings.radius == 1 && ((x == -1 && y == -1) || (x == 1 && y == -1) || (x == -1 && y == 1) || (x == 1 && y == 1)))) {
					if(settings.toroidal) {
						if(x + p.x >= settings.gridSize) {
							rx = 0;
						} else if(x + p.x < 0) {
							rx = settings.gridSize - 1;
						} else {
							rx = x + p.x;
						}

						if(y + p.y >= settings.gridSize) {
							ry = 0;
						} else if(y + p.y < 0) {
							ry = settings.gridSize - 1;
						} else {
							ry = y + p.y;
						}
						
						result.push(toIndex(rx, ry));
					} else if(x + p.x < settings.gridSize && x + p.x >= 0 && y + p.y < settings.gridSize && y + p.y >= 0) {
						result.push(toIndex(x + p.x, y + p.y));
					}
				}
			}
		}
		
		return result;
	}
	
	function tick() {
		cellsCopy = cells.slice();
		
		cells.forEach(function(v, i) {
			neighbours = 0;
			
			getPointsInRadius(i).forEach(function(r) {				
				if(r != i && cells[r] == 1) {
					neighbours++;
				}
			});
			
			if((v == 0 || v == 2) && neighbours <= settings.gmax && neighbours >= settings.gmin) {
				cellsCopy[i] = 1;
			} else if(v == 1 && (neighbours > settings.overpop || neighbours < settings.loneliness)) {
				cellsCopy[i] = 2;
			}
		});
		
		cells = cellsCopy.slice();
		
		currGen++;
	}
	
	function render() {
		ctx.clearRect(0, 0, settings.canvasSize, settings.canvasSize);
		
		cells.forEach(function(v, i) {
			if(v > 0) {
				cPos = toXY(i);
				
				ctx.fillStyle = "rgba(0, 0, 0, " + (1 / (v * v * v * v)) + ")";
				ctx.fillRect(cPos.x * blockSize, cPos.y * blockSize, blockSize, blockSize);
			}
		});
		
		ctx.strokeStyle = "#ddd";
		
		for(var x = blockSize; x < settings.canvasSize; x += blockSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, settings.canvasSize);
			ctx.stroke();
			ctx.closePath();
		}
		
		for(var y = blockSize; y < settings.canvasSize; y += blockSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(settings.canvasSize, y);
			ctx.stroke();
			ctx.closePath();
		}
	}
	
	function start() {
		interval = setInterval(function() {
			render();
			
			if(!settings.paused) {
				tick();
			}
			
			lblCurrGen.innerHTML = currGen;
		}, settings.delay);
	}
	
	function stop() {
		clearInterval(interval);
	}
	
	ctx.canvas.onmousedown = function(e) {
		if(settings.paused) {
			var gx = Math.floor(e.offsetX / blockSize),
				gy = Math.floor(e.offsetY / blockSize),
				gi = toIndex(gx, gy);
			
			if(e.ctrlKey) {
				cells[gi] = 0;
			} else if(e.shiftKey) {
				cells[gi] = 1;
			} else {
				cells[gi] = (cells[gi] == 1) ? 0 : 1;
			}
			
			currGen = 0;
			
			render();
		}
	};
	
	var btnPause = document.getElementById("pause"),
		btnStep = document.getElementById("step"),
		btnRandGrid = document.getElementById("randGrid"),
		btnClearGrid = document.getElementById("clearGrid"),
		rngRadius = document.getElementById("rngRadius"),
		valRadius = document.getElementById("valRadius"),
		rngLoneliness = document.getElementById("rngLoneliness"),
		valLoneliness = document.getElementById("valLoneliness"),
		maxLoneliness = document.getElementById("lMaxLone"),
		rngOverpop = document.getElementById("rngOverpop"),
		valOverpop = document.getElementById("valOverpop"),
		minOverpop = document.getElementById("lMinOverpop"),
		maxOverpop = document.getElementById("lMaxOverpop"),
		rngGMin = document.getElementById("rngGMin"),
		valGMin = document.getElementById("valGMin"),
		maxGMin = document.getElementById("lMaxGMin"),
		rngGMax = document.getElementById("rngGMax"),
		valGMax = document.getElementById("valGMax"),
		minGMax = document.getElementById("lMinGMax"),
		maxGMax = document.getElementById("lMaxGMax"),
		rngDelay = document.getElementById("rngDelay"),
		valDelay = document.getElementById("valDelay"),
		rngGridSize = document.getElementById("rngGridSize"),
		valGridSize = document.getElementById("valGridSize"),
		isToroidal = document.getElementById("isToroidal"),
		lblCurrGen = document.getElementById("currGen");
	
	function catchAndRecalcSettings() {
		var r = parseInt(rngRadius.value);
		
		maxLoneliness.innerHTML = rngOverpop.value;
		rngLoneliness.setAttribute("max", rngOverpop.value);
		
		minOverpop.innerHTML = rngLoneliness.value;
		maxOverpop.innerHTML = 4 * r * r + 4 * r - 1;
		rngOverpop.setAttribute("min", rngLoneliness.value);
		rngOverpop.setAttribute("max", 4 * r * r + 4 * r - 1);
		
		maxGMin.innerHTML = rngGMax.value;
		rngGMin.setAttribute("max", rngGMax.value);
		
		minGMax.innerHTML = rngGMin.value;
		maxGMax.innerHTML = 4 * r * r + 4 * r - 1;
		rngGMax.setAttribute("min", rngGMin.value);
		rngGMax.setAttribute("max", 4 * r * r + 4 * r - 1);
		
		var c;
		
		if(parseInt(rngLoneliness.value) > parseInt(rngOverpop.value)) {
			rngLoneliness.value = 4 * r * r + 4 * r - 1;
		}
		
		if((c = parseInt(rngOverpop.value)) >= 4 * r * r + 4 * r) {
			rngOverpop.value = 4 * r * r + 4 * r - 1;
		} else if(c < parseInt(rngLoneliness.value)) {
			rngOverpop.value = rngLoneliness.value;
		}
		
		if(parseInt(rngGMin.value) > parseInt(rngGMax.value)) {
			rngGMin.value = rngGMax.value;
		}
		
		if((c = parseInt(rngGMax.value)) < parseInt(rngGMin.value)) {
			rngGMax.value = rngGMin.value;
		} else if(c >= 4 * r * r + 4 * r) {
			rngGMax.value = 4 * r * r + 4 * r - 1;
		}
		
		settings.radius = valRadius.innerHTML = parseInt(rngRadius.value);
		settings.loneliness = valLoneliness.innerHTML = parseInt(rngLoneliness.value);
		settings.overpop = valOverpop.innerHTML = parseInt(rngOverpop.value);
		settings.gmin = valGMin.innerHTML = parseInt(rngGMin.value);
		settings.gmax = valGMax.innerHTML = parseInt(rngGMax.value);
		settings.delay = valDelay.innerHTML = parseInt(rngDelay.value);
		settings.toroidal = isToroidal.checked;
		
		if(settings.gridSize != (c = parseInt(rngGridSize.value))) {
			settings.gridSize = valGridSize.innerHTML = c;
			blockSize = settings.canvasSize / settings.gridSize;
			
			clearCells();
		}
	}
	
	btnPause.onclick = function() {
		settings.paused = !settings.paused;
		
		if(settings.paused) {
			this.value = "Resume";
			
			btnRandGrid.removeAttribute("disabled");
			btnClearGrid.removeAttribute("disabled");
			btnStep.removeAttribute("disabled");
			
			rngGridSize.removeAttribute("disabled");
		} else {
			this.value = "Pause";
			
			btnRandGrid.setAttribute("disabled", "yes");
			btnClearGrid.setAttribute("disabled", "yes");
			btnStep.setAttribute("disabled", "yes");
			
			rngGridSize.setAttribute("disabled", "yes");
		}
	};
	
	btnRandGrid.onclick = function() {
		randomCells();
	};
	
	btnClearGrid.onclick = function() {
		clearCells();
	};
	
	btnStep.onclick = function() {
		tick();
	};
	
	rngRadius.onmousemove
	= rngLoneliness.onmousemove
	= rngOverpop.onmousemove
	= rngGMin.onmousemove
	= rngGMax.onmousemove
	= rngDelay.onmousemove
	= rngGridSize.onmousemove
	= isToroidal.onchange = function() {
		catchAndRecalcSettings();
	};
	
	rngDelay.onchange = function() {
		stop();
		start();
		catchAndRecalcSettings();
	};
	
	catchAndRecalcSettings();
	
	clearCells();
	
	start();
};