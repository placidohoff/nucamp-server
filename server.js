const express = require('express')

const hostname = 'localhost'
const port = 3000

//returns the express server object for us to use.
const app = express()

//Using this middleware here will return this same response for any request:
app.use((req, res) => {
    console.log(req.headers)
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')
    res.end('<html>>body><h1>This is an Express Server</h1></body></html>')
})

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})