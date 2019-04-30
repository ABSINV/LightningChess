/**
 * Created by lievenj on 2/27/2019.
 */

import { LightningElement,track,api } from 'lwc';
import initialize from '@salesforce/apex/LoggedInUserController.initialize';
import keepSessionAlive from '@salesforce/apex/LoggedInUserController.keepSessionAlive';
import challenge from '@salesforce/apex/LoggedInUserController.challengePlayer';

export default class Lcplayerlist extends LightningElement {

    @track
    players

    @api
    currentUser

    connectedCallback(){
        initialize().then(result => {
            this.players = result;
            this.keepAlive();
        })
    }

    //Recursive method to keep the user session alive.
    keepAlive()
    {
        var wcp = this;
        window.setTimeout(
            //Use this to make sure the function is executed in the aura rendering cycle
            function() {
                keepSessionAlive().then(result => {
                    wcp.players = result;
                    wcp.keepAlive();
                });
            },
            10000
        );
    }

    challengePlayer(event)
    {
        alert('event received');
        debugger;
        challenge({userId : event.detail.User__c}).then(result => {
            alert('challenged');
        })
    }




}