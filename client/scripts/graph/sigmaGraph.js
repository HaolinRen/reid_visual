"use strict"
function sigmaGraph(render, type) {
	this.renderEle = [{
		container: render,
		type: type || 'canvas'
	}];

}

sigmaGraph.fn = sigmaGraph.prototype;

sigmaGraph.fn.init = function(pros) {
	let that = this;
	this.sig = new sigma({
		renderers: that.renderEle,
		settings: pros
	});
	this.renderer = this.sig.renderers[0];

}

sigmaGraph.fn.bindEvent = function(eventName, method) {
	this.sig.bind(eventName, function(n) {
		method(n);
	})
}

sigmaGraph.fn.addNodeDragEvent = function() {
	this.dragListener = new sigma.plugins.dragNodes(this.sig, this.renderer);
	this.dragListener.bind('startdrag', function(event) {
		console.log(event)
	})
}

sigmaGraph.fn.stopNodeDragEvent = function() {
	sigma.plugins.killDragNodes(this.is);
}

sigmaGraph.fn.getGraphPosition = function(x, y) {

	return this.sig.camera.graphPosition(x, y);
}

sigmaGraph.fn.indexNodeFromQuad = function(x, y) {
	return this.sig.camera.quadtree.point(x ,y);
}

sigmaGraph.fn.dispatchEvent = function(eventName, data) {
	this.sig.dispatchEvent(eventName, data);
}

sigmaGraph.fn.killGraph = function() {
	this.sig.graph.clear();
	console.log('kill');
}

sigmaGraph.fn.gotoCordinate = function(cordinates, animationsTime) {
	let that = this;
	try {
		sigma.misc.animation.camera(
			that.sig.camera, 
			cordinates, 
			{ duration: animationsTime || 200 }
		);
	} catch (e) {
		console.log('error cordinates');
	}
}

sigmaGraph.fn.prepareAnimate = function() {
	this.sig.settings('drawLabels', false);
}

sigmaGraph.fn.endAnimate = function() {
	this.sig.settings('drawLabels', true);
	this.sig.refresh({skipIndexation: true});
}

sigmaGraph.fn.animateGraph = function(nodesTarget, durationTime, callback) {
	if (nodesTarget.length === 0) {
		return;
	}
	let that = this;
	// this.prepareAnimate();
	sigma.plugins.animate(
		this.sig,
		{
			x: 'to_x',
			y: 'to_y'
		},
		{
			nodes: nodesTarget,
			duration: durationTime,
			onComplete: function() {
				if (callback) {
					callback();
				}
				// that.endAnimate();	
			}
		}
	)
}

sigmaGraph.fn.updateSetting = function(pros) {
	this.sig.settings(pros);
}

sigmaGraph.fn.updateMaxEdgeSize = function(size) {
	this.sig.settings({maxEdgeSize: size});
}

sigmaGraph.fn.updateMaxNodeSize = function(size) {
	this.sig.settings({
		maxNodeSize: size,
		minxNodeSize: size
	});
}

sigmaGraph.fn.resetCamera = function() {
	let that = this;
	sigma.misc.animation.camera(
		that.sig.camera, 
		{
			x: 0, 
			y: 0,
			ratio: 1
		}
	);
}

sigmaGraph.fn.setCamera = function(para) {
	let that = this;
	sigma.misc.animation.camera(that.sig.camera, para);
}

sigmaGraph.fn.clearGraph = function() {
	this.sig.graph.clear();
}

sigmaGraph.fn.getNodes = function() {
	return this.sig.graph.nodes();
}

sigmaGraph.fn.getLinks = function() {
	return this.sig.graph.edges();
}

sigmaGraph.fn.updateGraph = function(graph) {
	// try {
		let temp = {};
		temp.nodes = graph.nodes;
		if (!graph.hasOwnProperty('edges') && graph.hasOwnProperty('links')) {
			temp.edges = graph.links;
		} else if (graph.hasOwnProperty('edges')) {
			temp.edges = graph.edges;
		}
		this.clearGraph();

		this.sig.graph.read(temp);
		
		this.refreshGraph();
	// } catch(e) {
	// 	console.log('Wrong graph model');
	// }
}

sigmaGraph.fn.getCameracordi = function() {
	let that = this;
	return {
		'x': that.sig.camera.x,
		'y': that.sig.camera.y,
		'ratio': that.sig.camera.ratio
	}
}

sigmaGraph.fn.refreshGraph = function() {
	this.sig.refresh();
}

sigmaGraph.fn.addNode = function(node) {
	this.sig.graph.addNode(node);
}

sigmaGraph.fn.addEdge = function(edge) {
	this.sig.graph.addEdge(edge);
}

sigmaGraph.fn.delEdge = function(edgeID) {
	this.sig.graph.dropEdge(edgeID);
}

sigmaGraph.fn.delNode = function(nodeID) {
	this.sig.graph.dropNode(nodeID);
}

sigmaGraph.fn.resetGraphColor = function(edgeSize, edgeColor, isTimeBound, colorTime) {
	if (isTimeBound) {
		this.sig.graph.nodes().forEach(function(n) {
			if (n.dateInner) {
				n.color = n.originalColor;
			}
		});
		this.sig.graph.edges().forEach(function(e) {
			if (e.dateInner && !e.isBackstage) {
				e.color = colorTime;
			}
		})
	} else {
		this.backOriginalColor();
		this.sig.graph.edges().forEach(function(e) {
			if (!e.isBackstage) {
				// e.size = edgeSize;
				e.color = edgeColor;
			} else {
				e.hidden = true;
			}
		})
	}
}

sigmaGraph.fn.backOriginalColor = function(){
	this.sig.graph.nodes().forEach(function(n) {
		n.color = n.originalColor;
		n.hidden = false;
	});
	this.refreshGraph();
}

sigmaGraph.fn.getShowingNodesEdgesNum = function() {
	let res = {nodesNum: 0, edgesNum: 0};
	this.sig.graph.nodes().forEach(function(n) {
		if (!n.hidden) {
			res.nodesNum += 1;
		}
	})
	this.sig.graph.edges().forEach(function(e) {
		if (!e.hidden && !e.isBackstage) {
			res.edgesNum += 1;
		}
	})
	return res;
}

sigmaGraph.fn.resetGraph = function(edgeSize, edgeColor, isTimeBound, colorTime) {
	if (isTimeBound) {
		this.sig.graph.nodes().forEach(function(n) {
			if (n.dateInner) {
				n.color = n.originalColor;
			}
		});
		this.sig.graph.edges().forEach(function(e) {
			if (e.dateInner) {
				if (!e.isBackstage) {
					e.color = colorTime;
				}
				e.hidden = false;
			} else {
				e.hidden = true;
			}
		})
	} else {
		this.sig.graph.nodes().forEach(function(n) {
			n.color = n.originalColor;
			n.hidden = false;
			n.dateInner = true;
		});
		this.sig.graph.edges().forEach(function(e) {
			// e.size = edgeSize;
			e.dateInner = true;
			if (!e.isBackstage) {
				e.hidden = false;
				e.color = edgeColor;
			} else {
				e.hidden = true;
			}
		})
	}
}