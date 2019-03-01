/**
 * Created by lievenj on 2/26/2019.
 */

import { LightningElement,track } from 'lwc';
import Id from '@salesforce/user/Id';

export default class gamecomponent extends LightningElement {

    userId = Id;
    @track challengeCount = 0;

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
}