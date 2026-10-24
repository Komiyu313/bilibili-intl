// Diagnostic only: find which response hands the app its splash keep ids (16-digit numbers such as 6342887967322112).
// Logs the path and the matching numbers only, never the body. The response is passed through unchanged.
const path = $request.url.replace(/^https?:\/\/([^/?]+)([^?]*).*$/, '$1$2');
const body = typeof $response.body === 'string' ? $response.body : '';
const ids = body.match(/(?<![0-9])[67]3[45][0-9]{13}(?![0-9])/g);
if (ids) {
    const uniq = [...new Set(ids)];
    console.log(`[keepids] ${path} found ${uniq.length}: ${uniq.slice(0, 12).join(',')}`);
}
$done({});
