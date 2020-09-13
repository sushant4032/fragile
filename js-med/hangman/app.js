// const countryCode = "IN";
// getCountry(countryCode, (error, data) => {
//     if (error) {
//         console.log(error);
//     }
//     else {
//         console.log(data)
//     }
// })    

const createTipper = (perc) => {
    return (bill) => {
        return bill * perc;
    }
}

const a = createTipper(.10);
console.log(a(100));

const b = createTipper(.20);
console.log(b(100));

const c = createTipper(.25);
console.log(c(100));