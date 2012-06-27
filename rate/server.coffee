express = require 'express'
redis = require 'redis'

app = express.createServer()
client = redis.createClient()

app.set 'view options', layout: false

app.get '/', (req, res) ->
    res.render 'index.jade'

app.get '/:degrees', (req, res) ->
    client.publish 'vote', req.params.degrees if not isNaN req.params.degrees
    res.send req.params.degrees

app.listen(8000)