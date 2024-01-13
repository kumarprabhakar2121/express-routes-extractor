const pathModule = require("path");

function extractPathFromRegex(regexp) {
    return regexp
        .toString()
        .replace("/^", "")
        .replace("?(?=\\/|$)/i", "")
        .replace(/\\\//g, "/")
        .replace("(?:/(?=$))", "");
}

function flattenNestedStacks(accumulator, currentStack) {
    if (currentStack.handle.stack) {
        const routerPath = extractPathFromRegex(currentStack.regexp);
        return [...accumulator, ...currentStack.handle.stack.map((nestedStack) => ({ routerPath, ...nestedStack }))];
    }
    return [...accumulator, currentStack];
}

function getStacksFromApp(application) {
    // Express 3
    if (application.routes) {
        // convert to express 4
        return Object.keys(application.routes)
            .reduce((accumulator, method) => [...accumulator, ...application.routes[method]], [])
            .map((route) => ({ route: { stack: [route] } }));
    }

    // Express 4
    if (application._router && application._router.stack) {
        return application._router.stack.reduce(flattenNestedStacks, []);
    }

    // Express 4 Router
    if (application.stack) {
        return application.stack.reduce(flattenNestedStacks, []);
    }

    // Express 5
    if (application.router && application.router.stack) {
        return application.router.stack.reduce(flattenNestedStacks, []);
    }

    return [];
}

function normalizePathSegments(segments) {
    return pathModule.normalize(segments.filter((segment) => !!segment).join("")).trim();
}

function processRoutes(currentStack, prefix, paths) {
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
}

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

        return paths;
    } catch (error) {
        console.error("Error in extractExpressRoutes:", error.message);
        return [];
    }
}

function isExpressRouter(application) {
    try {
        const routes = extractExpressRoutes(application);
        return routes.length > 0;
    } catch (error) {
        console.error("Error in isExpressRouter:", error.message);
        return false;
    }
}

module.exports = { extractExpressRoutes, isExpressRouter };
