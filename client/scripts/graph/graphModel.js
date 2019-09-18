"use strict"
function GraphModel(width, height) {
  this.width = width;
  this.height = height;

  this.__MAX_NODE_SIZE = 10;
  this.__MIN_NODE_SIZE = 0.41;
  this.__MAX_EDGE_SIZE = 1;
  this.__EDV_EDGE_SIZE = 1;
  this.__HGE_EDGE_SIZE = 10;
  this.__MIN_EDGE_SIZE = 0.3;
  this.__SHANDOW_COLOR = '#C0C0C0';
  this.__ROUGE_COLOR = '#ec5148';
  this.__COLOR_BACKSTAGE = '#87CEEB';
  this.__IS_GROUPED = false;
  this.__MOVE_SPACE = 100;
  this.__ZOOMING_RATIO = 1.4;
  this.TIME_GO_CORDINATE = 2000;

  this.__MOVE_TIME_INTERN = 3600;

  this.sigGraphPros = {
    // autoRescale: true,
    hideEdgesOnMove: true,
    defaultNodeColor: '#ec5148',
    defaultEdgeColor: '#C0C0C0',
    edgeColor: '#C0C0C0',
    nodeColor: '#ec5148',
    mouseWheelEnabled: true,
    singleHover: true,
    doubleClickEnabled: false,
    maxNodeSize: this.__MAX_NODE_SIZE,
    minNodeSize: this.__MIN_NODE_SIZE,
    zoomMax: 2,
    zoomMin: 0.0001,
    edgesPowRatio: 0.1,
    minEdgeSize: this.__MIN_EDGE_SIZE,
    maxEdgeSize: this.__MAX_EDGE_SIZE,
    nodesPowRatio: 0.3,
    // batchEdgesDrawing: true,
    // webglEdgesbatchSize: 5000,
    drawLabels: true,
    enableEdgeHovering: false,
    drawEdgeLabels: false,
    // defaultLabelSize: 14,
    // labelSize: 'proportional',
    font : 'italic',
    labelSizeRatio: 2,
    labelThreshold: 20,
  };
  this.__FORCE_CONFIG = {
    worker: false,
    adjustSize: true,
    barnesHutOptimize: true,
    scalingRatio: 0.5,
    gravity: 1,
    slowDown: 5,
    startingIterations: 0,
    // edgeWeightInfluence: 1,
    // outboundAttractionDistribution: true,
    // linLogMode: true,
    barnesHutOptimize: false
  }
  this.__IS_TIME_INNER = false;
  this.graph = {};
  this.data = {};
  this.__showLinkWhileMoving = false;
  this.__showNodeWhileMoving = true;
  this.colorScale = d3.scale.category10();
  this.vingtColor = d3.scale.category20();
};

GraphModel.fn = GraphModel.prototype;

GraphModel.fn.init = function(render, type) {
  if (type === 'canvas') {
    this.mySigmaGraph = new sigmaGraph(render, 'canvas');
  } else {
    this.mySigmaGraph = new sigmaGraph(render, 'webgl');
  }
  this.mySigmaGraph.init(this.sigGraphPros);
  let renderID = 0;

  this.renderX = 'cam' + renderID + ':x';
  this.renderY = 'cam' + renderID + ':y';
  this.renderSize = 'cam' + renderID + ':size';
}

GraphModel.fn.startForce = function() {
  // if (!this.mySigmaGraph.sig.isForceAtlas2Running()) {
  //   if (!this.isFirstForceRunning) {
  //     this.isFirstForceRunning = true;
  // this.prepareAnimate();
      this.mySigmaGraph.sig.startForceAtlas2(this.__FORCE_CONFIG);
    // } else {
    //   this.mySigmaGraph.sig.startForceAtlas2();
    // }
  // }
}

GraphModel.fn.clear = function() {
  this.data = null;
  this.graph = null;
  this.mySigmaGraph.killGraph();
}

GraphModel.fn.initD3Force = function(w, h) {
  var that = this;
  
  var fakeGraph = {nodes:[], links: []};
  
  this.graph.nodes.forEach(function(n, i) {
    fakeGraph.nodes.push({
      x: n.x,
      y: n.y
    });
  })

  this.graph.links.forEach(function(e) {
    fakeGraph.links.push({source: e.source, target: e.target});
  })

  // this.prepareAnimate();
  function tick() {

    that.d3force.nodes().forEach(function(n, i) {
      let nodes = that.mySigmaGraph.getNodes();
      nodes[i].x = n.x;
      nodes[i].y = n.y;
    })

    that.refreshSigGraph();
  }

  this.d3force = d3.layout.force()
                    .nodes(fakeGraph.nodes)
                    .links(fakeGraph.links)
                    .charge(-400)
                    .friction(0.7)
                    .linkDistance(100)
                    .size([w, h])
                    .on('tick', tick);
}

GraphModel.fn.updateD3ForceGraph = function() {
  var fakeGraph = {nodes:[], links: []};

  var id2posi = {};
  this.mySigmaGraph.getNodes().forEach(function(n, i) {
    id2posi[n.id] = i;
    fakeGraph.nodes.push({x: n.x, y: n.y});
  })
  this.mySigmaGraph.getLinks().forEach(function(e) {
    fakeGraph.links.push({
      source: id2posi[e.source],
      target: id2posi[e.target]
    });
    
  })
  this.d3force.nodes(fakeGraph.nodes);
  this.d3force.links(fakeGraph.links);
}

GraphModel.fn.formatSelectedList = function(selected) {
  var res = {
    nodesList: [],
    edgesList: []
  };
  if (!selected || !selected.innerEdges || !selected.innerNodes) {

    return res;
  }
  var that = this;
  selected.innerEdges.forEach(function(e) {
    res.edgesList.push(e.id);
  });
  selected.innerNodes.forEach(function(n) {
    res.nodesList.push(that.graph.nodes[n].parID);
  })
  return res;
}

GraphModel.fn.addEventToGraph = function(eventName, method) {
  this.mySigmaGraph.bindEvent(eventName, method);
}

GraphModel.fn.enableDrag = function() {
  this.mySigmaGraph.addNodeDragEvent();
}

GraphModel.fn.bindFilterDoubleClickedNode = function(callback, callback2) {
  let that = this;
  
  this.addEventToGraph('doubleClickNode', function(n) {

    // let nodeClicked = that.getNodeFromCordinate(n.data.x, n.data.y, n.data.renderer.width, n.data.renderer.height);
  let nodeClicked = n.data.node;
    if (callback && nodeClicked) {
      
      callback(nodeClicked);
    }
    that.showSubgraphFromNode(nodeClicked);
  });
  this.addEventToGraph('doubleClickStage', function(n) {
    that.resetSigGraph();
    that.refreshSigGraph();
    if (callback2) {
      callback2();
    }
  })
}

GraphModel.fn.bindClickMethod = function(callback) {
  let that = this;
  this.addEventToGraph('clickNode', function(n) {
    if (callback) {
      callback(n.data.node);
    }
  });
}

