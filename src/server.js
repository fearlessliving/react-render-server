/**
 * The high-level logic for our serving endpoints (api routes).
 */

const bodyParser = require("body-parser");
const express = require("express");

const fetchPackage = require("./fetch_package.js");

const app = express();
app.use(bodyParser.json());


/**
 * Server-side render a react component.
 *
 * The contents to render are sent in the request body as json, in
 * the following format:
 * {
 *    "files": [
 *        "/genfiles/javascript/en/corelibs-package-59eab0.js",
 *        "/genfiles/javascript/en/shared-package-99b641.js",
 *        "/genfiles/javascript/en/content-library-281081.js"
 *    ],
 *    "path": "./javascript/content-library-package/components/link.jsx",
 *    "props": {
 *        "href": "http://www.google.com",
 *        "children": "Google"
 *    }
 * }
 *
 * 'files' are urls relative to www.khanacademy.org (that host is
 * hard-coded; we don't want to download from arbitrary servers here!)
 * 'files' should be specified in topological-sort order; they are
 * executed in the order listed here.
 *
 * 'path' is a path in nodejs require() format, which exports the react
 * component we wish to render.  It must be included in one of the files
 * specified in 'files'.
 *
 * 'props' are passed as the props to the react component being rendered.
 *
 * The return format is also json:
 * {
 *     "html": "<a href='http://www.google.com' class='link141'>Google</a>",
 *     "css": {
 *         content: ".link141{backgroundColor:transparent;}",
 *         renderedClassNames: ["link141"]
 *     }
 * }
 *
 * css will only be returned if the component makes use of Aphrodite
 * (https://github.com/Khan/aphrodite).
 */
app.post('/render', (req, res) => {
    // TODO(csilvers): validate input

    const fetchPromises = req.body.files.map(file => fetchPackage(file));
    Promise.all(fetchPromises).then(
        (fetchBodies) => {
            const allBodies = fetchBodies.join("\n");
            res.json({contents: allBodies});
        },
        (err) => {
            res.json({error: err});
        });
});


app.get('/_api/ping', (req, res) => { res.send('pong!\n'); });

module.exports = app;
