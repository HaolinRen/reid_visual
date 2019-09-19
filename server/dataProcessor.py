import numpy as np
import json
import time
from os import listdir
from scipy.spatial.distance import cosine
from graphBase import tlpGraph


QUERY_PATH = '/net/per920a/export/das14a/satoh-lab/wangz/person_reid/dataset/Market-1501-v15.09.15/query/'
GALLERY_PATH = '/net/per920a/export/das14a/satoh-lab/wangz/person_reid/dataset/Market-1501-v15.09.15/bounding_box_test/'
FEATURES_PATH = '/net/per920a/export/das14a/satoh-lab/wangz/person_reid/src/deep-person-reid-master/features/'

MAX_IMAGE_NUM = 100

class dataProcessor(object):
	def __init__(self):
		print('----- Loading data -----')
		self.loadJsonData('server/pdata.json')
		print('-----Full data Loaded-----')

	def getArr(self):
		arr = np.array(self.data)
		return arr

	def getFiles(self, filePath):
		filesName = listdir(filePath)
		persons = {}
		camera = {}
		for name in filesName:
			nl = name.split('_')
			if len(nl) > 1:
				personID = nl[0]
				cameraID = nl[1]
				if personID not in persons:
					persons[personID] = 0
				if cameraID not in camera:
					camera[cameraID] = 0

	def getEigValue(self):
		res = []
		try:
			arr = self.getArr()
			w, v = np.linalg.eig(arr)
			index = 0
			maxEig = 0
			for i in range(len(w)):
				if w[i].real > maxEig:
					index = i
					maxEig = w[i].real
			res.append(maxEig)
			tempList = []
			for x in v:
				tempList.append(abs(x[index].real))
			res.append(tempList)
		except:
			print('compute error')
		self.res = res

	def getJsonData(self, data):
		try:
			res = json.dumps(data)
		except:
			res = "error"
		return res

	def getGraph(self, req):
		d = json.loads(req)
		val = d['val']
		if val > 0.2:
			return ''
		graph = {
			'nodes': [],
			'links': []
		}
		nodeIndex = {}
		nodeCount = 0
		# 1348_c5s3_040940_06
		for i in self.allData:
			cameraID = i[5:7]
			videoID = i[7:9]

			if 'xc7' not in d['cd']:
				if cameraID not in d['cd']:
					continue
			if 'xs6' not in d['vd']:
				if videoID not in d['vd']:
					continue

			if i not in nodeIndex:
				nodeIndex[i] = nodeCount
				nodeCount += 1
				graph['nodes'].append({
						'imageID': i,
						'label': i[0:4],
						'group': int(i[2:4])
					})

			source = nodeIndex[i]
			for j in self.allData[i]:
				cameraID2 = j[5:7]
				videoID2 = j[7:9]

				if 'xc7' not in d['cd']:
					if cameraID2 not in d['cd']:
						continue
				else:
					if cameraID == cameraID2:
						continue
				if 'xs6' not in d['vd']:
					if videoID2 not in d['vd']:
						continue
				else:
					if videoID2 == videoID:
						continue

				if self.allData[i][j] >= val:
					continue
				if j not in nodeIndex:
					nodeIndex[j] = nodeCount
					nodeCount += 1
					graph['nodes'].append({
							'imageID': j,
							'label': j[0:4],
							'group': int(j[2:4])
						})
				target = nodeIndex[j]
				graph['links'].append({
						'source': source,
						'target': target
					})

		myGraph = tlpGraph(graph)
		myGraph.createGraph()
		return self.getJsonData(myGraph.applyLayout(d['layout']))



	def loadJsonData(self, filePath):
		with open(filePath, 'rb') as loadFile:
			self.allData = json.load(loadFile)

	def loadNumData(self, fileName):
		npData = np.load(FEATURES_PATH + fileName)
		return npData

	def calDist(self, d0, d1):
		return cosine(d0, d1)

	def getSimImages(self, req):
		
		res = []
		d = json.loads(req)
		filePath = QUERY_PATH
		featurePath = 'mobilenet_xent_market1501.pth.tar.qf.npy'
		firstPath = '/query/'
		if d['type'] == 'gallery':
			filePath = GALLERY_PATH
			featurePath = 'mobilenet_xent_market1501.pth.tar.gf.npy'
			firstPath = '/' + GALLERY_PATH
		
		filesNameList = listdir(filePath)
		filesNameList.sort()
		temp = []
		dataArr = self.loadNumData(featurePath)
		for f in filesNameList:
			if f[0] == '-':
				continue
			temp.append(f)
		filesNameList = temp
		k = 0

		personID = filesNameList[d['data']][0:4]
		for f in dataArr:
			if filesNameList[k][0:4] != '0000':
				dist = self.calDist(f, dataArr[d['data']])
				if dist < d['val']:
					tempID = filesNameList[k][0:4]
					same = 1
					if tempID != personID:
						same = 0
					res.append({
							'title': firstPath + filesNameList[k],
							'val': dist,
							'verify': same
						})
					if len(res) > MAX_IMAGE_NUM:
						break
			k += 1
		return self.getJsonData(res)

	def getQueryFiles(self):
		filesName = listdir(QUERY_PATH)
		filesName.sort()
		return filesName

	def getLayout(self, data):
		d = json.loads(data)
		graph = d['data']
		layout = d['layout']
		myGraph = tlpGraph(graph)
		myGraph.createGraph()
		return self.getJsonData(myGraph.applyLayout(layout))

	def getImages(self, req):
		
		req = json.loads(req)
		queryList = self.getQueryFiles()
		if req['type'] == 'all':
			res = {}
			personDict = {}
			k = 0
			for oneFile in queryList:
				nl = oneFile.split('_')
				if len(nl) > 1:
					if nl[0] not in personDict:
						personDict[nl[0]] = 0
						res['/query/' + oneFile] = k
						if len(res) > MAX_IMAGE_NUM:
							break
				k += 1
			return self.getJsonData(res)
		else:
			res = {
				'query': {},
				'gallery': {}
			}
			
			k = 0
			for oneFile in queryList:
				nl = oneFile.split('_')
				if len(nl) > 1:
					if nl[0] == req['data']:
						res['query']['/query/' + oneFile] = k
				k += 1

			galleryList = listdir(GALLERY_PATH)

			galleryList.sort()
			k = 0
			for oneFile in galleryList:
				nl = oneFile.split('_')
				if len(nl) > 1:
					if nl[0] == req['data']:
						res['gallery']['/' + GALLERY_PATH + oneFile] = k
				if oneFile[0] != '-':
					k += 1
			return self.getJsonData(res)