GraphModel.fn.showSubgraphFromNode = function(node) {
  if (node) {
    let tempNodes = this.graph.nodes;
    let alters = [];

    tempNodes.forEach(function(n) {
      n.hidden = true;
    })
    tempNodes[node.id].color = node.originalColor;
    tempNodes[node.id].hidden = false;
    for (let oneAlter of node.alter) {
      alters.push(oneAlter);
    }

    let nbSize = node.neighbors.length;
    for (let oneNb of node.neighbors) {
      let oneNode = tempNodes[oneNb];
      oneNode.color = oneNode.originalColor;
      oneNode.hidden = false;
      
      // for (let i = 0; i < nbSize; i += 1) {
      //   let tempIndex = oneNode.neighbors.indexOf(node.neighbors[i]);
      //   if (tempIndex !== -1) {
      //     alters.push(oneNode.alter[tempIndex]);
      //   }
      // }
    }
    this.graph.links.forEach(function(n, i) {
      n.hidden = true;
    });
    for (let oneAlter of alters) {
      this.graph.links[oneAlter].hidden = false;
    }

  } else {
    // this.resetSigGraph();
  }
  this.refreshSigGraph();
}

GraphModel.fn.getNodeFromCordinate = function(cx, cy, rdWidth, rdHeight) {
  let res = null;
  let px = cx + rdWidth / 2;
  let py = cy + rdHeight / 2;
  for (let n of this.graph.nodes) {
    let boundLeft = n[this.renderX] - n[this.renderSize];
    let boundRight = n[this.renderX] + n[this.renderSize];
    let boundTop = n[this.renderY] - n[this.renderSize];
    let boundBottom = n[this.renderY] + n[this.renderSize];

    if (px >= boundLeft && px <= boundRight && py >= boundTop && py <= boundBottom) {
      res = n;
      break;
    }
  }
  return res;
}

GraphModel.fn.analyseSearchTargets = function(targets, searchType) {
  let nodesTarget = [];
  let that = this;

  let participantNum = targets.participant.length;
  
  if (participantNum === 0) {
    nodesTarget = this.graph.nodes;
    this.graph.nodes.forEach(function(n) {
      n.hidden = false;
    });
    this.graph.links.forEach(function(l) {
      l.hidden = false;
    })
  } else {
    this.graph.nodes.forEach(function(n) {
      n.hidden = true;
    });
    this.graph.links.forEach(function(l) {
      l.hidden = true;
    })
    if (participantNum === 1) {
      let oneNode = this.graph.nodes[targets.participant[0]];
      oneNode.hidden = false;
      for (let oneNb of oneNode.neighbors) {
        this.graph.nodes[oneNb].hidden = false;
        nodesTarget.push(that.graph.nodes[oneNb]);
      }
      for (let oneAlter of oneNode.alter) {
        this.graph.links[oneAlter].hidden = false;
      }
      this.gotoGraphCordi({
        x: oneNode['read_cam0:x'],
        y: oneNode['read_cam0:y'],
        ratio: 0.1
      })
    } else {

      let exsitSameNb =[];
      this.graph.nodes[targets.participant[0]].neighbors.forEach(function(n) {
        if (targets.participant.indexOf(n) === -1) {
          exsitSameNb.push(n);
        }

      });
      if (searchType === 'AND') {
        for (let i = 1; i < participantNum; i += 1) {
          let dupList = [];
          let oneNode = this.graph.nodes[targets.participant[i]];
          for (let oneNb of oneNode.neighbors) {
            if (exsitSameNb.indexOf(oneNb) !== -1 && targets.participant.indexOf(oneNb) === -1) {
              dupList.push(oneNb);
            }
          }
          exsitSameNb = dupList;
        }
      } else {
        for (let i = 1; i < participantNum; i += 1) {
          let oneNode = this.graph.nodes[targets.participant[i]];
          for (let oneNb of oneNode.neighbors) {
            if (exsitSameNb.indexOf(oneNb) === -1 && targets.participant.indexOf(oneNb) === -1) {
              exsitSameNb.push(oneNb);
            }
          }
        }
      }
      
      for (let oneNb of exsitSameNb) {
        let oneNode = this.graph.nodes[oneNb];
        oneNode.hidden = false;
        nodesTarget.push(oneNode);
        for (let oneIndex of targets.participant) {
          let tgNode = this.graph.nodes[oneIndex];
          tgNode.hidden = false;
          let posi = tgNode.neighbors.indexOf(oneNb);
          if (posi !== -1) {
            this.graph.links[tgNode.alter[posi]].hidden = false;
          }
        }
      }
    }
  }
  if (targets.profs.length > 0) {
    for (let oneNode of nodesTarget) {
      if (targets.participant.indexOf(oneNode.id) === -1) {
        if (targets.profs.indexOf(oneNode.metier) === -1) {
          oneNode.hidden = true;
        } else {
          oneNode.hidden = false;
        }
      }
    }
  }
  if (targets.collection.length > 0) {
    for (let oneNode of nodesTarget) {
      if (oneNode.hidden) {
        continue;
      }
      let flag = false;
      for (let oneAlter of oneNode.alter) {
        if (flag) {
          break;
        }
        for (let oneEmi of this.graph.links[oneAlter].emi) {
          let tempCol = this.allEmi[oneEmi].col;
          if (targets.collection.indexOf(tempCol) !== -1) {
            flag = true;
            break;
          }
        }
      }
      if (!flag) {
        oneNode.hidden = true;
      }
    }
  }
  if (targets.chaine.length > 0) {
    for (let oneNode of nodesTarget) {
      if (oneNode.hidden) {
        continue;
      }
      let flag = false;
      for (let oneAlter of oneNode.alter) {
        if (flag) {
          break;
        }
        for (let oneEmi of this.graph.links[oneAlter].emi) {
          let tempChn = this.allEmi[oneEmi].chn;
          if (targets.chaine.indexOf(tempChn) !== -1) {
            flag = true;
            break;
          }
        }
      }
      if (!flag) {
        oneNode.hidden = true;
      }
    }
  }
  
  this.refreshSigGraph();
}

GraphModel.fn.highLightSubgraph = function(data) {
  var that = this;
  var matching = {
    nodes: {},
    links: 0
  }
  this.mySigmaGraph.getNodes().forEach(function(n, i) {
    if (data.nodesList.indexOf(n.parID) === -1) {
      n.color = that.__SHANDOW_COLOR;
    } else {
      matching.nodes[n.parID] = n.groupID;
      n.color = that.__ROUGE_COLOR;
    }
  });
  this.mySigmaGraph.getLinks().forEach(function(e) {
    if (data.edgesList.indexOf(e.id) === -1) {
      e.color = that.__SHANDOW_COLOR;
    } else {
      matching.links += 1;
      e.color = that.__ROUGE_COLOR;
    }
  });
  this.mySigmaGraph.refreshGraph();
  return matching;
}

