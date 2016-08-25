<?xml version="1.0" encoding="UTF-8"?>
<Workflow xmlns="http://soap.sforce.com/2006/04/metadata">
    <fieldUpdates>
        <fullName>Change_player</fullName>
        <field>Current_Player__c</field>
        <name>Change player</name>
        <notifyAssignee>false</notifyAssignee>
        <operation>NextValue</operation>
        <protected>false</protected>
        <targetObject>ChessBoard__c</targetObject>
    </fieldUpdates>
    <fieldUpdates>
        <fullName>Set_en_passant_turn</fullName>
        <field>En_Passant_Turn__c</field>
        <formula>ChessBoard__r.Current_Turn__c + 1</formula>
        <name>Set en passant turn</name>
        <notifyAssignee>false</notifyAssignee>
        <operation>Formula</operation>
        <protected>false</protected>
        <targetObject>ChessPiece__c</targetObject>
    </fieldUpdates>
    <rules>
        <fullName>Change player</fullName>
        <actions>
            <name>Change_player</name>
            <type>FieldUpdate</type>
        </actions>
        <active>false</active>
        <formula>true</formula>
        <triggerType>onCreateOnly</triggerType>
    </rules>
    <rules>
        <fullName>Update chesspiece en passant</fullName>
        <actions>
            <name>Set_en_passant_turn</name>
            <type>FieldUpdate</type>
        </actions>
        <active>true</active>
        <formula>!ChessPiece__r.Has_moved__c &amp;&amp; ( ABS(X_Origin__c -  X_Destination__c) == 2) &amp;&amp;  text(ChessPiece__r.Type__c) == &apos;Pawn&apos;</formula>
        <triggerType>onCreateOnly</triggerType>
    </rules>
</Workflow>
