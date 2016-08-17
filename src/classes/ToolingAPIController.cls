public with sharing class ToolingAPIController {

	@AuraEnabled
    public static Object testCall()
    {
        HttpRequest req = new HttpRequest();
        req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionID());
        req.setHeader('Content-Type', 'application/json');

        req.setEndpoint('https://chessgame-dev-ed.my.salesforce.com/services/data/v36.0/tooling/sobjects/');
        req.setMethod('GET');

        Http h = new Http();
        HttpResponse res = h.send(req);

        
        System.debug(res.getBody());
        return null;

    }

}