GraphModel.fn.formatSelectedInfoFromParIDList = function(nodesList) {
  let that = this;
  let matchingInfo = {
     innerNodes: [],
     innerEdges: [],
     alterEdges: []
  }
  let edgeChecker = {}

  this.graph.nodes.forEach(function(n, i) {
    if (nodesList.indexOf(n.parID) !== -1) {
      matchingInfo.innerNodes.push(n.id);
      let lg = n.neighbors.length;
      for (let i = 0; i < lg; i += 1) {
        if (nodesList.indexOf(that.graph.nodes[n.neighbors[i]].parID) !== -1) {
          if (edgeChecker[n.alter[i]] === undefined) {
            let tempLink = that.graph.links[n.alter[i]];
            matchingInfo.innerEdges.push(tempLink);
            edgeChecker[n.alter[i]] = 1;
          }
        } else {
          matchingInfo.alterEdges.push(that.graph.links[n.alter[i]]);
        }
      }
    }
  });
  return matchingInfo;
}

GraphModel.fn.highLightSubgraphAccordingNodesList = function(nodesList) {
  let that = this;
  let matchingInfo = {
     nodes: 0,
     links: 0,

  }
  this.graph.links.forEach(function(n) {
    n.color = that.__SHANDOW_COLOR;
  })

  this.graph.nodes.forEach(function(n, i) {
    if (nodesList.indexOf(n.parID) !== -1) {
      n.color = that.__ROUGE_COLOR;
      matchingInfo.nodes += 1;
      let lg = n.neighbors.length;
      for (let i = 0; i < lg; i += 1) {
        if (nodesList.indexOf(that.graph.nodes[n.neighbors[i]].parID) !== -1) {
          let tempLink = that.graph.links[n.alter[i]];
          tempLink.color = that.__ROUGE_COLOR;
          matchingInfo.links += 1;
        }
      }
    } else {
      n.color = that.__SHANDOW_COLOR;
    }
  });
  this.mySigmaGraph.refreshGraph();
  matchingInfo.links /= 2;
  return matchingInfo;
}

GraphModel.fn.updateGraphFromCertainGraph = function(certainGraph) {
  var piDict = {};
  var that = this;
  var pi2id = {};
  var existPi2id = {};
  var existId2pid = {}
  var deletedNodes = [];
  certainGraph.nodes.forEach(function(n, i) {
    piDict[n.pid] = false;
    pi2id[n.pid] = i;
  });

  this.mySigmaGraph.getNodes().forEach(function(n) {
    if (piDict[n.pid] === undefined) {
      that.mySigmaGraph.delNode(n.id);
      deletedNodes.push(n);
    } else {
      piDict[n.pid] = true;
      existId2pid[n.id] = n.pid;
      existPi2id[n.pid] = n.id;
    }
  });
  var k = 0;
  var temp;
  for (let oneNode in piDict) {
    if (!piDict[oneNode]) {
      temp = certainGraph.nodes[pi2id[oneNode]];
      while (existId2pid[k] !== undefined) {
        k += 1;
      }
      existId2pid[k] = temp.pid;
      existPi2id[temp.pid] = k;
      temp.id = k;
      this.mySigmaGraph.addNode(temp);
    }
  }

  var edgesDict = {};
  var edgeId2posi = {};
  certainGraph.links.forEach(function(e, i) {
    edgesDict[e.id] = false;
    edgeId2posi[e.id] = i;
  })
  this.mySigmaGraph.getLinks().forEach(function(e, i) {
    if (edgesDict[e.id] !== undefined) {
      edgesDict[e.id] = true;
    } else {
      that.mySigmaGraph.delEdge(e.id);
    }
  })
  var tempEdge;
  for (let oneEdge in edgesDict) {
    if (!edgesDict[oneEdge]) {
      tempEdge = certainGraph.links[edgeId2posi[oneEdge]];
      tempEdge.source = existPi2id[certainGraph.nodes[tempEdge.source].pid];
      tempEdge.target = existPi2id[certainGraph.nodes[tempEdge.target].pid];
      this.mySigmaGraph.addEdge(tempEdge);
    }
  }
  this.refreshSigGraph();
  return deletedNodes;
}

GraphModel.fn.updateGraphLayout = function(layout, graph) {
  var req = {};
  var that = this;
  // var graph = this.graph;
  req.layout = layout;
  req.data = {};
  req.data.links = graph.links;
  req.data.nodes = graph.nodes;

  lpt_util.postData(true, '/layout', JSON.stringify(req), function(data) {

    that.resetGraphCamera();
    that.graph = data;
    that.showGraph(data);
  });
}

GraphModel.fn.stopForce = function() {
  if (this.mySigmaGraph.sig.isForceAtlas2Running()) {
    this.mySigmaGraph.sig.killForceAtlas2();
    // this.endAnimate();
  }
}

GraphModel.fn.initGraph = function(data) {
  var that = this;
  var edgeSum = 0;
  var nodeSum = 0;
  data.nodes.forEach(function(d, i) {
    d.id = i;
    d.neighbors = [];
    d.alter = [];
    if (!d.color) {
      d.color = that.colorScale(d.group);
    }
    d.originalColor = d.color;
    if (!d.hidden) {
      nodeSum += 1;
    }
  });

  data.links.forEach(function (d, i) {
    d.id = i;
    let n1 = d.source;
    let n2 = d.target;
    let node1 = data.nodes[n1];
    let node2 = data.nodes[n2];
    node1.neighbors.push(n2);
    node2.neighbors.push(n1);
    node1.alter.push(i);
    node2.alter.push(i);
    d.size = d.weight;
    if (!d.hidden) {
      edgeSum += 1;
    }
  });

  data.nodes.forEach(d=>{
    d.size = d.neighbors.length + 1;
  })

  this.__edgeSum = edgeSum;
  this.__nodeSum = nodeSum;
  console.log(data)
  return data;
}

GraphModel.fn.getSelectedNodes = function(polygon) {
  var tempNodes = this.mySigmaGraph.getNodes();
  var res = [];
  let that = this;
  function testBound(n) {
    var x = n[that.renderX];
    var y = n[that.renderY];
    var i = 0;
    var j = 0;
    var c = 0;
    var end1 = polygon.length;
    var end2 = end1 - 1;

    if (end1 < 10) {
      return c;
    }

    for (i = 0, j = end2; i < end1; j = i++) {
        if ((((polygon[i][1] <= y) && (y < polygon[j][1])) || ((polygon[j][1] <= y) && (y < polygon[i][1]))) &&
            (x < (polygon[j][0] - polygon[i][0]) * (y - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0]))
            c = !c;
    }
    return c;
  }
  tempNodes.forEach(function(n, i) {
    if (testBound(n)) {
      res.push(i);
    }
  })
  return res;
}

