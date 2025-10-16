// Simple browser-only helper for BCCR Economic Indicators
// Fixed endpoint (BCCR):
//   https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicos
// Usage (builds query automatically):
//   node TDC.js INDICADOR FECHA_INICIO FECHA_FINAL NOMBRE SUBNIVELES
// Where dates are in DD/MM/YYYY per BCCR docs.

// If arguments omitted, defaults attempt to fetch today's indicator 317.

const isBrowser = true;
const URLCtor = URL;

/**
 * Perform an HTTP(S) GET request and return a Promise with { statusCode, headers, body }.
 * - Automatically parses JSON responses when Content-Type contains 'application/json'.
 * - Uses only built-in Node.js modules (no dependencies).
 *
 * @param {string} urlString - The URL to GET.
 * @param {object} [opts] - Optional settings: { timeoutMs }
 * @returns {Promise<{statusCode:number, headers:object, body:any}>}
 */
function httpGet(urlString, opts = {}) {
	if (isBrowser && typeof fetch === 'function') {
		return fetch(urlString, {
			method: 'GET',
			mode: 'cors',
			headers: {
				'Accept': 'application/xml, text/xml, */*',
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			credentials: 'omit'
		})
			.then(async (res) => {
				const statusCode = res.status;
				const headers = {};
				res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
				const contentType = headers['content-type'] || '';
				const raw = await res.text();
				let body = raw;
				if (contentType.includes('application/json')) {
					try { body = JSON.parse(raw); } catch (err) { body = { parseError: err.message, raw }; }
				}
				return { statusCode, headers, body };
			});
	}
    // Node path removed for browser-only build
    return Promise.reject(new Error('Fetch API not available in this environment'));
}

// Use local proxy endpoint to avoid CORS issues
// Direct BCCR endpoint: https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicos
const BCCR_ENDPOINT = '/api/indicadores';

function todayDDMMYYYY() {
	const d = new Date();
	const dd = String(d.getDate()).padStart(2, '0');
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const yyyy = d.getFullYear();
	return `${dd}/${mm}/${yyyy}`;
}

// Build query string params expected by BCCR service.
// Indicador: numeric code (e.g., 317 Compra, 318 Venta;)
// FechaInicio, FechaFinal: Today DD/MM/YYYY
// Nombre: subscriber name (string)
// SubNiveles: 'S' or 'N'
// CorreoElectronico: subscriber email (string)
// Token: subscription token (string)
function buildBccrUrl({ Indicador, FechaInicio, FechaFinal, Nombre, SubNiveles, Token, CorreoElectronico }) {
	const params = new URLSearchParams({ Indicador, FechaInicio, FechaFinal, Nombre, SubNiveles, Token, CorreoElectronico });
	return `${BCCR_ENDPOINT}?${params.toString()}`;
}

// Very light-weight XML parse to extract <NUM_VALOR> and <DES_FECHA> per row.
function parseBccrXml(xml) {
	if (typeof xml !== 'string') return { raw: xml, items: [] };
	
	// Match INGC011_CAT_INDICADORECONOMIC blocks (with any attributes)
	const itemRegex = /<INGC011_CAT_INDICADORECONOMIC[^>]*>([\s\S]*?)<\/INGC011_CAT_INDICADORECONOMIC>/g;
	const valueRegex = /<NUM_VALOR>([\s\S]*?)<\/NUM_VALOR>/;
	const dateRegex = /<DES_FECHA>([\s\S]*?)<\/DES_FECHA>/;
	const codRegex = /<COD_INDICADORINTERNO>([\s\S]*?)<\/COD_INDICADORINTERNO>/;
	
	const items = [];
	let match;
	
	while ((match = itemRegex.exec(xml)) !== null) {
		const block = match[1]; // Content between opening and closing tags
		const valueMatch = valueRegex.exec(block);
		const dateMatch = dateRegex.exec(block);
		const codMatch = codRegex.exec(block);
		
		if (valueMatch && dateMatch) {
			const rawValue = valueMatch[1].trim();
			const rawDate = dateMatch[1].trim();
			const rawCod = codMatch ? codMatch[1].trim() : undefined;
			
			let day, month;
			if (/^\d{4}-\d{2}-\d{2}T/.test(rawDate)) {
				// Format: YYYY-MM-DDTHH:mm:ss
				const d = new Date(rawDate);
				day = String(d.getDate()).padStart(2, '0');
				month = String(d.getMonth() + 1).padStart(2, '0');
			} else {
				// Format: DD/MM/YYYY
				[day, month] = rawDate.split('/');
			}
			items.push({
				indicador: rawCod,
				valor: parseFloat(rawValue)
			});
		}
	}
	console.log(items);
	
	return { items, count: items.length };
}


// Browser global exposure
function fetchIndicator({ indicador, fechaInicio, fechaFinal, nombre = 'Daniel Arrieta', subNiveles = 'N', token = 'M06AOT01C5', correo = 'darrieta525@gmail.com' }) {
    const params = {
        Indicador: indicador,
        FechaInicio: fechaInicio,
        FechaFinal: fechaFinal,
        Nombre: nombre,
        SubNiveles: subNiveles.toUpperCase(),
        Token: token,
        CorreoElectronico: correo,
    };
    const url = buildBccrUrl(params);
    return httpGet(url).then(({ body }) => parseBccrXml(body));
}

window.BCCR = {
    buildBccrUrl,
    parseBccrXml,
    fetchIndicator,
    today: todayDDMMYYYY
};

