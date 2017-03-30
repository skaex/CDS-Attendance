angular.module('starter.controllers', [])
.controller('NewMembersCtrl', function($scope, $ionicPlatform, $cordovaBarcodeScanner, $stateParams, scannerFactory, databaseFactory, memberFactory) {
  $scope.exist = false;
  $scope.show = false;
  $scope.member = '';
  $scope.new = false;

  $scope.newMember = function() {
    $scope.show = true;
    $scope.member = '';
    var group = parseInt($stateParams.id, 10);
    $ionicPlatform.ready(function() {
      $cordovaBarcodeScanner
      .scan()
      .then(function(barcodeData) {
        if (barcodeData.text !== '') {
          $scope.member = barcodeData.text;
          $scope.exist = memberFactory.doesExist(databaseFactory.getData(), $scope.member, group);
          $scope.new = !$scope.exist;
          if ($scope.exist === false) {
            databaseFactory.storeData(
              memberFactory.storeMember(
                databaseFactory.getData(), 
                $scope.member, 
                group
              )
            );
          }
        }
      }, function(error) {
        alert("There was an\n" +
                  "Error: " + error.text + "\n");
      });
    });
    
    
  }
})
.controller('MeetingCdsCtrl', function($scope, cdsGroupFactory, databaseFactory) {
  $scope.groups = [];
  var getGrps = function () {
    $scope.groups = cdsGroupFactory.getGroups(databaseFactory.getData());
  }
  getGrps();

})
.controller('NewCtrl', function($scope, $rootScope, $stateParams, $ionicModal, databaseFactory, cdsFactory) {
 // Form data for the login modal
  $scope.newMeetingData = {};
  $scope.grp = parseInt($stateParams.id, 10);

  var state = databaseFactory.getState();
  if (state) {
    if (state.groupId === parseInt($scope.grp)) {
      $scope.showPrevious = true;
    } else {
      $scope.showPrevious = false;
    }
  } else {
    $scope.showPrevious = false;
  }

  $rootScope.$on('attendance:started', function (event) {
    $scope.showPrevious = true;
  });

  $rootScope.$on('attendance:finished', function (event) {
    $scope.showPrevious = false;
  });
  
  $scope.showExists = false;

  $rootScope.$on('attendance:exists', function (event) {
    $scope.showExists = true;
    alert('The meeting already exists!');
  });

  $rootScope.$on('attendance:added', function (event) {
    $scope.showExists = false;
    alert('Meeting successfully added!');
  });
  
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/new-meeting.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeNewMeeting = function() {
    $scope.newMeetingData = {};
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.newMeeting = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.startNewMeeting = function() {
    // Store it in the db
    databaseFactory.storeData(
      cdsFactory.storeMeeting(
        databaseFactory.getData(), 
        $scope.newMeetingData.meetingDate, 
        $scope.grp
      )
    );
    // Store the state of the meeting as started
    if (!$scope.showExists) {
      databaseFactory.storeState(
        cdsFactory.startMeeting(
          databaseFactory.getState(),
          $scope.newMeetingData.meetingDate,
          $scope.grp
        )
      );
    }


    $scope.newMeetingData = {}
    $scope.modal.hide();
  };
  

})

.controller('AttendanceCtrl', function($scope, $ionicPlatform, $state, $window, $ionicHistory, $rootScope, $stateParams, $cordovaBarcodeScanner, cdsGroupFactory,  attendanceFactory, $ionicPopup, storageFactory, databaseFactory, scannerFactory) {
  $scope.meeting = databaseFactory.getState();
  $scope.group = cdsGroupFactory.getGroup(databaseFactory.getData(), $scope.meeting.groupId);
  $scope.response = {};
  
  $scope.confirmFinish = function() {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Finish meeting',
     template: 'Are you sure you want to end this meeting? You can no longer take any more attendance if you end the meeting.'
   });

   confirmPopup.then(function(res) {
     if(res) {
       databaseFactory.clearState();
       $ionicHistory.nextViewOptions({
          disableBack: true
       });
       $state.go('tab.meetgrp');
       // console.log('Exporta!');
     } else {
       console.log('Oops!');
     }
   });
 };
 $scope.existing = false;
 $scope.nomember = false;
 $scope.details = '';

 $rootScope.$on('memberattendance:exists', function (event) {
    $scope.nomember = false;
    $scope.existing = true;
  });
 $rootScope.$on('memberattendance:nomember', function (event) {
    $scope.existing = false;
    $scope.nomember = true;
  });
  $scope.take = function() {
    $ionicPlatform.ready(function() {
      $cordovaBarcodeScanner
      .scan()
      .then(function(barcodeData) {
        if (barcodeData.text !== '') {
          $scope.details = barcodeData.text;

          databaseFactory.storeData(
            attendanceFactory.recordAttendance(
              databaseFactory.getData(),
              databaseFactory.getState(),
              $scope.details
            )
          );
        }
      }, function(error) {
        alert("There was an\n" +
                  "Error: " + error.text + "\n");
      });
    });
    

  }
})