GraphModel.fn.getNodesInHullInfo = function(nodesList) {
  var that = this;
  var res = {
    innerNodes: nodesList,
    alterEdges: [],
    innerEdges: []
  }
  var edgesIndex = {};
  var tempNode,
    lg;
  var tempNodes = this.mySigmaGraph.getNodes();
  var tempEdges = this.mySigmaGraph.getLinks();
  nodesList.forEach(function(n) {
    tempNode = tempNodes[n];
    tempNode.color = tempNode.originalColor;
    lg = tempNode.alter.length;
    for (let i = 0; i < lg; i += 1) {
      if (tempNodes[tempNode.neighbors[i]].groupID !== tempNode.groupID) {
        res.alterEdges.push(tempEdges[tempNode.alter[i]]);
      } else {
        if (!edgesIndex[tempEdges[tempNode.alter[i]].id]) {
          edgesIndex[tempEdges[tempNode.alter[i]].id] = true;
          res.innerEdges.push(tempEdges[tempNode.alter[i]]);
        }
      }
    }
  })
  return res;
}

GraphModel.fn.testClickedNode = function(posi) {
  let clickedNode = null;
  // let graphPosi = this.mySigmaGraph.getGraphPosition(posi[0], posi[1]);

  // console.log(this.mySigmaGraph.indexNodeFromQuad(graphPosi.x, graphPosi.y));
  for (let oneNode of this.graph.nodes) {

    let leftLimit = oneNode[this.renderX] - oneNode[this.renderSize];
    let rightLimit = oneNode[this.renderX] + oneNode[this.renderSize];
    let topLimit = oneNode[this.renderY] - oneNode[this.renderSize];
    let bottomLimit = oneNode[this.renderY] + oneNode[this.renderSize];
    if (posi[0] > leftLimit && posi[0] < rightLimit && posi[1] < bottomLimit && posi[1] > topLimit) {
      clickedNode = oneNode;
      break;
    }
  }
  if (clickedNode) {
    clickedNode['renderX'] = clickedNode[this.renderX];
    clickedNode['renderY'] = clickedNode[this.renderY];
    clickedNode['renderSize'] = clickedNode[this.renderSize];
  }
  return clickedNode;
}

GraphModel.fn.testSelect = function(polygon) {
  var tempNodes = this.mySigmaGraph.getNodes();
  if (tempNodes.length === 0) {
    return;
  }
  var that = this;
  var existList = [];
  var alterEdges = [];
  var innerEdges = [];
  var shadColor = '#C0C0C0';

  function getPerson(node) {
    if (existList.indexOf(node.id) === -1) {
      existList.push(node.id);
      node.color = node.originalColor;
    }
  };

  function testBound(n) {
    var x = n[that.renderX];
    var y = n[that.renderY];
    var i = 0;
    var j = 0;
    var c = 0;
    var end1 = polygon.length;
    var end2 = end1 - 1;

    if (end1 < 10) {
      return c;
    }

    for (i = 0, j = end2; i < end1; j = i++) {
      if ((((polygon[i][1] <= y) && (y < polygon[j][1])) || ((polygon[j][1] <= y) && (y < polygon[i][1]))) &&
          (x < (polygon[j][0] - polygon[i][0]) * (y - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0]))
          c = !c;
    }
    return c;
  }

  this.graph.links.forEach(function(e, i) {
    var n1 = tempNodes[e.source];
    var n2 = tempNodes[e.target];
    if (!n1.hidden && !n2.hidden) {
      var r1 = testBound(n1);
      var r2 = testBound(n2);
      if (!e.hidden && !e.isBackstage) {
        if (r1 && r2) {
          getPerson(n1);
          getPerson(n2);
          innerEdges.push(e);
          e.color = '#ec5148';
          // e.size = that.__EDV_EDGE_SIZE;
        } else {
          if (!r1 && r2) {
            getPerson(n2);
            e.color = shadColor;
            alterEdges.push(e);
            // e.size = 0.1;
          } else if (r1 && !r2) {
            getPerson(n1);
            alterEdges.push(e);
            e.color = shadColor;
            // e.size = that.__MIN_EDGE_SIZE;
          } else {
            e.color = shadColor;
            n1.color = shadColor;
            n2.color = shadColor;
            // e.size = that.__MIN_EDGE_SIZE;
          }
        }
      } else if (e.isBackstage) {
        if (r1 && r2) {
          // e.size = that.__EDV_EDGE_SIZE;
          getPerson(n1);
          getPerson(n2);
          innerEdges.push(e);
          e.hidden = false;
        } else {
          if (!r1 && !r2) {
            // e.size = that.__MIN_EDGE_SIZE;
            e.hidden = true;
          } else {
            if (r1) {
              getPerson(n1);
            } else {
              getPerson(n2);
            }
            alterEdges.push(e);
            // e.size = that.__MIN_EDGE_SIZE;
            e.hidden = false;
          }
        }
      }
    }
  });

  if (existList.length === 0) {
    this.resetSigGraph();
    this.refreshSigGraph();
    this.__IS_SELECTED = false;
  } else {
    this.refreshSigGraph();
    this.__IS_SELECTED = true;
    // if (innerEdges.length === 0) {
    //  this.mySigmaGraph.updateMaxEdgeSize(this.__MIN_EDGE_SIZE);
    // } else {
    //  this.mySigmaGraph.updateMaxEdgeSize(this.__EDV_EDGE_SIZE);
    // }
  }
  return {
    innerNodes : existList.map(d=>{
      return tempNodes[d]
    }),
    innerEdges : innerEdges,
    alterEdges : alterEdges
  }
}

GraphModel.fn.gotoGraphCordi = function(cordinate) {
  if (cordinate) {
    this.mySigmaGraph.gotoCordinate(cordinate, this.TIME_GO_CORDINATE);
  }

}

GraphModel.fn.getNodeByName = function(name) {
  let res = null;
  for (let oneNode of this.graph.nodes) {
    if (oneNode.label === name) {
      res = oneNode;
      break;
    }
  }
  return res;
}

GraphModel.fn.getNodeCordiByName = function(name) {
  var lg = this.graph.nodes.length;
  var res = null;
  var that = this;
  this.graph.nodes.forEach(function(n) {
    if (n.label === name) {
      res = {
        x: n[that.renderX],
        y: n[that.renderY],
        ratio: 0.01
      };

      n.color = n.originalColor;
      // n.size = that.__MAX_NODE_SIZE;
    } else {
      n.color = that.__SHANDOW_COLOR;
      // n.size = that.__MIN_NODE_SIZE;
    }
  })
  setTimeout(function() {
    // that.mySigmaGraph.updateMaxNodeSize(that.__MAX_NODE_SIZE);
    that.refreshSigGraph();
  }, 100)
  return res;
}

GraphModel.fn.getHullFromOneGroup = function(groupID, nodesList) {
  var res = [];
  var lg = nodesList.length;
  var tempNode;
  var tempNodes = this.mySigmaGraph.getNodes();
  for (let i = 0; i < lg; i += 1) {
    tempNode = tempNodes[nodesList[i]];
    res.push([tempNode[this.renderX], tempNode[this.renderY]]);
  }

  return {
    data: res,
    color: this.graph.nodes[nodesList[0]].color
  };
}

