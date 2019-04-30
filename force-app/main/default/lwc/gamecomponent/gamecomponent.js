/**
 * Created by lievenj on 2/26/2019.
 */

import { LightningElement,track,wire } from 'lwc';
import Id from '@salesforce/user/Id';
import { registerListener } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';


export default class gamecomponent extends LightningElement {

    userId = Id;
    @track activeGame;
    @wire(CurrentPageReference)
    pageRef;
    @track challengeCount = 0;

    connectedCallback(){
        //Register callback for any streaming event that is received.
        registerListener('StreamingEvent',this.handleStreamingEvent,this);
    }

    renderedCallback(){
        let challengeTab = this.template.querySelector("[data-tab='challenges']");
        challengeTab.loadContent();
    }

    handleChallengeCountChange(event)
    {
        this.challengeCount = event.detail;
    }

    get challengeLabel(){
        let label = 'Challenges';
        if(this.challengeCount > 0)
        {
            label += ' (' + `${this.challengeCount}` + ')';
        }

        return label;
    }

    handleStreamingEvent(data){
        if(data.eventType !== 'NewChessBoard')
            return;

        this.activeGame = data.sObject;
    }

    handleGameChange(event)
    {
        this.activeGame = event.detail;
    }
}