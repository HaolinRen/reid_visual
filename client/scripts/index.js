$(function() {

    sidebarPane.initial();
    imageQuery.createQueryBoard();
  	timeFeature.init();  
  	simSegment.init();
  	setTimeout(function(){
  		graphBuilder.init();
  	}, 2000)
  	graphSidebar.init()
});
