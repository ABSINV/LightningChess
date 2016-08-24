({
	doInit: function (cmp, event, helper) {
        var action = cmp.get('c.getUser');
        action.setCallback(this,function(response){
        	//TODO add status check
            cmp.set('v.currentUser',response.getReturnValue());
        });
        
        $A.enqueueAction(action);
	},

	selectTab: function(cmp,event,helper)
	{
		
		var target = event.currentTarget;
		var previousTab = cmp.get('v.currentTab');
		cmp.set('v.currentTab',target.dataset.name);
		helper.toggleTabs(cmp,previousTab,target.dataset.name);
		
	},

	handleStreamingEvent: function(cmp,event,helper)
	{
		switch(event.getParam('eventType')){
            case 'NewChessBoard':
                return helper.createGame("c:Chessboard",cmp,event);
        }
		
	}
})