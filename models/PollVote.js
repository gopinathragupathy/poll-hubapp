//schema
var mongoose = require('mongoose');
var pollVoteSchema = mongoose.Schema({
    CampaignID: String,
    PollID: String,
    PQID: String, 
    ChoiceID: String,
    Count: Number,
    createdOn: { type: Date, default: Date.now }  
},
{
    collection: 'pollvote'                                                      
});
//model
var PollVote=mongoose.model( 'PollVote', pollVoteSchema, 'pollvote' );
module.exports = PollVote;