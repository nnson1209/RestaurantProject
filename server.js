const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");

require("dotenv").config();

const app = express();
port = process.env.PORT;

// Template engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/", require("./routes/dataRoutes"));
app.use("/booking", require("./routes/bookingRoutes"));
app.use("/staff", require("./routes/staffRoutes"));


app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
