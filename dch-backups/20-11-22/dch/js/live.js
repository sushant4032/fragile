var app = angular.module("myApp", []);
app.controller("myController", function ($scope, $http) {

    $scope.crushers = ['CRUSHER-1', 'CRUSHER-2', 'CRUSHER-3'];
    $scope.shovels = ['P&H-06', 'P&H-07', 'P&H-10',
        'P&H-11', 'P&H-12', 'P&H-13', 'P&H-14', 'P&H-15',
        'P&H-16', 'P&H-17', 'P&H-18', 'P&H-19', 'HIM-20', 'PC-TATA', 'KOMATSU-PC', 'LAXMAN-PC', 'PL-06', 'PL-07', 'SM-L&T'];
    $scope.draglines = ['JYOTI', 'PAWAN', 'VNDHYA', 'JWALA'];
    $scope.siloNames = ['OLD SILO', 'NEW SILO', 'WHARF WALL'];

    $scope.statusCodes = [0, 1, 2, 3];
    $scope.statusStrings = ['IDL', 'RNG', 'BDN', 'MNT', 'UDF'];


    $scope.machines = [];
    $scope.silos = [];
    $scope.dumper = {};
    $scope.dumpers = [];  // stores hourly snapshots of dumper objects.
    $scope.dumperTotal = {};


    $scope.time = new Date().getTime();
    $scope.stamp = ""  // time of fetched status
    $scope.syncCounter = 0;

    $scope.pin = "";

    $scope.user = "Guest";
    $scope.status = "Please user PIN:1234 to login as Viewpoint";
    $scope.upUrl = 'https://sushanttiwari.in/serv/upLive.php';
    $scope.downUrl = 'https://sushanttiwari.in/serv/downLive.php';
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



    // CONFIGS ////////
    $scope.auth = false;
    $scope.forceUpload = false;
    ///////////////////

    class Machine {
        constructor(name, type) {
            this.name = name;
            this.type = type;
            this.status = 0;
            this.remark = "";
            this.logs = [];
        }

        get = function () {
            return {
                name: this.name,
                type: this.type,
                status: this.status,
                remark: this.remark,
                logs: this.logs
            }
        }

        set = function (obj) {
            this.name = obj.name;
            this.type = obj.type;
            this.status = obj.status;
            this.remark = obj.remark;
            this.logs = obj.logs;
        }

        calculate = function () {
            this.idlm = this.logs.filter(x => x == 0).length * blockWidth;
            this.runm = this.logs.filter(x => x == 1).length * blockWidth;
            this.brkm = this.logs.filter(x => x == 2).length * blockWidth;
            this.mntm = this.logs.filter(x => x == 3).length * blockWidth;


            this.avlm = this.idlm + this.runm;
            this.navl = this.brkm + this.mntm;
            this.total = this.avlm + this.navl;

            this.pavl = Math.round(this.avlm * 100 / this.total);
            this.putl = Math.round(this.runm * 100 / this.total);
        }

        add = function (arr) {

            this.logs = [];
            arr.forEach((x, i) => {
                this.logs = this.logs.concat(x.logs);
            })
            this.calculate();
        }
    }

    class Silo {
        constructor(name) {
            this.name = name;
            this.rakes = 0;
            this.remark = "";
        }

        set = function (obj) {
            this.name = obj.name;
            this.rakes = obj.rakes;
            this.remark = obj.remark;
        }

        get = function () {
            return {
                name: this.name,
                rakes: this.rakes,
                remark: this.remark
            }
        }
    }

    class Dumper {
        constructor(hour) {
            this.hour = hour;

            this.east_total = 41;
            this.east_avl = 0;
            this.east_run = 0;

            this.west_total = 44;
            this.west_avl = 0;
            this.west_run = 0;
        }
        set = function (arr) {
            this.hour = arr[0];
            this.east_total = arr[1];
            this.east_avl = arr[2];
            this.east_run = arr[3];
            this.west_total = arr[4];
            this.west_avl = arr[5];
            this.west_run = arr[6];
        }
        get = function () {
            let k = [];
            k.push(this.hour);
            k.push(this.east_total);
            k.push(this.east_avl);
            k.push(this.east_run);
            k.push(this.west_total);
            k.push(this.west_avl);
            k.push(this.west_run);
            return k;
        }

        calculate = function () {
            this.east_idl = this.east_avl - this.east_run;
            this.east_brk = this.east_total - this.east_avl;
            this.east_pavl = Math.round(this.east_avl * 100 / (this.east_total));
            this.east_putl = Math.round(this.east_run * 100 / (this.east_total));

            this.west_idl = this.west_avl - this.west_run;
            this.west_brk = this.west_total - this.west_avl;
            this.west_pavl = Math.round(this.west_avl * 100 / (this.west_total))
            this.west_putl = Math.round(this.west_run * 100 / (this.west_total));

            this.avl = this.east_avl + this.west_avl;
            this.run = this.east_run + this.west_run;

            this.avlm = (this.east_avl + this.west_avl) * 60;
            this.idlm = (this.east_idl + this.west_idl) * 60;
            this.runm = (this.east_run + this.west_run) * 60;
            this.brkm = (this.east_brk + this.west_brk) * 60;
            this.total = (this.east_total + this.west_total) * 60;

            this.pavl = Math.round(this.avlm * 100 / this.total);
            this.putl = Math.round(this.runm * 100 / this.total);

        }
        add = function (arr) {
            this.east_total = 0;
            this.west_total = 0;

            arr.forEach((x, i) => {
                this.east_total += x.east_total;
                this.east_avl += x.east_avl;
                this.east_run += x.east_run;
                this.west_total += x.west_total;
                this.west_avl += x.west_avl;
                this.west_run += x.west_run;
            })
            this.calculate();

        }
    }


    initialize();


    function initialize() {
        timeBlock();
        console.log('block:', $scope.block, '  hour:', $scope.hour);

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
        } else {
            download();
        }

        sync();
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

    }



    function sync() {

        clearInterval(downEv);
        if ($scope.auth) {
            clearTimeout(upEv);
            upEv = setTimeout(upload, 2000);
        }
        downEv = setInterval(download, 30000);
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
                angular.forEach($scope.dumers, function (x, i) {
                    x.set(e.dumpers[i]);
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
                    console.log('Obsolete data detected. Resetting....');
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
            mach.logs[0] = mach.status;
            for (j = 1; j < totalBlocks; j++) {
                mach.logs[j] = 4;
            }
        });

        $scope.dumper = new Dumper();
        for (i = 0; i < 8; i++) {
            $scope.dumper[i] = new Dumper(i);
        }

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





        let crushers = $scope.machines.filter(x => x.type == 'crusher');
        $scope.crusherTotal = new Machine('crusher total', 'crusher total');
        $scope.crusherTotal.add(crushers);
        let shovels = $scope.machines.filter(x => x.type == 'shovel');
        $scope.shovelTotal = new Machine('shovel total', 'shovel total');
        $scope.shovelTotal.add(shovels);
        let draglines = $scope.machines.filter(x => x.type == 'dragline');
        $scope.draglineTotal = new Machine('dragline total', 'dragline total');
        $scope.draglineTotal.add(draglines);
        let dumpers = $scope.dumpers.filter(x => x.hour <= $scope.hour);
        $scope.dumperTotal = new Dumper(10);
        $scope.dumperTotal.add(dumpers);

        angular.forEach($scope.dumpers, function (x, i) {
            x.calculate();
        })
        $scope.dumper.calculate();
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



    $scope.randomize = function () {
        reset();

        angular.forEach($scope.machines, function (mach, i) {
            k = 0;
            for (i = 0; i < 4; i++) {
                l = 10 + Math.floor(10 * Math.random());
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
        $scope.update();
    }


    $scope.detailsSection = function (command) {
        $scope.mcns = {};
        if (command == 'crushers') {
            $scope.mcns = $scope.machines.filter(x => x.type == 'crusher');
            $scope.mcnTotal = $scope.crusherTotal;
        }
        else if (command == 'shovels') {
            $scope.mcns = $scope.machines.filter(x => x.type == 'shovel');
            $scope.mcnTotal = $scope.shovelTotal;
        }
        else if (command == 'draglines') {
            $scope.mcns = $scope.machines.filter(x => x.type == 'dragline');
            $scope.mcnTotal = $scope.draglineTotal;
        }
        console.log($scope.mcnTotal);
        plot($scope.mcns);
    }

});  