var pokerApp = angular.module("planningPoker", ["ngMaterial","ngRoute","ngMessages"]);

pokerApp.controller("PokerCtrl",["$scope","$http","$location","$mdToast","$mdSidenav","socket", function ($scope, $http, $location, $mdToast,$mdSidenav,socket) {
    $scope.user = { username : ""};
    var imagePath = "img/list/60.jpeg";
    $scope.userStories = [{
        face: imagePath,
        title: "Brunch this weekend?",
        description: " I'll be in your neighborhood doing errands"
    },
    {
        face: imagePath,
        title: "Brunch this weekend?",
        description: " I'll be in your neighborhood doing errands. I'll be in your neighborhood doing errands"
    }];

    
    ion.sound({
        sounds: [
            {
                name: "bell_ring"
            },{
                name: "chat_alertshort"
            },{
                name: "water_droplet_3"
            },{
                name: "button_tiny"
            }
            // {
            //     name: "notify_sound",
            //     volume: 0.2
            // },
            // {
            //     name: "alert_sound",
            //     volume: 0.3,
            //     preload: false
            // }
        ],
        volume: 0.8,
        path: "Client/ion.sound-3.0.7/sounds/",
        preload: true
    });
    
    ion.sound({
        sounds: [
            {
                name: "cardPlace1"
            },{
                name: "cardPlace2"
            }
        ],
        volume: 0.8,
        path: "Client/alerts/Casino sound package/",
        preload: true
    });
    
    
    
    //ion.sound.play("chat_alertshort");
    
    
    
    var cookie = getCookie("username");
    if(cookie !== ""){
        $http({
            method: "POST",
            url: "/api/userlogin",
            data: { usernameCookie : cookie }
        }).then(function successCallback(response) {
            console.log(response.data);
            if(response.data.username){
                $scope.user = response.data;
                setCookie("username" , $scope.user._id, 10);
                $location.path("/poker");
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Welcome back " + $scope.user.username)
                        .position("top right")
                        .hideDelay(2000)
                        .parent("div.poker")
                );
                socket.initiate(function(){
                    startListning();
                });
            }else{
                window.alert(response.data.result);
                $location.path("/");
            }
        }, function errorCallback(response) {
            console.error(response);
        });
    }else{
        $location.path("/");
    }
    
    $scope.openUserMenu = function ($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    $scope.logout = function(){
        $http({
            method: "GET",
            url: "/api/logout",
            }).then(function successCallback(response) {
                $scope.user = { username : "" };
                console.log(response);
                setCookie("username", "", 0);
                $location.path("/");
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Bye bye.. Hope to see you again")
                        .position( "top right")
                        .hideDelay(2000)
                        .parent("md-content.md-padding")
                );
            }, function errorCallback(response) {
                //window.alert(response);
                console.error(response);
        });
    };
    
        
    $scope.newuser = {
      email : "",
      username : "",
      password : ""
    }
    
    $scope.showLogin = function(){
      $location.path("/");
    };
    $scope.showSignUp = function(){
      $location.path("/signup");
    };
    
    $scope.callSignUp = function(){
      $http({
            method: "POST",
            url: "/api/user",
            data: $scope.newuser
        }).then(function successCallback(response) {
            console.log(response.data);
            if(response.data.username){
                $scope.user = response.data;
                $location.path("/poker");
                socket.initiate(function(){
                    startListning();
                });
            }else{
                window.alert(response.data.result);
            }
        }, function errorCallback(response) {
            console.error(response);
        });
    }
    
    $scope.credential = {
      username : "",
      password : ""
    }
    
    $scope.callLogin = function(){
      $http({
            method: "POST",
            url: "/api/userlogin",
            data: $scope.credential
        }).then(function successCallback(response) {
            console.log(response.data);
            if(response.data.username){
                $scope.user = response.data;
                setCookie("username" , $scope.user._id, 10);
                $location.path("/poker");
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Welcome back " + $scope.user.username)
                        .position( "top right")
                        .hideDelay(2000)
                        .parent("md-content.md-padding")
                );
                socket.initiate(function(){
                    startListning();
                });
            }else{
                window.alert(response.data.result);
            }
        }, function errorCallback(response) {
            console.error(response);
        });
    }
    
     /*********   Themes   ************* */
    $scope.themes = ["default","purple","red"];
    $scope.dynamicTheme = "default";
    $scope.getSelectedText = function () {
        if ($scope.selectedItem !== undefined) {
            return $scope.selectedItem;
        } else {
            return "Please select a theme";
        }
    };
    /***********   Cookie   ******************** */
    function setCookie(cname, cvalue, exmins) {
      var d = new Date();
      d.setTime(d.getTime() + (exmins*60*1000));
      var expires = "expires="+d.toUTCString();
      document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(";");
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    /******************************************** */
    $scope.cards = [{ value: 0, imagePath: "b-0.png" }, { value: 1, imagePath: "b-1.png" }, { value: 2, imagePath: "b-2.png" }, { value: 3, imagePath: "b-3.png" }, { value: 5, imagePath: "b-5.png" }, { value: 8, imagePath: "b-8.png" }, { value: 13, imagePath: "b-13.png" }, { value: 20, imagePath: "b-20.png" }, { value: 40, imagePath: "b-40.png" }, { value: 100, imagePath: "b-100.png" }, { value: "?", imagePath: "b-noidea.png" }];
    
    $scope.GroupUsers = [
        { "userName":"pritesh", "card": "", "played" : false , "online" : false },
        { "userName":"gargik", "card": "", "played" : false, "online" : false },
        { "userName":"swapnil", "card": "", "played" : false, "online" : false },
        { "userName":"jonathan", "card": "", "played" : false, "online" : false  },
        { "userName":"freddy", "card": "", "played" : false, "online" : false  },
        { "userName":"nitesh", "card": "", "played" : false, "online" : false }
    ];
    
    $scope.showCard = false;
    
    $scope.getNumber = function(num) {
        return new Array(num);   
    };
    /***************    game controls   ********************************* */
    $scope.playCard = function(card){
        socket.emit("playCard",card);
    };
    
    $scope.showCards = function(card){
        socket.emit("showCards");
    };
    $scope.chatGroup = [];
    
    $scope.chat = { text: "" };
    
    $scope.typingUser = "";
    
    $scope.sendChat = function(){
        $scope.chatGroup.push({ "user" :$scope.user.username, "text" : $scope.chat.text });
        socket.emit("chatMessage",{ "user" :$scope.user.username, "text" : $scope.chat.text })
        $scope.chat.text = "";
    };
    
    $scope.$watch($scope.chat,function(newVal,oldVal){
        socket.emit("typing");
    });
    
    $scope.toggleRight = buildToggler('right');
    function buildToggler(navID) {
      return function() {
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }
    }
    
    $scope.close = function () {
      $mdSidenav('right').close()
        .then(function () {
          $log.debug("close RIGHT is done");
        });
    };
    
    /****************    Socket Listners     ******************* */
    function startListning(){
        angular.forEach($scope.GroupUsers,function(member){
            if($scope.user.userName === member.userName){
                member.online = true;
            }
        });
        
        socket.on("confirmSession",function(msg){
            console.log(msg);
            showToast(msg);
        });
        
        socket.on("broadcast",function(msg){
            console.log(msg);
            showToast(msg);
        });
        
        socket.on("online",function(userName){
            console.log(userName, " is online");
            ion.sound.play("water_droplet_3");
            angular.forEach($scope.GroupUsers,function(member){
                if(userName === member.userName){
                    member.online = true;
                }
            });
        });
        
        socket.on("offline",function(userName){
            console.log(userName, " is offline");
            angular.forEach($scope.GroupUsers,function(member){
                if(userName === member.userName){
                    member.online = false;
                }
            });
        });
        
        socket.on("groupOnline",function(users){
            console.log(users, " are online");
            angular.forEach($scope.GroupUsers,function(member){
                angular.forEach(users,function(user){
                    if(user === member.userName){
                        member.online = true;
                    }
                });
            });
        });
        
        socket.on("playedCard",function(play){
            console.log(play.user, " played");
            ion.sound.play("cardPlace1");
            angular.forEach($scope.GroupUsers,function(member){
                if(play.user === member.userName){
                    member.card = "b-" + play.card + ".png";
                    member.played = true;
                }
            });
        });
        
        socket.on("showCard",function(){
            ion.sound.play("button_tiny");
            $scope.showCard = true;
        });
        
        socket.on("chatMessage",function(message){
            $scope.chatGroup.push(message);
            ion.sound.play("chat_alertshort");
        });
    }
    
    function showToast(message){
        $mdToast.show(
            $mdToast.simple()
                .textContent(message)
                .position( "top right")
                .hideDelay(2000)
                .parent("md-content.md-padding")
        );
    }
    /**************************************************************** */
}]);

