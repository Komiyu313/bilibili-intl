// 视频详情页（viewunite View/View）诊断脚本，仅用于测试版。
// 过滤逻辑与原作者 kokoryh/Sparkle 的 handleViewReply 相同，额外把收到的内容和删掉的内容写进日志。
// 日志只记录字段编号、类型、长度和卡片标题，不记录账号信息。

const TAG = '[ViewDiag]';
const log = (...a) => console.log(TAG, ...a);

const EXCLUDE_MODULES = [18, 29, 37, 55, 63]; // ACTIVITY, PAY_BAR, SPECIALTAG, MERCHANDISE, VIDEO_MENTIONS
const EXCLUDE_CARDS = [4, 5, 6, 7, 11]; // GAME, CM_TYPE, LIVE, AI_RECOMMEND, COURSE

function readVarint(b, p) {
    let v = 0, mul = 1, c;
    do {
        if (p >= b.length) throw new Error('varint overflow');
        c = b[p++];
        v += (c & 0x7f) * mul;
        mul *= 128;
    } while (c & 0x80);
    return [v, p];
}

function parse(b) {
    const out = [];
    let p = 0;
    while (p < b.length) {
        const start = p;
        let key;
        [key, p] = readVarint(b, p);
        const no = Math.floor(key / 8), wt = key % 8;
        if (no === 0) throw new Error('field 0');
        let val = null, num = null;
        if (wt === 0) [num, p] = readVarint(b, p);
        else if (wt === 1) p += 8;
        else if (wt === 5) p += 4;
        else if (wt === 2) {
            let len;
            [len, p] = readVarint(b, p);
            val = b.subarray(p, p + len);
            p += len;
        } else throw new Error('wire type ' + wt);
        if (p > b.length) throw new Error('truncated');
        out.push({ no, wt, num, val, raw: b.subarray(start, p) });
    }
    return out;
}

function varint(n) {
    const out = [];
    while (n > 127) {
        out.push((n % 128) | 0x80);
        n = Math.floor(n / 128);
    }
    out.push(n);
    return out;
}

function lenField(no, bytes) {
    const head = varint(no * 8 + 2).concat(varint(bytes.length));
    const r = new Uint8Array(head.length + bytes.length);
    r.set(head, 0);
    r.set(bytes, head.length);
    return r;
}

function concat(parts) {
    const r = new Uint8Array(parts.reduce((s, x) => s + x.length, 0));
    let o = 0;
    for (const x of parts) {
        r.set(x, o);
        o += x.length;
    }
    return r;
}

// 用一组字段重新拼出消息；edit(f) 返回 null 删除字段，返回 Uint8Array 替换该字段的内容
function rebuild(fields, edit) {
    const parts = [];
    for (const f of fields) {
        const r = edit ? edit(f) : undefined;
        if (r === null) continue;
        parts.push(r === undefined ? f.raw : lenField(f.no, r));
    }
    return concat(parts);
}

const getNum = (fields, no) => {
    const f = fields.find(x => x.no === no && x.wt === 0);
    return f ? f.num : 0;
};
const getBytes = (fields, no) => {
    const f = fields.find(x => x.no === no && x.wt === 2);
    return f ? f.val : null;
};

const utf8 = new TextDecoder('utf-8', { fatal: true });
// 找出消息里前几个像标题的短文字，便于在日志里认出是哪张卡片
function texts(b, depth = 0, acc = [], maxDepth = 3) {
    if (acc.length >= 3 || depth > maxDepth) return acc;
    let fs;
    try {
        fs = parse(b);
    } catch (e) {
        return acc;
    }
    for (const f of fs) {
        if (acc.length >= 3) break;
        if (f.wt !== 2 || !f.val.length) continue;
        let s = null;
        try {
            s = utf8.decode(f.val);
        } catch (e) {}
        if (s && s.length <= 40 && /[一-鿿]/.test(s) && !/[\u0000-\u001f]/.test(s)) acc.push(s);
        else texts(f.val, depth + 1, acc, maxDepth);
    }
    return acc;
}

