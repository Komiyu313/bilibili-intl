// Diagnostic only: log a short summary of splash and ad responses, then apply upstream's splash handling unchanged.
// Account fields are skipped and URL query strings are cut, so the log carries no account or device data.
const path = $request.url.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
const host = ($request.url.match(/^https?:\/\/([^/]+)/) || [])[1] || '';
const SKIP = /^(mid|uname|name|face|account|access|token|buvid|ip|mobile|tel|email|cookie|session)/i;

function log(msg) {
    console.log(`[diag] ${host}${path} ${msg}`);
}

function scalar(v) {
    if (typeof v !== 'string') return v;
    v = v.split('?')[0];
    return v.length > 120 ? v.slice(0, 120) + '…' : v;
}

function brief(o) {
    if (o === null || typeof o !== 'object') return scalar(o);
    if (Array.isArray(o)) return `[${o.length}]`;
    const out = {};
    for (const k of Object.keys(o)) {
        const v = o[k];
        if (SKIP.test(k)) out[k] = '<skip>';
        else if (v !== null && typeof v === 'object') out[k] = Array.isArray(v) ? `[${v.length}]` : `{${Object.keys(v).slice(0, 15).join(',')}}`;
        else out[k] = scalar(v);
    }
    return out;
}

function logItems(name, arr) {
    arr.slice(0, 8).forEach((it, i) => log(`${name}[${i}]=${JSON.stringify(brief(it))}`));
}

function patch(obj, values) {
    for (const k of Object.keys(values)) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
            if (values[k] === undefined) delete obj[k];
            else obj[k] = values[k];
        }
    }
}

function main() {
    const body = $response.body;
    let obj;
    try {
        obj = JSON.parse(body);
    } catch (e) {
        const h = $response.headers || {};
        log(`status=${$response.status} non-json len=${body ? body.length : 0} type=${h['Content-Type'] || h['content-type'] || ''}`);
        return $done({});
    }
    log(`status=${$response.status} top=${JSON.stringify(brief(obj))}`);
    const data = obj && obj.data;
    if (Array.isArray(data)) logItems('data', data);
    else if (data && typeof data === 'object') {
        log(`data=${JSON.stringify(brief(data))}`);
        for (const k of Object.keys(data)) if (!SKIP.test(k) && Array.isArray(data[k])) logItems(k, data[k]);
    }

    // Same as upstream handleSplash (its router also covers splash/list).
    if (/\/x\/v2\/splash\/(?:list|show|event\/list2)$/.test(path) && host === 'app.bilibili.com' && obj.code === 0 && data && typeof data === 'object' && !Array.isArray(data)) {
        patch(data, { account: undefined, event_list: undefined, preload: undefined, show: undefined, max_time: 0, min_interval: 31536000, pull_interval: 31536000 });
        if (Array.isArray(data.list)) {
            for (const it of data.list) {
                if (it && typeof it === 'object') patch(it, { duration: 0, begin_time: 2524579200, end_time: 2524665599, enable_pre_download: false });
            }
        }
        // Test: tell the app to keep nothing, hoping it drops the splash ads it already downloaded.
        if (path.endsWith('/splash/list')) patch(data, { keep_ids: [], list: [] });
        return $done({ body: JSON.stringify(obj) });
    }
    $done({});
}

try {
    main();
} catch (e) {
    log(`error ${e && e.message}`);
    $done({});
}
