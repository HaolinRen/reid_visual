"use strict"
function selector(ele, width, height) {
	this.ele = ele;
	this.width = width;
	this.height = height;
	this.isSelect = false;
	this.isDrag = false;
	this.callback = null;
	this.needHideLasso = false;
  this.labelsDict = {};
}

selector.prototype.init = function(callback) {
	let that = this,
		points = [],
		closePathDistance = 100,
        isPathClosed = false,
        tpath,
        lastPosi,
        closeOff = 3,
        torigin;

	this.svg = d3.select(this.ele)
				.append('svg')
				.attr('width', this.width)
				.attr('height', this.height);

  	this.labelPane = this.svg.append('g');

  	this.fontSizeScale = d3.scale.log();

	this.hullPane = this.svg.append('g');

	let myLasso = this.svg.append('g')
						.attr('class', 'lasso');
						

	this.dyn_path = myLasso.append('path')
						.attr('class', 'drawn');

	this.close_path = myLasso.append('path')
						.attr('class', 'loop_close');

  	this.origin_node = myLasso.append('circle')
  					.attr('class', 'origin')
  					.attr('display', 'none');

  function translateMend(arr, posi) {
  	let res = [];
  	let lg = arr.length;
  	for (let i = 0; i < lg; i += 1) {
  		res.push([arr[i][0]+posi[0], arr[i][1]+posi[1]]);
  	}
  	return res;
  }

	let myDrag = d3.behavior.drag()
				.on('drag', function() {
					let dx = d3.event.dx;
					let dy = d3.event.dy;
					lastPosi[0] += dx;
					lastPosi[1] += dy;
					let moveX = '' + lastPosi[0];
					let moveY = '' + lastPosi[1];
					myLasso.attr('transform', 'translate(' + moveX + ',' + moveY + ')');
				})
				.on('dragend', function() {
					if (that.callback) {
						setTimeout(function() {
							that.callback(translateMend(points, lastPosi));
						}, 100);
					}
				});

	myLasso.on('mouseover', function() {
				that.isDrag = true;
			})
			.on('mouseout', function() {
				that.isDrag = false;
			})
			.call(myDrag);;

	this.svg.on('mousedown', function() {

		if (that.isDrag) {
			return;
		}

		lastPosi = [0, 0];
		myLasso.attr('transform', 'translate(0, 0)');
		tpath = '';
		
		that.dyn_path.attr('d', null);
		that.close_path.attr('d', null).style('stroke-dasharray', ('4, 4'));
		// that.isMove = false;
		points = [];
		that.isSelect = true;
	})
	.on('mousemove', function() {
		if (!that.isSelect) {
			return;
		}
		if (that.dragInfoListenner) {
			that.dragInfoListenner(true);
		}
		let p = d3.mouse(this);
		let tx = p[0];
		let ty = p[1];
		if (tx < closeOff || tx > that.width-closeOff || ty < closeOff || ty > that.height-closeOff) {
			points = [];
			that.clearSelector();
			that.dyn_path.attr('d', null);
			that.close_path.attr('d', null);
			that.isSelect = false;
			return;
		}
		// that.isMove = true;
		if (tpath === '') {
		    tpath = tpath + "M " + tx + " " + ty;
		    torigin = [tx,ty];
		    that.origin_node
		        .attr("cx", tx)
		        .attr("cy", ty)
		        .attr("r", 3)
		        .attr("display", null);
		} else {
		    tpath = tpath + " L " + tx + " " + ty;
		}
		that.showLasso();
		points.push([tx, ty]);
		let distance = Math.sqrt(Math.pow(tx - torigin[0], 2) + Math.pow(ty - torigin[1], 2));

		let close_draw_path = "M " + tx + " " + ty + " L " + torigin[0] + " " + torigin[1];

		that.dyn_path.attr("d",tpath);

		isPathClosed = distance <= closePathDistance ? true : false;

		if(isPathClosed) {
		    that.close_path.attr("display",null)
		    			.attr("d", close_draw_path);
		}
		else {
		    that.close_path.attr("display","none");
		}
		})
		.on('mouseup', function() {
			if (!that.isSelect) {
				return ;
			}
			if (that.dragInfoListenner) {
				that.dragInfoListenner(false);
			}
			that.isSelect = false;
		    if (!isPathClosed || points.length < 10) {
		        that.clearSelector();
		        points = [];
		    } else {
		        that.close_path.style('stroke-dasharray', ('0, 0'));
			};
			if (that.callback) {// && that.isMove) {
				setTimeout(function() {
					if (that.needHideLasso) {
						that.hideLasso();
					}
					that.callback(points);
				}, 50);
			}
		});

	// 	this.svg.on('click', function() {
	// 		let posi = d3.mouse(this);
	// 		if (callback) {
	// 		  // if (!callback(posi)) {
	// 		    // that.removeLabels();
	// 		  // }
	// 		  callback(posi)
	// 		} else {
	// 		  // that.removeLabels();
	// 		}
	// 	});
	// 	this.svg.on('dblclick', ()=> {
	// 	// that.removeLabels();
	// })
}

