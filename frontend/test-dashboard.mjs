import fs from 'fs';

const token = JSON.parse(fs.readFileSync('token.json', 'utf8')).token;

const url = 'http://localhost:8080/api/v1/dashboard/resumen';

const res = await fetch(url, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const text = await res.text();
console.log('Status:', res.status);
console.log('Headers:', Object.fromEntries(res.headers.entries()));
console.log(text.slice(0, 500));
