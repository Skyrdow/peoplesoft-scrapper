import { Builder, By, ThenableWebDriver, until } from "selenium-webdriver";
import { writeFileSync } from "node:fs";
import { config } from "dotenv";
import { Datos_contrato, Datos_personales } from "./types";
import { ids, xpaths } from "./xpaths";

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
  const datos_p: Datos_personales[] = [];
  const datos_c: Datos_contrato[] = [];
  // Setup

  // Coneccion a http
  // options.addArguments("--ignore-certificate-errors");
  // options.addArguments("--ignore-ssl-errors");
  // options.addArguments("--allow-insecure-localhost");
  // options.addArguments("--allow-running-insecure-content");
  // options.setAcceptInsecureCerts(true);

  const driver = new Builder().forBrowser("firefox").build();
  // driver.manage().window().maximize();
  await driver.get(url);

  await driver.sleep(500);
  // Ingresar al login de peoplesoft
  const rrhh = await driver.findElement(By.css(".ingreso_rrhh"));

  await rrhh.click();

  const handles = await driver.getAllWindowHandles();

  await driver.switchTo().window(handles[handles.length - 1]);

  await driver.sleep(700);

  // Login
  const user_input = await driver.findElement(By.id("userid"));
  await user_input.clear();
  await user_input.sendKeys(usuario);
  const password_input = await driver.findElement(By.id("pwd"));
  await password_input.clear();
  await password_input.sendKeys(password);

  await driver.findElement(By.name("Submit")).click();

  await driver.sleep(700);

  console.log("===================================");
  console.log(await driver.getTitle());
  console.log("===================================");

  await driver.findElement(By.name("HC_WORKFORCE_ADMINISTRATION")).click();
  await driver.sleep(1000);

  console.log("===================================");
  console.log(await driver.getTitle());
  console.log("===================================");
  // NAVEGAR LA SIDEBAR
  var iframe = await driver.findElement(By.name("NAV"));
  await driver.switchTo().frame(iframe);
  await driver.sleep(700);

  await driver.findElement(By.name("CO_PERSONAL_INFORMATION")).click();
  await driver.wait(until.elementLocated(By.name("HC_PERSON_BIO")), 5000);

  await driver.findElement(By.name("HC_PERSON_BIO")).click();
  await driver.wait(until.elementLocated(By.name("HC_PERSONAL_DATA2")), 5000);

  await driver.findElement(By.name("HC_PERSONAL_DATA2")).click();
  await driver.sleep(700);

  await driver.switchTo().defaultContent();

  console.log("===================================");
  console.log(await driver.getTitle());
  console.log("===================================");
  var iframe = await driver.findElement(By.name("TargetContent"));
  await driver.switchTo().frame(iframe);
  await driver.sleep(700);

  console.log("===================================");
  console.log(await driver.getTitle());
  console.log("===================================");

  const ruts = ["21266659-9", "21172165-7"];
  for (let i = 0; i < ruts.length; i++) {
    var rut = await driver.findElement(By.id("PERALL_SEC_SRCH_EMPLID"));

    await rut.sendKeys();

    await driver.findElement(By.id("#ICSearch")).click();
    await driver.sleep(700);

    const dato: Datos_personales = {
      rut: "",
      nombre_1: "",
      nombre_2: "",
      apellido_1: "",
      apellido_2: "",
      fecha_nacimiento: "",
      lugar_nacimiento: "",
      pais_nacimiento: "",
      estado_civil: "",
      direccion: "",
      villa: "",
      comuna: "",
      numero: "",
      correo: "",
    };

    const nombre_tabla = await driver
      .findElement(By.xpath(xpaths.nombre))
      .getText();
    const split = nombre_tabla.split(" ");

    if (split.length == 4) {
      dato.nombre_1 = split[0];
      dato.nombre_2 = split[1];
      dato.apellido_1 = split[2];
      dato.apellido_2 = split[3];
    }
    if (split.length == 3) {
      dato.nombre_1 = split[0];
      dato.apellido_1 = split[1];
      dato.apellido_2 = split[2];
    }

    dato.fecha_nacimiento = await driver
      .findElement(By.id(ids.fecha_nacimiento))
      .getText();

    dato.lugar_nacimiento = await driver
      .findElement(By.id(ids.lugar_nacimiento))
      .getText();

    dato.pais_nacimiento = await driver
      .findElement(By.id(ids.pais_nacimiento))
      .getText();

    dato.estado_civil = await driver
      .findElement(By.id(ids.estado_civil))
      .getText();

    await driver.findElement(By.css("a.PSINACTIVETAB")).click();

    const direccion_completa = await driver
      .findElement(By.xpath(xpaths.direccion))
      .getText();

    const numero = await driver.findElement(By.id(ids.numero)).getText();
    if (numero.length == 8) {
      dato.numero = numero;
    } else if (numero.length == 9) {
      if (numero.includes(" ")) {
        dato.numero = numero.split(" ").join("");
      } else {
        dato.numero = numero.substring(1);
      }
    }

    const correo = await driver.findElement(By.id(ids.correo)).getText();
    if (!correo.includes("usach.cl")) {
      dato.correo = correo;
    }

    console.log(dato);
    datos_p.push(dato);

    await driver.findElement(By.id("#ICList")).click();
    await driver.wait(
      until.elementLocated(By.id("PERALL_SEC_SRCH_EMPLID")),
      5000,
    );
  }
  // NAVEGAR LA SIDEBAR
  var iframe = await driver.findElement(By.name("NAV"));
  await driver.switchTo().frame(iframe);
  await driver.sleep(700);

  await driver.findElement(By.name("CO_PERSONAL_INFORMATION")).click();
  await driver.wait(until.elementLocated(By.name("HC_PERSON_BIO")), 5000);

  await driver.findElement(By.name("HC_PERSONAL_DATA2")).click();
  await driver.sleep(700);

  await driver.switchTo().defaultContent();

  console.log("===================================");
  console.log(await driver.getTitle());
  console.log("===================================");
  var iframe = await driver.findElement(By.name("TargetContent"));
  await driver.switchTo().frame(iframe);
  await driver.sleep(700);

  for (let i = 0; i < ruts.length; i++) {
    var rut = await driver.findElement(By.id("PERALL_SEC_SRCH_EMPLID"));

    await rut.sendKeys();

    await driver.findElement(By.id("#ICSearch")).click();
    await driver.sleep(700);

    const dato: Datos_contrato = {
      tipo: "",
      estado: "",
      inicio: "",
      fin: "",
      motivo: "",
      facultad: "",
      ubicacion: "",
    };

    dato.tipo = await driver.findElement(By.name("algo")).getText();
    dato.estado = await driver.findElement(By.name("algo")).getText();
    dato.inicio = await driver.findElement(By.name("algo")).getText();
    dato.fin = await driver.findElement(By.name("algo")).getText();
    dato.motivo = await driver.findElement(By.name("algo")).getText();
    dato.facultad = await driver.findElement(By.name("algo")).getText();
    dato.ubicacion = await driver.findElement(By.name("algo")).getText();

    console.log(dato);
    datos_c.push(dato);

    await driver.findElement(By.id("#ICList")).click();
    await driver.wait(
      until.elementLocated(By.id("PERALL_SEC_SRCH_EMPLID")),
      5000,
    );
  }
  return { datos_p, datos_c };
}

