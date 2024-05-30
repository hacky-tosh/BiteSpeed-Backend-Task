import express from "express";
import bodyParser from "body-parser";
import sequelize from "./config/db.config";
import router from "./routes/routes";

const app = express();

app.use(bodyParser.json());

app.use('/api', router);


const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});


sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.log("Error syncing database:", err));