.controller('NewCdsCtrl', function($scope, $rootScope, $ionicHistory, $ionicModal, $ionicPlatform, $ionicPopup, cdsGroupFactory, generalFactory, databaseFactory) {
  $ionicHistory.clearHistory();
  $ionicHistory.clearCache();

  $scope.newGroupData = {};
  
  $scope.confirmReset = function() {
   var confirmPopup = $ionicPopup.confirm({
     title: 'RESET APP?',
     template: 'Are you sure you want to reset this app? This action will cause lost of data and cannot be reversed'
   });

   confirmPopup.then(function(res) {
     if(res) {
       generalFactory.reset();
       alert('Reset successful!');
       $rootScope.$emit('app:reset');
     } else {
       console.log('Oops!');
     }
   });
 };
  $ionicModal.fromTemplateUrl('templates/new-group.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $rootScope.$on('app:reset', function (event) {
    $scope.groups = [];
    $scope.grpexists = false;
  });

  $scope.groups = [];
  $scope.grpexists = false
  $rootScope.$on('group:exists', function (event) {
    $scope.grpexists = true;
    alert("The group already exist");
  });
  
  var getGrps = function () {
    $scope.groups = cdsGroupFactory.getGroups(databaseFactory.getData());
  }
  getGrps();
  $scope.closeNewGroup = function() {
    $scope.newGroupData = {};
    $scope.modal.hide();
  };

  $scope.newGroup = function() {
    $scope.modal.show();
  };

  $scope.createNewGroup = function() {
    $scope.newGroupData.cdsGroup = $scope.newGroupData.cdsGroup.toUpperCase();
    databaseFactory.storeData(cdsGroupFactory.createGroup(
      databaseFactory.getData(), 
      $scope.newGroupData.cdsGroup
    ));
    $scope.newGroupData = {}
    $scope.modal.hide();
    getGrps();
  };
  $scope.refresh = function () {
    getGrps();
    $scope.grpexists = false
    $scope.$broadcast('scroll.refreshComplete');
  };

})
.controller('GroupReportCtrl', function ($scope, $stateParams, $ionicPlatform, $cordovaFile, $window, databaseFactory, reportsFactory, cdsGroupFactory) {
  $scope.query = "";
  var cdgroup = cdsGroupFactory.getGroup(databaseFactory.getData(), parseInt($stateParams.id, 10));
  $scope.reports = reportsFactory.getReports(databaseFactory.getData(), parseInt($stateParams.id, 10));
  $scope.export = function (data) {
    var str = cdgroup + "  CDS Report\r\n";
    for (var k = 0; k < data.length; k++ ) {
      str += data[k].name + ', ' + data[k].times;
      for (var ij = 0; ij < data[k].adates.length; ij++) {
        str +=  ', ' + data[k].adates[ij];
      }
      str += '\r\n';
      
    }
    $ionicPlatform.ready(function() {
      $cordovaFile.writeFile(cordova.file.externalRootDirectory, 'cds.csv', str , true)
      .then(function (success) {
        $cordovaFile.writeFile(cordova.file.externalRootDirectory, 'cds.txt', str , true)
      .then(function (success) {
        alert('It is done!');
      }, function (error) {
        alert('There was an error in making txt!');
      });
      }, function (error) {
        alert('There was an error in making csv!');
      });
    })
  };


})
.controller('ReportCdsGrpsCtrl', function($scope, databaseFactory, cdsGroupFactory) {
  $scope.groups = [];

  var getGrps = function () {
    $scope.groups = cdsGroupFactory.getGroups(databaseFactory.getData());
  };
  getGrps();
  $scope.refresh = function () {
    getGrps();
    $scope.$broadcast('scroll.refreshComplete');
  }
});
