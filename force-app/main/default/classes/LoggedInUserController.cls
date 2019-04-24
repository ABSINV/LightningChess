/*
* Class that controls the list of logged in users
* */
public without sharing class LoggedInUserController {

	@AuraEnabled
	public static Object initialize()
	{
		LoggedInPlayer__c lu;
		try {
			lu =  [select id, Name, Player_Status__c, User__c, Player_Name__c from LoggedInPlayer__c where User__c = :UserInfo.getUserId()];
			lu.Status__c = 'Available';
			lu.Last_Seen__c = Datetime.now();
			update lu;
		} catch(Exception e) { 
			lu = new LoggedInPlayer__c();
			lu.User__c = UserInfo.getUserId();
			lu.Name = UserInfo.getName();
			lu.Status__c = 'Available';
			insert lu;
		} 
		return getActivePlayers();
	}

	@AuraEnabled
	public static void closeSession()
	{
		List<LoggedInPlayer__c> playerList = [select id, Name, Player_Status__c, User__c, Player_Name__c from LoggedInPlayer__c where User__c = :UserInfo.getUserId()];
		delete playerList;
	}
	@AuraEnabled
	public static Object keepSessionAlive()
	{
		LoggedInPlayer__c lu =  [select id, Name, Player_Status__c, User__c, Player_Name__c from LoggedInPlayer__c where User__c = :UserInfo.getUserId()];
		lu.Last_Seen__c = Datetime.now();
		update lu;
		return getActivePlayers();
	}

	private static List<LoggedInPlayer__c> getActivePlayers()
	{
		Datetime n = Datetime.now();
		//n = n.addMinutes(-5);
		n = n.addSeconds(-10);

		System.debug(n);
		return [select id, Name, Player_Status__c, User__c, Player_Name__c from LoggedInPlayer__c where User__c != :UserInfo.getUserId()];
	}

	@AuraEnabled
	public static void challengePlayer(String userId)
	{
		System.debug(userId);
		//TODO Clean this query to one
		LoggedInPlayer__c l = [select id, Player_Status__c from LoggedInPlayer__c where User__c = :userId];
		LoggedInPlayer__c me = [select id, Player_Status__c from LoggedInPlayer__c where User__c = :UserInfo.getUserId()];
		List<Player_Challenge__c> c = [select id,Challenged_User__c,CreatedById from Player_Challenge__c where  (Challenged_User__c = :userId and CreatedById = :UserInfo.getUserId())];
		delete c;
		if(l.Player_Status__c == 'Available' && me.Player_Status__c == 'Available')
		{
			Player_Challenge__c challenge = new Player_Challenge__c();
			challenge.Challenged_User__c = userId;
			challenge.Game_Type__c = 'Chess';
			insert challenge;
		}
	}

	@AuraEnabled
	public static Map<String,Object> handePlayerChallenge(Boolean status,Id challengeId)
	{
		Map<String,Object> returnMap = new Map<String,Object>();
		Boolean succes = true;
		String message = '';
		Player_Challenge__c c = [select id,Challenged_User__c,CreatedById from Player_Challenge__c where id = :challengeId];
		if(status)
		{
			List<LoggedInPlayer__c> players = [select id,Player_Status__c from LoggedInPlayer__c where User__c = :c.Challenged_User__c or User__c = :c.CreatedById];

			for(LoggedInPlayer__c p : players)
			{
				if(p.Player_Status__c != 'Available')
				{
				 	succes = false;
				 	message = 'Challenge is no longer valid';
				}

				p.Status__c = 'In game';
				p.Challenged_By__c = null;
			}

			if(succes)
			{
				update players;
				//Create a new chessboard
				ChessGameController.createNewChessGame(c.Challenged_User__c, c.CreatedById);
			}
		}
		delete c;
		returnMap.put('succes',succes);
		returnMap.put('message',message);
		return returnMap;
	}

	public static void setPlayersActive(List<Id> userIds)
	{
		List<LoggedInPlayer__c> players = [select id from LoggedInPlayer__c where User__c in :userIds];
		for(LoggedInPlayer__c p : players)
		{
			p.Status__c = 'Available';
		}

		update players;
	}
}