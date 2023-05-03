// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

//Answering a get request into /api
app.get("/api", function (req, res) {
  //Get unix  now
  let unix = Date.now();
  //Get natural date now
  let naturalDate = unixToNat(unix);
  //Return the JSON of unix and natural date
  res.json({ unix: parseInt(unix), utc: naturalDate });
});

//Answering a get request into /api/:date?
app.get("/api/:date?", function (req, res) {
  let date = req.params.date;
  let unix = null;
  let naturalDate = null;
  let notADate = false;

  //If date is not null, we check if it is a unix or in natual yyyy-mm-dd format
  if (date !== null) {
    //Using regex, If date is all digits, assume unix timestamp
    if (/^\d{10,13}$/.test(date)) {
      unix = date;
      naturalDate = unixToNat(parseInt(date));
    }
    // Using regex, test for yyyy-mm-dd format
    else if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      //Check if the date is within bounds of the month and day
      let dateArr = date.split("-");
      let year = parseInt(dateArr[0]);
      let month = parseInt(dateArr[1]);
      let day = parseInt(dateArr[2]);

      if (month < 1 || month > 12) {
        notADate = true;
      } else if (day < 1 || day > 31) {
        notADate = true;
      } else if (
        (month == 4 || month == 6 || month == 9 || month == 11) &&
        day == 31
      ) {
        notADate = true;
      }
      //Check for leap year
      else if (month == 2) {
        let isLeapYear = false;
        if (year % 4 == 0) {
          isLeapYear = true;
        }
        if (year % 100 == 0) {
          isLeapYear = false;
        }
        if (year % 400 == 0) {
          isLeapYear = true;
        }
        if (isLeapYear && day > 29) {
          notADate = true;
        } else if (!isLeapYear && day > 28) {
          notADate = true;
        }
      }

      //Otherwise, assume it is a natural date
      unix = natToUnix(date);
      naturalDate = unixToNat(unix);
    } else if (date == "") {
      //Get unix of current time
      unix = Date.now();
      naturalDate = unixToNat(unix);
    } else if (!isNaN(Date.parse(date))) {
      // Get Unix of date
      let dateObj = new Date(date);
      unix = dateObj.getTime();
      naturalDate = unixToNat(unix);
    } else {
      notADate = true;
    }
  }

  //If date is wrong we give an error json
  if (notADate) {
    res.json({ error: "Invalid Date" });
  } else {
    //Return a JSON of unix and natural date
    res.json({ unix: parseInt(unix), utc: naturalDate });
  }
});

//Function to convert yyyy-mm-dd date to unix timestamp
function natToUnix(date) {
  //Converting date to milliseconds
  let dateInt = Date.parse(date);
  if (!isNaN(dateInt)) {
    return dateInt;
  } else {
    return null;
  }
}

// Function to convert unix timestamp to day, date month year, hour:minute:second in GMT
function unixToNat(unix) {
  //Converting unix timestamp to milliseconds
  let dateObj = new Date(unix);

  //Converting milliseconds to date
  let daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let day = daysOfWeek[dateObj.getUTCDay()];

  let monthsOfYear = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let month = monthsOfYear[dateObj.getUTCMonth()];

  let date = dateObj.getUTCDate();
  let year = dateObj.getUTCFullYear();
  let hours = dateObj.getUTCHours();
  let minutes = dateObj.getUTCMinutes();
  let seconds = dateObj.getUTCSeconds();

  if (date < 10) {date = "0" + date};
  if (hours < 10) {hours = "0" + hours};
  if (minutes < 10) {minutes = "0" + minutes};
  if (seconds < 10) {seconds = "0" + seconds};

  let natDate =
    day +
    ", " +
    date +
    " " +
    month +
    " " +
    year +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds +
    " GMT";

  return natDate;
}
