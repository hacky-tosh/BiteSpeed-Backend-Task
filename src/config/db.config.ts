import { Sequelize } from "sequelize";

const sequelize = new Sequelize("bitespeed_db", "hackytosh", "root", {
  host: "34.121.140.204",
  dialect: "mysql",
  logging: false,
});

export default sequelize;