pokerApp.config(["$mdThemingProvider","$routeProvider","$compileProvider", function($mdThemingProvider,$routeProvider,$compileProvider) {
    $compileProvider.debugInfoEnabled(false);
    $mdThemingProvider.theme("default")
        .primaryPalette("blue")
        .accentPalette("orange");
    $mdThemingProvider.theme("purple")
        .primaryPalette("purple");
    $mdThemingProvider.theme("red")
        .primaryPalette("red");
            
    $mdThemingProvider.setDefaultTheme("default");
    $mdThemingProvider.alwaysWatchTheme(true);
    
    /******************************** */
    $routeProvider
    .when("/", {
        templateUrl:"Client/templates/login.html",
        //controller: "mainController"
    })
    .when("/signup", {
        templateUrl:"Client/templates/signup.html",
    })
    .when("/poker", {
        templateUrl:"Client/templates/poker.html",
        //controller: "fileupload"
    })
    .when("/scrummaster", {
        templateUrl:"Client/templates/scrumMaster.html",
        //controller: "fileupload"
    })
    .otherwise({
        redirectTo:"/"
    });     
}]);

pokerApp.service("socket", ["$location", "$timeout",
    function ($location, $timeout) {
        this.initiate = function (callback) {
            // this.socket = io();
            this.socket = io.connect();
            callback();
        };

        this.on = function (eventName, callback) {
            if (this.socket) {
                this.socket.on(eventName, function (data) {
                    $timeout(function () {
                        callback(data);
                    });
                });
            }
        };

        this.emit = function (eventName, data) {
            if (this.socket) {
                this.socket.emit(eventName, data);
            }
        };

        this.removeListener = function (eventName) {
            if (this.socket) {
                this.socket.removeListener(eventName);
            }
        };
    }
]);

pokerApp.service("auth",["$scope", "$http", function($scope, $http){
    $scope.authorized = false;
    $scope.user;
    this.isAuthorized = function(){
        return $scope.authorized;
    }
  
    this.authenticate = function(credential, callback){
        $http({
            method: "POST",
            url: "/api/userlogin",
            data: credential
        }).then(function successCallback(response) {
            console.log(response.data);
            if(response.data.username){
                $scope.authorized = true;
                $scope.user = response.data;
                callback(response.data);
            }else{
                window.alert(response.data.result);
                $scope.authorized = false;
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Sorry the password doesn't match.")
                        .position("top right")
                        .hideDelay(3000)
                        .parent("md-content.md-padding")
                );
                callback(response.data);
            }
        }, function errorCallback(response) {
            console.error(response);
        });
    }
  
}]);