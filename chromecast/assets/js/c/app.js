define(["knockout-2.3.0","jquery"], function(ko,$) {

        var model;

        function SenderPageModel(){
            this.ActivityStatus = ko.observable("Loading...");
            this.PlayList = ko.observableArray([]);
        }


        SenderPageModel.prototype.parsePlayList = function(data){
            if (typeof data.apiVersion =="undefined" or data.apiVersion!="2.0" ){
                this.ActivityStatus("Unsupported Playlist Format");
                return;
            }
            debugger;
        }


        function init(config) {
            var result = $.Deferred();
            $.getJSON( config.playlist )
                .done(function( data ) {
                  alert(JSON.stringify(data));
                  result.resolve(data);
                });
            model = new SenderPageModel();
            ko.applyBindings(model);
            return result;
        };

        function run(data) {

            model.parsePlayList(data);

        }

        return {
            init: init,
            run: run
        }
    }
);