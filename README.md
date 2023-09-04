# Project

Backend Challenge for Flixxo

## Description

This is an application, coded TypeScript for Node.js, that provides an API to fetch and modify data about cryptocurrencies.

It was developed on top of JSON Web Token (JWT) for authentication, and using http-only cookies for better security. It also relies on a standard cookie for a control purpose, giving the user the possibility to logout offline.

Database handling is made through TypeORM. Endpoints that show lists are prepared for future pagination, returning an object containing the data itself and pagination status.

## Installing

Set up database:

```sql
CREATE SCHEMA guiladgFlixxo;
CREATE USER 'guiladgFlixxoUser'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';
GRANT ALL ON fl.* to guiladgFlixxoUser@localhost;
```

_Please set a strong password, 123456 is an example_

This will create a new database and a new user with all privileges granted.

## Developing

### Built With

-  NodeJs
-  Express
-  JsonWebToken
-  TypeORM
-  BcryptJS

### Prerequisites

-  Node.js version >= 18
-  NPM version >= 9
-  MySQL/MariaDB version = 8

### Setting up Dev

To run the API on a new server, first of all, clone repository from GitHub

```shell
git clone https://github.com/guiladg/flixxoBackChallenge
cd flixxoBackChallenge/
npm i
```

This steps will download all the development files, and install the dependencies.

### Configuration

The app relies on a .env file as the environment-specific configuration. The repository comes with a .env.sample file that contains the needed variables and sample values. To create a new .env file with the same data provided in the sample file just copy:

```shell
cp .env.sample .env
```

To change the configuration, run, edit and then save:

```shell
nano .env
```

_If database setup example was not modified from the one in this file, there is no need to change .env either._

### Mocking data

At this time, database will be empty so it needs some data to be inserted for the app to work properly. Run:

```shell
npm run mockData
```

This will create an administrator user with username: **admin** and password: **admin**, and a bunch of currencies and their historical prices.

### Building

After setting up the environment or if any of the files are modified, the project needs to be built and started. For archiving this:

```shell
npm run start
```

This will build and run the application, and start listening for RESTful API requests.

## Api Reference

### Public endpoints

-  **GET** /currency

   Lists all currencies present in the database.

-  **GET** /price/`currency_symbol`

   Lists historical prices of the requested currency.

-  **GET** /price/`currency_symbol`/last

   Shows the last price of the requested currency.

### Private endpoints (for logged in user)

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
