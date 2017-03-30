angular.module('starter.services', [])
.factory('storageFactory', function($window){
  var storagef = {};

  storagef.getStoredAttendance = function() {
    return JSON.parse($window.localStorage['cdsAttendance'] || false);
  };

  storagef.storeAttendance = function(data) {
    $window.localStorage['cdsAttendance'] = JSON.stringify(data);
  }

  return storagef;
})
.factory('databaseFactory', function($window){
  var dbKey = 'DatabaseData';
  var appKey = 'AppData';
  return {
    storeData: function(value) {
      $window.localStorage[dbKey] = JSON.stringify(value);
    },
    getData: function() {
      return JSON.parse($window.localStorage[dbKey] || '{}');
    },
    storeState: function(value) {
      $window.localStorage[appKey] = JSON.stringify(value);
    },
    getState: function() {
      return JSON.parse($window.localStorage[appKey] || '{}');
    },
    clearState: function() {
      $window.localStorage[appKey] = null;
    }
  };
})
.factory('generalFactory', function($window) {
  return {
    reset: function() {
      $window.localStorage.clear();
      console.log('Reset!');
    }
  };
})
.factory('meetingFactory', function($cordovaFile, $window) {
  var meetingFac = {};
  meetingFac.startNew = function(grp, date) {
    // store in local storage.
    $window.localStorage['cdsAttendance'] = JSON.stringify({
      meetingGroup: grp,
      meetingDate: date,
      attendances: []
    });

  };
  return meetingFac;
})
.factory('cdsFactory', function($rootScope) {
  return {
    storeMeeting: function(databaseObj, data, groupId) {
      for (var i = 0; i < databaseObj.cdsgroups.length; i++) {
        if (databaseObj.cdsgroups[i].id === groupId) {
          for (var j = 0; j < databaseObj.cdsgroups[i].meetings.length; j++) {
            if (databaseObj.cdsgroups[i].meetings[j] === data.toISOString()){
              $rootScope.$emit('attendance:exists');
              return databaseObj
            }
          }
          databaseObj.cdsgroups[i].meetings.push(data);
          $rootScope.$emit('attendance:added');
          break;
        }
      }
      return databaseObj;
    },
    startMeeting: function(stateObj, data, groupId) {
      $rootScope.$emit('attendance:started');
      return {
        groupId: groupId,
        meetingDate: data
      };
    }
  };
})
.factory('cdsGroupFactory', function($ionicPlatform, $rootScope) {
  var cdsfac = {};
  
  cdsfac.getGroups = function(databaseObj){
    return databaseObj.cdsgroups || [];
  }
  cdsfac.getGroup = function(databaseObj, groupId) {
    for (var i = 0; i < databaseObj.cdsgroups.length; i++) {
      if (databaseObj.cdsgroups[i].id === groupId) {
        return databaseObj.cdsgroups[i].cds;
      }
    }
    return null;
  }
  cdsfac.createGroup = function(databaseObj, data) {
    var cdsObj = {
      cds: data,
      members: [],
      meetings: [],
    };
    if (databaseObj.cdsgroups) {
      for (var i = 0; i < databaseObj.cdsgroups.length; i++) {
        if (databaseObj.cdsgroups[i].cds === data) {
          $rootScope.$emit('group:exists');
          return databaseObj;
        }
      }
      cdsObj.id = databaseObj.cdsgroups.length + 1;
      databaseObj.cdsgroups.push(cdsObj);
      
    } else {
      cdsObj.id = 1;
      databaseObj.cdsgroups = [cdsObj,];
    }
    return databaseObj;
  }
  return cdsfac;
})
.factory('memberFactory', function() {
  return {
    storeMember: function(databaseObj, data, groupId) {
      for (var i = 0; i < databaseObj.cdsgroups.length; i++) {
        if (databaseObj.cdsgroups[i].id === groupId) {
          databaseObj.cdsgroups[i].members.push({
            details: data,
            attendances:[]
          });
          break;
        }
      }
      return databaseObj;
    },
    doesExist: function(databaseObj, data, groupId){
      for (var i = 0; i < databaseObj.cdsgroups.length; i++) {
        if (databaseObj.cdsgroups[i].id === groupId) {
          for (var j = 0; j < databaseObj.cdsgroups[i].members.length; j++)
          {
            if (databaseObj.cdsgroups[i].members[j].details === data) {
              return true;
            }
          }
          return false;
        }
      }
    }
  };
})
.factory('scannerFactory', function(){
  return {
    captureDetails: function() {
      return 'FC/16A/5973-HAMZA-ABDULMAJID-SADIQ';
    }
  };
  // $ionicPlatform.ready(function() {
  //     $cordovaBarcodeScanner
  //     .scan()
  //     .then(function(barcodeData) {
  //       if (barcodeData.text !== '') {
  //         $scope.response = attendanceFactory.recordAttendance(barcodeData.text);
  //       }
  //       $scope.attendance = storageFactory.getStoredAttendance();
  //       $scope.counta = $scope.attendance.attendances.length;
  //     }, function(error) {
  //       alert("There was an\n" +
  //                 "Error: " + error.text + "\n");
  //     });
  //   });
})
.factory('reportsFactory', function() {
  return {
    getReports: function(databaseObj, groupId) {
      var res = [];
      for (var i = 0; i < databaseObj.cdsgroups.length; i++) {
      
        if (databaseObj.cdsgroups[i].id === groupId) {
          for (var j = 0; j < databaseObj.cdsgroups[i].members.length; j++) {
            var member = databaseObj.cdsgroups[i].members[j];
            
            res.push({
              name: member.details,
              times: member.attendances.length,
              adates: member.attendances
            })
          }
          break;
          return res;
        }
      }
      return res;
    }
  }
})
.factory('attendanceFactory', function($window, $ionicPlatform, $cordovaFile, $rootScope) {
  var attendanceFac = {};
  attendanceFac.recordAttendance = function(databaseObj, stateObj, data) {
    for (var i = 0; i < databaseObj.cdsgroups.length; i++) {
      if (databaseObj.cdsgroups[i].id === stateObj.groupId) {
        for (var j = 0; j < databaseObj.cdsgroups[i].members.length; j++) {
          if (databaseObj.cdsgroups[i].members[j].details === data) {
            if (databaseObj.cdsgroups[i].members[j].attendances.indexOf(stateObj.meetingDate) === -1) {
              databaseObj.cdsgroups[i].members[j].attendances.push(stateObj.meetingDate);
              $rootScope.$emit('memberattendance:taken');
            } else {
              $rootScope.$emit('memberattendance:exists');        
            }
            return databaseObj;
          }
        }
        $rootScope.$emit('memberattendance:nomember');
        break;
      }
    }
    return databaseObj;
  }

  return attendanceFac;
});
