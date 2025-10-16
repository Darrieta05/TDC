const xml = `<?xml version="1.0" encoding="utf-8"?>
<DataSet xmlns="http://ws.sdde.bccr.fi.cr">
  <diffgr:diffgram xmlns:msdata="urn:schemas-microsoft-com:xml-msdata" xmlns:diffgr="urn:schemas-microsoft-com:xml-diffgram-v1">
    <Datos_de_INGC011_CAT_INDICADORECONOMIC xmlns="">
      <INGC011_CAT_INDICADORECONOMIC diffgr:id="INGC011_CAT_INDICADORECONOMIC1" msdata:rowOrder="0">
        <COD_INDICADORINTERNO>317</COD_INDICADORINTERNO>
        <DES_FECHA>2025-10-15T00:00:00-06:00</DES_FECHA>
        <NUM_VALOR>501.41000000</NUM_VALOR>
      </INGC011_CAT_INDICADORECONOMIC>
    </Datos_de_INGC011_CAT_INDICADORECONOMIC>
  </diffgr:diffgram>
</DataSet>`;

// Test the regex
const itemRegex = /<INGC011_CAT_INDICADORECONOMIC[^>]*>([\s\S]*?)<\/INGC011_CAT_INDICADORECONOMIC>/g;
const valueRegex = /<NUM_VALOR>([\s\S]*?)<\/NUM_VALOR>/;
const dateRegex = /<DES_FECHA>([\s\S]*?)<\/DES_FECHA>/;
const codRegex = /<COD_INDICADORINTERNO>([\s\S]*?)<\/COD_INDICADORINTERNO>/;

const items = [];
let match;

console.log('Testing XML parser...\n');

while ((match = itemRegex.exec(xml)) !== null) {
  console.log('Found INGC011 block');
  const block = match[1];
  console.log('Block content:', block.substring(0, 100));
  
  const valueMatch = valueRegex.exec(block);
  const dateMatch = dateRegex.exec(block);
  const codMatch = codRegex.exec(block);
  
  console.log('Value match:', valueMatch ? valueMatch[1].trim() : 'NONE');
  console.log('Date match:', dateMatch ? dateMatch[1].trim() : 'NONE');
  console.log('Code match:', codMatch ? codMatch[1].trim() : 'NONE');
  
  if (valueMatch && dateMatch) {
    items.push({
      indicador: codMatch ? codMatch[1].trim() : undefined,
      fecha: dateMatch[1].trim(),
      valor: parseFloat(valueMatch[1].trim())
    });
  }
}

console.log('\nParsed items:', JSON.stringify(items, null, 2));
