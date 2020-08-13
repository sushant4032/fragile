const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const t = new Date();

const users = [];
const u = {
    id: 0,
    name: 'Someone',
    last: t
}

for (let i = 0; i < 20; i++) {
    let name = "";
    for (let j = 0; j < 5; j++){
        let r = Math.floor(26 * Math.random());
        name += letters[r];
    }
    u.id = i;
    u.name = name;
users.push({ ...u });
}


// console.log(users);


const ms = [];
const m ={
    from: 0,
    to:0,
    body: "Hello ",
    type: "text",
    status: "sent",
    sent: t,
    read: t,
    deleted: t
};

for (let i = 0; i < 20; i++){
    m.from = Math.round(50 * Math.random());
    let content = "hello ";
    for (let j = 0; j < 5; j++) {
        let r = Math.floor(26 * Math.random());
        content += letters[r];
    }
    m.body= content;
    ms.push({...m});
}

// console.log(ms);
