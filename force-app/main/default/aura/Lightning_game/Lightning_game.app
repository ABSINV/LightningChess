<aura:application controller='ChessGameController' implements="force:appHostable">
    <ltng:require styles="/resource/SLDS23/assets/styles/salesforce-lightning-design-system.css" />
    <aura:handler name="init" value="{!this}" action="{!c.doInit}" />
    <aura:attribute name="currentUser" type="String"></aura:attribute>
    <aura:dependency resource="c:Chessboard" />
    <aura:dependency resource="c:PlayerList" />
    
    <div class="chessbackground">
        <div class='slds' style="max-width:1250px;margin:0 auto; padding-top: 25px; padding-bottom:25px;">
            <c:GeneralGameComponent />

      	</div>
      
    </div>
</aura:application>