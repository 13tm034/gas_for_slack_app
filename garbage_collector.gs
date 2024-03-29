var SLACK_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("TOKEN");
var postUrl =  PropertiesService.getScriptProperties().getProperty("URL");
var username = 'GarbageCollector';
var icon = ':garbage_collector:'; 


function channelNameToId(name) {
  var res = UrlFetchApp.fetch('https://slack.com/api/channels.list?token=' + SLACK_ACCESS_TOKEN);
  var channelsList=JSON.parse(res.getContentText());
  var foundChannelsId = '';
  var isFound = channelsList.channels.some(function(channels){
    if (channels.name.match(name)){
      foundChannelsId = channels.id;
      return true;
    } 
  });
  return foundChannelsId;
}

function elapsedDaysToUnixTime(days){  
  var date = new Date();
  var now = Math.floor(date.getTime()/ 1000); // unixtime[sec]
  //return now - 8.64e4 * days + '' // 8.64e4[sec] = 1[day] 文字列じゃないと動かないので型変換している
  return now - 8.64e4 * days + '' // 8.64e4[sec] = 1[day] 文字列じゃないと動かないので型変換している
}

function filesList(data){
  var params = {
    'token': SLACK_ACCESS_TOKEN,
    'channel': data.channel,
    'ts_to': data.ts_to,
    'count': data.count
  }
  var options = {
    'method': 'POST',
    'payload': params
  }
  var res = UrlFetchApp.fetch('https://slack.com/api/files.list',options);
  return JSON.parse(res.getContentText());
}


/* 指定チャンネル内・特定日数より以前のファイルを削除 */
function deleteOldFile(channelName) {
  const days = 0;  // 遡る日数(ユーザが指定)　<-
  
  var channelId = channelNameToId(channelName) || groupNameToId(channelName);
  if(!channelId){
    Logger.log('Not found "' + channelName + '". Skipping.');
    return -1; //見つからなければ終了
  }
  Logger.log('Found "' + channelName + '"(' + channelId + ')');
  var options = {
    channel: channelId,
    ts_to: elapsedDaysToUnixTime(days),
    count: 1000
  }

  filesList(options).files.forEach(function(val){
    data = filesDelete(val.id);
    if (data.error) Logger.log('  Failed to delete file ' + val.name + ' Error: ' + data.error);
    else Logger.log('  Deleted file "' + val.name + '"(' + val.id + ')');
  });
}

function filesDelete(id){
  var params = {
    token: SLACK_ACCESS_TOKEN,
    file: id
  }
  return execute('files.delete', params);
}


function execute(apiName, params){
  var options = {
    'method': 'POST',
    'payload': params
  }
  var res = UrlFetchApp.fetch('https://slack.com/api/' + apiName,options);
  return JSON.parse(res.getContentText());
}

function raise_alert() {
  var message = Logger.getLog()
  var jsonData =
  {
     "username" : username,
     "icon_emoji": icon,
     "text" : message
  };
  var payload = JSON.stringify(jsonData);

  var options =
  {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : payload
  };

  UrlFetchApp.fetch(postUrl, options);
}


/* 雑談チャンネル・グループの名称を検索して古いファイルを削除 */
function oldFileExecutioner(){
  const targetChannels = PropertiesService.getScriptProperties().getProperty("OLDFILE").split(",");    
  targetChannels.forEach(deleteOldFile);
  raise_alert();
}

