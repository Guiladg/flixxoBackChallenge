# Project

Backend Challenge for Flixxo

## Developing

### Description

This is an application, coded in TypeScript for Node.js, that provides an API to fetch and modify data about cryptocurrencies.

It was developed on top of JSON Web Token (JWT) for authentication, and using http-only cookies, to provide a higher security level. It also relies on a standard cookie for a control purpose, giving the user the possibility to logout offline.

Database handling is made through TypeORM plugin. Endpoints that show lists are prepared for future pagination, returning an object, that contains the data itself and the pagination status.

Comments are made according to Deno style guide: https://docs.deno.com/runtime/manual/references/contributing/style_guide#use-jsdoc-for-exported-symbols.

### Built With

-  Node.js
-  Express
-  JsonWebToken
-  Sequelize
-  Class-Validator
-  BcryptJS
-  Docker

### Prerequisites

-  Node.js version >= 18
-  NPM version >= 9
-  PostgreSQL >= 15

## Installing - the basic setup

### Core files

To run the API on a new server, first of all, clone the repository from GitHub

```shell
git clone https://github.com/guiladg/flixxoBackChallenge
cd flixxoBackChallenge/
```

This steps will download all the development files.

### Configuration

The app relies on a `.env` file as the environment-specific configuration. The repository comes with a `.env.sample` file that contains the needed variables and sample values.

To create a new `.env` file with the same data provided in the sample file just copy and rename.

_If database setup instructions will not be modified from the one in this file, there is no need to change .env either._

## Installing - deploying without Docker

### Database

Commands to run on PSQL Shell:

```sql
CREATE DATABASE guiladg_flixxo;
CREATE USER guiladg_flixxo_user WITH ENCRYPTED PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE guiladg_flixxo TO guiladg_flixxo_user;
\c guiladg_flixxo postgres
GRANT ALL ON SCHEMA public TO guiladg_flixxo_user;
```

_Use the password set on the .env file before_

This will create a new database and a new user with all privileges granted.

### Downloading dependencies

```shell
npm i
```

This will download the dependencies required to run the application.

### Mocking data

At this time, database will be empty so it needs some data to be inserted for the app to work properly. Run:

```shell
npm run mockData
```

This will create an administrator user with username: **admin** and password: **admin**, and a bunch of currencies and their historical prices.

### Building and running

After setting up the environment or if any of the files are modified, the project needs to be built and started. For archiving this:

```shell
npm run start:prod
```

This will build and run the application, and start listening for RESTful API requests.

## Installing - deploying with Docker

For deploying in a server with a Docking environment just run the following command and wait for containers to start. Two containers will be created, one with the app, and the other with the database. On the first run it will also automatically mock data.

```shell
docker-compose up
```

## Api Reference

### Public endpoints

-  **GET** /currency

   Lists all currencies present in the database.

-  **GET** /price/`currency_symbol`

   Lists historical prices of the requested currency.

-  **GET** /price/`currency_symbol`/last

   Shows the last price of the requested currency.

### Private endpoints (_logged-in users only_)

-  **GET** /price/`currency_symbol`

   Same as public, but shows prices ids for data manipulation.

-  **GET** /price/`currency_symbol`/last

   Same as public, but shows price id for data manipulation.

-  **POST** /price/`currency_symbol`
   | Name | Required | Type |
   | :-------------|:--------:|:-------:|
   | `value` | required | number |
   | `date` | optional | Date |

   Inserts a new price for the desired currency. If a specific date is not provided, current date is used.

-  **PATCH** /price/`price_id`
   | Name | Required | Type |
   | :------ | :------: | :----: |
   | `value` | optional | number |
   | `date` | optional | Date |

   Modifies saved data of the desired price record.

### Authorization endpoints

-  **POST** /auth/login
   | Name | Required | Type |
   | :--------- | :------: | :----: |
   | `username` | required | string |
   | `password` | required | string |

   Logs in user and returns authorization tokens as cookies.

-  **POST** /auth/refresh

   Refreshes tokens and returns them as new cookies.

-  **POST** /auth/logout

   Logs out user and delete tokens.

# Respuestas

### ¿Qué es SQL Injection y cómo puede evitarse?

Es un problema de vulnerabilidad en la seguridad que se da cuando una aplicación no valida la entrada del usuario antes de incluirla en un comando SQL. El ejemplo más claro es en el caso de las búsquedas. Si el comando sql es `SELECT * FROM users WHERE username = '{variable}'`, en la medida en que la variable no esté escapada de ninguna manera, el atacante podría escribir `' OR 'a'='a`, y esto dejaría como comando final `SELECT * FROM users WHERE username = '' OR 'a'='a'`. Así, obtendría la información completa de la tabla de usuarios.