GraphModel.fn.buildGraphFromSelected = function(data) {
  var res = {};
  res.nodes = [];
  res.links = [];
  var lg = data.innerNodes.length;
  var tempNode, oneNode;
  var idict = {};
  // var a = ['alter', 'degree', 'emis', 'metier', 'label', 'metier', 'neighbors',
          // 'num', 'originalColor', 'parID', 'pid']
  for (let i = 0; i < lg; i += 1) {
    oneNode = this.graph.nodes[data.innerNodes[i]];
    tempNode = {};
    idict[oneNode.id] = i;
    for (let p in oneNode) {  
      tempNode[p] = oneNode[p];
    }
    // tempNode.x = oneNode['read_cam0:x'];
    tempNode.color = oneNode.originalColor;
    // tempNode.y = oneNode['read_cam0:y'];
    // tempNode.size = oneNode['read_cam0:size'];

    tempNode.id = i;
    res.nodes.push(tempNode);
  };
  lg = data.innerEdges.length;
  var oneEdge, tempEdge;
  for (let i = 0; i < lg; i += 1) {
    tempEdge = {};
    oneEdge = data.innerEdges[i];
    for (let p in oneEdge) {
        tempEdge[p] = oneEdge[p];
    }
    tempEdge.size = oneEdge['read_cam0:size'];
    if (idict[tempEdge.source] !== undefined) {
      tempEdge.source = idict[tempEdge.source];
    }
    if (idict[tempEdge.target] !== undefined) {
      tempEdge.target = idict[tempEdge.target];
    }
    res.links.push(tempEdge);
  }
  return res;
}

GraphModel.fn.moveGraph = function(direction) {
  var currentCord = this.mySigmaGraph.getCameracordi();
  switch (direction) {
    case 'up':
      currentCord.y -= this.__MOVE_SPACE * currentCord.ratio;
      break;
    case 'down':
      currentCord.y += this.__MOVE_SPACE * currentCord.ratio;
      break;
    case 'left':
      currentCord.x -= this.__MOVE_SPACE * currentCord.ratio;
      break;
    case 'right':
      currentCord.x += this.__MOVE_SPACE * currentCord.ratio;
      break;
    case 'zoom in':
      currentCord.ratio /= this.__ZOOMING_RATIO;
      break;
    case 'zoom out':
      currentCord.ratio *= this.__ZOOMING_RATIO;
      break;
    case 'reset':
      currentCord.x = 0;
      currentCord.y = 0;
      currentCord.ratio = 1;
  }
  this.mySigmaGraph.gotoCordinate(currentCord);
  var that = this;
  if (this.redrawHullCallback) {
    that.redrawHullCallback();
  }
}

GraphModel.fn.resetGraphCamera = function() {
  this.mySigmaGraph.resetCamera();
}

GraphModel.fn.setMaxNodesize = function(size) {
  this.sigGraphPros.maxNodeSize = size;
}

GraphModel.fn.refreshSigGraph = function() {
  this.mySigmaGraph.refreshGraph();
}

GraphModel.fn.resetGraphColor = function() {
  // this.mySigmaGraph.updateMaxNodeSize(this.__MIN_NODE_SIZE);
  // this.mySigmaGraph.updateMaxEdgeSize(this.__MIN_EDGE_SIZE);
  this.mySigmaGraph.resetGraphColor(this.__MIN_EDGE_SIZE, this.__SHANDOW_COLOR, this.__IS_TIME_INNER, this.__ROUGE_COLOR);
}

GraphModel.fn.resetSigGraph = function() {
  this.mySigmaGraph.resetGraph(this.__MIN_EDGE_SIZE, this.__SHANDOW_COLOR, this.__IS_TIME_INNER, this.__ROUGE_COLOR);
  // this.mySigmaGraph.updateMaxNodeSize(this.__MIN_NODE_SIZE);
  // this.mySigmaGraph.updateMaxEdgeSize(this.__MIN_EDGE_SIZE);
}

GraphModel.fn.backOriginalColor = function() {
  this.mySigmaGraph.backOriginalColor();
}

GraphModel.fn.getGroupNodesDict = function(community) {
  var groupIndex = {};
  var groupID;
  for (let oneNode in community) {
    groupID = community[oneNode];
    if (groupIndex.hasOwnProperty(groupID)) {
      groupIndex[groupID].push(+oneNode);
    } else {
      groupIndex[groupID] = [+oneNode];
    }
  }
  return groupIndex;
}

GraphModel.fn.getGroupSizeDict = function(groupNodesDict) {
  var res = {};
  for (let oneGroup in groupNodesDict) {
    res[oneGroup] = groupNodesDict[oneGroup].length;
  }
  return res;
}

GraphModel.fn.getGroupNodes = function(groupID) {
  var res = null;
  if (this.groupNodesDict) {
    res = this.groupNodesDict[groupID];
  }
  return res;
}

GraphModel.fn.processCommunity = function(community) {
  var that = this;
  this.groupNodesDict = this.getGroupNodesDict(community);
  this.groupSizeDict = this.getGroupSizeDict(this.groupNodesDict);
  this.mySigmaGraph.getNodes().forEach(function(n, i) {
    n.groupID = community[''+i];
    // n.color = that.vingtColor(n.groupID);
    // n.originalColor = n.color;
  });

  this.mySigmaGraph.getLinks().forEach(function(e) {
    if (e.isBackstage) {
      e.hidden = true;
    }
  })
  this.refreshSigGraph();
  return this.groupNodesDict;
}

GraphModel.fn.colorNodesAccordingToGroup = function() {
  var that = this;
  this.mySigmaGraph.getNodes().forEach(function(n, i) {
    n.color = that.vingtColor(n.groupID);
    n.originalColor = n.color;
  });
  this.refreshSigGraph();
}

GraphModel.fn.colorNodesAccordingToMetier = function() {
  var that = this;
  this.mySigmaGraph.getNodes().forEach(function(n, i) {
    n.color = that.colorScale(n.metier);
    n.originalColor = n.color;
  });
  this.refreshSigGraph();
}

GraphModel.fn.getShowingInfo = function() {
  return this.mySigmaGraph.getShowingNodesEdgesNum();
}

GraphModel.fn.updateMovingChoice = function(isShowLink, isShowNode) {
  if (isShowLink) {
    this.__showLinkWhileMoving = true;
  } else {
    this.__showLinkWhileMoving = false;
  }
  if (isShowNode) {
    this.__showNodeWhileMoving = true;
  } else {
    this.__showNodeWhileMoving = false;
  }
}

GraphModel.fn.showGraph = function(graph) {
  var tempGraph = this.initGraph(graph);

  this.graph = tempGraph;
  // if (this.d3force) {
  //   this.d3force.stop();
  //   this.d3force = null;
  // }
  // this.mySigmaGraph.updateMaxNodeSize(this.__MIN_NODE_SIZE);
  // this.mySigmaGraph.updateMaxEdgeSize(this.__MIN_EDGE_SIZE);

  this.mySigmaGraph.updateGraph(tempGraph);
}

