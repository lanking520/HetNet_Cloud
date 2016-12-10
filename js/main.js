/// </// <reference path="angular.min.js" />
/// </// <reference path="highcharts.js" />
var myApp = angular.module("Mainmodule", []);
var preUrl = "http://localhost:8008";
var mainController = function ($scope, $http, $log) {
	$scope.currView = "./home.html";
    $scope.init = function () {
       
    }
    
}

myApp.controller("MainController", mainController);
