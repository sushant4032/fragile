var app = angular.module("myApp", []);
app.controller("myController", function ($scope, $http) {

    $scope.subSections = ['live', 'dumpers']

    $scope.crushers = ['Crusher-01', 'Crusher-02', 'Crusher-03'];
    $scope.shovels = ['P&H-06', 'P&H-07', 'P&H-10',
        'P&H-11', 'P&H-12', 'P&H-13', 'P&H-14', 'P&H-15',
        'P&H-16', 'P&H-17', 'P&H-18', 'P&H-19', 'HIM-20', 'PC-TATA', 'KOMATSU-PC', 'LAXMAN-PC', 'PL-06', 'PL-07', 'SM-L&T'];
    $scope.draglines = ['Jyoti', 'Pawan', 'Vindhya', 'Jwala'];
    $scope.siloNames = ['OLD SILO', 'NEW SILO', 'WHARF WALL'];
    $scope.dumperNames = ['EAST', 'WEST'];

    $scope.types = ['silo', 'crusher', 'shovel', 'dragline'];
    $scope.statusCodes = [0, 1, 2];
    $scope.statusStrings = ['Idle', 'Running', 'BreakDown', 'Undef'];


    $scope.machines = [];
    $scope.silos = [];
    $scope.dumper = {};
    $scope.dumpers = [];  // stores hourly snapshots of dumper objects.
    $scope.dumperTotal={ };




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


    $scope.block = 0;
    $scope.hour = 0;



    // CONFIGS ////////
    $scope.changed = false;
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
            this.idlmins = 0;
            this.runmins = 0;
            this.brkmins = 0;
            this.avlmins = 0;
            this.defmins = 0;
            this.avl = 0;
            this.utl = 0;
            this.idlhms = "";
            this.runhms = "";
            this.brkhms = "";
            this.avlhms = "";
            this.avlstr = "";
            this.utlstr = "";
        }
    }

    class Silo {
        constructor(name) {
            this.name = name;
            this.rakes = 0;
            this.remark = "";
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

    }


    initialize();


    function initialize() {


        timeBlock();

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
    


        for (i = 0; i < $scope.hour; i++) {
            k = new Dumper(i);
            $scope.dumpers.push(k);
        }


        if ($scope.forceUpload) {
            upload();
            setTimeout(download, 5000);
        }
        else {
            download();
        }

        setInterval(sync, 15000);
    }








    function timeBlock() {
        var a = new Date(2019, 9, 5, 5, 0, 0, 0);
        var b = a.getTime();
        var c = new Date().getTime();
        var d = Math.floor((c - b) / (8 * 3600 * 1000));
        var e = b + d * (8 * 3600 * 1000);
        $scope.start = e;
        $scope.block = Math.floor((c - e) / (5 * 60 * 1000));
        $scope.hour = Math.floor($scope.block / 12);
        console.log('block:', $scope.block, '  hour:', $scope.hour);

    }






    function sync() {
        $scope.syncCounter++;

        if ($scope.changed && $scope.auth) {
            upload();
        }
        else if ($scope.syncCounter % 4 == 0) {
            timeBlock();
            download();
        }

    }





    $scope.update = function () {
        $scope.changed = true;
        performanceLog();
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
                var stamp = e.stamp;
                var f = new Date(stamp);
                var hh = f.getHours();
                var mm = f.getMinutes();
                var ss = f.getSeconds();
                var t = hh + ':' + mm + ':' + ss;

                $scope.machines = e.machines;
                $scope.silos = e.silos;
                $scope.dumper = e.dumper;
                angular.forEach(e.dumpers,function(x,i){
                    console.log(x);
                    if(x){
                        console.log('yay')
                        $scope.dumpers[i]=x;
                    }
                })
                // $scope.dumpers = e.dumpers;
                $scope.stamp = stamp;


                console.log('Downloaded..', e.stamp, 'By:' + e.user + ' @ ' + t);
                console.log(e);

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
        $scope.obj = {
            user: $scope.user,
            stamp: new Date().getTime(),
            machines: $scope.machines,
            silos: $scope.silos,
            dumper: $scope.dumper,
            dumpers: $scope.dumpers
        };

        $scope.objString = JSON.stringify($scope.obj);
        var payload = { 'str': $scope.objString };
        // console.log(JSON.parse(payload.str));
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
                if (e.stamp == $scope.obj.stamp) {
                    console.log('Uploaded...', e.stamp);
                    $scope.changed = false; // only when upload is successful.
                }
            },
            function () {
                console.log("upload failed....");
            })
    }






    function reset() {

        angular.forEach($scope.machines, function (mach, i) {
            if (mach.status != 2) {
                mach.status = 0;
                mach.remark = "";
            }
            mach.logs[0] = mach.status;
            for (j = 1; j < 96; j++) {
                mach.logs[j] = 3;
            }
        });

        $scope.dumper = new Dumper();
        $scope.dumpers = [];

    }



    function performanceLog() {

        timeBlock();

        // INTERPOLATION ////////////////////////

        angular.forEach($scope.machines, function (mach, i) {
            let valids = [0, 1, 2];
            if (!valids.includes(mach.logs[0])) {
                mach.logs[0] = mach.status;
            }

            for (j = 1; j < $scope.block; j++) {
                if (!valids.includes(mach.logs[j])) {
                    mach.logs[j] = mach.logs[j - 1];
                }
            }

            mach.logs[$scope.block] = mach.status;

            for (j = $scope.block + 1; j < 96; j++) {
                mach.logs[j] = 3;
            }
        });


        $scope.crusherTotal = {
            idlmins: 0,
            runmins: 0,
            brkmins: 0,
            avlmins: 0,
            defmins: 0
        };
        $scope.shovelTotal = {
            idlmins: 0,
            runmins: 0,
            brkmins: 0,
            avlmins: 0,
            defmins: 0
        };
        $scope.draglineTotal = {
            idlmins: 0,
            runmins: 0,
            brkmins: 0,
            avlmins: 0,
            defmins: 0
        };

        $scope.dumperTotal = {
            east_total : 0,
            east_avl : 0,
            east_run : 0,

            west_total: 0,
            west_avl: 0,
            west_run: 0    
        }


        $scope.dumper.hour = $scope.hour;
        $scope.dumpers[$scope.hour] = { ...$scope.dumper };
        console.log($scope.dumpers);

        angular.forEach($scope.dumpers, function (d, i) {
            d.east_idl = d.east_avl - d.east_run;
            d.east_brk = d.east_total - d.east_avl;
            d.east_avli = Math.round(d.east_avl * 100 / d.east_total);
            d.east_utli = Math.round(d.east_run * 100 / d.east_total);


            d.west_idl = d.west_avl - d.west_run;
            d.west_brk = d.west_total - d.west_avl;
            d.west_avli = Math.round(d.west_avl * 100 / d.west_total);
            d.west_utli = Math.round(d.west_run * 100 / d.west_total);


            $scope.dumperTotal.east_total += d.east_total;
            $scope.dumperTotal.east_avl += d.east_avl;
            $scope.dumperTotal.east_run += d.east_run;

            $scope.dumperTotal.west_total += d.west_total;
            $scope.dumperTotal.west_avl += d.west_avl;
            $scope.dumperTotal.west_run += d.west_run;

            $scope.dumperTotal.east_idl = $scope.dumperTotal.east_avl - $scope.dumperTotal.east_run;
            $scope.dumperTotal.east_brk = $scope.dumperTotal.east_total - $scope.dumperTotal.east_avl;
            $scope.dumperTotal.east_avli = Math.round($scope.dumperTotal.east_avl * 100 / $scope.dumperTotal.east_total);
            $scope.dumperTotal.east_utli = Math.round($scope.dumperTotal.east_run * 100 / $scope.dumperTotal.east_total);


            $scope.dumperTotal.west_idl = $scope.dumperTotal.west_avl - $scope.dumperTotal.west_run;
            $scope.dumperTotal.west_brk = $scope.dumperTotal.west_total - $scope.dumperTotal.west_avl;
            $scope.dumperTotal.west_avli = Math.round($scope.dumperTotal.west_avl * 100 / $scope.dumperTotal.west_total);
            $scope.dumperTotal.west_utli = Math.round($scope.dumperTotal.west_run * 100 / $scope.dumperTotal.west_total);

            $scope.dumperTotal.idl = $scope.dumperTotal.east_idl+$scope.dumperTotal.west_idl;
            $scope.dumperTotal.run = $scope.dumperTotal.east_run+$scope.dumperTotal.west_run;
            $scope.dumperTotal.brk = $scope.dumperTotal.east_brk+$scope.dumperTotal.west_brk;
            $scope.dumperTotal.avl = $scope.dumperTotal.east_avl+$scope.dumperTotal.west_avl;
            $scope.dumperTotal.total = $scope.dumperTotal.east_total+$scope.dumperTotal.west_total;
           
            $scope.dumperTotal.avli = Math.round($scope.dumperTotal.avl * 100 / $scope.dumperTotal.total);
            $scope.dumperTotal.utli = Math.round($scope.dumperTotal.run * 100 / $scope.dumperTotal.total);

            
            $scope.dumperTotal.idlhms = ""+$scope.dumperTotal.idl+":00"
            $scope.dumperTotal.runhms = ""+$scope.dumperTotal.run+":00"
            $scope.dumperTotal.brkhms = ""+$scope.dumperTotal.brk+":00"
            $scope.dumperTotal.avlhms = ""+$scope.dumperTotal.avl+":00"

            $scope.dumperTotal.avlstr = `${$scope.dumperTotal.avli}%`;
            $scope.dumperTotal.utlstr = `${$scope.dumperTotal.utli}%`;
            
        });



        // console.log($scope.dumpers);





        angular.forEach($scope.machines, function (mach, i) {
            mach.idlmins = 0;
            mach.runmins = 0;
            mach.brkmins = 0;

            for (j = 0; j <= $scope.block; j++) {
                s = mach.logs[j];
                if (s === 0) {
                    mach.idlmins += 5;
                }
                else if (s === 1) {
                    mach.runmins += 5;
                }
                else if (s === 2) {
                    mach.brkmins += 5;
                }
                else {
                    console.log('Status error while performance counting...')
                    console.log('index:', j, ' log:', s);
                    break;
                }
            }
            mach.defmins = mach.idlmins + mach.runmins + mach.brkmins;
            mach.avlmins = mach.idlmins + mach.runmins;
            mach.avl = Math.round(mach.avlmins * 100 / mach.defmins);
            mach.utl = Math.round(mach.runmins * 100 / mach.defmins);

            mach.idlhms = tohhmm(mach.idlmins);
            mach.runhms = tohhmm(mach.runmins);
            mach.brkhms = tohhmm(mach.brkmins);
            mach.avlhms = tohhmm(mach.avlmins);

            mach.avlstr = `${mach.avl}%`;
            mach.utlstr = `${mach.utl}%`;

            $scope.changed = true;


            ////// TOTALING CALCULATIONS /////////


            if (mach.type == 'crusher') {
                $scope.crusherTotal.idlmins += mach.idlmins;
                $scope.crusherTotal.runmins += mach.runmins;
                $scope.crusherTotal.brkmins += mach.brkmins;
                $scope.crusherTotal.avlmins += mach.avlmins;
                $scope.crusherTotal.defmins += mach.defmins;

                $scope.crusherTotal.avl = Math.round($scope.crusherTotal.avlmins * 100 / $scope.crusherTotal.defmins);
                $scope.crusherTotal.utl = Math.round($scope.crusherTotal.runmins * 100 / $scope.crusherTotal.defmins);

                $scope.crusherTotal.idlhms = tohhmm($scope.crusherTotal.idlmins);
                $scope.crusherTotal.runhms = tohhmm($scope.crusherTotal.runmins);
                $scope.crusherTotal.brkhms = tohhmm($scope.crusherTotal.brkmins);
                $scope.crusherTotal.avlhms = tohhmm($scope.crusherTotal.avlmins);

                $scope.crusherTotal.avlstr = `${$scope.crusherTotal.avl}%`;
                $scope.crusherTotal.utlstr = `${$scope.crusherTotal.utl}%`;
            }

            else if (mach.type == 'shovel') {
                $scope.shovelTotal.idlmins += mach.idlmins;
                $scope.shovelTotal.runmins += mach.runmins;
                $scope.shovelTotal.brkmins += mach.brkmins;
                $scope.shovelTotal.avlmins += mach.avlmins;
                $scope.shovelTotal.defmins += mach.defmins;

                $scope.shovelTotal.avl = Math.round($scope.shovelTotal.avlmins * 100 / $scope.shovelTotal.defmins);
                $scope.shovelTotal.utl = Math.round($scope.shovelTotal.runmins * 100 / $scope.shovelTotal.defmins);

                $scope.shovelTotal.idlhms = tohhmm($scope.shovelTotal.idlmins);
                $scope.shovelTotal.runhms = tohhmm($scope.shovelTotal.runmins);
                $scope.shovelTotal.brkhms = tohhmm($scope.shovelTotal.brkmins);
                $scope.shovelTotal.avlhms = tohhmm($scope.shovelTotal.avlmins);

                $scope.shovelTotal.avlstr = `${$scope.shovelTotal.avl}%`;
                $scope.shovelTotal.utlstr = `${$scope.shovelTotal.utl}%`;
            }

            else if (mach.type == 'dragline') {
                $scope.draglineTotal.idlmins += mach.idlmins;
                $scope.draglineTotal.runmins += mach.runmins;
                $scope.draglineTotal.brkmins += mach.brkmins;
                $scope.draglineTotal.avlmins += mach.avlmins;
                $scope.draglineTotal.defmins += mach.defmins;

                $scope.draglineTotal.avl = Math.round($scope.draglineTotal.avlmins * 100 / $scope.draglineTotal.defmins);
                $scope.draglineTotal.utl = Math.round($scope.draglineTotal.runmins * 100 / $scope.draglineTotal.defmins);

                $scope.draglineTotal.idlhms = tohhmm($scope.draglineTotal.idlmins);
                $scope.draglineTotal.runhms = tohhmm($scope.draglineTotal.runmins);
                $scope.draglineTotal.brkhms = tohhmm($scope.draglineTotal.brkmins);
                $scope.draglineTotal.avlhms = tohhmm($scope.draglineTotal.avlmins);

                $scope.draglineTotal.avlstr = `${$scope.draglineTotal.avl}%`;
                $scope.draglineTotal.utlstr = `${$scope.draglineTotal.utl}%`;
            }
        });
    }




    $scope.login = function () {
        if ($scope.pin == "8520") {
            $scope.user = "Viewpoint";
            $scope.auth = true;
        }
        else if ($scope.pin == "4563") {
            $scope.user = "Admin";
            $scope.auth = true;
        }
        else {
            $scope.pin = ""
        }
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
            k %= 3;
            mach.logs[i] = k;
            $scope.changed = true;
        }
        $scope.update();
    }



    $scope.timef = function (block) {
        k = $scope.start + block * 300 * 1000;
        l = new Date(k);
        h = l.getHours();
        h = h % 12;
        if (h == 0) { h = 12;}
        t = "" + h + ":" + (l.getMinutes() < 10 ? "0" : "") + l.getMinutes()+(l.getHours()<12?" AM":" PM");
        return t;
    }



    function tohhmm(mins) {
        h = Math.floor(mins / 60);
        m = mins % 60;
        return h.toString() + " : " + (m < 10 ? "0" : "") + m.toString();
    }
});  