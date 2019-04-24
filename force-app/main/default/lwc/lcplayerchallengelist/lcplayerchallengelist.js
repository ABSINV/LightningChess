/**
 * Created by lievenj on 2/28/2019.
 */

import { LightningElement,api,track,wire } from 'lwc';
import { registerListener } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import handePlayerChallenge from '@salesforce/apex/LoggedInUserController.handePlayerChallenge';


export default class Lcplayerchallengelist extends LightningElement {

    @api
    currentUser
    @track
    challenges
    @wire(CurrentPageReference)
    pageRef

    get hasChallenges(){
        return !(this.challenges === undefined || this.challenges == null || this.challenges.length === 0);
    }

    connectedCallback(){
        this.challenges = [];
        registerListener('StreamingEvent',this.handleStreamingEvent,this);
    }

    handleStreamingEvent(data){
        let obj = data.sObject;
        let e = data.event;
        if(data.eventType !== 'UserGameChallenge')
            return;

        if(e.type === 'created')
        {
            if(obj.Challenged_User__c === this.currentUser)
            {
                this.challenges.push(obj);
            }
            this.notifyChallengeCount();
        }
        else if (e.type === 'deleted')
        {
            for(let i = 0; i < this.challenges.length;i++)
            {
                if(this.challenges[i].Id === obj.Id)
                {
                    this.challenges.splice(i,1);
                    break;
                }
            }
            this.notifyChallengeCount();
        }
    }

    notifyChallengeCount(){
        this.dispatchEvent(new CustomEvent('challengecountchange',{detail: this.challenges.length}));
    }

    handleChallengeResponse(event){
        var challenge = event.detail.challenge;
        var status = event.detail.status;

        // eslint-disable-next-line no-unused-vars
        handePlayerChallenge({status:status,challengeId:challenge.Id}).then(result => {
            
        });


    }
}