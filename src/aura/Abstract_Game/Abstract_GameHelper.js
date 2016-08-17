({
	/**
        This method will define if it's my turn to play or not.
    */
    setMyMove : function(cmp)
    {
        var board = cmp.get('v.activeGame');
        var user = cmp.get('v.currentUser');
        cmp.set('v.myMove',board.Current_Player__c == this.getPlayerColor(user,board));
    },

    /**
        This method sets the player and opponent values of the component. They are purely for displaying purposes.
    */
    setPlayers : function(cmp)
    {
        var game = cmp.get('v.activeGame');
        var currentUser = cmp.get('v.currentUser');
        var playercolor = this.getPlayerColor(currentUser,game);
        if(playercolor == 'White')
        {
            cmp.set('v.opponent',game.Black_Name__c);
            cmp.set('v.player',game.White_Name__c);
        }
        else
        {
            cmp.set('v.player',game.Black_Name__c);
            cmp.set('v.opponent',game.White_Name__c);
        }
    },
})