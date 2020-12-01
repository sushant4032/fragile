var app = angular.module("myApp", []);
app.controller("myController", function ($scope, $http) {



    $scope.crushers = ['Crusher-01', 'Crusher-02', 'Crusher-03'];
    $scope.shovels = ['P&H-06', 'P&H-07', 'P&H-09', 'P&H-10',
        'P&H-11', 'P&H-12', 'P&H-13', 'P&H-14', 'P&H-15',
        'P&H-16', 'P&H-17', 'P&H-18', 'P&H-19', 'HIM-20', 'PC-TATA', 'PL-06', 'PL-07', 'SM-L&T'];
    $scope.draglines = ['Jyoti', 'Pawan', 'Vindhya', 'Jwala'];
    $scope.machines = [];
    $scope.types = ['crusher', 'shovel', 'dragline'];
    $scope.statusCodes = [0, 1, 2];
    $scope.statusStrings = ['Idle', 'Running', 'BreakDown'];
    $scope.time = new Date().getTime();
    $scope.changed = false;
    $scope.pin = "";
    $scope.auth = false;
    $scope.user = "Guest";
    $scope.status = "Please user PIN:1234 to login as Viewpoint";

    presentShift()
    sync();
    setInterval(sync, 15000);

    function presentShift() {
        var a = new Date(2019, 9, 5, 5, 0, 0, 0);
        var b = a.getTime();
        var c = new Date().getTime();
        var d = Math.floor((c - b) / (8 * 3600 * 1000));
        var e = b + d * (8 * 3600 * 1000);
        $scope.start = e;
     }

    class Machine {
        constructor(name, type) {
            this.name = name;
            this.type = type;
            this.status = 0;
            this.remark = "";
        }

        get = function () {
            var k = {
                name: this.name,
                type: this.type,
                status: this.status
            }
        }
        change = function (status, remark) {
            this.status = status;
            this.ramark = remark;
        }
    }


    angular.forEach($scope.crushers, function (x, i) {
        var k = new Machine(x, 'crusher');
        $scope.machines.push(k);
    })
    angular.forEach($scope.shovels, function (x, i) {
        var k = new Machine(x, 'shovel');
        $scope.machines.push(k);
    })
    angular.forEach($scope.draglines, function (x, i) {
        var k = new Machine(x, 'dragline');
        $scope.machines.push(k);
    })



    $scope.update = function () {
        $scope.changed = true;
    }

    $scope.login = function () {
        if ($scope.pin == "1234") {
            $scope.user = "Viewpoint";
            $scope.auth = true;
        }
        else if ($scope.pin == "1111") {
            $scope.user = "Admin";
            $scope.auth = true;
        }
        else {
            $scope.pin = ""
        }

    }

    function sync() {
        if ($scope.changed) {
            upload();
        }
        else {
            download();
        }
    }

    function download() {
        var payload = {};
        var req = {
            method: 'POST',
            url: 'https://sushanttiwari.in/serv/downLive.php',
            headers: {
                'Content-Type': undefined
            },
            data: payload
        };

        $http(req).then(
            function (res) {
                var a = res.data;
                var b = a.indexOf('{');
                var c = a.lastIndexOf('}');
                var d = a.slice(b, c + 1);
                var e = JSON.parse(d);
                var stamp = e.stamp;
                var f = new Date(stamp);
                var hh = f.getHours();
                var mm = f.getMinutes();
                var ss = f.getSeconds();
                var t = hh + ':' + mm + ':' + ss;
                var machines = e.machines;
                $scope.machines = machines;
                console.log(e.user + ' @ ' + t);
        


                if (stamp < $scope.start) {
                    resetIdle();
                }
            },
            function () {
                console.log("fetch failed");
            })
    }

    function upload() {
        $scope.obj = {
            user: $scope.user,
            stamp: new Date().getTime(),
            machines: $scope.machines
        };

        $scope.objString = JSON.stringify($scope.obj);
        var payload = { 'str': $scope.objString };
        console.log(JSON.parse(payload.str));
        var req = {
            method: 'POST',
            url: 'https://sushanttiwari.in/serv/upLive.php',
            headers: {
                'Content-Type': undefined
            },
            data: payload
        };

        $http(req).then(
            function (res) {
                var a = res.data;
                var b = a.indexOf('{');
                var c = a.lastIndexOf('}');
                var d = a.slice(b, c + 1);
                var e = JSON.parse(d);
                console.log(e);

                $scope.changed = false;  
            },
            function () {
                console.log("upload failed");
            })
    }

    function resetIdle() {
        angular.forEach($scope.machines, function (x, i) {
            if (x.status == 1) {
                x.status = 0;
                x.remark = "";
            }
        });
        $scope.changed=true;
    }
});  