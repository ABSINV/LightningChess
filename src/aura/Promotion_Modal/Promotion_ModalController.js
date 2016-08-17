({
	handlePromotion : function(cmp, event, helper) {
    	cmp.set('v.payload',event.getParam('payload'));
		cmp.set('v.overlayActive',true);
		cmp.set('v.color',event.getParam('color'));
	},

	closeEscModal : function(cmp,event,helper)
    {
    	if(event.keyCode == 27)
    		helper.closeModal(cmp);
    },

    closeModal : function(cmp,event,helper)
    {
    	helper.closeModal(cmp);
    },

    selectPromotion : function(cmp,event,helper)
    {
    	
    	var dataset = event.currentTarget.dataset;
    	var event =  $A.get('e.c:Promotion_Complete');

    	var params = {
    		'type': dataset.type,
    		'payload': cmp.get('v.payload')
    	}

    	event.setParams(params);
    	event.fire();

    	helper.closeModal(cmp);
    }

})