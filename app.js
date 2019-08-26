const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const controller = require('./controller')

const app = express();
app.use(cors());
app.use(helmet());

app.get('/run', controller.run)

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server up & running on port: ${process.env.PORT || 5000}`)
);
