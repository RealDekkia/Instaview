const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
const httpServer = http.createServer(app);

app.use('/', express.static('html'));
app.use('/photos', express.static('../photos'));
app.use('/profile', express.static('../profile'));
app.use('/stories', express.static('../stories'));

app.get('/getjson', function (req, res) {
    if (req.headers.name) {
        res.status(200).send(fs.readFileSync(path.join(__dirname, '../' + req.headers.name + '.json'), 'utf8'));
    } else {
        res.status(404).send('file not found');
    }

});


httpServer.listen(80, function () {
    console.log('Server started on port 80. Access http://localhost to view the data');
});

