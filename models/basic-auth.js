const getUsers = require("./db").getUsers;

module.exports = {auth};

async function auth(username,password){
    console.log('auth')
    let user = await authenticate({ username, password });
    return user;
}
async function authenticate({ username, password }) {
    console.log('authenticate',username,password);
    let users = getUsers();
    let user = users.find(u => u.username === username && u.password === password);
    console.log('authenticate',users)
    if (user) {
        let { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}