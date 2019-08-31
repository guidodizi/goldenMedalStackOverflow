const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const controller = require('./controller')
const rateLimit = require("express-rate-limit");

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3 // limit each IP to 100 requests per windowMs
});

app.set('trust proxy', 1);
app.use(cors());
app.use(helmet());
app.use(limiter);

const extendTimeoutMiddleware = (req, res, next) => {
  const space = ' ';
  let isFinished = false;
  let isDataSent = false;
  let count = 0;

  res.once('finish', () => {
    isFinished = true;
  });

  res.once('end', () => {
    isFinished = true;
  });

  res.once('close', () => {
    isFinished = true;
  });

  res.on('data', (data) => {
    // Look for something other than our blank space to indicate that real
    // data is now being sent back to the client.
    console.log('data event')
    if (data !== space) {
      console.log('data event end')
      isDataSent = true;
    }
  });

  const waitAndSend = () => {
    setTimeout(() => {
      // If the response hasn't finished and hasn't sent any data back....
      if (!isFinished && !isDataSent) {
        res.write(space);
        count++;

        // wait for 150sec max
        if (count <= 10){
          // Wait another 15 seconds
          waitAndSend();
        }
      }
    }, 15000);
  };

  waitAndSend();
  next();
};

app.use(extendTimeoutMiddleware);
app.get('/run', controller.run)

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server up & running on port: ${process.env.PORT || 5000}`)
);