GraphModel.fn.getGraph = function() {
  return this.graph;
}

GraphModel.fn.getShowingNodes = function() {
  return this.mySigmaGraph.getNodes();
}

GraphModel.fn.getNodeSum = function() {
  return this.__nodeSum;
}

GraphModel.fn.getEdgeSum = function() {
  return this.__edgeSum;
}

GraphModel.fn.filterEdgeFromDate = function(d1, d2) {
  var that = this;
  if (d1 === d2) {
    this.__IS_TIME_INNER = false;
    this.resetSigGraph();
    this.refreshSigGraph();
    return {
      nodesNum: this.__nodeSum,
      edgesNum: this.__edgeSum
    }
  }
  this.__IS_TIME_INNER = true;
  var ems;
  var lg;

  var flag;
  var emiCount;
  var existList = [];
  var edgeCount = 0;
  var tempNodes = this.mySigmaGraph.getNodes();
  tempNodes.forEach(function(n) {
    n.color = that.__SHANDOW_COLOR;
    n.dateInner = false;
  })

  this.graph.links.forEach(function(e) {
    ems = e.emi;
    lg = ems.length;
    flag = false;
    emiCount = 0;
    for (let i = 0; i < lg; i += 1) {
      if (that.allEmi[ems[i]].date >= d1 && that.allEmi[ems[i]].date < d2) {
        flag = true;
        emiCount += 1;
      }
    }
    e.numEmInDate = emiCount;
    if (flag) {
      edgeCount += 1;
      that.graph.nodes[e.source].color = that.graph.nodes[e.source].originalColor;
      that.graph.nodes[e.target].color = that.graph.nodes[e.target].originalColor;
      if (existList.indexOf(e.source) === -1) {
        existList.push(e.source);
      }
      if (existList.indexOf(e.target) === -1) {
        existList.push(e.target);
      }
      e.hidden = false;
      e.dateInner = true;
      if (!e.isBackstage) {
        e.color = that.__ROUGE_COLOR;
      }
    } else {
      // if (!e.isBackstage) {
      //  e.color = that.__SHANDOW_COLOR;
      // }
      that.graph.nodes[e.source].color = that.__SHANDOW_COLOR;
      that.graph.nodes[e.target].color = that.__SHANDOW_COLOR;
      e.hidden = true;
      e.dateInner = false;
    }
  });
  lg = existList.length;
  for (let i = 0; i < lg; i += 1) {
    tempNodes[existList[i]].dateInner = true;
    tempNodes[existList[i]].color = tempNodes[existList[i]].originalColor;
  }
  this.refreshSigGraph();
  return {
    nodesNum: existList.length,
    edgesNum: edgeCount
  }
}

GraphModel.fn.filterGraphFromNodeNum = function(extent) {
  let that = this;
  if (extent.length === 0) {
    this.resetSigGraph();
    this.refreshSigGraph();
    return null;
  }
  var lg = 0;

  var edgeCount = 0;

  var tempNodes = this.mySigmaGraph.getNodes();
  tempNodes.forEach(function(n) {
    if (n.num >= extent[0] && n.num <= extent[1]) {
      n.hidden = false;
    } else {
      n.hidden = true;
    }
  });
  console.log(tempNodes);
  tempNodes.forEach(function(n) {
    for (let oneNb of n.neighbors) {
      if (tempNodes[oneNb].hidden === false) {
        edgeCount += 1;
      }
    }
  })

  this.refreshSigGraph();
  return {
    nodesNum: lg,
    edgesNum: edgeCount
  }
}

GraphModel.fn.filterGraphFromParIDList = function(idList) {
  let that = this;
  if (idList.length === 0) {
    this.resetSigGraph();
    this.refreshSigGraph();
    return null;
  }

  var nodeCount = 0;

  var edgeCount = 0;

  var tempNodes = this.mySigmaGraph.getNodes();
  tempNodes.forEach(function(n) {
    if (idList.indexOf(n.parID) != -1) {
      nodeCount += 1;
      n.hidden = false;
    } else {
      n.hidden = true;
    }
  });

  tempNodes.forEach(function(n) {
    for (let oneNb of n.neighbors) {
      if (tempNodes[oneNb].hidden === false) {
        edgeCount += 1;
      }
    }
  })

  this.refreshSigGraph();
  return {
    nodesNum: nodeCount,
    edgesNum: edgeCount
  }
}

GraphModel.fn.filterGraphFromEmiNum = function(extent) {
  var that = this;
  if (extent.length === 0) {
    this.resetSigGraph();
    this.refreshSigGraph();
    return;
  }

  var lg;

  var emiCount;
  var existList = [];
  var edgeCount = 0;
  var tempNodes = this.mySigmaGraph.getNodes();
  tempNodes.forEach(function(n) {
    // n.color = that.__SHANDOW_COLOR;
    n.hidden = true;
  })

  this.graph.links.forEach(function(e) {
    lg = e.emi.length;
    emiCount = 0;
    
    if (lg >= extent[0] && lg <= extent[1]) {
      edgeCount += 1;
      that.graph.nodes[e.source].hidden = false;
      that.graph.nodes[e.target].hidden = false;
      
      e.hidden = false;
      // if (!e.isBackstage) {
      //   e.color = that.__ROUGE_COLOR;
      // }
    } else {
      // that.graph.nodes[e.source].color = that.__SHANDOW_COLOR;
      // that.graph.nodes[e.target].color = that.__SHANDOW_COLOR;
      e.hidden = true;
    }
  });

  // lg = existList.length;
  // for (let i = 0; i < lg; i += 1) {
  //   tempNodes[existList[i]].color = tempNodes[existList[i]].originalColor;
  // }
  this.refreshSigGraph();
  return {
    nodesNum: lg,
    edgesNum: edgeCount
  }
}

