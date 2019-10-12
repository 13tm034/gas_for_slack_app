function BotInterface(){
  function doPost(e){
    var response = { text:'test'};
    return   return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  }

}
