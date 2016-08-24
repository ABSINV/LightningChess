({
	assignClasses: function (cmp) {
		var location_container = cmp.find('location_container').getElement();

		var isSelected = cmp.get('v.isSelected');
		if(isSelected)
		{
			$A.util.addClass(location_container,'selected');
		}
		else
		{
			$A.util.removeClass(location_container,'selected');
		}

	},

	notifyAsSelected : function(cmp)
	{
		if(!$A.util.isEmpty('v.piece'))
		{
			var location = cmp.get('v.location');
	        var e = cmp.getEvent('select');
	        e.setParams({'location':location});
	        e.fire();
		}
		 
	},

	notifyAsTarget : function(cmp)
	{
		var location = cmp.get('v.location');
	    var e = cmp.getEvent('target');
	    e.setParams({'location':location});
	    e.fire();
	}
})