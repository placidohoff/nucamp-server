const express = require('express')
const morgan = require('morgan')
const campsiteRouter = require('./routes/campsiteRouter')

const hostname = 'localhost'
const port = 3000

//returns the express server object for us to use:
const app = express()

//Will only use this middlware/log in development mode:
app.use(morgan('dev'))

//Converts json to javascript objects for us:
app.use(express.json())

//We provide the root path for our campsiteRouter instance
app.use('/campsites', campsiteRouter)


//This sets up the home directory dynamically.
app.use(express.static(__dirname + '/public'))

//Using this middleware here will return this same response for any request other than index:
app.use((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')
    res.end('<html>>body><h1>This is an Express Server</h1></body></html>')
})

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})