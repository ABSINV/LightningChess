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

	}
})