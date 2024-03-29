// hogehogehogehogehogehogehogehogehogehoge

function cleanChannels() 
{
  var sheet = SpreadsheetApp.openById("1kp23Zr2Aq4hZC-mxx4rYMvOVafPoi2JETV9Ub_u1ujo");
  var values = sheet.getDataRange().getValues();

  var channelNames = [];
  for (var i = 1; i < values.length; ++i) {
    channelNames.push(values[i][0]);
  }

  var token = PropertiesService.getScriptProperties().getProperty('SLACK_API_TOKEN');
  var slackApp = SlackApp.create(token);

  for each(var channelName in channelNames) {
    cleanChannel(slackApp, channelName);
  }
}


function cleanChannel(slackApp, channelName)
{
  var channelId = getChannelId(slackApp, channelName);
  if (channelId.length == 0) {
    return;
  }

  var date = new Date();
  date.setMinutes(date.getMinutes() - 3); // 1週間前
  var timestamp = Math.round(date.getTime() / 1000) + '.000000';

  do {
    var optParams = {
      latest: timestamp,
      count: 1
    };
    var result = slackApp.channelsHistory(channelId, optParams);
    if (result.ok) {
      for each(var message in result.messages) {
        slackApp.chatDelete(channelId, message.ts);
      }
    }
  } while (result.ok && result.has_more)
}

function getChannelId(slackApp, channelName)
{
  var channelId = '';
  var result = slackApp.channelsList();
  if (result.ok) {
    for each(var channel in result.channels) {
      if (channel.name == channelName) {
        channelId = channel.id;
        break;
      }
    }
  }
  return channelId;
}