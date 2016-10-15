(function () {
    var listFactory = function ($http) {
        var factory = {};
        
        factory.getRows = function(listId) {
            return $http.get('/' + listId);
        }
        
        return factory;
    };

    listFactory.$inject = ['$http'];
    angular.module('listopheApp').factory('listFactory', listFactory);

})();
