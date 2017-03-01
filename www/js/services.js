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
.factory('generalFactory', function($ionicPlatform, $window) {
  var generalFac = {};

  generalFac.reset = function() {
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
      }, function() {
        $window.localStorage.clear();
        console.log('Reset!');
        alert("Reset Successful!");
      });
    });
  };

  return generalFac;
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
.factory('cdsFactory', function($ionicPlatform) {
  var cdsfac = {};
  // The function below won't work due to some javascript nonsense.
  cdsfac.getGroups = function(){
    $ionicPlatform.ready(function() {
      var db = window.sqlitePlugin.openDatabase({name: 'cds.db', location: 'default'});
      var objs = [];
      db.executeSql('SELECT * FROM cdsgroups', [], function(rs) {
        for (var i = 0; i < rs.rows.length; i++) {
          objs.push(rs.rows.item(i));
        }
        return objs;   
      }, function(error) {
        alert("Error: " + error.message);
        console.log('SELECT SQL statement ERROR: ' + error.message);
        return [];
      });
    });
  }
  cdsfac.createGroup = function(data) {
    $ionicPlatform.ready(function() {
      var db = window.sqlitePlugin.openDatabase({name: 'cds.db', location: 'default'});
      db.transaction(function(tx) {
        //tx.executeSql('DROP TABLE cdsgroups');
        tx.executeSql('CREATE TABLE IF NOT EXISTS cdsgroups(ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT NOT NULL UNIQUE)');
        tx.executeSql('INSERT INTO cdsgroups (NAME) VALUES (?)', [data]);
      }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
        alert('ERROR: ' + error.message);
      }, function() {
        console.log('Populated database OK');
      });
    });
  }
  return cdsfac;
})
.factory('attendanceFactory', function($window, $ionicPlatform, $cordovaFile, $rootScope) {
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
    var datea = attends.meetingDate;
    var grp = parseInt(attends.meetingGroup, 10);
    $ionicPlatform.ready(function() {
      var db = window.sqlitePlugin.openDatabase({name: 'cds.db', location: 'default'});
      db.transaction(function(tx) {
        //tx.executeSql('DROP TABLE cdsgroups');
        tx.executeSql('CREATE TABLE IF NOT EXISTS cdsattendances(ID INTEGER PRIMARY KEY AUTOINCREMENT, CDSGROUP INTEGER NOT NULL, CORPER TEXT, DATE TEXT)');
        for (var i = 0; i < arr.length; i++) {
          tx.executeSql('INSERT INTO cdsattendances (CDSGROUP, CORPER, DATE) VALUES (?, ?, ?)', [grp, arr[i], datea]);
        }
      }, function(error) {
        alert('Error: ' + error.message);
        console.log('Transaction ERROR: ' + error.message);
        alert('ERROR: ' + error.message);
      }, function() {
        $window.localStorage.clear();
        $rootScope.$emit('attendance:finished');
        console.log('Populated database OK');
      });
    });

  }
  return attendanceFac;
});
