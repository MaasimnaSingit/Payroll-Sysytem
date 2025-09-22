const bcrypt = require('./server/node_modules/bcrypt');

async function generateHash() {
    const password = 'Tgpspayroll16**';
    const hash = await bcrypt.hash(password, 10);
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Verify the hash
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash verification:', isValid);
}

generateHash().catch(console.error);
