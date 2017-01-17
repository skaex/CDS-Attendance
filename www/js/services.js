angular.module('starter.services', [])
.factory('meetingFactory', function($cordovaFile, $window) {
  var meetingFac = {};
  meetingFac.startNew = function(data) {
    // return slug.
    var slug = data.cdsGroup + '-' + 'GROUP' + '-' + data.meetingDate;
    // store in local storage.
    $window.localStorage['cdsAttendance'] = JSON.stringify({
      meeting: data,
      attendances: []
    });

    return slug;
  };
  return meetingFac;
})
.factory('attendanceFactory', function($window, $ionicPlatform, $cordovaFile) {
  var attendanceFac = {};
  attendanceFac.recordAttendance = function(data) {
    var result = {
      exist: false,
      entry: data,
    };
    var attends = JSON.parse($window.localStorage['cdsAttendance']);
    if (attends.attendances.indexOf(data) === -1) {
      attends.attendances.push(data);
    } else {
      result.exist = true;
    }
    $window.localStorage['cdsAttendance'] = JSON.stringify(attends);
    return result;
  }
  attendanceFac.finish = function() {
    var attends = JSON.parse($window.localStorage['cdsAttendance']);
    var arr = attends.attendances;
    var datea = new Date(attends.meeting.meetingDate);
    datea = datea.getDate() + '-' + (datea.getMonth() + 1) + '-' + datea.getFullYear();
    var filename = 'CDS-ATTENDANCE-' + attends.meeting.cdsGroup + '-' + datea;
    //console.log(datea);
    var str = 'Attendance for ' + attends.meeting.cdsGroup + ' ' + datea + '\r\n';

    for (var i = 0; i < arr.length; i++) {
        str += arr[i] + '\r\n';
    }
    //console.log(str);
    $ionicPlatform.ready(function() {
      $cordovaFile.writeFile(cordova.file.externalDataDirectory, filename + '.csv', str , true)
      .then(function (success) {
        $cordovaFile.writeFile(cordova.file.externalDataDirectory, filename + '.txt', str , true)
      .then(function (success) {
        $window.localStorage.clear();
        alert('It is done!');
      }, function (error) {
        alert('There was an error in making txt!');
      });
      }, function (error) {
        alert('There was an error in making csv!');
      });
    });
  }
  return attendanceFac;
});
