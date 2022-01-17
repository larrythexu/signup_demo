const express = require('express');
const app = express()

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const https = require('https');

app.use(express.static('public')); //to keep a STATIC directory (access for html & css)

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

    const url = 'https://us20.api.mailchimp.com/3.0/lists/c135fd3a7c'
    const options = {
        method: 'POST',
        auth: 'anyuser:346cba6d5d20605ac842a0c34fa0cbc5-us20'
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

app.listen(process.env.PORT || 3000, () => { //process.env.PORT is a dynamic port - for heroku to choose
    console.log("Server is running on port 3000")
})

//Mailchimp API Key
//346cba6d5d20605ac842a0c34fa0cbc5-us20
//Mailchimp List ID
//c135fd3a7c