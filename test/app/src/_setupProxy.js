const createProxyMiddleware = require("http-proxy-middleware");

const filter = function (pathname, req) {
    const accept = req.header("Accept");
    if (pathname.startsWith("/static")) return false;
    if (!!accept && (accept.includes("html") || accept.includes("image"))) {
        console.log(`HTML: ${pathname} (${accept})`);
        return false;
    }
    console.log(`MINIO: ${pathname} (${accept})`);
    return true;
};

const onProxReq = (proxyReq, req, res) => {
    // add custom header to request
    // proxyReq.setHeader('x-added', 'foobar');
    console.log("HEADERS", req.headers);
    // or log the req
};
module.exports = function (app) {
    app.use(
        createProxyMiddleware(filter, {
            target: "http://minio:9000",
            // changeOrigin: true,
            // logLevel: "debug",
            xfwd: true,
            onProxReq,
            headers: {
                Host: "minio:9000",
                // Connection: "",
            },
            // proxy_set_header X-Real-IP $remote_addr;
            // proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            // proxy_set_header X-Forwarded-Proto $scheme;
            // proxy_set_header Host $http_host;

            // proxy_connect_timeout 300;
            // # Default is HTTP/1, keepalive is only enabled in HTTP/1.1
            // proxy_http_version 1.1;
            // proxy_set_header Connection "";
            // chunked_transfer_encoding off;
        })
    );
};
