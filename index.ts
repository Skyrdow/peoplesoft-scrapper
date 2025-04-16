import { Builder, By } from "selenium-webdriver";
import { writeFileSync } from "node:fs";
import { config } from 'dotenv';
import { Dato } from "./types";

config();

const url = process.env.url;
const usuario = process.env.usuario;
const password = process.env.password;

async function obtenerDatos(url: string, usuario: string, password: string) {
  // Setup
  const driver = new Builder().forBrowser("chrome").build();
  driver.manage().window().maximize();
  await driver.get(url);

  // console.log(await driver.getPageSource())

  const element = await driver.findElement(By.css(
    ".text-secondary-content.md\\:text-5xl"
  ))

  const text = await element.getText()

  console.log(text)

  await driver.quit();
  // await driver.sleep(1);
};

function guardarDatos() {
  const datos: Dato[] = [{ rut: "1", nombre: "Lucas", fecha_nacimiento: "2/3/4" }];

  let contenidoCSV = "rut,nombre,fecha_nacimiento\n";

  datos.forEach(dato => {
    contenidoCSV += `${dato.rut},${dato.nombre},${dato.fecha_nacimiento}\n`;
  });

  writeFileSync('datos.csv', contenidoCSV, 'utf8');
}

function main() {
  if (!url) {
    console.log("sin url")
    process.exit(1)
  } if (!usuario || !password) {
    console.log("sin credenciales")
    process.exit(1)
  }
  obtenerDatos(url, usuario, password);

  guardarDatos();
}

main();
