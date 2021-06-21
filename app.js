const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const dotenv = require('dotenv').config();
const express = require('express');
const app = express()
const port = process.env.PORT || 80;



let calendarDate = new Date();
let date = calendarDate.getDate();
// Check whether to add 0 before months number below 10
let month = (calendarDate.getMonth() > 8) ? (calendarDate.getMonth() + 1) : ("0" + (calendarDate.getMonth() + 1));
let year = calendarDate.getFullYear();

let todayDate = `${date}-${month}-${year}`;

const pinCode = 670306;

// Making API request to the below URL
let url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pinCode}&date=${todayDate}`;

// Our Gmail Credentials
// Don't forget to disable less secured apps access in your Google Account
var transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
        user: process.env.email,
        pass: process.env.password
    }
});

let testObject = [{
    "center_id": 1234,
    "name": "District General Hostpital",
    "name_l": "",
    "address": "45 M G Road",
    "address_l": "",
    "state_name": "Maharashtra",
    "state_name_l": "",
    "district_name": "Satara",
    "district_name_l": "",
    "block_name": "Jaoli",
    "block_name_l": "",
    "pincode": "413608",
    "lat": 28.7,
    "long": 77.1,
    "from": "09:00:00",
    "to": "18:00:00",
    "fee_type": "Free",
    "vaccine_fees": [{
        "vaccine": "COVISHIELD",
        "fee": "250"
    }],
    "sessions": [{
        "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "date": "31-05-2021",
        "available_capacity": 50,
        "available_capacity_dose1": 25,
        "available_capacity_dose2": 25,
        "min_age_limit": 18,
        "vaccine": "COVISHIELD",
        "slots": [
            "FORENOON",
            "AFTERNOON"
        ]
    }]
}]

const api = async () => {

    // User Agent should be specified as request from script file is not served by server
    fetch(url, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                Host: 'cdn-api.co-vin.in',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
            }
        })
        .then(async (response) => {
            await response.json()
                .then((parsedData) => {
                    let vaccineCenter = parsedData.centers;
                    let length = vaccineCenter.length;
                    console.log(vaccineCenter)
                    // check whether the length of the array is greater than 0 
                    if (length > 0) {
                        mailFunction(vaccineCenter, length)
                    }
                })
                .catch((e) => {
                    console.log("Error Obtained")
                })
        })
}


const mailFunction = async (apiData, length) => {
    // Loop through the passed array

    for (let i = 0; i < length; i++) {
        const {
            center_id,
            name,
            address,
            state_name,
            district_name,
            block_name,
            pincode,
            from,
            to,
            fee_type,
            sessions
        } = apiData[i];
        // sessions is an array so we have to assign 1st element of sessions to variables
        const {
            date,
            available_capacity,
            min_age_limit,
            available_capacity_dose1,
            available_capacity_dose2,
            slots
        } = sessions[0]


        var mailOptions = {
            from: 'Rahul',
            to: 'pvrahul.271199@gmail.com',
            subject: 'Vaccine Available',
            text: `
            Center Id: ${center_id}
            Hospital Name: ${name},
            Address: ${address}
            Location: ${block_name}, ${district_name}, ${state_name} ${pincode}
            from: ${from}
            to: ${to}
            Date: ${date}
            Fee-Type: ${fee_type}
            Minimun Age Limit: ${min_age_limit}
            Available Capacity: ${available_capacity}
            Available Capacity Dose 1: ${available_capacity_dose1}
            Available Capacity Dose 2: ${available_capacity_dose2}
            Slots: ${slots}
            `
        };
        console.log(mailOptions.text);
        if (available_capacity > 0) {
            console.log(available_capacity)
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    }
}

// We cannot use setInterval with async functions 
// We have to make a new promise which when resolved will call setIntervalfunction
const setAsyncTimeout = () => new Promise(resolve => {
    setInterval(() => {
        api();
        resolve();
    }, 30000);
});

setAsyncTimeout()

app.all('*', (req, res) => {
    res.send("Script is working")
})

app.listen(port, () => {
    console.log(`Server Listening at ${port}`)
})