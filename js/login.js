var myApp = angular.module("Mainmodule", []);

var preUrl = "http://34.201.21.219:8111";
//var preURL = "http://0.0.0.0:8111"

var mainController = function ($scope, $http, $log, $window) {
	$scope.failhider = true;
	$scope.currView = "login/logintable.html"

	$scope.name;
	$scope.email;
	$scope.password;

	// login
	$scope.login = function() {
		$window.sessionStorage.setItem("userEmail", "test@columbia.edu");
		$window.location.href = "/AdminLTE-2.3.11/index.html";
		// if ($scope.email != undefined && $scope.password != undefined) {
		// 	// console.log($scope.email);
		// 	// console.log($scope.password);

		// 	$http({
		// 		url: preURL + '/login',
		// 		method: "POST",
		// 		data: {email: $scope.email, password: $scope.password}
		// 	}).then(function successCallback(response) {
		// 		if (response.data["status"] == "Failure") {
		// 			$scope.failhider = false;
		// 		} else {
		// 			$window.sessionStorage.setItem("userEmail", $scope.email);
		// 			$window.location.href = "/AdminLTE/index.html"
		// 		}
		// 	}, function errorCallback(response) {
		// 		console.log(response);
		// 	});
		// }
	};

	// register
	$scope.register = function() {
		if ($scope.name != undefined && $scope.email != undefined && $scope.password != undefined) {
			$http({
				url: preURL + "/register",
				method: "POST",
				data: {email: $scope.email, password: $scope.password, name: $scope.name}
			}).then(function successCallback(response) {
				if (response.data["status"] == "Failure") {
					$scope.failhider = false
				} else {
					$window.sessionStorage.setItem("userEmail", $scope.email);
					$window.location.href = "/AdminLTE-2.3.11/index.html";
				}
			}, function errorCallback(response) {
				console.log(response);
			});
		}
	};

	// switch to register page
	$scope.switchRegisterPage = function() {
		$scope.currView = "login/registertable.html";
		$scope.failhider = true;
	}

	// swithc to sigin page
	$scope.switchSigninPage = function() {
		$scope.currView = "login/logintable.html";
		$scope.failhider = true;
	}
};

myApp.controller("MainController", mainController);