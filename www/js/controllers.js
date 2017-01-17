angular.module('starter.controllers', [])

.controller('NewCtrl', function($scope, $state, $window, $ionicModal, meetingFactory) {
 // Form data for the login modal
  $scope.newMeetingData = {};

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
    $scope.newMeetingData.cdsGroup = $scope.newMeetingData.cdsGroup.toUpperCase();
    $scope.slug = meetingFactory.startNew($scope.newMeetingData);
    //console.log('Starting new meeting', $scope.newMeetingData);
    
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
  } 
})

.controller('AttendanceCtrl', function($scope, $ionicPlatform, $state, $window, $stateParams, $cordovaBarcodeScanner,  attendanceFactory, $ionicPopup) {
  $scope.attendance = JSON.parse($window.localStorage['cdsAttendance'] || false);
  if ($scope.attendance == false) {
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
       $state.go('tab.new');
       console.log('Exporta!');
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

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