Para evitarlo, la mejor manera es usar herramientas como TypeORM o Prisma, en el caso de Node.js, usando sus funciones y métodos para el manejo de las bases de datos. En el caso de necesitar ejecutar un comando SQL puro, lo ideal es usar funciones del propio sistema de base de datos o diseñadas especificamente para evitar la inyeccion. Por ejemplo, en PHP existe **mysql_real_escape_string()** y para Node.js hay múltiples bibliotecas en NPM.

### ¿Cuándo es conveniente utilizar SQL Transactions? Dar un ejemplo.

Siempre que sea necesario ingresar información en la base de datos, que tenga vinculación entre sí, pero que no forme parte de una misma instrucción, es ideal realizarlo dentro de una transacción. Un ejemplo, es cuando se _parsea_ un archivo que se recibe desde un sistema (como una exportación a csv) con el fin de incorporar sus datos a otro sistema, siguiendo la estructura de este último. En esos casos, si ocurre un error en medio del proceso, se debe cancelar toda la inclusión en la base datos, de lo contrario quedaría solo una parte del archivo procesado, algo que no solo es insuficiente, sino que además complica sobremanera cualquier paso siguiente. Otro ejemplo muy común, es cuando una acción depende de dos procesos paralelos, como subir el saldo en una cuenta y bajarlo en otra, para hacer un pase de dinero entre estas. Si se produce un error en el medio del proceso, la transacción entera debe cancelarse para mantener el saldo final en cero.

### Describí brevemente las ventajas del patrón controller/service/repository

Al dividir en tres capas la lógica de la aplicación, permite diferenciarlas claramente, logrando una mejor y más facil lectura del código, haciéndolo más legible y manejable. Esto a su vez, permite hacer _testeos_ mucho más simples, que no requieren comprobar el funcionamiento del todo el código, sino solo de sectores.

Además, mejora la escalabilidad, ya que permite hacer crecer partes del código sin tener modificar otras, lo que ayuda mucho en el caso de trabajar equipos de desarrollo. Esto último, lo vuelve en general menos rígido y más dinámico, por el solo hecho de poder, por ejemplo, actualizar el sistema de bases de datos, cambiar el repositorio y dejar las otras dos capas intactas.

### ¿Cuál es la mejor forma de guardar un campo de tipo enum en la DB?

Depende sel sistema de bases de datos que se use. Algunos, proporcionan directamente la posibilidad de guardar datos de tipo ENUM, como MySQL o PostgreSQL. A su vez, existen alternativas, como crear una tabla de relación (ej: talles), o definir desde el código qué significa cada ítem de la enumeración y guardarla como un número de la lista (ej: 1 para small) o como texto, ya sea en clave (ej: M para medium) o completo (ej: large).

### Usando async/await: ¿cómo se puede aprovechar el paralelismo?

Node.js incorpora algo, que en su momento fue muy revolucionario en cuanto al estándar de internet, que era —y en parte continúa siéndolo— PHP. La posibilidad de ejecutar procesos en paralelo, permite una utilización mucho más razonable de los recursos del sistema. Por ejemplo, hay procesos que demoran mucho tiempo, sobre todo los que implican lectura/escritura de datos en discos; poder procesar información, "mandarla" a grabar mientras se recibe otra petición y se trabaja con ella instantaneamente, es uno de los casos típicos. Cualquier proceso que pueda realizarse por partes, que no requieran su ejecución lineal, tiene sentido realizarlas mediante subprocesos asíncronos.

La palabra clave `await`, permite que la ejecución del código se haga como si no fuera asíncrona, "esperando" a que la función en cuestión finalice antes de ejecutar la linea siguiente. Esto ayuda a la legibilidad del código, evitando las promesas en cascada.

Otra estrategia para resolver las promesas en cascada y a su vez permitir la ejecución en paralelo de múltiples funciones manteniendo su control, es la utilización del método `Promise.all`. En sí, esto no es más que una nueva promesa, que espera a la resolución de todas las promesas que le sean pasadas como parámetros para recién ahí resolver.

```typescript
const Promise1 = new Promise((resolve, reject) => {...});
const Promise2 = new Promise((resolve, reject) => {...});
const Promise3 = asyncFn1();
const Promise4 = asyncFn2();

Promise.all([Promise1, Promise2, Promise3, Promise4])
   .then(() => {...})
   .catch(() => {...})
   .finally(() => {...})
```

En este caso, se crean 4 promesas que después se conjugan en el `Promise.all`. Si cualquiera de ellas, sin importar el orden, devolviera un error, se ejecutaría la función dentro del `catch`, mientras que solo si las cuatro progresan sin errores, se ejecutaría la función dentro del `then`.
