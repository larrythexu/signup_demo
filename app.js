const express = require('express');
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const https = require('https');
app.use(express.static('public')); //to keep a STATIC directory (access for html & css)
require('dotenv').config(); //to hide sensitive info

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/signup.html')
})

app.post("/", (req, res) => {
    var firstName = req.body.firstname
    var lastName = req.body.lastname
    var email = req.body.email

    var data = {
        members : [{
            email_address : email,
            status : 'subscribed',
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName
            }
        }]
    }

    var jsonData = JSON.stringify(data)

    const url = process.env.URL
    const options = {
        method: 'POST',
        auth: process.env.API_KEY,
    }

    const request = https.request(url, options, (response) => { //REQUEST to send data to MailChimp
        // response.on("data", (data) => { //"data" is the event of receiving any data
        //     console.log(response.statusCode)
        // })

        if (response.statusCode == 200) {
            res.sendFile(__dirname + "/success.html")
        } else if (response.statusCode = 400) {
            res.sendFile(__dirname + "/failure.html")
        }
    })

    request.write(jsonData);
    request.end();
})

app.post('/failure', (req, res) => {
    res.redirect('/');
})

app.post('/success', (req, res) => {
    res.redirect('/mailinfo');
})

app.get('/mailinfo', (req, res) => {
    const url = process.env.URL_MEMBERS
    const options = {
        method: 'GET',
        auth: process.env.API_KEY,
    }

    https.get(url, options, (response) => {
        var listData = ''

        response.on("data", (data) => {
            listData += data;
        })

        response.on("end", () => {
            var parsedData = JSON.parse(listData);

            res.writeHead(200,{"Content-Type" : "text/html"});
            res.write("<h2>List of member names:</h2>")

            var nameList = "<ol>"
            for (let i = 0; i < parsedData.members.length; i++) {
                nameList += "<li>" + parsedData.members[i].full_name + "</li>";
            }
            nameList += "</ol>"

            res.write(nameList);
            res.send();
        })
    })
})

app.listen(process.env.PORT || 3000, () => { //process.env.PORT is a dynamic port - for heroku to choose
    console.log("Server is running on port 3000")
})