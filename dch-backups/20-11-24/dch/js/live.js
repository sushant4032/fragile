var app = angular.module("myApp", []);
app.controller("myController", function ($scope, $http) {

    $scope.crusherNames = ['CRUSHER-1', 'CRUSHER-2', 'CRUSHER-3'];
    $scope.shovelNames = ['P&H-06', 'P&H-07', 'P&H-10',
        'P&H-11', 'P&H-12', 'P&H-13', 'P&H-14', 'P&H-15',
        'P&H-16', 'P&H-17', 'P&H-18', 'P&H-19', 'HIM-20', 'PC-TATA', 'KOMATSU-PC', 'LAXMAN-PC', 'PL-06', 'PL-07', 'SM-L&T'];
    $scope.draglineNames = ['JYOTI', 'PAWAN', 'VNDHYA', 'JWALA'];
    $scope.siloNames = ['OLD SILO', 'NEW SILO', 'WHARF WALL'];

    $scope.statusCodes = [0, 1, 2, 3];
    $scope.statusStrings = ['IDL', 'RNG', 'BDN', 'MNT', 'UDF'];


    $scope.machines = [];
    $scope.silos = [];
    $scope.dumper = {};
    $scope.dumpers = [];  // stores hourly snapshots of dumper objects.
    $scope.activeDumpers = [];
    $scope.dumperTotal = {};


    $scope.time = new Date().getTime();
    $scope.stamp = ""  // time of fetched status
    $scope.syncCounter = 0;

    $scope.pin = "";

    $scope.user = "Guest";
    $scope.status = "Please user PIN:1234 to login as Viewpoint";
    $scope.upUrl = 'https://sushanttiwari.in/dch/serv/upLive.php';
    $scope.downUrl = 'https://sushanttiwari.in/dch/serv/downLive.php';
    $scope.upUrl = 'serv/upLive.php';
    $scope.downUrl = 'serv/downLive.php';
    // $scope.upUrl = 'http://localhost:8080/dch/serv/upLive.php';
    // $scope.downUrl = 'http://localhost:8080/dch/serv/downLive.php';
    // $scope.upUrl = 'http://localhost/dch/serv/upLive.php';
    // $scope.downUrl = 'http://localhost/dch/serv/downLive.php';


    // GLOBALS /////
    $scope.block = 0;
    $scope.hour = 0;

    const blockWidth = 10;
    const totalBlocks = 8 * 60 / blockWidth;

    let downEv = null;
    let upEv = null;



    // CONFIGS ///////////////////////////////////
    $scope.auth = false;
    $scope.forceUpload = false;
    /////////////////////////////////////////////


    initialize();


    function initialize() {
        timeBlock();
        console.log('block:', $scope.block, '  hour:', $scope.hour);

        angular.forEach($scope.crusherNames, function (x, i) {
            var k = new Machine(x, 'crusher');
            $scope.machines.push(k);
        })
        angular.forEach($scope.shovelNames, function (x, i) {
            var k = new Machine(x, 'shovel');
            $scope.machines.push(k);
        })
        angular.forEach($scope.draglineNames, function (x, i) {
            var k = new Machine(x, 'dragline');
            $scope.machines.push(k);
        })
        angular.forEach($scope.siloNames, function (x, i) {
            var k = new Silo(x)
            $scope.silos.push(k);
        })

        $scope.dumper = new Dumper();

        angular.forEach($scope.machines, function (mach, i) {
            for (j = 0; j < totalBlocks; j++) {
                mach.logs[j] = 4;
            }
        })


        for (i = 0; i < 8; i++) {
            k = new Dumper(i);
            $scope.dumpers.push(k);
        }


        if ($scope.forceUpload) {
            upload();
        }
        else {
            download();
        }

        sync();

        setInterval(autoReloader, 4 * 3600 * 1000);
    }

    function timeBlock() {
        var a = new Date(2019, 9, 5, 5, 0, 0, 0);
        var b = a.getTime();
        var c = new Date().getTime();
        var d = Math.floor((c - b) / (8 * 3600 * 1000));
        var e = b + d * (8 * 3600 * 1000);
        $scope.start = e;
        $scope.block = Math.floor((c - e) / (blockWidth * 60 * 1000));
        $scope.hour = Math.floor((c - e) / (60 * 60 * 1000));

        // $scope.block = 30;
        // $scope.hour = 4;

    }



    function sync() {

        clearInterval(downEv);
        if ($scope.auth) {
            clearTimeout(upEv);
            upEv = setTimeout(upload, 5000);
        }
        downEv = setInterval(download, 30000);
    }

    function autoReloader() {
        location.reload();
    }

    $scope.update = function () {
        performanceLog();
        sync();
    }


    function download() {

        var payload = {};
        var req = {
            method: 'POST',
            url: $scope.downUrl,
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

                $scope.stamp = e.stamp;
                t = e.time;

                angular.forEach($scope.machines, function (x, i) {
                    x.set(e.machines[i]);
                    x.calculate();
                })
                angular.forEach($scope.silos, function (x, i) {
                    x.set(e.silos[i]);
                })
                angular.forEach($scope.dumpers, function (x, i) {
                    x.set(e.dumpers[i]);
                    x.calculate();
                })
                $scope.dumper.set(e.dumper);
                $scope.dumper.calculate();


                console.log('Downloaded..', e.stamp, 'By:' + e.user + ' @ ' + t);
                // console.log(e);
                if ($scope.stamp < $scope.start) {
                    console.log('Obsolete data detected.');
                    reset();
                }
                performanceLog();
            },
            function () {
                console.log("fetch failed");
            })
    }




    function upload() {

        let obj = {
            user: $scope.user,
            stamp: new Date().getTime(),
            time: new Date().toLocaleString(),
            machines: [],
            silos: [],
            dumpers: [],
            dumper: $scope.dumper.get()
        };
        console.log(obj);


        angular.forEach($scope.machines, function (x, i) {
            obj.machines.push($scope.machines[i].get());
        })
        angular.forEach($scope.silos, function (x, i) {
            obj.silos.push($scope.silos[i].get());
        })

        angular.forEach($scope.dumpers, function (x, i) {
            obj.dumpers.push($scope.dumpers[i].get());
        })

        let objString = JSON.stringify(obj);
        let payload = { 'str': objString };


        var req = {
            method: 'POST',
            url: $scope.upUrl,
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
                if (e.stamp == obj.stamp) {
                    console.log('Uploaded...', e.stamp);
                }
            },
            function () {
                console.log("upload failed....");
                sync();
            })
    }



    function reset() {
        angular.forEach($scope.machines, function (mach, i) {
            if (mach.status < 2) {
                mach.status = 0;
                mach.remark = "";
            }
            mach.logs = [];
            mach.logs[0] = mach.status;
            for (j = 1; j < totalBlocks; j++) {
                mach.logs[j] = 4;
            }
        });

        $scope.dumper = new Dumper();
        $scope.dumpers = [];
        for (i = 0; i < 8; i++) {
            $scope.dumpers[i] = new Dumper(i);
        }
        console.log('Reset...');
        performanceLog();

    }



    function performanceLog() {
        // console.log('logging................');
        timeBlock();


        angular.forEach($scope.machines, function (mach, i) {
            let valids = [0, 1, 2, 3];
            if (!valids.includes(mach.logs[0])) {
                mach.logs[0] = mach.status;
            }

            for (j = 1; j < $scope.block; j++) {
                if (!valids.includes(mach.logs[j])) {
                    mach.logs[j] = mach.logs[j - 1];
                }
            }

            mach.logs[$scope.block] = mach.status;

            for (j = $scope.block + 1; j < totalBlocks; j++) {
                mach.logs[j] = 4;
            }

            mach.calculate();

        });


        $scope.crushers = $scope.machines.filter(x => x.type == 'crusher');
        $scope.shovels = $scope.machines.filter(x => x.type == 'shovel');
        $scope.draglines = $scope.machines.filter(x => x.type == 'dragline');

        $scope.crusherTotal = new Machine('crusher total', 'crusher total');
        $scope.crusherTotal.add($scope.crushers);

        $scope.shovelTotal = new Machine('shovel total', 'shovel total');
        $scope.shovelTotal.add($scope.shovels);

        $scope.draglineTotal = new Machine('dragline total', 'dragline total');
        $scope.draglineTotal.add($scope.draglines);

        $scope.activeDumpers = $scope.dumpers.filter(x => x.hour <= $scope.hour);


        $scope.dumpers[$scope.hour].set($scope.dumper.get());
        angular.forEach($scope.dumpers, function (x, i) {
            x.calculate();
        })
        $scope.dumper.calculate();

        $scope.dumperTotal = new Dumper(10);
        $scope.dumperTotal.add($scope.activeDumpers);

        // $scope.graph('crusher');
        // $scope.graph('shovel');
        // $scope.graph('dragline');
        // $scope.graph('dumper');
    }



    $scope.graph = function (section) {

        obj = {
            crushers: JSON.parse(JSON.stringify($scope.crushers)),
            crusherTotal: JSON.parse(JSON.stringify($scope.crusherTotal)),
            shovels: JSON.parse(JSON.stringify($scope.shovels)),
            shovelTotal: JSON.parse(JSON.stringify($scope.shovelTotal)),
            draglines: JSON.parse(JSON.stringify($scope.draglines)),
            draglineTotal: JSON.parse(JSON.stringify($scope.draglineTotal)),
            dumpers: JSON.parse(JSON.stringify($scope.activeDumpers)),
            dumperTotal: JSON.parse(JSON.stringify($scope.dumperTotal))
        }
        if (section == 'crusher') {
            crusherGraph(obj);
        }
        else if (section == 'shovel') {
            shovelGraph(obj);
        }
        else if (section == 'dragline') {
            draglineGraph(obj);
        }
        else if (section == 'dumper') {
            dumperGraph(obj);
        }
    }




    $scope.login = function () {
        if (btoa($scope.pin) == "ODUyMA==") {
            $scope.user = "Viewpoint";
            $scope.auth = true;
        }
        else if (btoa($scope.pin) == "NDU2Mw==") {
            $scope.user = "Admin";
            $scope.auth = true;
        }
        else if (btoa($scope.pin) == "MjMwNA==") {
            $scope.user = "Dev";
            $scope.auth = true;
        }
        else {
            $scope.pin = ""
        }
    }


    $scope.machineStatus = function (mach) {

        if (mach.status == 3) {
            // mach.status = 2;
            mach.remark = "MAINTENANCE";
        }
        else {
            mach.remark = "";
        }
        $scope.update();

    }

    $scope.machStatus = function (mach, i) {
        console.log(i);
        mach.status = i;
    }



    $scope.dumperCounter = function (command) {
        console.log(command);
        if (command == 1) {
            if ($scope.dumper.east_avl > 0)
                $scope.dumper.east_avl--;
        }
        else if (command == 2) {
            if ($scope.dumper.east_avl < $scope.dumper.east_total)
                $scope.dumper.east_avl++;
        }
        else if (command == 3) {
            if ($scope.dumper.east_run > 0)
                $scope.dumper.east_run--;
        }
        else if (command == 4) {
            if ($scope.dumper.east_run < $scope.dumper.east_avl)
                $scope.dumper.east_run++;
        }

        else if (command == 5) {
            if ($scope.dumper.west_avl > 0)
                $scope.dumper.west_avl--;
        }
        else if (command == 6) {
            if ($scope.dumper.west_avl < $scope.dumper.west_total)
                $scope.dumper.west_avl++;
        }
        else if (command == 7) {
            if ($scope.dumper.west_run > 0)
                $scope.dumper.west_run--;
        }
        else if (command == 8) {
            if ($scope.dumper.west_run < $scope.dumper.west_avl)
                $scope.dumper.west_run++;
        }

        $scope.update();
    }



    $scope.trendToggle = function (mach, i) {
        if ($scope.auth) {
            k = mach.logs[i];
            k += 1;
            k %= 4;
            mach.logs[i] = k;
            sync();
        }
        $scope.update();
    }






    $scope.timef = function (block) {
        k = $scope.start + block * blockWidth * 60 * 1000;
        l = new Date(k);
        h = l.getHours();
        h = h % 12;
        if (h == 0) { h = 12; }
        t = "" + h + ":" + (l.getMinutes() < 10 ? "0" : "") + l.getMinutes() + (l.getHours() < 12 ? " AM" : " PM");
        return t;
    }

    $scope.hourf = function (hour) {
        let s = new Date($scope.start + hour * 3600 * 1000).getHours();
        sh = s % 12;
        if (sh == 0) sh = 12;

        let e = new Date($scope.start + (hour + 1) * 3600 * 1000).getHours();
        eh = e % 12;
        if (eh == 0) eh = 12;

        return "" + sh + (s < 12 ? "AM" : "PM") + " - " + eh + (e < 12 ? "AM" : "PM");
    }



    $scope.hms = function (mins) {
        h = Math.floor(mins / 60);
        m = mins % 60;
        return h.toString() + " : " + (m < 10 ? "0" : "") + m.toString();
    }



    randomize = function () {
        reset();

        angular.forEach($scope.machines, function (mach, i) {
            k = 0;
            for (i = 0; i < 5; i++) {
                l = 5 + Math.floor(10 * Math.random());
                v = Math.floor(4 * Math.random())
                for (j = 0; j < l; j++) {
                    if (k < $scope.block) {
                        mach.logs[k] = v;
                        k++;
                    }
                }
                if (k == $scope.block) {
                    mach.status = v;
                    break;
                }
            }
        })

        angular.forEach($scope.dumpers, function (d, i) {
            let obj = {
                east_avl: 20+Math.floor(10 * Math.random()),
                east_run: 20-Math.floor(10 * Math.random()),
                west_avl: 20+Math.floor(10 * Math.random()),
                west_run: 20-Math.floor(10 * Math.random())
            }
            d.set(obj);
        })
        $scope.dumper.set($scope.dumpers[$scope.hour].get());
       

        $scope.update();
    }

    $scope.rebase = function () {
        $scope.machines = [];
        $scope.silos = [];
        $scope.dumper = {};
        $scope.dumpers = [];


        angular.forEach($scope.crusherNames, function (x, i) {
            var k = new Machine(x, 'crusher');
            $scope.machines.push(k);
        })
        angular.forEach($scope.shovelNames, function (x, i) {
            var k = new Machine(x, 'shovel');
            $scope.machines.push(k);
        })
        angular.forEach($scope.draglineNames, function (x, i) {
            var k = new Machine(x, 'dragline');
            $scope.machines.push(k);
        })
        angular.forEach($scope.siloNames, function (x, i) {
            var k = new Silo(x)
            $scope.silos.push(k);
        })

        $scope.dumper = new Dumper();

        angular.forEach($scope.machines, function (mach, i) {
            for (j = 0; j < totalBlocks; j++) {
                mach.logs[j] = 4;
            }
        })


        for (i = 0; i < 8; i++) {
            k = new Dumper(i);
            $scope.dumpers.push(k);
        }

        performanceLog();
        receiver($scope);


    }

    $scope.indirect = function (js) {
        return eval(js);
    }

    $scope.dnLocal = function () {
        let temp = $scope.downUrl;
        $scope.downUrl = 'serv/downLive.php';
        download();
        $scope.downUrl = temp;
    }
    $scope.upLocal = function () {
        let temp = $scope.upUrl;
        $scope.upUrl = 'serv/upLive.php';
        upload();
        $scope.upUrl = temp;
    }
    $scope.dnRemote = function () {
        let temp = $scope.downUrl;
        $scope.downUrl = 'https://sushanttiwari.in/dch/serv/downLive.php';
        download();
        $scope.downUrl = temp;
    }
    $scope.upRemote = function () {
        let temp = $scope.upUrl;
        $scope.upUrl = 'https://sushanttiwari.in/dch/serv/upLive.php';
        upload();
        $scope.upUrl = temp;
    }


});

