import { Sequelize } from "sequelize";

const sequelize = new Sequelize("bitespeed_db", "root", "root", {
  host: process.env.HOST || "localhost",
  dialect: "mysql",
  logging: false,
});

export default sequelize;
