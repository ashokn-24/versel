export const generateId = ()=>{
    const len = 5;
    let id = "";
    const subset = '1234567890qwertyuiopasdfghjklzxcvbnm';

    for (let i = 0; i < len; i++) {
        id += subset[Math.floor(Math.random() * subset.length)];
    }

    return id;
}