function guardarDatos({
  datos_p,
  datos_c,
}: {
  datos_p: Datos_personales[];
  datos_c: Datos_contrato[];
}) {
  let contenidoCSV = "rut,nombre,fecha_nacimiento\n";

  for (let i = 0; i < datos_p.length; i++) {
    const dato_p = datos_p[i];
    const dato_c = datos_c[i];
    contenidoCSV +=
      `${dato_p.rut},` +
      `${dato_p.nombre_1},` +
      `${dato_p.nombre_2},` +
      `${dato_p.apellido_1},` +
      `${dato_p.apellido_2},` +
      `${dato_p.fecha_nacimiento},` +
      `${dato_p.lugar_nacimiento},` +
      `${dato_p.pais_nacimiento},` +
      `${dato_p.estado_civil},` +
      `${dato_p.direccion},` +
      `${dato_p.villa},` +
      `${dato_p.comuna},` +
      `${dato_p.numero},` +
      `${dato_p.correo},` +
      `${dato_p.correo},` +
      `${dato_c.tipo},` +
      `${dato_c.estado},` +
      `${dato_c.inicio},` +
      `${dato_c.fin},` +
      `${dato_c.motivo},` +
      `${dato_c.facultad},` +
      `${dato_c.ubicacion}\n`;
  }
  writeFileSync("datos.csv", contenidoCSV, "utf8");
}

async function main() {
  if (!url) {
    console.log("sin url");
    process.exit(1);
  }
  if (!usuario || !password) {
    console.log("sin credenciales");
    process.exit(1);
  }
  const datos = await obtenerDatos(url, usuario, password);

  guardarDatos(datos);
}

main();
