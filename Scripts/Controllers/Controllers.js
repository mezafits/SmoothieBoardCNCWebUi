var module = angular.module('cncSmoothie', [ 'rzModule', 'ui.bootstrap','angularFileUpload']);
   module.controller('AppController', function ($scope) {
    $scope.options = configuration;
})

   module.component('jogPanel', {
        templateUrl: 'templates/jogPanel.html',
        controller:['smoothierest', function (smoothierest)
        {
            var scope = this;

            scope.options = configuration;

            scope.commandLog = [{ message: "NTR" }];

            scope.xJogSlider = {
                    value: 1,
                    options: {
                        showTicksValues: true,
                        stepsArray: [
                            {value:0.01,legend:'1/100'},
                          { value: 0.1, legend: '1/10' },
                          { value: 1, legend: 'Full' },
                          { value: 10, legend: '10x' }
                        ]
                    }
            };
            scope.yJogSlider = {
                value: 1,
                options: {
                    showTicksValues: true,
                    stepsArray: [
                         { value: 0.01, legend: '1/100' },
                      { value: 0.1, legend: '1/10' },
                      { value: 1, legend: 'Full' },
                      { value: 10, legend: '10x' }
                    ]
                }
            };
            scope.zJogSlider = {
                value: 1,
                options: {
                    showTicksValues: true,
                    stepsArray: [
                      { value: 0.001, legend: '1/1000' },
                      { value: 0.01, legend: '1/100' },
                      { value: 0.1, legend: '1/10' },
                      { value: 1, legend: 'Full' }
                      
                    ]
                }
            };

            scope.previousXrotation = 0.0;
            scope.previousYrotation = 0.0;
            scope.previousZrotation = 0.0;

            scope.xPosition = 0.0;
            scope.yPosition = 0.0;
            scope.zPosition = 0.0;

            scope.zAbsolute = 0.0;
            scope.xAbsolute = 0.0;
            scope.yAbsolute = 0.0;

            scope.xSpeed = 1000.0;
            scope.ySpeed = 1000.0;
            scope.zSpeed = 10.0;
             
            scope.xScaleFactor = function()
            {
                return scope.xJogSlider.value;
            }
            scope.yScaleFactor = function()
            {
                return scope.yJogSlider.value;
            }
            scope.zScaleFactor = function()
            {
                return scope.zJogSlider.value;
            }

            function xIncrement()
            {
                
                    scope.xPosition += scope.xScaleFactor();
                    scope.xAbsolute += scope.xScaleFactor();
               
                
            }
            function xDecrement()
            {
                    scope.xPosition -= scope.xScaleFactor();
                    scope.xAbsolute -= scope.xScaleFactor();
            }

            function yIncrement()
            {
                scope.yPosition += scope.yScaleFactor();
                scope.yAbsolute += scope.yScaleFactor();
            }
            function yDecrement()
            {
                scope.yPosition -= scope.yScaleFactor();
                scope.yAbsolute -= scope.yScaleFactor();
            }

            function zIncrement()
            {
                
                scope.zPosition += scope.zScaleFactor();
                scope.zAbsolute += scope.zScaleFactor();
            }
            function zDecrement()
            {
                scope.zPosition -= scope.zScaleFactor();
                scope.zAbsolute -= scope.zScaleFactor();
            }

            function xCanIncrement()
            {
                var dest_position = (scope.xAbsolute + scope.xScaleFactor());
                if (scope.options.limit_max_x_axis >= dest_position) {

                    return true;
                }
                else {
                    return false;
                }
            }
            function xCanDecrement()
            {
                var dest_position = scope.xAbsolute - scope.xScaleFactor();

                if (scope.options.limit_min_x_axis <= dest_position) {
                    return true;
                }
                else {
                    return false;
                }
            }

            function yCanIncrement()
            {
                var dest_position = (scope.yAbsolute + scope.yScaleFactor());
                if (scope.options.limit_max_y_axis >= dest_position) {

                    return true;
                }
                else {
                    return false;
                }
            }
            function yCanDecrement()
            {
                var dest_position = (scope.yAbsolute + scope.yScaleFactor());
                if (scope.options.limit_min_y_axis <= dest_position) {

                    return true;
                }
                else {
                    return false;
                }
            }

            function zCanIncrement()
            {
                var dest_position = (scope.zAbsolute + scope.zScaleFactor());
                if (scope.options.limit_max_z_axis >= dest_position) {

                    return true;
                }
                else {
                    return false;
                }
            }
            function zCanDecrement()
            {
                var dest_position = (scope.zAbsolute + scope.zScaleFactor());
                if (scope.options.limit_min_z_axis <= dest_position) {

                    return true;
                }
                else {
                    return false;
                }
            }
                   

            scope.xOnDrag = function (rotation) {

                if (scope.previousXrotation < rotation)
                {
                    if (xCanIncrement()) {
                        xIncrement();
                    }
                }
                else
                {
                    if (xCanDecrement()) {
                        xDecrement();
                    }
                }
                scope.previousXrotation = rotation;
               
            }
            scope.xOnDragEnd = function(rotation)
            {
                scope.runCommand('G91 G0 X' + scope.xPosition + ' F' + scope.xSpeed + ' G90', true);
            }

            scope.yOnDrag = function (rotation) {
                if(scope.previousYrotation < rotation)
                {
                    if (yCanIncrement()) {
                        yIncrement();
                    }
                }
                else
                {
                    if (yCanDecrement()) {
                        yDecrement();
                    }
                }
                scope.previousYrotation = rotation;

            }
            scope.yOnDragEnd = function(rotation)
            {
                scope.runCommand('G91 G0 Y' + scope.yPosition + ' F' + scope.ySpeed + ' G90', true);
            }

            scope.zOnDrag = function (rotation) {
                if(scope.previousZrotation < rotation)
                {
                    if (zCanIncrement()) {
                        zIncrement();
                    }

                }
                else
                {
                    if (zCanDecrement()) {
                        zDecrement();
                    }
                }
                scope.previousZrotation = rotation;
            }
            scope.zOnDragEnd = function(rotation)
            {
                scope.runCommand('G90 G0 Z' + scope.zPosition + ' F' + scope.zSpeed,true);
            }
          
            var manager = {};
            var speedJoggerInterval = {};
            var speedJoggerResponseTime = 200;
            var speedJoggerVelocity = 3000;

            function speedJoggerStep(percentagePower, velocity)
            {

                var steps_per_interval = Math.round((speedJoggerResponseTime / (1000 * 60)) * speedJoggerVelocity) * percentagePower;
                return steps_per_interval;
            }

            
            var speedJoggerThrustX = 0.0;
            var speedJoggerThrustY = 0.0;
            function CreateNipple()
            {
                var element = document.getElementById('joyStick1');
                manager = nipplejs.create({
                    zone: element,
                    size: 200,
                    mode: 'dynamic',
                    position: { left: '50%', top: '50%' },
                    color: 'black'
                });

                manager.on('move', function (event, data) {
                    var position = event.target.nipples[0].frontPosition;
                    speedJoggerMoves(position);

                });
                manager.on('end', function (event, data) {
                    speedJoggerEnds();
                });
                manager.on('shown', function (event, data) {
                    speedJoggerActivated();
                });
                manager.on('hidden', function (event, data) {
                    speedJoggerDeactivated();
                });
            }
            function speedJoggerIntervalEvent()
            {
                scope.runCommand("G91 G0 X" + speedJoggerStep(speedJoggerThrustX, speedJoggerVelocity) + " G0 Y" + speedJoggerStep(speedJoggerThrustY, speedJoggerVelocity) + " F" + speedJoggerVelocity + " G90", false);
            }
            function speedJoggerMoves(position)
            {
              
                speedJoggerThrustX = position.x/100;
                speedJoggerThrustY = position.y/100;
            }
            function speedJoggerEnds()
            {
                speedJoggerDeactivated();
            }
            function speedJoggerActivated()
            {
                speedJoggerInterval = setInterval(speedJoggerIntervalEvent, speedJoggerResponseTime);
                
            }
            function speedJoggerDeactivated()
            {
                clearInterval(speedJoggerInterval);
            }
         
            
            scope.runCommand = function (gcode, runSilient) {
                    
                    scope.writeLog(gcode);
                    smoothierest.postGcode(gcode).then(function (response) {
                        var responses = response.split("\n");
                        for (var i = 0; i < responses.length; i++) {
                            scope.writeLog(response[i]);
                        }
                    }, function (failure) {
                        scope.writeLog("Could not complete command due to error");
                    });

                    
                    }
            scope.writeLog = function (message)
            {
                console.log(message);
                if (scope.commandLog.length > 9)
                scope.commandLog.pop();
                scope.commandLog.push({timestamp:Date.now(), message: message });

             
                
            }
            scope.Init = function()
            {
                CreateNipple();
            }
            scope.Init();
        }]
        
    });
   module.component('jogDial', {
       template: '<img  ng-src="Content/images/knob2.png"width="200" height="200" style="-webkit-user-select: none;">',
       bindings:{
           onDrag: '&',
           onDragEnd: '&'
       },
       controller: function($rootScope,$scope,$element)
       {
          var _scope = this;
          var dial = $element[0].children[0];
          _scope.draggable = Draggable.create(dial, {

               type: "rotation",

               // throwProps (ONLY TWEENMAX PREMIUM): enables kinetic-based flicking (continuation of movement, decelerating after releasing the mouse/finger)
               throwProps: false,


               onDrag: function () {

                   _scope.rotation = this.rotation;

                   $scope.$apply(function () {
                       _scope.onDrag({ rotation: _scope.rotation })
                   });

               },

               onDragEnd: function () {

                   _scope.rotation = this.rotation;

                   $scope.$apply(function () {
                       _scope.onDragEnd({ rotation: _scope.rotation })
                   });
               }

           });

           
       }
   })

   module.component('jobPanel', {
       templateUrl: 'templates/JobPanel.html',
       controller: ['$scope','smoothierest', 'FileUploader', function ($scope,smoothierest, FileUploader) {
            
          this.uploader = $scope.uploader = new FileUploader({
              url: '/upload'
           });
           
           
           // FILTERS

           $scope.uploader.filters.push({
               name: 'customFilter',
               fn: function (item /*{File|FileLikeObject}*/, options) {
                   return this.queue.length < 10;
               }
           });
          
           // CALLBACKS

           $scope.uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
               console.info('onWhenAddingFileFailed', item, filter, options);
           };
           $scope.uploader.onAfterAddingFile = function (fileItem) {
               fileItem.headers = { 'X-Filename': fileItem.file.name };
               console.info('onAfterAddingFile', fileItem);
           };
           $scope.uploader.onAfterAddingAll = function (addedFileItems) {
               console.info('onAfterAddingAll', addedFileItems);
           };
           $scope.uploader.onBeforeUploadItem = function (item) {
              
               console.info('onBeforeUploadItem', item);
           };
           $scope.uploader.onProgressItem = function (fileItem, progress) {
               console.info('onProgressItem', fileItem, progress);
           };
           $scope.uploader.onProgressAll = function (progress) {
               console.info('onProgressAll', progress);
           };
           $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
               console.info('onSuccessItem', fileItem, response, status, headers);
           };
           $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
               console.info('onErrorItem', fileItem, response, status, headers);
           };
           $scope.uploader.onCancelItem = function (fileItem, response, status, headers) {
               console.info('onCancelItem', fileItem, response, status, headers);
           };
           $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
               console.info('onCompleteItem', fileItem, response, status, headers);
           };
           $scope.uploader.onCompleteAll = function () {
               console.info('onCompleteAll');
           };

           $scope.init = function()
           {
               $scope.files = smoothierest.getAllFiles().then(function (response)
               {
                   return ParseFiles(response);

               }, function (error) {
                   return ['Unable to check files']
               });

           }

           $scope.init();
           function ParseFiles(response)
           {
               var fileListArray = [];
               var fileList = response.split("\n");
               $.each(fileList, function (c) {
                   var e = this.trim;
                   if (e.match(/\.g(code)?$/)) {
                       fileListArray.push(e);
                   }
               });

               return fileListArray;
           }
       }]
   });
   module.factory('smoothierest', function ($http) {
       var service = {
           postGcode: function (gcode) {
               var url = "/command";
               gcode += "\n";
              return $http.post(url, gcode);
           },
           getCurrentPosition:function()
           {
           
           },
           getAllFiles:function()
           {
              var url = "/command";
              return $http.post(url, "M20");
              // return [{ filename: "test.gcode" }, { filename: "test2.gcode" }, { filename: "test3.gcode" }];
           },
          
           playFile:function(file)
           {

           },
           motorsOff: function () {
              return this.postGcode("M18");
           }
           ,
       }
       return service;
   });