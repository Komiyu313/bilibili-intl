// Diagnostic only (dev branch): find out which App Store requests check for and download
// updates, and how a Bilibili entry appears in them. Logs URL paths, parameter names, field
// names and short snippets around Bilibili identifiers. Never logs headers, query values
// or whole bodies, because those carry Apple account data.
const isResp = typeof $response !== 'undefined';
const msg = isResp ? $response : $request;
const BILI = /736536022|1548857482|tv\.danmaku\.[A-Za-z0-9.]+|com\.bilibili\.[A-Za-z0-9.]+/g;
try {
    const u = $request.url;
    const qi = u.indexOf('?');
    const path = qi < 0 ? u : u.slice(0, qi);
    const params = qi < 0 ? '' : u.slice(qi + 1).split('&').map(p => p.split('=')[0]).join(',');
    const headers = msg.headers || {};
    const ct = headers['Content-Type'] || headers['content-type'] || '';
    let body = typeof msg.body === 'string' ? msg.body : '';
    let keys = [];
    if (/json/i.test(ct) || /^\s*[\[{]/.test(body)) {
        const walk = (o, d) => {
            if (!o || typeof o !== 'object' || d > 3) return;
            for (const k of Object.keys(o)) { if (!Array.isArray(o)) keys.push(k); walk(o[k], d + 1); }
        };
        try { walk(JSON.parse(body), 0); } catch (e) { keys.push('(json parse failed)'); }
    } else {
        keys = (body.match(/<key>[^<]{1,60}<\/key>/g) || []).map(k => k.slice(5, -6));
    }
    keys = [...new Set(keys)].slice(0, 80);
    // Blank out anything that could be a token: <data> blobs and long opaque runs.
    const mask = t => t.replace(/\s+/g, ' ').replace(/<data>[^<]*<\/data>/g, '<data>…</data>')
        .replace(/[A-Za-z0-9+\/=_-]{24,}/g, '«…»');
    const hits = [];
    let lastEnd = -1;
    let m;
    while ((m = BILI.exec(body)) && hits.length < 6) {
        const a = Math.max(0, m.index - 160), b = Math.min(body.length, m.index + m[0].length + 160);
        if (hits.length && m.index < lastEnd) continue;
        lastEnd = b;
        hits.push(mask(body.slice(a, b)));
    }
    console.log(`[probe] ${isResp ? 'RESP ' + (msg.status || '') : 'REQ'} ${$request.method} ${path}` +
        ` params=[${params}] ct=${ct} len=${body.length} keys=[${keys.join(',')}]`);
    hits.forEach((h, i) => console.log(`[probe] bili#${i + 1}: ${h}`));
} catch (e) {
    console.log('[probe] error ' + e);
}
$done({});
