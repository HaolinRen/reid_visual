"use strict"

var lpt_util = {
    giveRanColor : function() {
      var cList = ['red', 'orange','yellow','olive','green','teal','blue','violet','purple','pink','brown'];
      var cLen = cList.length;
      var cp = Math.floor(Math.random() * cLen);
      return cList[cp];
    },
    postData : function(async, url, data, callback) {
      this.postData_o(async, url, 'application/json', data, (d)=>{
        try {
          var res = JSON.parse(d);
          if (callback) {
            callback(res)
          }
        } catch (e) {
          callback({});
          throw 'wrong json format';
        }
      })
    },
    postBinaryData : function(async, url, data, callback) {
      this.postData_o(async, url, 'application/cotet-steam', dta, callback);
    },
    postData_o: function(async, url, contType, data, callback) {
      $.ajax({
        async: async,
        type: 'POST',
        url: url,
        contentType: contType,
        data: data,
        success: function (resData) {
          callback(resData);
        },
        error: function (resData) {
          console.log(resData.statusText);
        }
      })
    },

    extendInstance : function (child, parent) {
        let F = function() {};
        F.prototype = parent.prototype;
        child.prototype = new F();
        child.prototype.constructor = child;
        child.prototype.uber = parent.prototype;
    },
    downloadFile: function(fileType, fileName, fileData) {
      if (false && window.navigator.msSaveBlob) {
        var blob = new Blob([decodeURIComponent(fileData)], {
          type: 'text/'+ fileType +';charset=utf-8'
        });

        window.navigator.msSaveBlob(blob, fileName);

      } else if (window.Blob && window.URL) {
        // HTML5 Blob        
        var blob = new Blob([fileData], {
          type: 'text/' + fileType + ';charset=utf-8'
        });
        var dataUrl = URL.createObjectURL(blob);

        $(this).attr({
          'download': fileName,
          'href': dataUrl,
          'target': '_blank'
        });
      } else {
        var dataToDownload = 'data:application/' + fileType + ';charset=utf-8,' + encodeURIComponent(fileData);

        $(this)
          .attr({
            'download': fileName,
            'href': dataToDownload,
            'target': '_blank'
          });
      }
    }
};

var timeFeature = {
    extent: [0, 0],
    init: function() {
        let ele = $('#timepane');
        this.timeline = new activityIndex(ele, ele.width());
        this.timeline.init();
        this.timeline.showGraph();
        this.timeline.callback = this.filterTime
    },
    filterTime: function(extent) {
        timeFeature.extent = extent;
        imageQuery.getQueryImages()
    },
    testTime: function(t) {
        if (this.extent[0] == this.extent[1]) {
            return false
        }
        if (this.extent[0] <= t && this.extent[1] >= t) {
            return false
        }
        return true
    }
}

var sidebarPane = {
    mySidebar: $('.ui.sidebar'),
    maxSnippetsNum: 200,
    maxTermsNum: 100,
    isTimelineShowed: true,
    showSidebar : function() {
        sidebarPane.mySidebar.sidebar('setting', 'transition', 'overlay')
                    .sidebar('toggle');
    },
    initial: function() {
        const SNIPPETS_NUM_INPUT_INDEX = 1;

        const TERMS_NUM_INPUT_INDEX = 2;

        const TIMELINE_TAGGLE = 3;

        const FILE_PATH_INPUT_INDEX = 4;

        const PROGRESS_BAR_INDEX = 5;

        const CONFIRM_BUTTON_INDEX = 6;


        $('#pageID').on('click', function() {
            sidebarPane.showSidebar();
        });

        let inputEles = sidebarPane.mySidebar.children();

        let snippetsNumEle = inputEles.eq(SNIPPETS_NUM_INPUT_INDEX).find('input');
        snippetsNumEle.on('input', d=>{
            let snippetsNum = +d.target.value;
            if (snippetsNum > 0) {
                sidebarPane.maxSnippetsNum = snippetsNum;
            } else {
                sidebarPane.maxSnippetsNum = sidebarPane.maxSnippetsNum;
            }
        })

        let termsNumEle = inputEles.eq(TERMS_NUM_INPUT_INDEX).find('input');
        termsNumEle.on('input', d=>{
            let termsNum = +d.target.value;
            if (termsNum > 0) {
                sidebarPane.maxTermsNum = termsNum;
            } else {
                sidebarPane.maxTermsNum = sidebarPane.maxTermsNum;
            }
        })


        let progressBar = inputEles.eq(PROGRESS_BAR_INDEX).find('#pgsbar');
        let progressLabel = inputEles.eq(PROGRESS_BAR_INDEX).find('.label');

        let progressShow = null;

        inputEles.eq(CONFIRM_BUTTON_INDEX).find('.button').on('click', d=>{
            progressLabel.html("Loading")
            clearInterval(progressShow);
            let count = 1;
            progressShow = setInterval(d=>{
                if (count >= 7) {
                    clearInterval(progressShow);
                } else {
                    count += 1;
                    progressBar.progress('set percent', count * 10)
                }
                progressLabel.html(count);
            }, 1000);

            let dataPath = inputEles.eq(FILE_PATH_INPUT_INDEX).find('input').val();

            let para = {
                'dataPath': dataPath
            }

            myVsearch.dataConfig = para;

            utilObj.requestData('/config', para, d=>{

                clearInterval(progressShow);

                if (!d) {
                    progressBar.addClass('error');
                    progressLabel.html('Error')
                } else {
                    myTimeline.processData(d);
                    progressBar.progress('complete')
                    progressLabel.html('Complete')

                    setTimeout(a=>{
                        sidebarPane.showSidebar()
                    }, 600)
                }
            })
        })
    }
}

