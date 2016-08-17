public with sharing class StreamingAPIController {
	
	@AuraEnabled
    public static Object getSession(){
        return UserInfo.getSessionId();
    }    
}