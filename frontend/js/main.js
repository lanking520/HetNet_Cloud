/// </// <reference path="angular.js" />
/// </// <reference path="angular-animate.js" />
var homeApp = angular.module("homeModule", ['ngMap','ngAnimate','ngSanitize','ui.bootstrap']);
homeApp.controller("homeController", homeController);
homeApp.service("httpService", httpService);

var preUrl = "http://34.201.21.219:8111"
//var preUrl = "http://0.0.0.0:8111"


function homeController($scope, $http, $window, httpService, NgMap) {
    var vm = this;
    var email = $window.sessionStorage.getItem("userEmail");

    $scope.mainInit = function(){
        $scope.email = email;
        $scope.homeView = "../home/main.html";
        $scope.networkList;
        $scope.appdataList;
        // Store all application package
        $scope.applicationPackageList;
        // Store selected application
        $scope.selectedApplication;
    }
    // Vars used for sorting and search
    $scope.networkOrderByField = "time";
    $scope.networkReverseSort = false;
    $scope.appdataOrderByField = "time";
    $scope.appdataReverseSort = false;

    $scope.desicionMakerHideDecision = true;
    $scope.showNetworkSwitchDecision = true;
    $scope.currDev = "";
    $scope.curru = "";

    $scope.ssidToSwitch = "";
    $scope.macidToSwitch = "";

    // switch to main
    $scope.switchMain = function () {
        $scope.homeView = "../home/main.html";
    };

    // switch to network data
    $scope.switchNetworkData = function () {
        $scope.homeView = "../home/networkData.html";
    };

    // switch to network visualization
    $scope.switchNetworkDataVisualization = function () {
        $scope.homeView = "../home/networkDataVisualization.html";
    };

    // switch to application data
    $scope.switchApplicationData = function () {
        $scope.homeView = "../home/applicationData.html";
    };

    // switch to application data visualization
    $scope.switchApplicationDataVisualization = function () {
        $scope.homeView = "../home/applicationDataVisualization.html";
    };

    // switch to decision maker
    $scope.switchDecisionMaker = function () {
        $scope.homeView = "../home/decisionMaker.html";
    }

    // switch to system data
    $scope.switchSystemData = function () {
        $scope.homeView = "../home/systemData.html";
    };

    // switch to system data visualization
    $scope.switchSystemDataVisualization = function () {
        $scope.homeView = "../home/systemDataVisualization.html";
    };

    function mapinit(){
        NgMap.getMap({id: 'networkDataMap'}).then(function(map) {
            vm.map = map;
        });
    };

    function decisionMakerMapInit() {
        NgMap.getMap({id: 'decisionMakerMap'}).then(function(map) {
            vm.decisionMakerMap = map;
        });
    }

    function getlocation(){
        vm.coord = [];
        httpService.getalllocation().then(function (response){
            vm.coord = response.data.locations;
        });
    }

    function getnetworks(location){
        $scope.networkList = [];
        httpService.getnetbylocation(location).then(function (response) {
            for (var i = 0; i < response.data.networks.length; i++) {
                var network = {
                    "ssid": response.data.networks[i].ssid,
                    "bandwidth": response.data.networks[i].bandwidth,
                    "avgss": response.data.networks[i].avgss,
                    "location": response.data.networks[i].location,
                    "security": response.data.networks[i].security,
                    "device_id": response.data.networks[i].device_id,
                    "time": response.data.networks[i].time
                };
                $scope.networkList.push(network);
            }
        });
    }


    function assignNetworks(){
        var dynMarkers = [];
        for (key in vm.coord) {
                latlng = vm.coord[key].split(",");
                var latLng = new google.maps.LatLng(latlng[1], latlng[0]);
                var marker = new google.maps.Marker({
                    position:latLng,
                    icon:'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                });
                google.maps.event.addListener(marker,'click', function(event){
                    var loc = event.latLng.lng().toFixed(4).toString() +","+event.latLng.lat().toFixed(4).toString();
                    httpService.getLocationParser(event.latLng.lat(), event.latLng.lng()).then(function (response) {
                        $scope.CurrLoc = response.data.results[0].formatted_address;
                    });
                    getnetworks(loc);
                    $scope.$apply(); // Trigger the Event! After this process
                });
                dynMarkers.push(marker);
        }
        vm.markerClusterer = new MarkerClusterer(vm.map, dynMarkers, {});
    }

    $scope.getpos = function(event) {
      $scope.Lnglat = [event.latLng.lng().toFixed(4).toString(), event.latLng.lat().toFixed(4).toString()];
      if (vm.decisionClickCluster != undefined) {
        vm.decisionClickCluster.clearMarkers();
      }
      //vm.clickCluster.clearMarkers();
      //httpService.getAllSSID(Lnglat[0],Lnglat[1]).then(function (response) {$scope.currSSID = response.data.ssid;});
      var marker = new google.maps.Marker({
        position: event.latLng, 
        map: vm.decisionMakerMap});
      console.log("NEw marker");
      vm.decisionClickCluster = new MarkerClusterer(vm.decisionMakerMap,[marker],{});
      console.log("Add marker");
      $scope.hideDecision = false;
      // TODO: Add decision API here to show:
    };

    //$scope.updateSSID = function(network){$scope.currNet = network;}
    $scope.updateDevice = function(device){
        $scope.currDev = device.name;

        // Get parameters needed for find the network to switch
        var deviceID = $scope.currDev;
        var location = $scope.Lnglat[0] + "," + $scope.Lnglat[1];

        console.log(deviceID);
        console.log(location);
        console.log("------------");

        httpService.getMacIdByPrefByLoc(deviceID, location).then(function(response) {
            $scope.showNetworkSwitchDecision = false;
            console.log(response.data.macid);
            console.log(response.data.ssid);
            $scope.ssidToSwitch = response.data.ssid;
            $scope.macidToSwitch = response.data.macid;
        });        
    }

    $scope.updateUid = function(uid){
        $scope.curru = uid.name;

            
        if ($scope.currDev != "") {
            var deviceID = $scope.currDev;
            var uid = $scope.curru;
            var location = $scope.Lnglat[0] + "," + $scope.Lnglat[1];

            console.log(deviceID);
            console.log(uid);
            console.log(location);
            console.log("----------------");

            httpService.getMacidByPrefByUidLoc(deviceID, uid, location).then(function(response) {
                console.log(response.data.macid);
                console.log(response.data.ssid);
                $scope.ssidToSwitch = response.data.ssid;
                $scope.macidToSwitch = response.data.macid;
            });
        }
    };

    $scope.decisionMakerInit = function () {
        // vm.clickCluster = new MarkerClusterer(vm.map, [], {});
        // $scope.hideDecision = true;
        decisionMakerMapInit();
        // getlocation();
        // setTimeout(function () {
        //     $scope.$apply(assignNetworks());
        // }, 2000);

        httpService.getAllDevice().then(function(response) {
            $scope.currDevice = response.data.device_id;
        });

        httpService.getAlluid().then(function(response) {
            $scope.currUid = response.data.uid;
        });
    };

    // Init network data
    $scope.networkDataInit = function () {
       vm.clickCluster = new MarkerClusterer(vm.map,[], {});
       mapinit();
       getlocation();
       setTimeout(function(){$scope.$apply(assignNetworks());}, 2000);
       httpService.getAllDevice().then(function(response){
          $scope.currDevice = response.data.device_id;
       });
       httpService.getAlluid().then(function(response){
          $scope.currUid = response.data.uid;
       });
    };

    // Init application data
    $scope.applicationDataInit = function () {
        var appdataList = [];
        httpService.getappdata().then(function (response) {
            $scope.appdataList = response.data.appdata;
        });
    };


    // Init network visualization
    $scope.networkVisualizationInit = function () {

        httpService.getavgssbyssid().then(function (response) {
            var ssid = response.data.ssid;
            var avgss = response.data.avgss;
            Highcharts.chart('barChart1', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Distribution of Average Signal Strength in dB'
                },
                xAxis: {
                    categories: ssid
                },
                yAxis: {
                    title: {
                        text: 'Average Signal Strength'
                    }
                },
                series: [{
                    name: 'Average Signal Strength',
                    data: avgss
                }]
            });
        });

        
        httpService.getbandwidthbyssid().then(function (response) {
            var ssid = response.data.ssid;
            var bandwidth = response.data.bandwidth;
            Highcharts.chart('barChart2', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Distribution of Average Bandwidth in Mbit/s'
                },
                xAxis: {
                    categories: ssid
                    // categories: ['35.02654303', '38.73984845', '42.45315388', '46.1664593',
                    //     '49.87976473', '53.59307015', '57.30637557', '61.019681',
                    //     '64.73298642', '68.44629185', '72.15959727']
                },
                yAxis: {
                    title: {
                        text: 'Average Bandwidth'
                    }
                },
                series: [{
                    name: 'Average Bandwidth',
                    data: bandwidth
                }]
            });
        });
    };

    // Init appdata visualization
    $scope.appdataVisualizationInit = function () {

        var downloadStatsData = [];
        var uploadStatsData = [];

        // Get all application name
        httpService.getallapplication().then(function (response) {
            $scope.applicationPackageList = response.data.application_package;
        });

        // Get download stats
        httpService.getDownloadStats().then(function(response) {
            var downloadStats = response.data.download_stats;
            for (var i = 0; i < downloadStats.length; i++) {
                // Construct data required to draw pie chart
                var application_package = downloadStats[i].application_package;
                var download = downloadStats[i].download;
                downloadStatsData.push({
                    name: application_package,
                    y: download
                });
            }

            // Draw download pie chart
            Highcharts.chart('appPieChart2', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'Download Statistics by Different Applications'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                series: [{
                    name: 'Percentage',
                    colorByPoint: true,
                    data: downloadStatsData
                }]
            });
        });

        // Get upload stats
        httpService.getUploadStats().then(function(response) {
            var uploadStats = response.data.upload_stats;
            for (var i = 0; i < uploadStats.length; i++) {
                var application_package = uploadStats[i].application_package;
                var upload = uploadStats[i].upload;
                uploadStatsData.push({
                    name: application_package,
                    y: upload
                });
            }

            Highcharts.chart('appPieChart1', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'Upload Statistics by Different Applications'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                series: [{
                    name: 'Percentage',
                    colorByPoint: true,
                    data: uploadStatsData
                }]
            });
        });     
    };

    $scope.onApplicationSelectionChange = function(application) {
        $scope.selectedApplication = application;

        var uploadTimeSeries = [];
        var downloadTimeSeries = [];

        // Send http service with 
        httpService.getTimeSeriesByApplication($scope.selectedApplication).then(function (response) {
            var uploadData = response.data.upload;
            var downloadData = response.data.download;
            
            // Parse uploadData, build uploadTimeSeries
            for (var i = 0; i < uploadData.length; i++) {
                var upload = uploadData[i].upload;

                var year = uploadData[i].time.year;
                var month = uploadData[i].time.month;
                var day = uploadData[i].time.day;
                var hour = uploadData[i].time.hour;
                var minute = uploadData[i].time.minute;
                var second = uploadData[i].time.second;

                // Add to uploadTimeSeries
                uploadTimeSeries.push([Date.UTC(year, month, day, hour, minute, second), upload]);
            }

            // Parse downloadData, build downloadTimeSeries
            for (var i = 0; i < downloadData.length; i++) {
                var download = downloadData[i].download;

                var year = downloadData[i].time.year;
                var month = downloadData[i].time.month;
                var day = downloadData[i].time.day;
                var hour = downloadData[i].time.hour;
                var minute = downloadData[i].time.minute;
                var second = downloadData[i].time.second;

                // Add to downloadTimeSeries
                downloadTimeSeries.push([Date.UTC(year, month, day, hour, minute, second), download]);
            }

            // Sort uploadTimeSeries and downloadTimeSeries by date
            uploadTimeSeries.sort(function(a, b) {
                return a[0] - b[0];
            });

            downloadTimeSeries.sort(function(a, b) {
                return a[0] - b[0];
            });

            // Draw upload highchart
            Highcharts.chart('uploadTimeSeries', {
                chart: {
                    zoomType: 'x'
                },
                title: {
                    text: 'Upload Statistics by ' + $scope.selectedApplication + "(in MB)"
                },
                subtitle: {
                    text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    title: {
                        text: 'Upload'
                    }
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    area: {
                        fillColor: {
                            linearGradient: {
                                x1: 0,
                                y1: 0,
                                x2: 0,
                                y2: 1
                            },
                            stops: [
                                [0, Highcharts.getOptions().colors[0]],
                                [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                            ]
                        },
                        marker: {
                            radius: 2
                        },
                        lineWidth: 1,
                        states: {
                            hover: {
                                lineWidth: 1
                            }
                        },
                        threshold: null
                    }
                },

                series: [{
                    type: 'area',
                    name: 'upload',
                    data: uploadTimeSeries
                }]
            });

            // Draw download highchart
            Highcharts.chart('downloadTimeSeries', {
                chart: {
                    zoomType: 'x'
                },
                title: {
                    text: 'Download Statistics by ' + $scope.selectedApplication + "(in MB)"
                },
                subtitle: {
                    text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    title: {
                        text: 'Upload'
                    }
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    area: {
                        fillColor: {
                            linearGradient: {
                                x1: 0,
                                y1: 0,
                                x2: 0,
                                y2: 1
                            },
                            stops: [
                                [0, Highcharts.getOptions().colors[0]],
                                [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                            ]
                        },
                        marker: {
                            radius: 2
                        },
                        lineWidth: 1,
                        states: {
                            hover: {
                                lineWidth: 1
                            }
                        },
                        threshold: null
                    }
                },

                series: [{
                    type: 'area',
                    name: 'upload',
                    data: downloadTimeSeries
                }]
            });
        });
    };    
};

function httpService($http) {

    this.getnetworks = function () {
        return $http({
            url: preUrl + "/network/getall",
            method: "GET"
        });
    }

    this.getalllocation = function(){
        return $http({
            url: preUrl + "/network/getalllocation",
            method: "GET"
        });
    }

    this.getnetbylocation = function(location){
        return $http({
            url: preUrl +"/network/bylocation",
            method:"GET",
            params: {"location": location}
        });
    }

    this.getavgssbyssid = function () {
        return $http({
            url: preUrl + "/network/avgss",
            method: "GET"
        });
    }

    this.getbandwidthbyssid = function () {
        return $http({
            url: preUrl + "/network/bandwidth",
            method: "GET"
        });
    }

    this.getallapplication = function() {
        return $http({
            url: preUrl + "/appdata/getallapplication",
            method: "GET"
        });
    }

    this.getappdata = function () {
        return $http({
            url: preUrl + "/appdata/getall",
            method: "GET"
        });
    }

    this.getTimeSeriesByApplication = function(selectedApplication) {
        return $http({
            url: preUrl + "/appdata/series/byapplicationpackage",
            method: "GET",
            params: {applicationpackage: selectedApplication}
        });
    }

    this.getDownloadStats = function() {
        return $http({
            url: preUrl + "/appdata/downloadstats",
            method: "GET"
        });
    }

    this.getUploadStats = function() {
        return $http({
            url: preUrl + "/appdata/uploadstats",
            method: "GET"
        });
    }

    this.getLocationParser = function (Longtitude, Latitude) {
        return $http({
            url: "http://maps.googleapis.com/maps/api/geocode/json",
            method: "GET",
            params: {latlng: Longtitude + "," + Latitude}
        });
    }
    this.getAllSSID = function(Longtitude, Latitude){
        return $http({
            url: preUrl +"/network/getallssid",
            medthod: "GET",
            params: {location: Longtitude+","+Latitude }
        });
    }
    this.getAlluid = function(){
        return $http({
            url: preUrl +"/network/getalluid",
            medthod: "GET"
        });
    }
    this.getAllDevice = function(){
        return $http({
            url: preUrl +"/network/getalldevice",
            medthod: "GET"
        });
    }

    this.getMacidByPrefByUidLoc = function(deviceID_p, uid_p, location_p) {
        return $http({
            url: preUrl + "/event/getmacidbyprefbyuidloc",
            method: "GET",
            params: {
                device_id: deviceID_p,
                uid: uid_p,
                location: location_p
            }
        });
    }

    this.getMacIdByPrefByLoc = function(deviceID_p, location_p) {
        return $http({
            url: preUrl + "/event/getmacidbyprefbyloc",
            method: "GET",
            params: {
                device_id: deviceID_p,
                location: location_p
            }
        });
    }
}