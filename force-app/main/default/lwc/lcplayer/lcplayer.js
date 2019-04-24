/**
 * Created by lievenj on 2/28/2019.
 */

import { LightningElement,api } from 'lwc';

export default class Lcplayer extends LightningElement {
    @api
    user

    get userAvailable(){
        return this.user.Player_Status__c == 'Available';
    }

    get classList(){
        var classList = 'slds-media slds-media--center'
        if(this.userAvailable)
            classList += ' status-available';
        return classList;
    }

    challengeUser(){
        var evt = new CustomEvent("playerchallenge",{
            detail: this.user
        });
        this.dispatchEvent(evt);
    }
}