import { Builder, By, ThenableWebDriver, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import { writeFileSync } from "node:fs";
import { config } from "dotenv";
import { Datos_personales } from "./types";

config();

const url = process.env.url;
const usuario = process.env.usuario;
const password = process.env.password;

async function fillFormAndSubmit(
  formSelectors: {
    inputFields: { selector: string; value: string }[];
    submitButtonSelector: string;
  },
  driver: ThenableWebDriver,
): Promise<void> {
  // Llenar campos de entrada
  for (const field of formSelectors.inputFields) {
    const inputElement = await driver.findElement(By.css(field.selector));
    await inputElement.clear();
    await inputElement.sendKeys(field.value);
  }

  // Enviar formulario
  const submitButton = await driver.findElement(
    By.css(formSelectors.submitButtonSelector),
  );
  await submitButton.click();

  // Esperar a que la página se cargue
  await driver.wait(until.urlContains, 5000);
}

async function clickButtonAndWait(
  buttonSelector: string,
  waitSelector: string,
  driver: ThenableWebDriver,
): Promise<void> {
  const button = await driver.findElement(By.css(buttonSelector));
  await button.click();

  // Esperar a que el elemento deseado esté presente
  await driver.wait(until.elementLocated(By.css(waitSelector)), 5000);
}

async function obtenerDatos(url: string, usuario: string, password: string) {
  // Setup
  const options = new Options();

  // Coneccion a http
  options.addArguments("--ignore-certificate-errors");
  options.addArguments("--ignore-ssl-errors");
  options.addArguments("--allow-insecure-localhost");
  options.addArguments("--allow-running-insecure-content");
  options.setAcceptInsecureCerts(true);

  const driver = new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  driver.manage().window().maximize();
  await driver.get(url);

  await driver.sleep(3000);
  // Ingresar al login de peoplesoft
  const rrhh = await driver.findElement(By.css(".ingreso_rrhh"));

  await rrhh.click();

  const handles = await driver.getAllWindowHandles();

  await driver.switchTo().window(handles[handles.length - 1]);

  await driver.wait(until.urlContains, 5000);

  // Login
  // const user_input = await driver.findElement(By.id("userid"))
  // await user_input.clear();
  // await user_input.sendKeys(usuario)
  // const password_input = await driver.findElement(By.id("pwd"))
  // await password_input.clear();
  // await password_input.sendKeys(password)

  // await driver.findElement(By.name("Submit")).click();

  console.log(await driver.getPageSource());

  await driver.sleep(3000);
  await driver.quit();
}

function guardarDatos() {
  const datos: Datos_personales[] = [];

  let contenidoCSV = "rut,nombre,fecha_nacimiento\n";

  datos.forEach((dato) => {
    contenidoCSV += `${dato.rut},${dato.nombre_1},${dato.fecha_nacimiento}\n`;
  });

  writeFileSync("datos.csv", contenidoCSV, "utf8");
}

function main() {
  if (!url) {
    console.log("sin url");
    process.exit(1);
  }
  if (!usuario || !password) {
    console.log("sin credenciales");
    process.exit(1);
  }
  obtenerDatos(url, usuario, password);

  //guardarDatos();
}

main();