var graphBuilder = {
    infoEle: $('#graphinfo'),
    seg: $('#graphSeg'),
    init: function() {
        let boardEle = $('#graphBoard');
        let width = boardEle.width();
        let height = boardEle.height();

        this.selector = new selector('#selectBoard', width, height)

        this.selector.init()
        this.selector.callback = function(d) {
            let res = graphBuilder.graphModel.testSelect(d);
            let queryTemp = '';
            let maxVal = 1000;
            let k = 0;
            for (let oneNode of res.innerNodes) {
                queryTemp += '<div class="item"><img class="ui avator image" src="/bounding_box_test/'
                queryTemp += oneNode.imageID + '"><div class="content">'
                queryTemp += oneNode.imageID.split('_')[1] + '</div></div>'
                k += 1;
                if (k > maxVal) {
                    break
                }
            }
            let jele = $(queryTemp)
            jele.css('margin_left', '1em')
            simSegment.board.html(jele)
        }

        this.graphModel = new GraphModel(width, height);
        this.graphModel.init(boardEle[0]);
        $('#showGraph').on('click', d=>{
            graphBuilder.seg.addClass('loading')
            graphBuilder.showGraph();
        })
    },
    updateGraphInfo(info) {
        graphBuilder.infoEle.html(info)
    },
    showGraph: function() {
        $.ajax({
            url: 'graph',
            type: 'POST',
            data: JSON.stringify({
                            'val': simSegment.rangeVal,
                            'layout': graphSidebar.layout,
                            'cd': graphSidebar.cameraDict,
                            'vd': graphSidebar.videoDict
                        }), 
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: data=>{
                let temp = 'Nodes ' + data['nodes'].length + ' Links ' + data['links'].length
                graphBuilder.updateGraphInfo(temp)
                this.graphModel.showGraph(data);
                graphBuilder.seg.removeClass('loading')          
            }
        })
    }
}

var imageQuery = {
	imageBoard: $('#imageRendering'),
	relatedQueryBoard: $('#queryRendering'),
	galleryBoard: $('#galleryRendering'),
    lastClicked: '',
	addGalleryBoard: function(gallery) {
		let res = '';
		let galleryDict = {}
        let dateDict = {}
		for (let item in gallery) {
			let nameList = item.split('/');
			let nlSize = nameList.length;

            let personInfo = nameList[nlSize-1].split('_');
			let cameraID = personInfo[1].substring(0, 2)

            let date = parseInt(personInfo[2]/25);

            if (timeFeature.testTime(date)) {
                continue
            }

            dateDict[date] = 20

			if (galleryDict[cameraID]) {
				galleryDict[cameraID].push(item)
			} else {
				galleryDict[cameraID] = [item];
			}
		}

        timeFeature.timeline.showHoverLine(dateDict)

		for (let cameraID in galleryDict) {
            res += '<div class="ui segment">';
            res += cameraID + '<div class="ui mini images">';
            for (let image of galleryDict[cameraID]) {
            	res+= '<img class="ui image queryImage" src="' + image + '">'
            }
			res += '</div></div>'
        }
        let jele = $(res);
        jele.find('img').on('click', d=>{
            let fileName = d.target.src;
            let imageName = '/' + fileName.replace(d.target.baseURI, '')
            simSegment.searchSimImages('gallery', gallery[imageName])
        })
		imageQuery.galleryBoard.html(jele);
	},
	createQueryBoard: function() {
        this.clearSearch();
        $.ajax({
            url: 'query',
            type: 'POST',
            data: '{"type": "all"}', 
            contentType: "application/json; charset=utf-8",
            dataType:"json",
            success: data=>{
                let temp = ''
                for (let oneImage in data) {
                    let imgList = oneImage.split('_');
                    let t = imgList[2]/25;
                    if (timeFeature.testTime(t)) {
                        continue
                    }
                    temp += '<img class="ui bordered image queryImage" src="' + oneImage + '">'
                }
                let jTemp = $(temp)
                jTemp.on('click', d=>{
                    let imageName = d.target.src.split('/')
                    imageName = imageName[imageName.length-1]
                    let personID = imageName.split('_')[0];
                    imageQuery.lastClicked = personID
                    imageQuery.getQueryImages(personID)
                    
                    let fileName = d.target.src;
                    fileName = '/' + fileName.replace(d.target.baseURI, '')

                    simSegment.searchSimImages('query', data[fileName])
                })
                
                imageQuery.imageBoard.html(jTemp);
            }
        })
    },
    clearSearch: function() {
        imageQuery.lastClicked = '';
        imageQuery.relatedQueryBoard.html('');
        imageQuery.galleryBoard.html('');
    },
	getQueryImages: function(ck) {
        let clicked = ck || this.lastClicked;
        if (clicked == '') return
        $.ajax({
            url: 'query',
            type: 'POST',
            data: JSON.stringify({
                            type: 'person', 
                            data: clicked
                        }), 
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: fdata=>{
                let queryTemp = '';
                for (let item in fdata.query) {
                    let imgList = item.split('_');
                    let t = imgList[2]/25;
                    if (timeFeature.testTime(t)) {
                        continue
                    }
                    queryTemp += '<img class="ui bordered image queryImage" src="' + item + '">'
                }
                let jele = $(queryTemp)
                jele.on('click', d=>{
                    let fileName = d.target.src;
                    let imageName = '/' + fileName.replace(d.target.baseURI, '')
                    simSegment.searchSimImages('query', fdata.query[imageName])
                })
                imageQuery.relatedQueryBoard.html(jele);
                imageQuery.addGalleryBoard(fdata.gallery);
            }
        })
	}
}