GraphModel.fn.filterEdgesForMove = function(d1, d2) {
  var that = this;
  var lg;
  var i;

  var flag;
  var n1;
  var n2;
  var emiCount;
  var nodesToGroupDict = {};
  var tempNodes = this.mySigmaGraph.getNodes();
  var groupNodesActivity = {};
  groupNodesActivity.sumEmi = 0;

  function addNodeEmNumToDict(nodeID, targetGroup, emiNum, emisList) {
    if (nodesToGroupDict.hasOwnProperty(nodeID)) {
      if (nodesToGroupDict[nodeID][targetGroup] === undefined) {
        nodesToGroupDict[nodeID][targetGroup] = emiNum;
        // nodesToGroupDict[nodeID][targetGroup] = emisList;
      } else {
        nodesToGroupDict[nodeID][targetGroup] += emiNum;
        // var k = emisList.length;
        // for (var j = 0; j < k; j += 1) {
        //  if (nodesToGroupDict[nodeID][targetGroup].indexOf(emisList[j]) === -1) {
        //    nodesToGroupDict[nodeID][targetGroup].push(emisList[j])
        //  }
        // }

      }
    } else {
      nodesToGroupDict[nodeID] = {};
      nodesToGroupDict[nodeID][targetGroup] = emiNum;
      // nodesToGroupDict[nodeID][targetGroup] = emisList;
    }
    if (groupNodesActivity.hasOwnProperty(targetGroup)) {
      groupNodesActivity[targetGroup] += emiNum;
      groupNodesActivity.sumEmi += emiNum;
    } else {
      groupNodesActivity[targetGroup] = emiNum;
      groupNodesActivity.sumEmi += emiNum;
    }
  }
  tempNodes.forEach(function(n) {
    if (that.__showNodeWhileMoving) {
      n.hidden = false;
      n.color = that.__SHANDOW_COLOR;
    } else {
      n.hidden = true;
    }
  })
  this.graph.links.forEach(function(e) {
    lg = e.emi.length;
    flag = false;
    emiCount = 0;
    for (i = 0; i < lg; i += 1) {
      if (that.allEmi[e.emi[i]].date >= d1 && that.allEmi[e.emi[i]].date < d2) {
        flag = true;
        emiCount += 1;
      }
    }

    n1 = that.graph.nodes[e.source];
    n2 = that.graph.nodes[e.target];
    if (flag) {
      addNodeEmNumToDict(n1.id, n2.groupID, emiCount, e.emi);
      addNodeEmNumToDict(n2.id, n1.groupID, emiCount, e.emi);

      if (that.__showLinkWhileMoving) {
        e.hidden = false;
      } else {
        e.hidden = true;
      }

      if (!that.__showNodeWhileMoving) {
        n1.hidden = false;
        n2.hidden = false;
      }

      e.dateInner = true;
    } else {
      e.hidden = true;
    }
  });
  return {
    'nodesToGroupDict': nodesToGroupDict,
    'groupNodesActivity': groupNodesActivity
  };
}

GraphModel.fn.filterTargetEdgesForMove = function(d1, d2, nodesList) {
  var that = this;
  var lg;
  var i;
  var j;
  var alg;
  var flag;
  var n1;
  var e;
  var n2;
  var emiCount;
  var nodesToGroupDict = {};
  var tempNodes = this.mySigmaGraph.getNodes();

  function addNodeEmNumToDict(nodeID, targetGroup, emiNum, emisList) {
    if (nodesToGroupDict.hasOwnProperty(nodeID)) {
      if (nodesToGroupDict[nodeID][targetGroup] === undefined) {
        nodesToGroupDict[nodeID][targetGroup] = emiNum;
        // nodesToGroupDict[nodeID][targetGroup] = emisList;
      } else {
        nodesToGroupDict[nodeID][targetGroup] += emiNum;
        // var k = emisList.length;
        // for (var j = 0; j < k; j += 1) {
        //  if (nodesToGroupDict[nodeID][targetGroup].indexOf(emisList[j]) === -1) {
        //    nodesToGroupDict[nodeID][targetGroup].push(emisList[j])
        //  }
        // }
      }
    } else {
      nodesToGroupDict[nodeID] = {};
      nodesToGroupDict[nodeID][targetGroup] = emiNum;
      // nodesToGroupDict[nodeID][targetGroup] = emisList;
    }
  }
  tempNodes.forEach(function(n) {
    if (that.__showNodeWhileMoving) {
      n.hidden = false;
      n.color = that.__SHANDOW_COLOR;
    } else {
      n.hidden = true;
    }
  });
  var alg = this.graph.links.length;
  for (j = 0; j < alg; j += 1) {
    e = this.graph.links[j];
    lg = e.emi.length;
    if (nodesList.indexOf(e.source) === -1 && nodesList.indexOf(e.target) === -1) {
      e.hidden = true;
      continue;
    } else {
      flag = false;
      emiCount = 0;
      for (i = 0; i < lg; i += 1) {
        if (that.allEmi[e.emi[i]].date >= d1 && that.allEmi[e.emi[i]].date < d2) {
          flag = true;
          emiCount += 1;
        }
      }

      n1 = that.graph.nodes[e.source];
      n2 = that.graph.nodes[e.target];
      if (flag) {
        addNodeEmNumToDict(n1.id, n2.groupID, emiCount, e.emi);
        addNodeEmNumToDict(n2.id, n1.groupID, emiCount, e.emi);

        if (that.__showLinkWhileMoving) {
          e.hidden = false;
        } else {
          e.hidden = true;
        }
        if (!that.__showNodeWhileMoving) {
          n1.hidden = false;
          n2.hidden = false;
        }

        e.dateInner = true;
      } else {
        e.hidden = true;
      }
    }
  };
  return nodesToGroupDict;
}

GraphModel.fn.getRandomPositionInGroup = function(groupID) {
  var tempArr = this.groupNodesDict[groupID];
  var lg = tempArr.length;
  var r1 = Math.floor(Math.random() * lg);
  var r2 = Math.floor(Math.random() * lg);
  var res = {};
  res.x = (this.graph.nodes[tempArr[r1]].x + this.graph.nodes[tempArr[r2]].x) / 2;
  res.y = (this.graph.nodes[tempArr[r1]].y + this.graph.nodes[tempArr[r2]].y) / 2;
  return res;
}

GraphModel.fn.findTargetGroupForNode = function(groupDict) {
  var maxVal = 0;
  var groupTarget = 0;
  var index;
  for (let oneGroup in groupDict) {
    // index = groupDict[oneGroup].length;
    index = groupDict[oneGroup] / this.groupSizeDict[oneGroup];
    if (index > maxVal) {
      maxVal = index;
      groupTarget = +oneGroup;
    }
  }
  return groupTarget;
}

GraphModel.fn.findMoveNodes = function(nodesToGroupDict) {
  var that = this;
  var res = [];
  var mostConnectGroup,
    mcPosi,
    n,
    maxNum = 0;

  for (let oneNode in nodesToGroupDict) {
    n = this.graph.nodes[+oneNode];
    n.color = n.originalColor;

    mostConnectGroup = that.findTargetGroupForNode(nodesToGroupDict[oneNode]);
    if (!n.isMoved) {
      n.origin_x = n.x;
      n.origin_y = n.y;
      n.origin_groupID = n.groupID;
      n.isMoved = true;
    }
    if (mostConnectGroup !== n.groupID) {
      mcPosi = that.getRandomPositionInGroup(mostConnectGroup);
      n.to_x = mcPosi.x;
      n.to_y = mcPosi.y;
      res.push(n.id);
    } else if (n.x !== n.origin_x) {
      n.to_x = n.origin_x;
      n.to_y = n.origin_y;
      res.push(n.id);
    }

  }
  return res;
}

