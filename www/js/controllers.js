angular.module('starter.controllers', [])

.controller('NewCtrl', function($scope, $state, $window, $stateParams, $ionicHistory, $ionicModal, meetingFactory) {
 // Form data for the login modal
  $scope.newMeetingData = {};
  $scope.grp = $stateParams.id;
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
    //$scope.slug = meetingFactory.startNew($scope.grp, $scope.newMeetingData.meetingDate);
    //console.log('Starting new meeting', $scope.newMeetingData);
    $window.localStorage['cdsAttendance'] = JSON.stringify({
      meetingGroup: $scope.grp,
      meetingDate: $scope.newMeetingData.meetingDate,
      attendances: []
    });
    // Do something interesting here.

    $scope.newMeetingData = {}
    $scope.modal.hide();
    $state.go('tab.attendance');
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    // $timeout(function() {
    //   $scope.closeLogin();
    // }, 1000);
  };
  $scope.goToAttendance = function() {
    $state.go('tab.attendance');
  };

  //parseInt($stateParams.id,10);
  //var attendance = JSON.parse($window.localStorage['cdsAttendance'] || false);
  var groupobj = {};
  // $ionicPlatform.ready(function() {
  //     var db = window.sqlitePlugin.openDatabase({name: 'cds.db', location: 'default'});
  //     db.executeSql('SELECT * FROM cdsgroups WHERE ID = ?', [ parseInt($stateParams.id,10) ], function(rs) {
  //       groupobj = rs.rows.item(0)
  //     }, function(error) {
  //       alert("Error: " + error.message);
  //       console.log('SELECT SQL statement ERROR: ' + error.message);
  //     });
  //   });
  // if(!attendance) {
  //   attendance = JSON.stringify({
  //     meeting: {},
  //     attendances: []
  //   });
  // } else {
  //   // Decide if to clear the attendances.
  //   attendance.meeting.cdsGroup = groupobj;
  // }

})

.controller('AttendanceCtrl', function($scope, $ionicPlatform, $state, $window, $ionicHistory, $stateParams, $cordovaBarcodeScanner,  attendanceFactory, $ionicPopup) {
  $scope.attendance = JSON.parse($window.localStorage['cdsAttendance'] || false);
  if ($scope.attendance == false) {
    $ionicHistory.clearHistory();
    $state.go('tab.new');
  }

  if ($scope.attendance) {
    $scope.counta = $scope.attendance.attendances.length;
  }
  $scope.response = {};
  $scope.confirmFinish = function() {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Finish meeting',
     template: 'Are you sure you want to end this meeting? You can no longer take any more attendance if you end the meeting.'
   });

   confirmPopup.then(function(res) {
     if(res) {
       attendanceFactory.finish();
       $ionicHistory.clearHistory();
       $state.go('tab.newgrp');
       // console.log('Exporta!');
     } else {
       console.log('Oops!');
     }
   });
 };
  $scope.take = function() {
    $ionicPlatform.ready(function() {
      $cordovaBarcodeScanner
      .scan()
      .then(function(barcodeData) {
        $scope.response = attendanceFactory.recordAttendance(barcodeData.text);
        $scope.attendance = JSON.parse($window.localStorage['cdsAttendance'] || false);
        $scope.counta = $scope.attendance.attendances.length;
      }, function(error) {
        alert("There was an\n" +
                  "Error: " + error.text + "\n");
      });
    });
  }
})

