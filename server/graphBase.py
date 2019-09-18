import pip
import math
import re
from tulip import *

class tlpGraph():
	def __init__(self, data):
		self.__MAX_NODE_SIZE = 10
		self.__MIN_NODE_SIZE = 1
		self.__NODE_DIST = 8.6

		self.graph = tlp.newGraph()
		self.data = data
		if 'edges' in data:
			self.data['links'] = data['edges']
		self.nodeIndex = {}
		self.layoutList = tlp.getLayoutAlgorithmPluginsList()

	# def createSgGraph(self):
	# 	count = 0
	# 	viewSize = self.graph.getSizeProperty("viewSize")
	# 	baseSize = tlp.Size(1,1,1)
	# 	for n in self.data['nodes']:
	# 		tempNode = self.graph.addNode()
	# 		self.nodeIndex[count] = tempNode
	# 		viewSize[tempNode] = baseSize * n['size']
	# 		count += 1
	# 	for e in self.data['links']:
	# 		n1 = self.nodeIndex[e['source']]
	# 		n2 = self.nodeIndex[e['target']]
	# 		self.graph.addEdge(n1, n2)

	def getMaxNodeSize(self):
		maxNodeNum = 1
		for n in self.data['nodes']:
			if n['num'] > maxNodeNum:
				maxNodeNum = n['num']
		self.denominator = math.sqrt(maxNodeNum)

	def computeNodeSize(self, nodeNum):
		res = 1
		if nodeNum > 0:
			res = math.sqrt(nodeNum) / self.denominator 
		else:
			return res
		res = res * self.__NODE_DIST + self.__MIN_NODE_SIZE
		return math.ceil(res)

	def createGraph(self):
		count = 0
		viewSize = self.graph.getSizeProperty("viewSize")
		baseSize = tlp.Size(1, 1, 1)

		# self.getMaxNodeSize()

		for n in self.data['nodes']:
			tempNode = self.graph.addNode()
			if 'size' not in n and 'num' in n:
				n['size'] = math.sqrt(n['num']) + 1
			# viewSize[tempNode] = baseSize * n['size']
			self.nodeIndex[count] = tempNode
			count += 1
		
		for e in self.data['links']:
			n1 = self.nodeIndex[e['source']]
			n2 = self.nodeIndex[e['target']]
			self.graph.addEdge(n1, n2)		
		
	def applyLayout(self, layout):
		if layout in self.layoutList:
			viewLayout = self.graph.getLayoutProperty('viewLayout')
			
			self.graph.applyLayoutAlgorithm(layout, viewLayout)
			index = 0
			# baseSize = tlp.Size(16,16,1)
			for n in self.graph.getNodes():
				self.data['nodes'][index]['x'] = viewLayout[n][0]
				self.data['nodes'][index]['y'] = viewLayout[n][1]
				# self.data['nodes'][index]['id'] = index
				# viewSize[n] = baseSize
				index += 1
			# index = 0
			# for e in self.data['links']:
			# 	e['id'] = index
			# 	index += 1
			# bound = tlp.computeBoundingBox(self.graph)
			# boundBox = {'x0': bound[0][0], 'x1': bound[1][0],
			# 			'y0': bound[0][1], 'y1': bound[1][1]}
			# self.data['boundBox'] = boundBox

		return self.data

	def applyLouvain(self):
		weightProp = self.graph.getIntegerProperty('weight')
		index = 0
		for n in self.graph.getEdges():
			tempVale = 1
			if 'weight' in self.data['links'][index]:
				tempVale = self.data['links'][index]['weight']
			weightProp.setEdgeValue(n, tempVale)
			index += 1

		params = tlp.getDefaultPluginParameters('Louvain', self.graph)
		params['metric'] = weightProp
		# params['precision'] = 0.01
		resultMetric = self.graph.getDoubleProperty('resultMetric')
	
		success = self.graph.applyDoubleAlgorithm('Louvain', resultMetric, params)
		
		index = 0
		for i in self.graph.getNodes():
			self.data['nodes'][index]['groupID'] = resultMetric[i]
			index += 1

		return self.data

		
# a = {
# 	'nodes': [{}, {}, {}, {}, {}, {}],
# 	'links':[{'source': 0, 'target': 1, 'weight': 1}, {'source': 2, 'target': 1, 'weight': 6}, {'source': 0, 'target': 2, 'weight': 4},
# 					{'source': 0, 'target': 4, 'weight': 3}, {'source': 0, 'target': 5, 'weight': 2},{'source': 4, 'target': 5, 'weight': 7},
# 					{'source': 4, 'target': 3, 'weight': 4}, {'source': 3, 'target': 5, 'weight': 5}]
# 	}

# test = tlpGraph(a)
# print(test.layoutList)
# test.createGraph()
# test.applyLouvain()

# for i in test.data['nodes']:
# 	print i
