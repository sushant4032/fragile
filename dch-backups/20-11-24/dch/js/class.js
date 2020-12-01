const blockWidth = 10;
const totalBlocks = 8 * 60 / blockWidth;

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
        this.name = hour;

        this.east_total = 41;
        this.east_avl = 0;
        this.east_run = 0;

        this.west_total = 44;
        this.west_avl = 0;
        this.west_run = 0;
    }
    set = function (obj) {
        if (obj.east_avl > 0) {
            this.east_avl = obj.east_avl;
        }
        if (obj.east_run > 0) {
            this.east_run = obj.east_run;
        }
        if (obj.west_avl > 0) {
            this.west_avl = obj.west_avl;
        }
        if (obj.west_run > 0) {
            this.west_run = obj.west_run;
        }
    }
    get = function () {
        let k = {
            'hour': this.hour,
            'east_total': this.east_total,
            'east_avl': this.east_avl,
            'east_run': this.east_run,
            'west_total': this.west_total,
            'west_avl': this.west_avl,
            'west_run': this.west_run
        }

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