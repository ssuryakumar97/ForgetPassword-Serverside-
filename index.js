const express = require("express")
const app = express()
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/auth")
const cors = require("cors");

app.set("view engine","ejs");
app.use(express.urlencoded({extended: false}))
app.use(express.json());

dotenv.config()

mongoose.connect(process.env.MONGO_URL).then(()=>console.log("DB is connected successfully")).catch((err) => console.log(err));

app.use(cors());
app.use("/api", userRoute)


app.listen(process.env.PORT || 4000, () =>  console.log(`app is running on port ${process.env.PORT}`));
