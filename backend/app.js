const express = require("express");
const { PORT } = require("./config/config");
const rootRouter = require("./routes/index");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

require("./db/index");

app.use(bodyParser.json());
app.use(cors())

app.use("/api/v1", rootRouter);

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});