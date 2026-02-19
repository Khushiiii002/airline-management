import fetch from 'node-fetch'; // This might fail if node-fetch is not installed, but native fetch should work in node 18+

async function test() {
    try {
        const response = await fetch('http://localhost:5000/api/flights/stats');
        console.log('Status:', response.status);
        const data = await response.text();
        console.log('Data:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
