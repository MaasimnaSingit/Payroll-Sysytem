const bcrypt = require('bcryptjs');

function generateHash() {
    const password = 'Tgpspayroll16**';
    const hash = bcrypt.hashSync(password, 10);
    console.log('Password:', password);
    console.log('Hash (bcryptjs):', hash);
    
    // Verify the hash
    const isValid = bcrypt.compareSync(password, hash);
    console.log('Hash verification:', isValid);
    
    // Test with the hash we've been using
    const oldHash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    const isValidOld = bcrypt.compareSync(password, oldHash);
    console.log('Old hash verification:', isValidOld);
}

generateHash();
