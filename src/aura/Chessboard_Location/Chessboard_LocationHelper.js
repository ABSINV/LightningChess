({
	/*
		Assigns the correct classes to the containers
	*/
	assignClasses: function (cmp) {
		var location_container = cmp.find('location_container').getElement();

		//Add or remove selected class
		var isSelected = cmp.get('v.isMarked');
		if(isSelected)
			$A.util.addClass(location_container,'selected');
		else
			$A.util.removeClass(location_container,'selected');

		//Add or remove selected class
		var isTarget = cmp.get('v.isTarget');
		if(isTarget)
			$A.util.addClass(location_container,'targeted');
		else
			$A.util.removeClass(location_container,'targeted');

		//Set location background color
		var location = cmp.get('v.location');
		var color;
		if(((location.x + location.y) % 2) == 0)
			color = 'white';
		else
			color = 'black';

		$A.util.addClass(location_container,color);
	},

	/*
		Fires a selection event
	*/
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

	/*
		Fires a target event.
	*/
	notifyAsTarget : function(cmp)
	{
		var location = cmp.get('v.location');
	    var e = cmp.getEvent('target');
	    e.setParams({'location':location});
	    e.fire();
	},

})