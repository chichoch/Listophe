(function(){
    var app = angular.module('listopheApp', ['ngRoute']);

	app.config(function($routeProvider) {
		$routeProvider
			.when('/', {
				controller: 'MainController',
				templateUrl: 'app/views/main.html'
			})
			.when('/list/:listId' , {
				controller: 'ListController',
				templateUrl: 'app/views/list.html'
			})
			.otherwise( { redirectTo: '/'});
	});

}());