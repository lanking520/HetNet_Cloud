/// </// <reference path="angular.min.js" />
/// </// <reference path="highcharts.js" />
var myApp = angular.module("Mainmodule", []);
var preUrl = "http://35.162.120.177";
var mainController = function ($scope, $http, $log) {
	$scope.currView = "/home/home.html";
    $scope.init = function () {
       
    }
    $scope.homeinit = function(){
    	$http({
            url: preUrl + "/policy",
            method: "GET"
        }).success(function (response) {
            var ldata  = response.pop();
            $log.debug(ldata);
            $scope.networks = ldata["Networks"];
            ldata.remove('Networks');
            $scope.Phone = ldata;
        });
    }

}

myApp.controller("MainController", mainController);