var graphSidebar = {
    'layout': 'FM^3 (OGDF)',
    cameraDict: {},
    videoDict: {},
    isSelect: false,
    init: function() {
        $('#sidebarToggle').on('click', d=>{
            $('#graphSidebar')
                .sidebar({
                context: $('#graphSeg')
              }).sidebar('setting', 'transition', 'overlay').sidebar('toggle')
        })
        $('#graphLayout').dropdown({
            'onChange': function(value, text) {
                graphSidebar.layout = text;
            }
        })
        $('.cameracheckbox').checkbox({
            onChange: function() {
                let val = this.value;
                if (graphSidebar.cameraDict[val] == undefined) {
                    graphSidebar.cameraDict[val] = 0
                } else {
                    delete graphSidebar.cameraDict[val]
                }
            }
        })
        $('.videocheckbox').checkbox({
            onChange: function() {
                let val = this.value;
                if (graphSidebar.videoDict[val] == undefined) {
                    graphSidebar.videoDict[val] = 0
                } else {
                    delete graphSidebar.videoDict[val]
                }
            }
        })
        $('#selector').on('click', function() {
            if (graphSidebar.isSelect) {
                $(this).removeClass('active')
                $('#selectBoard').css('display', 'none')
                graphSidebar.isSelect = false;  
            } else {
                $(this).addClass('active')
                $('#selectBoard').css('display', 'block')
                graphSidebar.isSelect = true;
            }
        });
    }
}

var simSegment = {
    rangeEle : $('#rgbar'),
    rangeLabelEle : $('#rglabel'),
    board: $('#distboard'),
    lastClickedImg: -1,
    lastQuery: '',
    rangeVal: 0.15,
    init : function() {
        this.rangeEle.on('input', d=>{
            let temp = +simSegment.rangeEle.val() / 100;
            simSegment.rangeLabelEle.html('< ' + temp)
        });
        this.rangeEle.on('change', d=>{
            let temp = +simSegment.rangeEle.val();
            simSegment.rangeVal = temp/100;
            if (this.lastClickedImg != -1) {
                this.searchSimImages(this.lastQuery, this.lastClickedImg)
            }
            graphBuilder.seg.addClass('loading')
            graphBuilder.showGraph();
        })
    },
    searchSimImages: function(type, imageName) {
        this.lastQuery = type;
        this.lastClickedImg = imageName;
        $.ajax({
            url: 'simval',
            type: 'POST',
            data: JSON.stringify({
                            data: imageName,
                            val: simSegment.rangeVal,
                            type: type
                        }), 
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: data=>{
                let queryTemp = ''
                data.sort(function(a, b) {
                    return a.val - b.val
                })

                for (let one of data) {
                    console.log(one)
                    if (one.verify) {
                        queryTemp += '<div class="rightImage item"><img class="ui avator image" src="'
                    } else {
                        queryTemp += '<div class="wrongImage item"><img class="ui avator image" src="'
                    }
                    queryTemp += one.title + '"><div class="content"><div class="header">'
                    queryTemp += one.val.toFixed(6)
                    queryTemp += '</div>' + one.title.split('/')[2].split('_')[1] + '</div></div>'
                }
                let jele = $(queryTemp)
                jele.css('margin_left', '1em')
                simSegment.board.html(jele)
            }
        })
    },
}