def getgallery():
	dp = dataProcessor()
	galleryList = listdir(GALLERY_PATH)
	dateDict = {}
	for oneFile in galleryList:
		fnls = oneFile.split('_')
		if len(fnls) > 2:
			date = int(int(fnls[2])/25)
			if date in dateDict:
				dateDict[date] += 1
			else:
				dateDict[date] = 1

	xval = 0
	yVal = 0

def getDistMatrix():
	dp = dataProcessor()
	res = {}
	featurePath = 'mobilenet_xent_market1501.pth.tar.gf.npy'
	filesNameList = listdir('../'+GALLERY_PATH)
	filesNameList.sort()
	temp = []
	dataArr = dp.loadNumData(featurePath)

	for f in filesNameList:
		if f[0] == '-':
			continue
		temp.append(f)

	filesNameList = temp


	lg = len(filesNameList)

	for k in range(lg):
		if filesNameList[k][0:4] != '0000':
			fileName = filesNameList[k].replace('.jpg', '')
			res[fileName] = {}
			print(k)
			for j in range(2798,lg):
				dist = dp.calDist(dataArr[k], dataArr[j])
				f2 = filesNameList[j].replace('.jpg', '')
				res[fileName][f2] = dist
	with open('data.json', 'w') as writefile:
			json.dump(res, writefile)


# getDistMatrix()


def purifyData():
	with open('pdata.json', 'rb') as loadFile:
		d = json.load(loadFile)
		res = {}
		for k in d:
			res[k+'.jpg'] = {}
			for f in d[k]:
				if d[k][f] < 0.4:
					res[k+'.jpg'][f+'.jpg'] = d[k][f]
		with open('pdata04.json', 'w') as writefile:
			json.dump(res, writefile)
# getgallery()

# purifyData()

# mobilenet_xent_market1501.pth.tar.gf.npy


# filesNameList = listdir('../' + GALLERY_PATH)
# filesNameList.sort()
# print(filesNameList)

