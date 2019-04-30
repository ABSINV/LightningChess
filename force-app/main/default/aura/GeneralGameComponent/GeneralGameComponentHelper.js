({
	toggleTabs : function(cmp,currentTab,previousTab) {
		this.toggleTab(currentTab,cmp);
		if(!$A.util.isEmpty(previousTab))
		{
			this.toggleTab(previousTab,cmp);
		}			
	},

	toggleTab : function(tab,cmp)
	{
		var tabId = this.getTabAuraId(tab,cmp);
		var t = cmp.find(tabId);
		$A.util.toggleClass(t,'slds-hide');
		$A.util.toggleClass(t,'slds-show');

	},

	getTabAuraId: function(tab,cmp)
	{
		var globalId = cmp.getGlobalId();
		switch(tab)
		{
			case 'challenges' :
				return 'challenge-tab';

			case 'users':
				return 'user-tab';
		}
	},

	createGame: function(gameComponent,cmp,event)
	{
		if(gameComponent)
		{
			var params = {
				"currentUser": cmp.get('v.currentUser'), 
				"activeGame": event.getParam('sObject'),
				"aura:id": "active_game_cmp"
			}

			var callback = function(newCmp){
				if (cmp.isValid()) {
					var body = cmp.find('game_location');
					body.set("v.body",newCmp);
				}
			}

			$A.createComponent(gameComponent,params,callback);

		}
	}
})