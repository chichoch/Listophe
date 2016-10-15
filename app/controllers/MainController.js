(function () {
    var MainController = function ($scope, $location) {
        var socket = io();
        $scope.listName = '';
        
        $scope.submit = function () {
            if ($scope.listName != '') {
                socket.emit('createNewList', $scope.listName);    
            } else {
                socket.emit('createNewList', 'NEW LIST');
            }
            
        };
        
        socket.on('createdNewList', function(id){
            $location.path('list/' + id); 
            console.log('Socket on MainC id: ' + id);
            $scope.$apply();
        });

    };
    MainController.$inject = ['$scope', '$location'];

    angular.module('listopheApp').controller('MainController', MainController);
})();
