/// </// <reference path="angular.min.js" />
/// </// <reference path="highcharts.js" />
var myApp = angular.module("Mainmodule", []);
var preUrl = "http://35.162.120.177";
var mainController = function ($scope, $http, $window, $interval, $log, httpService) {
	$scope.currView = "/home/home.html";
    var homeinterval = null;
    var networkinterval = null;
    var locationinterval = null;
    var systeminterval = null;
    $scope.init = function () {
        var data = $window.sessionStorage.getItem("PersonalInfo");
        if (data == "" || data == undefined)
        { $window.location.href = '../'; }
        $scope.personalInfo = JSON.parse(data)[0];
    }

    $scope.homeinit = function(){
        stopallinterval();
        homeinterval = $interval(homecycle, 5000);
    };

    $scope.networkinit = function(){
        stopallinterval();
        networkinterval = $interval(networkcycle, 3000);
    }

    var homecycle = function(){
        httpService.getLatesttime($scope.personalInfo.Email).success(function (response) {
            $scope.testinfo = response[0]["Time"];        
        });
    }

    var networkcycle = function(){
        httpService.getLatestnetwork($scope.personalInfo.Email).success(function (response) {
            $scope.networks = response[0];
        });
    }

    var stopallinterval = function(){
        $interval.cancel(homeinterval);
        $interval.cancel(networkinterval);
        $interval.cancel(systeminterval);
        $interval.cancel(locationinterval);
    }
}

var httpService = function($http, $log){

    this.getLatesttime = function(myemail){
        return $http({
            url: preUrl + "/location",
            method: "GET",
            params:{Email : myemail,select:'Time', sort: '-Time', limit: 1}
        });
    }
    this.getLocationParser = function(Longtitude, Latitude){
       return $http({
            url: "http://maps.googleapis.com/maps/api/geocode/json",
            method: "GET",
            params:{latlng: Longtitude+","+Latitude}
            }).success(function(response){
            address=response["results"][0]["formatted_address"];
            });
    }
    this.getLatestlocation = function(myemail){
        return $http({
            url: preUrl + "/location",
            method: "GET",
            params:{Email : myemail, sort: '-Time', limit: 1}
        });
    }
    this.getLatestnetwork = function(myemail){
        return $http({
            url: preUrl + "/network",
            method: "GET",
            params:{Email : myemail, sort: '-Time', limit: 1}
        });
    }
    this.getLastestSystemInfo = function(myemail){
        return $http({
            url: preUrl + "/system",
            method: "GET",
            params:{Email : myemail, sort: '-Time', limit: 1}
        });
    }

}

myApp.controller("MainController", mainController);
myApp.service("httpService", httpService);