function handleCards(relates) {
    const fs = parse(relates);
    const kept = {}, dropped = [];
    const out = rebuild(fs, f => {
        if (f.no !== 1 || f.wt !== 2) return undefined;
        const card = parse(f.val);
        const type = getNum(card, 1);
        const cmStock = getBytes(card, 11);
        const basic = getBytes(card, 12);
        const uniqueId = basic ? getBytes(parse(basic), 6) : null;
        const drop = EXCLUDE_CARDS.includes(type) || (cmStock && cmStock.length) || (uniqueId && uniqueId.length);
        if (drop) {
            dropped.push(`type=${type}${cmStock && cmStock.length ? ' cmStock' : ''}${uniqueId && uniqueId.length ? ' uniqueId' : ''} ${JSON.stringify(texts(f.val))}`);
            return null;
        }
        kept[type] = (kept[type] || 0) + 1;
        if (type !== 1) log(`  保留的非视频卡片 type=${type} fields=${card.map(x => x.no).join(',')} ${JSON.stringify(texts(f.val))}`);
        return undefined;
    });
    log(`  推荐卡片：保留 ${JSON.stringify(kept)}，删除 ${dropped.length} 张`);
    dropped.forEach(d => log(`  删除卡片 ${d}`));
    return out;
}

function handleModules(intro) {
    const fs = parse(intro);
    const seen = [];
    const out = rebuild(fs, f => {
        if (f.no !== 2 || f.wt !== 2) return undefined;
        const mod = parse(f.val);
        const type = getNum(mod, 1);
        if (EXCLUDE_MODULES.includes(type)) {
            seen.push(`-${type}`);
            log(`  删除模块 type=${type} ${f.val.length}B ${JSON.stringify(texts(f.val))}`);
            return null;
        }
        seen.push(String(type));
        if (type === 3) {
            return rebuild(mod, m => {
                if (m.no !== 5 || m.wt !== 2) return undefined;
                return rebuild(parse(m.val), h => (h.no === 1 ? null : undefined));
            });
        }
        if (type === 28) {
            return rebuild(mod, m => (m.no === 22 && m.wt === 2 ? handleCards(m.val) : undefined));
        }
        return undefined;
    });
    log(`  模块顺序 ${seen.join(' ')}（负号为已删除）`);
    return out;
}

function handleView(msg) {
    const top = parse(msg);
    log(`顶层字段 ${top.map(f => f.no).join(',')}`);
    return rebuild(top, f => {
        if (f.no === 7) {
            log(`删除 cm（广告数据）${f.val ? f.val.length : 0}B ${JSON.stringify(texts(f.val || new Uint8Array(), 0, [], 8))}`);
            return null;
        }
        if (f.no === 3 && f.wt === 2) return rebuild(parse(f.val), u => (u.no === 7 ? null : undefined));
        if (f.no === 5 && f.wt === 2) {
            return rebuild(parse(f.val), t => {
                if (t.no !== 1 || t.wt !== 2) return undefined;
                const tm = parse(t.val);
                if (getNum(tm, 1) !== 1) return undefined;
                return rebuild(tm, i => (i.no === 2 && i.wt === 2 ? handleModules(i.val) : undefined));
            });
        }
        return undefined;
    });
}

(() => {
    const started = Date.now();
    let body = $response.body;
    if (body instanceof ArrayBuffer) body = new Uint8Array(body);
    const headers = $response.headers || {};
    const enc = Object.keys(headers).find(k => k.toLowerCase() === 'grpc-encoding');
    if (!body || body.length < 5) {
        log(`收到的响应体为空或不完整：${body ? body.length : 'null'} 字节，原样放行`);
        return $done({});
    }
    const flag = body[0];
    const len = ((body[1] << 24) >>> 0) + (body[2] << 16) + (body[3] << 8) + body[4];
    log(`收到 ${body.length} 字节，压缩标志 ${flag}，帧长度 ${len}${enc ? '，grpc-encoding ' + headers[enc] : ''}`);
    if (body.length !== len + 5) log(`帧长度与实际字节数不符，可能被截断`);
    try {
        let msg = body.subarray(5, 5 + len);
        if (flag) msg = new Uint8Array($utils.ungzip(msg));
        const out = handleView(msg);
        const frame = new Uint8Array(5 + out.length);
        frame[0] = 0;
        frame[1] = out.length >>> 24;
        frame[2] = (out.length >>> 16) & 255;
        frame[3] = (out.length >>> 8) & 255;
        frame[4] = out.length & 255;
        frame.set(out, 5);
        const h = { ...headers };
        if ($request.headers && $request.headers.te === 'trailers' && $response.h2_trailers === undefined && !Object.keys(h).some(k => k.toLowerCase() === 'grpc-status')) h['grpc-status'] = '0';
        log(`处理完成：${msg.length} → ${out.length} 字节，用时 ${Date.now() - started}ms`);
        $done({ headers: h, body: frame });
    } catch (e) {
        log(`处理出错，原样放行：${e && e.message}`);
        $done({});
    }
})();
