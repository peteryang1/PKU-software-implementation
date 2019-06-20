define([
    'jquery',
    'knockout',
    'komapping',
    'underscore',
    'wx',
    'mtutor-client-base'
], function ($, ko, komapping, _, wx, mTutorClientBase) {
    ko.mapping = komapping;
    return App();

    function App() {
        var self = window.app;
        

        +function init() {
            wx.ready(function () {
                app.bindShareMsg();
            });
        }();
    }
})