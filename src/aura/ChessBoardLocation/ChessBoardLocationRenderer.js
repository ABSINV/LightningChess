({
	afterRender : function(cmp,helper)
	{
		this.superAfterRender();
		helper.assignClasses(cmp);
	},

	rerender : function(cmp,helper)
	{
		this.superRerender();
		helper.assignClasses(cmp);
	}
})