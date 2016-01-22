"use strict";

var Botkit = require('botkit')
var strava = require('strava-v3')

// Expect a SLACK_TOKEN environment variable
var slackToken = process.env.SLACK_TOKEN
if (!slackToken) {
  console.error('SLACK_TOKEN is required!')
  process.exit(1)
}

var clubId = process.env.CLUB_ID
if (!clubId) {
  clubId = 114729
  console.error('CLUB_ID is required!')
  //process.exit(1)
}

var controller = Botkit.slackbot()
var bot = controller.spawn({
  token: slackToken
})

bot.startRTM(function (err, bot, payload) {
  if (err) {
    throw new Error('Could not connect to Slack')
  }
})

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

var motivations = [
  'Train insane or remain the same.',
  'You look like a can of biscuits that’s just popped open.',
  'Your tears are like jet fuel to me.',
  'Gat yer arse on that tarmac ya Big Mac eating duffelbagers.',
  'All I do is eat gunpowder and run. What about you?',
  'Go away, you smell like failure and corn chips.',
  'There will be no crying or whining for any reason or a reason will be issued to you.',
]

controller.hears('strava stats', ['direct_message','direct_mention'], function (bot, evt) {
  strava.clubs.listMembers({id:clubId},function(err, members) {
    strava.clubs.listActivities({id:clubId},function(err, activities) {
      let shamingList = []
      members.forEach(function(member) {
        let memberHasActivity = false
        activities.forEach(function(activity) {
          if (member.id === activity.athlete.id) {
            memberHasActivity = true
          }
        });

        if (!memberHasActivity) {
          shamingList.push(member)
          console.log(member.firstname + " does not have activities")
        }
      });

      let lazyStr = ""
      shamingList.forEach(function(shamee, index) {
        let comma = (index !== shamingList.length) ? ", " : ""
        lazyStr += shamee.firstname + " " + shamee.lastname + comma
      });

      lazyStr += motivations[Math.floor(Math.random()*(motivations.length+1))]
      bot.reply(message, lazyStr)
    });
  });
})

controller.hears(['strava help', 'help', 'strava'], ['direct_message', 'direct_mention'], function (bot, message) {
  var help = 'I will respond to the following messages: \n' +
      '`strava stats` for a simple message.\n' +
      '`bot help` to see this again.'
  bot.reply(message, help)
})
