//schema
var mongoose = require('mongoose');
var pollSchema = mongoose.Schema({
    Campaigns: [{
        CampaignID: {type:String},
        Locale: String,
        BrandID: String,
        Description: String,
        TimeStamp: String,
        Polls: [{
            PollID: {type:String},
            Description: String,
            BrandID: String,
            StartDate: String,
            EndDate: String,
            AccessControl: String,
            IsLocked: Boolean,
            AlwaysShowResult: Boolean,
            ShowVoteCount: Boolean,
            ChangeVote: Boolean,
            AllowMultipleChoices: Boolean,
            LimitVote: Number,
            Questions: [{
                PQID:String, 
                Question: String,
                Answers:[{
                    ChoiceID:String,
                    ChoiceText: String,
                    ChoiceMedia: String,
                    Caption: String,
                    ChoiceType: String,
                    Count:Number
                }]
            }]
        }]
    }],
    createdOn: { type: Date, default: Date.now },
    modifiedOn: Date
},
{
    collection: 'polldata'                                                      
});

//model
var Poll=mongoose.model( 'Poll', pollSchema, 'polldata' );
module.exports = Poll;
