/**
 * Created by lievenj on 2/28/2019.
 */

import { LightningElement,api } from 'lwc';

export default class Lcplayerchallengeitem extends LightningElement {
    @api
    challenge

    acceptChallenge()
    {
        this.replyToChallenge(true);
    }

    rejectChallenge()
    {
        this.replyToChallenge(false);
    }

    replyToChallenge(status)
    {
        var evt = new CustomEvent('challengeresponse',{detail:{status:status,challenge:this.challenge}});
        this.dispatchEvent(evt);
    }

}