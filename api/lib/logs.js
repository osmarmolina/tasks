import winston from "winston";
import moment from 'moment'

// Configura los transportes de Winston (dónde se guardarán los logs)
const date = moment().format('DD-MM-YYYY')
export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(), // Imprime los logs en la consola
    new winston.transports.File({ filename: `logs/${date}.log` }), // Guarda los logs en un archivo
  ],
  format: winston.format.combine(
    winston.format.timestamp(), // Agrega una marca de tiempo a los logs
    winston.format.printf((info) => `${info.timestamp} - ${info.level} - ${info.message}`)
  ),
});
