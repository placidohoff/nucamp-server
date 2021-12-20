const express = require('express')
const morgan = require('morgan')

const hostname = 'localhost'
const port = 3000

//returns the express server object for us to use:
const app = express()

//Will only use this middlware/log in development mode:
app.use(morgan('dev'))

//Converts json to javascript objects for us:
app.use(express.json())

//This responds as the default for all routing requests:
app.all('/campsites', (req, res, next) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    //forwards this request to the next relevent middlware:
    //If is a 'get', will forward to the next 'get', if is a 'post', etc
    next()
})

app.get('/campsites', (req, res) => {
    res.end('Will send all the campsites to you')
})

app.post('/campsites', (req, res) => {
    res.end(`Will add the campsite: ${req.body.name} with description: ${req.body.description}`)
})

app.put('/campsites', (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /campsites')
})

app.delete('/campsites', (req, res) => {
    res.end('Deleting all campsites')
})

app.get('/campsites/:campsiteId', (req, res) => {
    res.end(`Will send details of the campsite: ${req.params.campsiteId} to you`)
})

app.post('/campsites/:campsiteId', (req, res) => {
    res.statusCode = 403
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`)
})

app.put('/campsites/:campsiteId', (req, res) => {
    res.write(`Updating the campsite: ${req.body.description}`)
})

app.put('/campsites/:campsiteId', (req, res) => {
    res.write(`Updating the campsite: ${req.params.campsiteId}\n`)
    res.end(`Will update the campsite ${req.body.name} 
        with description: ${req.body.description}`)

    //^^Multi-line response returned as text
})


app.delete('/campsites/:campsiteId', (req, res) => {
    res.end(`Deleting campsite: ${req.params.campsiteId}`)
})



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