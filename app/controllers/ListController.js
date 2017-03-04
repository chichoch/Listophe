(function() {

	var ListController = function ($scope, $routeParams, listFactory) {
		//Use socket!
        var socket = io();
        var listId = $routeParams.listId;
                
        $scope.listRow = '';
		$scope.listName = '';
        $scope.list = [];
        
		function init() {
            listFactory.getRows(listId)
                .then(function(response) {
                    console.log("LIST: ", response.data.rows);
                    $scope.list = response.data.rows;
                    $scope.listName = response.data.name;
                    socket.emit('OpenList', listId);
                }, function(data, status, headers, config) {
                    console.log(data.error + ' ' + status);
                });
        };
        
        init();
        
        socket.on('newRow', function(r){
            addRow(r);  
        });
        
        socket.on('updateRow', function(id, text, checked){
            for (var i = 0, len = $scope.list.length; i < len; i ++) {
                if ($scope.list[i]._id == id) {
                    console.log("Updated row:", id, !checked);
                    $scope.list[i].text = text;
                    $scope.list[i].checked = !checked;
                    $scope.$apply();
                    break;
                }
            }
        });
        
		function addRow(r) {
            $scope.list.push(r);
            $scope.$apply();
            //TODO Scroll to bottom. 
            //angular.element("#list-div")[0].scrollBottom=0;

        };
        
        
        $scope.checkRow = function(id) {
            // listId, id, row, checked
            for (var i=0,len=$scope.list.length;i<len;i++){
               if ($scope.list[i]._id === id){
                   console.log('Checked row with id: ', id);
                   socket.emit('rowChecked', listId, id, $scope.list[i].text, $scope.list[i].checked);
                   break;
               }
           } 
        }
		
        $scope.submit = function() {
			if ($scope.listRow) {
                socket.emit('addRow', listId, $scope.listRow);
				/*$scope.list.push({
					row: this.listRow,
					checked: false,
					id: this.id
				});*/
				$scope.listRow = '';
			}
		};
	};

	ListController.$inject = ['$scope', '$routeParams', 'listFactory'];

	angular.module('listopheApp').controller('ListController', ListController);

})();