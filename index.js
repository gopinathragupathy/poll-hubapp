//Polls api for mongo using node and express

var express=require('express');
var bodyParser= require('body-parser');
var _ = require('lodash');
var async = require('async');
var credentials = require('./credentials/credentials.js');
var db = require('./models/db');
var Poll=require("./models/Poll");
var PollVote=require("./models/PollVote");
var app=express();
var endPointPath="/polls/v1/";
var responseData;

//to run in production: export NODE_ENV=production
//to run  in dev: export NODE_ENV=production 
//then: node poll


app.get('/', function(req, res){
    res.send('<br>Gopi rules this now!. <br/>This is the Dig Poll API<br/>1. /polls/v1/getpollresults/+pollId will return all quuestions in a poll<br/>2. /polls/v1/createpoll/+pollId will create a poll. requires this payload in JSON<br/>{"secret":"secret"}<br/>3. /polls/v1/updatepollvote/+pollId will create a poll. requires this payload in JSON:<br/>{"secret":"secret", "questionId":"questionid", "choiceId:choiceid", "votecount":votecount}<br/>4.          /polls/v1/updatepoll/+pollId updatepoll (update multiple questions with choices and count to add). <br> Payload {"secret":"secret", questions:[{"questionId", [choices{"choiceId":"choiceid", "count":updatecount}]}    ');
});

app.use(bodyParser.json());


app.get(endPointPath+'getpolls/:locale', function(req, res) {
    var queryCond = {};
    queryCond["Campaigns.Locale"] = req.params.locale;
    if (req.query.BrandId || req.query.CampaignId ) {
      if(req.query.BrandId)
        queryCond["Campaigns.BrandID"] = req.query.BrandId;
      if(req.query.CampaignId)
        queryCond["Campaigns.CampaignID"] = req.query.CampaignId;
      query = Poll.find(queryCond);
    }
    else {
      var err={"RequestError":"Must provide either a BrandId or CampaignId"};
      responseData=(err);
      res.json(responseData);
      return;
    }
    query.exec(function (err, campaigns) {
        if (err) {
            responseData=err;
            res.json(responseData);
        }else{
            var pollList = [];
            campaigns.forEach(function(campaign) {
              delete campaign.__v;
              delete campaign["__v"];
              delete campaign._id;
              campaign.Campaigns[0].Polls.forEach(function(currentPoll) {
                   currentPoll.Questions = [];
                   delete currentPoll.Questions;
              });
            });
            responseData=campaigns;
            res.json(responseData); 
        }
    });
});
app.get(endPointPath+'getpolldetails/:pollId', function(req, res) {
    var id=req.params.pollId;
    var pollId=id;
    var query = Poll.findOne({ 'Campaigns.Polls.PollID': pollId });
        query.exec(function (err, poll) {
            if (err) {
                responseData=err;
                res.json(responseData);
            }else{
                responseData=poll;
                res.json(responseData); 
            }
        })
});

app.post(endPointPath+'updatepollvote', function(req, res) {
   //updates a single question choice    
   //get post body so mulitple updates can be made. 
   console.log("req.body", req.body);
   var bodyData=req.body;
   var secret, votes;
   secret=bodyData.secret;
   votes=bodyData.Votes;
   var responseData=[];
    //first validate paramters, if not correct, respond with error
   if (!secret || !votes) {
      var err={"update":false, "RequestError":"Must provide Secret value, Vote List"};
      responseData=err;
      res.json(responseData);
   }else{
      var voteList = [];
      votes.forEach(function(vote) {
        voteList.push(function(callback) {
          var newvote = new PollVote();
          newvote.CampaignID = vote.CampaignID;
          newvote.PollID = vote.PollID;
          newvote.PQID = vote.PQID;
          newvote.ChoiceID = vote.ChoiceID;
          newvote.Count = vote.Count;
          newvote.save( function( err, savedVote ){
            console.log('inside save');
            if(!err){

              responseData.push({"created":true});
              callback(null, vote);
            }else{
              err.created=false;
              responseData.push(err);
              callback(null, vote);
            }
          });
        });
      });

      async.parallel(voteList, function(err, result) {
        /* this code will run after all calls finished the job or
           when any of the calls passes an error */
        if (err) {
          console.log('final Error---' + err);
          res.json(err);
          return;
        }

        console.log('final---' + responseData);
        res.json(responseData);
      });
    }    
});

app.post(endPointPath+'createpoll/:id', function(req, res) {
   
   var campaignId=req.params.id
   var bodyData=req.body;
   var responseData=[];
   //first validate paramters, if not correct, respond with error
   if (!campaignId) {
      var err={"created":false, "RequestError":"Must provide both a Campaign Id"};
      responseData=(err);
      res.json(responseData);
   }else if (campaignId != bodyData.Campaigns[0].CampaignID) {
    console.log(bodyData.Campaigns[0]);
      var err={"created":false, "RequestError":"Campaign Id not match with the poll data"};
      responseData=(err);
      res.json(responseData);
   }else {
     //parameters are not null, try to insert. Error if already exists. Return created:true is created
     console.log("campaignId", campaignId);
     var query = Poll.findOne({ 'Campaigns.CampaignID': campaignId });
     var newCampaign = new Poll();
     //newCampaign.Campaigns;
     var campaign = bodyData.Campaigns[0];
     query.exec(function (err, existingCampaign) {
        console.log("inside query");
        if(existingCampaign) {
          console.log("inside exisiting");
           console.log("newCampaign.Campaigns");
          newCampaign = existingCampaign;
          campaign.Polls.forEach(function(currentPoll) {
            console.log("first chk--" + currentPoll.PollID);
            var existingPoll = _.find(newCampaign.Campaigns[0].Polls, {PollID: currentPoll.PollID});
            if(existingPoll) {
              newCampaign.Campaigns[0].Polls.splice(newCampaign.Campaigns[0].Polls.indexOf(existingPoll),1);
            } 
            newCampaign.Campaigns[0].Polls.push(currentPoll);
            
          });
        }
        else {
          newCampaign.Campaigns.push(campaign);
        }
        newCampaign.save( function( err, savedCampaign ){
          console.log('inside save');
          if(!err){

            responseData.push({"created":true});
            res.json(responseData);
          }else{
            err.created=false;
            responseData.push(err);
            res.json(responseData);
          }
        });
      });
      
    }
});


app.listen(process.env.PORT || 3000);