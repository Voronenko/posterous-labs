define(["knockout-2.3.0","jquery"], function(ko,$) {

  var CastAPIReady = new $.Deferred();
  var castApi;
  var castAPIConsumer;

  var defaultCastAPIConsumer = {
      applicationID:'',
      setReceivers: function(){}
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


        return {
            ready: function(callback){CastAPIReady.done(callback)},
            init: initializeCastApiinitializeCastApi
        }
    }
);