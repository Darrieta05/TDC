// Simple Express proxy server for BCCR API (bypasses CORS restrictions)
const express = require('express');
const cors = require('cors');
const https = require('https');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files (index.html, TDC.js, etc.)
app.use(express.static('.'));

// Proxy endpoint that forwards to BCCR
app.get('/api/indicadores', (req, res) => {
    // Build the BCCR URL with query params from the client request
    const bccrEndpoint = 'https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicos';
    const queryParams = new URLSearchParams(req.query).toString();
    const fullUrl = `${bccrEndpoint}?${queryParams}`;

    console.log(`[Proxy] Forwarding request to: ${fullUrl}`);

    // Make HTTPS request to BCCR
    https.get(fullUrl, (bccrResponse) => {
        let data = '';

        // Set response headers
        res.set('Content-Type', bccrResponse.headers['content-type'] || 'text/xml');

        // Collect data chunks
        bccrResponse.on('data', (chunk) => {
            data += chunk;
        });

        // Send complete response back to browser
        bccrResponse.on('end', () => {
            console.log(`[Proxy] Response received (${data.length} bytes, status: ${bccrResponse.statusCode})`);
            res.status(bccrResponse.statusCode).send(data);
        });

    }).on('error', (err) => {
        console.error('[Proxy] Error fetching from BCCR:', err.message);
        res.status(500).json({ error: 'Failed to fetch from BCCR', message: err.message });
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`✅ BCCR Proxy Server running at http://localhost:${PORT}`);
    console.log(`📄 Open http://localhost:${PORT}/index.html in your browser`);
    console.log(`🔄 Proxy endpoint: http://localhost:${PORT}/api/indicadores`);
});
