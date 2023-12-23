import {Sequelize} from "sequelize" 
import 'dotenv/config'


const postgresConnection = new Sequelize( process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  dialect: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});

export default postgresConnection