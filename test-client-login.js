const http = require('http');

function testClientLogin() {
    console.log('Testing client login with real credentials...');
    
    const postData = JSON.stringify({
        username: 'Tgpspayroll',
        password: 'Tgpspayroll16**'
    });

    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            if (res.statusCode === 200) {
                try {
                    const result = JSON.parse(data);
                    console.log('✅ Login successful!');
                    console.log('Token received:', result.token ? 'Yes' : 'No');
                    console.log('User role:', result.user?.role);
                    console.log('Username:', result.user?.username);
                } catch (e) {
                    console.log('❌ Invalid JSON response:', data);
                }
            } else {
                console.log('❌ Login failed:', res.statusCode, data);
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Connection error:', error.message);
        console.log('Make sure the server is running on port 8080');
    });

    req.write(postData);
    req.end();
}

testClientLogin();