.controller('NewCdsCtrl', function($scope, $window, $state, $ionicModal, $ionicPlatform, $ionicPopup, cdsFactory) {
  $scope.newGroupData = {};
  $scope.confirmReset = function() {
   var confirmPopup = $ionicPopup.confirm({
     title: 'RESET APP?',
     template: 'Are you sure you want to reset this app? This action will cause lost of data and cannot be reversed'
   });

   confirmPopup.then(function(res) {
     if(res) {
       $ionicPlatform.ready(function() {
          var db = window.sqlitePlugin.openDatabase({name: 'cds.db', location: 'default'});
          db.transaction(function(tx) {
            tx.executeSql('DROP TABLE cdsgroups');
            tx.executeSql('DROP TABLE cdsattendances');
            tx.executeSql('CREATE TABLE IF NOT EXISTS cdsgroups(ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT NOT NULL UNIQUE)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS cdsattendances(ID INTEGER PRIMARY KEY AUTOINCREMENT, CDSGROUP INTEGER NOT NULL, CORPER TEXT, DATE TEXT)');
          }, function(error) {
            alert('Error: ' + error.message);
            console.log('Transaction ERROR: ' + error.message);
            alert('ERROR: ' + error.message);
          }, function() {
            $window.localStorage.clear();
            console.log('Reset!');
            alert("Reset Successful!");
            $state.go('tab.newgrp');
          });
        });
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
  $scope.groups = [];

  var getGrps = function () {
  $ionicPlatform.ready(function() {
      $scope.groups = [];
      var db = window.sqlitePlugin.openDatabase({name: 'cds.db', location: 'default'});
      db.executeSql('SELECT * FROM cdsgroups ORDER BY ID DESC', [], function(rs) {
        for (var i = 0; i < rs.rows.length; i++) {
          $scope.groups.push(rs.rows.item(i));
        } 
      }, function(error) {
        alert("Error: " + error.message);
        console.log('SELECT SQL statement ERROR: ' + error.message);
      });
    });
}
getGrps();
  //$scope.groups = cdsFactory.getGroups();
  //alert($scope.groups);
  $scope.closeNewGroup = function() {
    $scope.newGroupData = {};
    $scope.modal.hide();
  };

  $scope.newGroup = function() {
    $scope.modal.show();
  };

  $scope.createNewGroup = function() {
    $scope.newGroupData.cdsGroup = $scope.newGroupData.cdsGroup.toUpperCase();
    cdsFactory.createGroup($scope.newGroupData.cdsGroup);
    $scope.newGroupData = {}
    $scope.modal.hide();
    getGrps();
  };
  $scope.refresh = function () {
    getGrps();
    $scope.$broadcast('scroll.refreshComplete');
  };

})
.controller('GroupReportCtrl', function ($scope, $stateParams, $ionicPlatform, $cordovaFile, $window) {
  $scope.reports = [];
  $scope.query = "";
  $ionicPlatform.ready(function() {
      var db = window.sqlitePlugin.openDatabase({name: 'cds.db', location: 'default'});
      db.executeSql('SELECT CORPER, count(*) ATTENDANCE_COUNT from cdsattendances where CDSGROUP=? group by CORPER', [$stateParams.id], function(rs) {
        for (var i = 0; i < rs.rows.length; i++) {
          var cor = {
            name: '',
            times: 0,
            adates: []
          };
          //alert(rs.rows.item(i).CORPER);
          db.executeSql('SELECT DATE from cdsattendances where CDSGROUP=? and CORPER=?', [$stateParams.id, rs.rows.item(i).CORPER], function(rsi) {
            for (var j = 0; j < rsi.rows.length; j++) {
              cor.adates.push(rsi.rows.item(j));
            }
          });
          cor.name = rs.rows.item(i).CORPER;
          cor.times = rs.rows.item(i).ATTENDANCE_COUNT;
          $scope.reports.push(cor);
        } 
      }, function(error) {
        alert("Error: " + error.message);
        console.log('SELECT SQL statement ERROR: ' + error.message);
      });
    });
  $scope.export = function (data) {
    var str = "";
    for (var k = 0; k < data.length; k++ ) {
      str += data[k].name + ', ' + data[k].times;
      for (var ij = 0; ij < data[k].adates.length; ij++) {
        str +=  ', ' + data[k].adates[ij].DATE;
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
.controller('ReportCdsGrpsCtrl', function($scope, $ionicPlatform) {
  $scope.groups = [];

  var getGrps = function () {
    $ionicPlatform.ready(function() {
      $scope.groups = [];
      var db = window.sqlitePlugin.openDatabase({name: 'cds.db', location: 'default'});
      db.executeSql('SELECT * FROM cdsgroups ORDER BY ID DESC', [], function(rs) {
        for (var i = 0; i < rs.rows.length; i++) {
          $scope.groups.push(rs.rows.item(i));
        } 
      }, function(error) {
        alert("Error: " + error.message);
        console.log('SELECT SQL statement ERROR: ' + error.message);
      });
    });
  };
  getGrps();
  $scope.refresh = function () {
    getGrps();
    $scope.$broadcast('scroll.refreshComplete');
  }
});
