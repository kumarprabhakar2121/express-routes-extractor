const pathModule = require("path");

/**
 * Extracts a path from a regular expression.
 *
 * @param {RegExp} regexp - The regular expression to extract the path from.
 * @returns {string} The extracted path.
 */
function extractPathFromRegex(regexp) {
    try {
        return regexp
            .toString()
            .replace("/^", "")
            .replace("?(?=\\/|$)/i", "")
            .replace(/\\\//g, "/")
            .replace("(?:/(?=$))", "");
    } catch (error) {
        console.error("Error in extractPathFromRegex:", error.message);
        return "";
    }
}

/**
 * Flattens nested stacks in an Express application.
 *
 * @param {Array} accumulator - The accumulator array.
 * @param {Object} currentStack - The current stack to flatten.
 * @returns {Array} The flattened array.
 */
function flattenNestedStacks(accumulator, currentStack) {
    try {
        if (currentStack.handle.stack) {
            const routerPath = extractPathFromRegex(currentStack.regexp);
            return [
                ...accumulator,
                ...currentStack.handle.stack.map((nestedStack) => ({ routerPath, ...nestedStack }))
            ];
        }
        return [...accumulator, currentStack];
    } catch (error) {
        console.error("Error in flattenNestedStacks:", error.message);
        return accumulator;
    }
}

/**
 * Gets stacks from an Express application.
 *
 * @param {Object} application - The Express application.
 * @returns {Array} The array of stacks.
 */
function getStacksFromApp(application) {
    try {
        // Express 3
        if (application?.routes) {
            // Convert to Express 4
            return Object.keys(application.routes)
                .reduce((accumulator, method) => [...accumulator, ...application.routes[method]], [])
                .map((route) => ({ route: { stack: [route] } }));
        }

        // Express 4
        if (application?._router?.stack) {
            return application._router.stack.reduce(flattenNestedStacks, []);
        }

        // Express 4 Router
        if (application?.stack) {
            return application.stack.reduce(flattenNestedStacks, []);
        }

        // Express 5
        if (application?.router?.stack) {
            return application.router.stack.reduce(flattenNestedStacks, []);
        }

        return [];
    } catch (error) {
        console.error("Error in getStacksFromApp:", error.message);
        return [];
    }
}

/**
 * Normalizes path segments.
 *
 * @param {Array} segments - The array of path segments.
 * @returns {string} The normalized path.
 */
function normalizePathSegments(segments) {
    try {
        return pathModule.normalize(segments.filter((segment) => !!segment).join("")).trim();
    } catch (error) {
        console.error("Error in normalizePathSegments:", error.message);
        return "";
    }
}

/**
 * Processes routes in a current stack and adds them to the paths array.
 *
 * @param {Object} currentStack - The current stack to process.
 * @param {string} prefix - The prefix to add to the paths.
 * @param {Array} paths - The array to store the processed paths.
 */
function processRoutes(currentStack, prefix, paths) {
    try {
        if (currentStack.route) {
            const routeLogged = {};
            for (const route of currentStack.route.stack) {
                const method = route.method ? route.method.toUpperCase() : null;
                if (!routeLogged[method] && method) {
                    const stackPath = normalizePathSegments([
                        prefix,
                        currentStack.routerPath,
                        currentStack.route.path,
                        route.path
                    ]);
                    paths.push({ method, path: stackPath });
                    routeLogged[method] = true;
                }
            }
        }
    } catch (error) {
        console.error("Error in processRoutes:", error.message);
    }
}

/**
 * Extracts Express routes from an application.
 *
 * @param {Object} application - The Express application.
 * @returns {Array} The array of extracted routes.
 */
function extractExpressRoutes(application) {
    try {
        const stacks = getStacksFromApp(application);
        if (stacks.length === 0) {
            return [];
        }
        const prefix = "";
        const paths = [];

        if (stacks) {
            for (const currentStack of stacks) {
                processRoutes(currentStack, prefix, paths);
            }
        }
        const uniquePaths = makeRoutesUnique(paths);
        return uniquePaths;
    } catch (error) {
        console.error("Error in extractExpressRoutes:", error.message);
        return [];
    }
}

/**
 * Checks if an application is an Express router.
 *
 * @param {Object} application - The Express application.
 * @returns {boolean} True if it's an Express router, false otherwise.
 */
function isExpressRouter(application) {
    try {
        const routes = extractExpressRoutes(application);
        return routes.length > 0;
    } catch (error) {
        console.error("Error in isExpressRouter:", error.message);
        return false;
    }
}

/**
 * Makes an array of routes unique based on the combination of method and path.
 *
 * @param {Array<{ method: string, path: string }>} inputRoutes - The array of routes to make unique.
 * @returns {Array<{ method: string, path: string }>} - The array of unique routes.
 */
function makeRoutesUnique(inputRoutes) {
    /**
     * Set to keep track of unique combinations of method and path.
     * @type {Set<string>}
     */
    const uniqueRouteKeys = new Set();

    /**
     * Array to store the result of unique routes.
     * @type {Array<{ method: string, path: string }>}
     */
    const uniqueRoutes = [];

    // Iterate through the inputRoutes array
    for (const route of inputRoutes) {
        /**
         * Unique key representing the combination of method and path.
         * @type {string}
         */
        const routeKey = `${route.method}-${route.path}`;

        // Check if the combination of method and path is already in the set
        if (!uniqueRouteKeys.has(routeKey)) {
            uniqueRouteKeys.add(routeKey);

            // If not, add it to the uniqueRoutes array
            uniqueRoutes.push(route);
        }
    }

    return uniqueRoutes;
}

module.exports = { extractExpressRoutes, isExpressRouter };
