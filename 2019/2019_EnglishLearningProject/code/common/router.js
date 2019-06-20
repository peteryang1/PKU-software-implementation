define([
        'knockout',
        'crossroads',
        'hasher',
        'mtutor-client-base'
],
    function (ko, crossroads, hasher) {
        function Router(config) {
            function bindRoutes() {
                ko.utils.arrayForEach(config.routes, function (route) {
                    app[route.page] = { page: route.page, query: ko.observable() };
                    crossroads.addRoute(route.url, function (query) {
                        query.page = route.page;
                        app.updateQuery(query);
                    });
                });
            }

            function activateCrossroads() {
                function parseHash(newHash, oldHash) {
                    app.changeHash(newHash);
                    crossroads.parse(newHash);
                }

                crossroads.normalizeFn = crossroads.NORM_AS_OBJECT;
                hasher.initialized.add(parseHash);
                hasher.changed.add(parseHash);
                hasher.init();
            }

            function init() {
                bindRoutes();
                activateCrossroads();
            }
            init();
        }

        return new Router(window.routerConfig);
    });