selector.prototype.clearSelector = function() {
  this.dyn_path.attr("d", null);
  this.close_path.attr("d", null);
  this.origin_node.attr("display", "none");
};

selector.prototype.removeOneLabel = function(label) {

  if (this.labelsDict[label] !== undefined) {
    // this.labelsDict[label].isClicked = false;
    this.labelsDict[label].labelSvg.remove();
    delete this.labelsDict[label];
  }
}

selector.prototype.addLabels = function(nodes, rdx, rdy, rds, mxsize) {
	let minFontSize = 5;
	let minScale = 0;
	let maxScale = 0;

	nodes.forEach(d=>{
		console.log(d)
		if (d.size > maxScale) {
			maxScale = d.size;
		}

		if (d.size < minScale || minScale === 0) {
			minScale = d.size;
		}
	})

	this.fontSizeScale.range([minFontSize, mxsize]).domain([minScale, maxScale])
	console.log(minFontSize, mxsize, minScale, maxScale)
	for (let i = 0; i < nodes.length; i += 1) {
      this.addLabel(nodes[i], rdx, rdy, rds, nodes[i].size);
    }
}

selector.prototype.addLabel = function(oneNode, rdx, rdy, rds, wt) {
  let tempLabelPlace = this.labelPane.append('g');


  let posi = [oneNode[rdx]+oneNode[rds], oneNode[rdy]];

  this.labelsDict[oneNode.label] = {
	'labelSvg': tempLabelPlace,
	// 'isClicked': true,
	'nodeID': oneNode.id,
	'x': posi[0],
	'y': posi[1]
  };

  let that = this;

  let tempText = tempLabelPlace.append('text')
      .attr('transform', 'translate(' + posi[0] + ',' + posi[1] + ')')
      .attr('text-anchor', 'start')
      .attr('font-size', (d)=>{
      	return that.fontSizeScale(wt);
      })
      .text(oneNode.label);

  let bbox = tempText.node().getBBox();

  tempLabelPlace.insert('rect', 'text')
                .attr('x', posi[0]-2)
                .attr('y', posi[1]-bbox.height/2 - 8)
                .attr('width', bbox.width + 4)
                .attr('height', bbox.height + 4)
                .style('opacity', 0.7)
                .style('stroke', 'black')
                .style('stroke-width', 0.3)
                .style('fill', 'white')
}

selector.prototype.updateLabelsPosi = function(duration, nodesPosiDict) {
	let nodeHasLabel = [];
	for (var oneLabel in this.labelsDict) {
		let tempID = this.labelsDict[oneLabel].nodeID;
		if (nodesPosiDict[tempID]) {
			let tx = nodesPosiDict[tempID][0] - this.labelsDict[oneLabel].x;
			let ty = nodesPosiDict[tempID][1] - this.labelsDict[oneLabel].y;
			this.labelsDict[oneLabel].labelSvg
				.transition()
				.duration(duration || 100)
				.attr('transform', 'translate(' + tx + ',' + ty + ')')
		}
	}
}

selector.prototype.removeLabels = function() {
  for (let oneLabel in this.labelsDict) {
    this.removeOneLabel(oneLabel);
  }
}

selector.prototype.hideLasso = function() {
	this.dyn_path.style('stroke', 'white');
	this.close_path.style('stroke', 'white');
	this.origin_node.attr('display', 'none');
}

selector.prototype.updateLassoState = function(hide) {
	if (hide) {
		this.needHideLasso = true;
	} else {
		this.needHideLasso = false;
	}
}

selector.prototype.showLasso = function() {
	this.dyn_path.style('stroke', 'rgb(80,80,80)');
	this.close_path.style('stroke', 'rgb(80,80,80)');
	this.origin_node.attr('display', 'block');	
}

selector.prototype.getSVGBoard = function() {
	return this.svg;
}

