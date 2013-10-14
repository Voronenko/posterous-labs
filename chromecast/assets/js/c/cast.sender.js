define(["knockout-2.3.0","jquery"], function(ko,$) {

  var CastAPIReady = new $.Deferred();
  var castApi;
  var castAPIConsumer;
  var appsList=null;

  var defaultCastAPIConsumer = {
      applicationID:'',
      setReceivers: function(){},
      getCastingDevice: function(){}
  };



if (window.cast && window.cast.isAvailable) {
    CastAPIReady.resolve();
} else {
  window.addEventListener("message", function(event) {
    if (event.source == window && event.data && event.data.source == "CastApi" && event.data.event == "Hello"){
        CastAPIReady.resolve(event);
    }
  });
};

function initializeCastApiinitializeCastApi(consumer) {
  castApi = new cast.Api();
  castAPIConsumer = $.extend( defaultCastAPIConsumer, consumer );
  castApi.addReceiverListener(consumer.applicationID, onReceiverList);
};

function onReceiverList(list) {
    castAPIConsumer.setReceivers(list);
}


function getWhiteListedApps(){
    var result = new $.Deferred();
    debugger;
    if (appsList != null) {
        result.resolve(appsList);
        return result;
    }
    $.getJSON("http://query.yahooapis.com/v1/public/yql?"+
        "q=select+*+from+html+where+url%3D%22https%3A%2F%2Fclients3.google.com%2Fcast%2Fchromecast%2Fdevice%2Fconfig%22"+
        "&format=json'&callback=?",
        // this function gets the data from the successful
        // JSON-P call
        function(data){
            // if there is data, filter it and render it out
            if(data.results[0]){
                var parsed = data.results[0].replace('<body>', '');
                var parsed = parsed.replace('</body>', '');
                var parsed = parsed.replace('<p>', '');
                var parsed = parsed.replace('</p>', '');
                var parsed = parsed.replace(")]}'", '');
                var obj = JSON.parse(parsed);
                appsList = obj.applications;
                result.resolve(appsList);

            } else {
             console.log('failed to parse list of whitelisted apps.');
             result.reject('failed to parse list of whitelisted apps.');
            }
       });
      return result;
}


/* ------------------------------- */
function castMedia(mediaurl) {

          var result = new $.Deferred();
          var currentReceiver = castAPIConsumer.getCastingDevice();
          var launchRequest = new cast.LaunchRequest(castAPIConsumer.applicationID, currentReceiver);
          launchRequest.parameters = '';

          var loadRequest = new cast.MediaLoadRequest(mediaurl);
          loadRequest.autoplay = true;

          castApi.launch(launchRequest, function(status) {
            if (status.status == 'running') {
              castApi.loadMedia(status.activityId,
                                      loadRequest,
                                      result.resolve);
            } else {
                result.reject(status);
            }
          });

         return result;

        }



        return {
            ready: function(callback){CastAPIReady.done(callback)},
            init: initializeCastApiinitializeCastApi,
            play:castMedia,
            getWhiteListedApps:getWhiteListedApps
        }
    }
);
