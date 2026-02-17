const http = require('http');

/**
 * 1. Done
 * 2. User Done
 * 3. Form Done
 * 4. Log name Done
 */


server = http.createServer((req, res) => {
    const url = req.url;
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<html lang="en">');
    res.write(`<head><title>Super mario team</title></head>`)

    res.write(`<body>`);
    switch (url) {
        case '/':
            res.write(`
            <h1>Hello human!</h1>
<form action="/create-user" method="post" >
    <label>Username 
    <input type="text" name="username"/>
    </label>
    <button>Submit</button>
</form>
`);
            break;
        case '/users':
            res.write(`
            <ul>
                <li>Pablo</li>
                <li>Diablo</li>
                <li>Chico</li>
            </ul>
            `);
            break;
        case '/create-user':
            if (req.method === 'POST') {
                const body = [];
                req.on('data', (chunk) => {
                    body.push(chunk);
                })
                req.on('end', () => {
                    const str= Buffer.concat(body).toString('UTF-8');
                    console.log(str.split('=')[1]);
                })
                res.statusCode = 302;
                res.setHeader('Location', '/');
                return res.end();
            }
            break;
        default:
            res.write('<h1>Not found page!</h1>');
            break;
    }
    res.end();
})


server.listen(3000);

