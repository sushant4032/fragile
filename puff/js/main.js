const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const t = new Date().getTime();

const users = [];
const u = {
    id: 0,
    name: 'Someone',
    last: t
}

for (let i = 0; i < 20; i++) {
    let name = "";
    for (let j = 0; j < 5; j++) {
        let r = Math.floor(26 * Math.random());
        name += letters[r];
    }
    u.id = i;
    u.name = name;
    users.push({ ...u });
}


// console.log(users);


const msgs = [];
const m = {
    from: 0,
    to: 0,
    body: "Hello ",
    type: "text",
    status: "sent",
    sent: t,
    read: t,
    deleted: t
};

for (let i = 0; i < 20; i++) {
    m.from = Math.round(50 * Math.random());
    let content = "hello ";
    for (let j = 0; j < 5; j++) {
        let r = Math.floor(26 * Math.random());
        content += letters[r];
    }
    m.body = content;
    msgs.push({ ...m });
}

// console.log(msgs);


localStorage.setItem('users', JSON.stringify(users));
localStorage.setItem('msgs', JSON.stringify(msgs));


let drawLists = () => {
    const msgs = JSON.parse(localStorage.getItem('msgs'));
    const users = JSON.parse(localStorage.getItem('users'));

    // console.log(msgs);
    console.log(users);

 

    const main = document.querySelector('.list main');
    users.forEach((x, i) => {
        const lit = document.querySelector('#list-item-template').content.cloneNode(true);
        let img = lit.querySelector('.l img');
        let name = lit.querySelector('.name');
        let last = lit.querySelector('.last');
        let count = lit.querySelector('.count');

        let str = `res/users/user (${i}).png`;
        img.src = str;
        name.innerText = x.name;
        let d = new Date(x.last);
        last.innerText = "Last seen:" + d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + " "+d.toLocaleTimeString();
        main.appendChild(lit);
    })

}

drawLists();