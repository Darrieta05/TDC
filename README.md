# Tipo de Cambio - BCCR Exchange Rate Display

Display real-time exchange rates (Tipo de Cambio) from Costa Rica's Central Bank (BCCR) with a simple Express proxy server to handle CORS restrictions.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Proxy Server
```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Open in Browser
Navigate to: **http://localhost:3000/index.html**

The page will automatically fetch and display:
- **Indicator 317** - Tipo de Cambio Compra (Buy Rate)
- **Indicator 318** - Tipo de Cambio Venta (Sell Rate)

## 📁 Project Structure

```
TipodeCambio/
├── index.html          # Frontend display page
├── TDC.js             # Browser helper for BCCR API
├── server.js          # Express proxy server
├── package.json       # Node.js dependencies
└── README.md          # This file
```

## 🔧 How It Works

1. **Browser** requests data from `/api/indicadores` (local proxy)
2. **Proxy Server** forwards the request to BCCR's actual endpoint
3. **BCCR** responds with XML data
4. **Proxy** returns XML to browser with proper CORS headers
5. **TDC.js** parses XML and updates the page

## 🔑 API Parameters

The BCCR API requires these parameters:
- **Indicador**: Indicator code (317=Compra, 318=Venta)
- **FechaInicio**: Start date (DD/MM/YYYY)
- **FechaFinal**: End date (DD/MM/YYYY)
- **Nombre**: Subscriber name
- **SubNiveles**: Sub-levels (S/N)
- **Token**: API token (default: M06AOT01C5)
- **CorreoElectronico**: Email (default: darrieta525@gmail.com)

## 📡 Proxy Endpoints

### GET /api/indicadores
Proxies requests to BCCR with query parameters

Example:
```
http://localhost:3000/api/indicadores?Indicador=317&FechaInicio=15/10/2025&FechaFinal=15/10/2025&Nombre=Daniel&SubNiveles=N&Token=M06AOT01C5&CorreoElectronico=darrieta525@gmail.com
```

### GET /health
Health check endpoint
```json
{ "status": "ok", "timestamp": "2025-10-15T..." }
```

## 🛠️ Development

To modify default token/email, edit the defaults in `TDC.js`:
```javascript
function fetchIndicator({ 
  token = 'YOUR_TOKEN', 
  correo = 'your@email.com' 
}) { ... }
```

To change the port, set the PORT environment variable:
```bash
PORT=8080 npm start
```

## 📝 Notes

- The proxy server handles CORS issues by forwarding requests server-side
- All static files (HTML, JS) are served from the project root
- The BCCR endpoint responds with XML which is parsed in the browser

## 🐛 Troubleshooting

**Issue**: "Cannot GET /"
- **Solution**: Navigate to `/index.html` explicitly

**Issue**: "ECONNREFUSED" or network errors
- **Solution**: Check your internet connection and verify BCCR endpoint is accessible

**Issue**: No data displayed
- **Solution**: Check browser console for errors and server logs for proxy status

## 📄 License

ISC