GraphModel.fn.findMoveNodesFromTargetNodes = function(nodesToGroupDict, nodesList, groupIndexList) {
  var that = this;
  var res = [];
  var mostConnectGroup,
    mcPosi,
    n,
    flag,
    maxNum = 0;

  for (let oneNode in nodesToGroupDict) {
    flag = false;
    n = this.graph.nodes[+oneNode];
    n.color = n.originalColor;

    mostConnectGroup = that.findTargetGroupForNode(nodesToGroupDict[oneNode]);
    if (nodesList.indexOf(n.id) === -1) {
      if (groupIndexList.indexOf(mostConnectGroup) !== -1) {
        flag = true;
      }
    } else {
      flag = true;
    }
    if (flag) {
      if (!n.isMoved) {
        n.origin_x = n.x;
        n.origin_y = n.y;
        n.origin_groupID = n.groupID;
        n.isMoved = true;
      }
      if (mostConnectGroup !== n.groupID) {
        mcPosi = that.getRandomPositionInGroup(mostConnectGroup);
        n.to_x = mcPosi.x;
        n.to_y = mcPosi.y;
        res.push(n.id);
      } else if (n.x !== n.origin_x) {
        n.to_x = n.origin_x;
        n.to_y = n.origin_y;
        res.push(n.id);
      }
    } else {
      n.color = this.__SHANDOW_COLOR;
    }
  }
  return res;
}

GraphModel.fn.getGroupListForTargetNodesList = function(nodesList) {
  var res = [];
  var lg = nodesList.length;
  var groupID;
  for (let i = 0; i < lg; i += 1) {
    groupID = this.graph.nodes[nodesList[i]].groupID;
    if (res.indexOf(groupID) === -1) {
      res.push(groupID);
    }
  }
  return res;
}

GraphModel.fn.prepareAnimate = function() {
  this.mySigmaGraph.prepareAnimate();
}

GraphModel.fn.endAnimate = function() {
  this.mySigmaGraph.endAnimate();
}

GraphModel.fn.letsMove = function(nodesList, d1, d2) {

  var that = this;
  var nodesToGroupDict = this.filterTargetEdgesForMove(d1, d2, nodesList);

  var groupIndexList = this.getGroupListForTargetNodesList(nodesList);
  var nodesToMove = this.findMoveNodesFromTargetNodes(nodesToGroupDict, nodesList, groupIndexList);
  this.mySigmaGraph.animateGraph(nodesToMove, this.__MOVE_TIME_INTERN);
}

GraphModel.fn.moveAllGraph = function(d1, d2, callback) {
  var filterRes = this.filterEdgesForMove(d1, d2);
  var nodesToMove = this.findMoveNodes(filterRes.nodesToGroupDict);
  this.mySigmaGraph.animateGraph(nodesToMove, this.__MOVE_TIME_INTERN);
  if (callback) {
    callback(filterRes.groupNodesActivity);
  }
}

GraphModel.fn.letsMoveBackToOrigin = function(callback) {
  this.mySigmaGraph.animateGraph(this.backToOriginPosition(), this.__MOVE_TIME_INTERN/2, callback);
  // this.endAnimate();
}

GraphModel.fn.hideAllEdges = function() {
  this.graph.links.forEach(function(e) {
    e.hidden = true;
  })
  this.refreshSigGraph();
}

GraphModel.fn.updateEmissionData = function(allEmi) {
  this.allEmi = allEmi;
}

GraphModel.fn.backToOriginPosition = function() {
  var res = [];
  this.graph.nodes.forEach(function(n) {
    if (n.isMoved) {
      n.to_x = n.origin_x;
      n.to_y = n.origin_y;
      res.push(n);
      n.isMoved = false;
    }
  });
  return res;
}

GraphModel.fn.addBackstageEdges = function(graphOriginal, graphBB, miniCoEmi) {
  if (graphBB.links.length === graphOriginal.links.length) {
    return graphBB;
  }

  var res = graphBB;
  var nodesIndex = {};
  var edgesIndex = {};
  var backstageEdges = [];
  var temp, term;
  var tempSource, tempTarget;
  var n1, n2;
  graphBB.links.forEach(function(e, i) {
    edgesIndex[e.id] = true;
  })
  graphBB.nodes.forEach(function(n, i) {
    nodesIndex[n.parID] = i;
  })
  graphOriginal.links.forEach(function(e) {
    if (e.weight >= miniCoEmi) {
      n1 = graphOriginal.nodes[e.source];
      n2 = graphOriginal.nodes[e.target];
      tempSource = n1.parID;
      tempTarget = n2.parID;
      if (nodesIndex[tempSource] !== undefined && nodesIndex[tempTarget] !== undefined) {
        if (edgesIndex[e.id] === undefined) {
          temp = {};
          for (term in e) {
            temp[term] = e[term]
          }
          temp.source = nodesIndex[tempSource];
          temp.target = nodesIndex[tempTarget];

          temp.color = '#87CEEB';
          temp.isBackstage = true;
          temp.hidden = true;
          backstageEdges.push(temp);
        }
      }
    }
  })
  res.links = res.links.concat(backstageEdges);
  return res;
}

GraphModel.fn.addBackstageNodes = function(graphOriginal, graphBB, miniEmi) {
  if (graphBB.links.length === graphOriginal.links.length) {
    return graphBB;
  }
  var res = {};
  res.nodes = [];
  res.links = [];
  var nodeShaffleIndex = {};
  var nodesIndex = {};
  var linksIndex = {};

  let tempCount = 0;
  graphOriginal.nodes.forEach(function(n, i) {
    if (n.num >= miniEmi) {
      res.nodes.push(n);
      nodeShaffleIndex[i] = tempCount;
      tempCount += 1;
    }
  })

  graphBB.nodes.forEach(function(n, i) {
    nodesIndex[n.parID] = i;
  })

  graphBB.links.forEach(function(l, i) {
    linksIndex[l.id] = i;
  })

  graphOriginal.links.forEach(function(n, i) {
    if (nodeShaffleIndex[n.source] !== undefined && nodeShaffleIndex[n.target] !== undefined) {
      if (linksIndex[n.id] === undefined) {
        let flag = false;
        let snode = graphOriginal.nodes[n.source];
        let tnode = graphOriginal.nodes[n.target];
        
        if (nodesIndex[snode.parID] === undefined && snode.alter[0] === i) {
          nodesIndex[snode.parID] = true;
          flag = true;
        }
        if (nodesIndex[tnode.parID] === undefined && tnode.alter[0] === i) {
          flag = true;
          nodesIndex[tnode.parID] = true;
        }
        if (flag) {
          let tempObj = {};
          for (let oneProp in n) {
            tempObj[oneProp] = n[oneProp];
          }
          tempObj.source = nodeShaffleIndex[n.source];
          tempObj.target = nodeShaffleIndex[n.target];
          res.links.push(tempObj);
        }
            
      } else {
        let tempObj = {};
        for (let oneProp in n) {
          tempObj[oneProp] = n[oneProp];
        }
        tempObj.source = nodeShaffleIndex[n.source];
        tempObj.target = nodeShaffleIndex[n.target];
        res.links.push(tempObj);
      }
    }
  })
  console.log(res);
  return res;  
}
