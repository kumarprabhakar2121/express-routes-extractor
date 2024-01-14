
---

# Express Routes Extractor

A utility module for extracting and processing routes from Express applications.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The Express Routes Extractor is a JavaScript module that provides functions to extract and process routes from Express applications. It is particularly useful when you need to inspect and analyze the routing structure of your Express application.

## Installation

To install the Express Routes Extractor, use the following npm command:

```bash
npm install express-routes-extractor
```

## Usage

### ES6 Module

```javascript
import { extractExpressRoutes, isExpressRouter } from 'express-routes-extractor';
import express from 'express';

// Your Express application instance
const myApp = express();

// Extract routes
const routes = extractExpressRoutes(myApp);
// Returns an array of route objects with information about the HTTP method and path.
/* [ { path: '/ping', method: 'POST' }  ] */

// Check if the application is an Express router
import router from "./router.js";

const isRouter = isExpressRouter(router);
console.log('Is Express Router:', isRouter); // true
// Returns 'true' if the application is an Express router, otherwise false.
```

### CommonJS (Node.js)

```javascript
const { extractExpressRoutes, isExpressRouter } = require('express-routes-extractor');
const express = require('express');

// Your Express application instance
const myApp = express();

// Extract routes
const routes = extractExpressRoutes(myApp);
// Returns an array of route objects with information about the HTTP method and path.
/* [ { path: '/ping', method: 'POST' }  ] */

// Check if the application is an Express router
const router = require("./user-router.js");
const isRouter = isExpressRouter(router);
console.log('Is Express Router:', isRouter); // true
// Returns 'true' if the application is an Express router, otherwise false.
```

## API Reference

### `extractExpressRoutes(application)`

Extracts routes from the given Express application.

- **Parameters:**
  - `application`: An instance of an Express application.

- **Returns:**
  - An array of route objects with information about the HTTP method and path.

### `isExpressRouter(application)`

Checks if the given application is an Express router.

- **Parameters:**
  - `application`: An instance of an Express application.

- **Returns:**
  - `true` if the application is an Express router, otherwise `false`.

## Examples

```javascript
import { extractExpressRoutes, isExpressRouter } from 'express-routes-extractor';
import express from 'express';

// Your Express application instance
const myApp = express();

const routes = extractExpressRoutes(myApp);
console.log('Extracted Routes:', routes);
/* [ { path: '/ping', method: 'POST' }  ] */

const router = require("./user-router.js");
const isRouter = isExpressRouter(router);
console.log('Is Express Router:', isRouter); // true
```

## Contributing

If you would like to contribute to this project, please follow our [Contribution Guidelines](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE).

---

Feel free to customize this README according to your specific needs. Add more sections or details if required. Providing clear and concise information will help users understand how to use your module effectively.