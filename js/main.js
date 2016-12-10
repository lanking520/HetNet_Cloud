/// </// <reference path="angular.min.js" />
/// </// <reference path="highcharts.js" />
var myApp = angular.module("Mainmodule", []);
var preUrl = "http://35.162.120.177";
var mainController = function ($scope, $http, $log) {
	$scope.currView = "/home/home.html";
    $scope.init = function () {
       $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyDv7LXWXvrFxVXasT4su3kOHg6Kyv0gSUY";
    }
    $scope.homeinit = function(){
    	$http({
            url: preUrl + "/policy",
            method: "GET"
        }).success(function (response) {
            var ldata  = response.pop();
            $log.debug(ldata);
            $scope.networks = ldata["Networks"];
            delete ldata["Networks"];
            $scope.Phone = ldata;
            $http({
                url: "http://maps.googleapis.com/maps/api/geocode/json",
                method: "GET",
                params:{latlng: $scope.Phone["Latitude"]+","+$scope.Phone["Longtitude"]}
                }).success(function(response){
                $scope.location=response["results"][0]["formatted_address"];
                });
        });
    }

}

myApp.controller("MainController", mainController);
