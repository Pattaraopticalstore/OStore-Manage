const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const newPassword = 'password123'; 

bcrypt.hash(newPassword, SALT_ROUNDS, (err, hash) => {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }
    console.log("New Password Hash:");
    console.log(hash);
});