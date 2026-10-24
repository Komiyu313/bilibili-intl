/**
 * 哔哩哔哩 · 首页布局 / 我的页（国际版适配）
 *
 * 处理两个接口，其余接口仍交给 kokoryh/Sparkle 的 bilibili.json.js：
 *   - /x/resource/show/tab/v2  顶部标签、右上角入口、底栏
 *   - /x/v2/account/mine       「我的」页
 *
 * 与原脚本的区别：
 *   - 服务器不返回右上角入口时（国际版、海外布局）也会加上「消息」，可改为放回底栏
 *   - 保留服务器返回的创作中心板块，改成大陆版的宫格样式并补上「数据中心」「有奖活动」，
 *     语言不一致时翻译标题、按钮和已知条目
 *
 * 参数（argument，JSON）：
 *   showCreatorHub: 0 隐藏创作中心，1 保留（默认 1）
 *   messageEntry:   "top" 首页右上角（默认），"bottom" 底栏
 *
 * 页面模板与多语言文本取自 kokoryh/Sparkle（GPL-3.0），本文件同样以 GPL-3.0 发布。
 */

const I18N = {
    'zh-Hans': {
        live: '直播', for_you: '推荐', trending: '热门', anime: '动画', film: '影视',
        messages: '消息', home: '首页', following: '动态', me: '我的',
        downloads: '离线缓存', history: '历史记录', my_favorites: '我的收藏', watch_later: '稍后再看',
        creator_hub: '创作中心', data_center: '数据中心', upload: '发布', upload_management: '稿件管理', reward_events: '有奖活动',
        recommended_services: '推荐服务', customization: '个性装扮', mall: '会员购', my_wallet: '我的钱包',
        live_studio: '我的直播', more_services: '更多服务', help_center: '联系客服', settings: '设置',
    },
    'zh-Hant': {
        live: '直播', for_you: '推薦', trending: '熱門', anime: '動畫', film: '影視',
        messages: '訊息', home: '首頁', following: '關注', me: '我的',
        downloads: '離線快取', history: '歷史記錄', my_favorites: '我的收藏', watch_later: '稍後再看',
        creator_hub: '創作中心', data_center: '資料中心', upload: '發佈', upload_management: '稿件管理', reward_events: '有獎活動',
        recommended_services: '我的服務', customization: '個性裝扮', mall: '會員購', my_wallet: '我的錢包',
        live_studio: '我的直播', more_services: '更多服務', help_center: '聯絡客服', settings: '設定',
    },
    en: {
        live: 'Live', for_you: 'For You', trending: 'Trending', anime: 'Anime', film: 'Film & TV',
        messages: 'Messages', home: 'Home', following: 'Following', me: 'Me',
        downloads: 'Downloads', history: 'History', my_favorites: 'My Favorites', watch_later: 'Watch Later',
        creator_hub: 'Creator Hub', data_center: 'Data Center', upload: 'Upload', upload_management: 'Upload Management', reward_events: 'Events',
        recommended_services: 'Recommended Services', customization: 'Customization', mall: 'Mall', my_wallet: 'My Wallet',
        live_studio: 'Live Studio', more_services: 'More Services', help_center: 'Help Center', settings: 'Settings',
    },
    ja: {
        live: 'ライブ', for_you: 'おすすめ', trending: '急上昇', anime: 'アニメ', film: '映画・ドラマ',
        messages: 'メッセージ', home: 'ホーム', following: 'フォロー', me: 'マイページ',
        downloads: 'オフライン保存', history: '履歴', my_favorites: 'お気に入り', watch_later: '後で見る',
        creator_hub: 'クリエイターセンター', data_center: 'データセンター', upload: '投稿', upload_management: '投稿管理', reward_events: 'イベント',
        recommended_services: 'マイサービス', customization: 'カスタマイズ', mall: 'モール', my_wallet: 'ウォレット',
        live_studio: '配信スタジオ', more_services: 'その他のサービス', help_center: 'ヘルプセンター', settings: '設定',
    },
};

const CREATOR_TITLES = ['创作中心', '創作中心', 'Creator Hub', 'クリエイターセンター'];

function getArgument() {
    const defaults = { showCreatorHub: 1, messageEntry: 'top' };
    try {
        if (typeof $argument === 'string' && $argument) return Object.assign(defaults, JSON.parse($argument));
        if (typeof $argument === 'object' && $argument) return Object.assign(defaults, $argument);
    } catch (e) {
        console.log(`[bilibili.layout] bad argument: ${e}`);
    }
    return defaults;
}

// Language from s_locale in the request URL; otherwise from the layout's own text; else zh-Hans.
function getLocale(url, anchorNames) {
    const m = /[?&]s_locale=([^&]*)/.exec(url);
    const value = m ? decodeURIComponent(m[1]) : '';
    for (const loc of ['zh-Hant', 'en', 'ja']) {
        if (value === loc || value.startsWith(`${loc}_`)) return loc;
    }
    for (const name of anchorNames) {
        for (const loc of ['zh-Hant', 'en', 'ja']) {
            const t = I18N[loc];
            if (name === t.home || name === t.for_you || name === t.history || name === t.downloads) return loc;
        }
    }
    return 'zh-Hans';
}

function isObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function handleLayout(data, t, arg) {
    const bottomMode = arg.messageEntry === 'bottom';
    let msg = [];
    if (bottomMode) {
        const server = (Array.isArray(data.bottom) ? data.bottom : []).find(
            b => isObject(b) && typeof b.uri === 'string' && (b.uri.startsWith('bilibili://im/') || b.uri.startsWith('bilibili://link/im'))
        );
        const item = server || {
            id: 3506,
            tab_id: 'home_im for overseas',
            uri: 'bilibili://im/home_tab',
            icon: 'https://i0.hdslb.com/bfs/legacy/a6cb60a3369b85d72986233f6a8774751093aa4e.png',
            icon_selected: 'https://i0.hdslb.com/bfs/legacy/e1ab7c3c7a5b2beb79af328f95f19fc781aaa950.png',
        };
        msg = [Object.assign({}, item, { name: t.messages, pos: 4 })];
    }
    data.tab = [
        { pos: 1, id: 731, name: t.live, tab_id: '直播tab', uri: 'bilibili://live/home' },
        { pos: 2, id: 477, name: t.for_you, tab_id: '推荐tab', uri: 'bilibili://pegasus/promo', default_selected: 1 },
        { pos: 3, id: 478, name: t.trending, tab_id: '热门tab', uri: 'bilibili://pegasus/hottopic' },
        { pos: 4, id: 3502, name: t.anime, tab_id: 'bangumi', uri: 'bilibili://pgc/bangumi_v2' },
        { pos: 5, id: 3503, name: t.film, tab_id: 'film', uri: 'bilibili://pgc/cinema_v2' },
    ];
    data.top = bottomMode
        ? []
        : [
              {
                  pos: 1,
                  id: 176,
                  name: t.messages,
                  tab_id: '消息Top',
                  uri: 'bilibili://link/im_home',
                  icon: 'http://i0.hdslb.com/bfs/archive/d43047538e72c9ed8fd8e4e34415fbe3a4f632cb.png',
              },
          ];
    data.bottom = [
        {
            pos: 1,
            id: 177,
            name: t.home,
            tab_id: 'home',
            uri: 'bilibili://main/home/',
            icon: 'http://i0.hdslb.com/bfs/archive/63d7ee88d471786c1af45af86e8cb7f607edf91b.png',
            icon_selected: 'http://i0.hdslb.com/bfs/archive/e5106aa688dc729e7f0eafcbb80317feb54a43bd.png',
        },
        {
            pos: 2,
            id: 179,
            name: t.following,
            tab_id: 'dynamic',
            uri: 'bilibili://following/home/',
            icon: 'http://i0.hdslb.com/bfs/archive/86dfbe5fa32f11a8588b9ae0fccb77d3c27cedf6.png',
            icon_selected: 'http://i0.hdslb.com/bfs/archive/25b658e1f6b6da57eecba328556101dbdcb4b53f.png',
        },
        ...msg,
        {
            pos: 5,
            id: 181,
            name: t.me,
            tab_id: '我的Bottom',
            uri: 'bilibili://user_center/',
            icon: 'http://i0.hdslb.com/bfs/archive/4b0b2c49ffeb4f0c2e6a4cceebeef0aab1c53fe1.png',
            icon_selected: 'http://i0.hdslb.com/bfs/archive/a54a8009116cb896e64ef14dcf50e5cade401e00.png',
        },
    ];
}

function isCreatorSection(s, t) {
    if (!isObject(s)) return false;
    const title = s.title || '';
    const buttonUrl = (isObject(s.button) && s.button.url) || '';
    return (
        s.type === 1 ||
        !!s.up_title ||
        CREATOR_TITLES.includes(title) ||
        title === t.creator_hub ||
        (typeof buttonUrl === 'string' && buttonUrl.startsWith('bilibili://uper/'))
    );
}

// Entries the mainland app shows after 创作中心 and 稿件管理. Both are web pages, so the intl app can open them too.
function creatorExtras(t) {
    return [
        { id: 534, title: t.data_center, uri: 'https://member.bilibili.com/york/data-center?navhide=1&from=profile', icon: 'https://i0.hdslb.com/bfs/feed-admin/367204ba56004b1a78211ba27eefbf5b4cc53a35.png', need_login: 1, global_red_dot: 1, display: 1 },
        { id: 174, title: t.reward_events, uri: 'https://www.bilibili.com/blackboard/x/activity-tougao-h5/all', icon: 'https://i0.hdslb.com/bfs/archive/7f4fa86d99bf3814bf10f8ee5d6c8c9db6e931c8.png', need_login: 1, global_red_dot: 1, display: 1 },
    ];
}

// Keep the server's creator section but lay it out like the mainland app: a grid (style 1) of up to four entries.
// Titles are translated only when the section is not already in the app language.
function buildCreatorSection(section, t) {
    const s = JSON.parse(JSON.stringify(section));
    try {
        const items = Array.isArray(s.items) ? s.items.filter(isObject) : [];
        const path = uri => (typeof uri === 'string' ? uri.split('?')[0] : '');
        for (const extra of creatorExtras(t)) {
            if (items.length >= 4) break;
            if (!items.some(i => path(i.uri) === path(extra.uri))) items.push(extra);
        }
        s.items = items;
        s.style = 1;
        if ((s.title || '') !== t.creator_hub) {
            s.title = t.creator_hub;
            if (s.up_title) s.up_title = t.creator_hub;
            if (isObject(s.button) && s.button.text) s.button.text = t.upload;
            for (const item of items) {
                const uri = item.uri || '';
                if (uri.startsWith('bilibili://uper/homevc')) item.title = t.creator_hub;
                else if (uri.includes('archive_list') || uri.includes('manuscript-list')) item.title = t.upload_management;
                else if (uri.includes('data-center')) item.title = t.data_center;
                else if (uri.includes('activity-tougao')) item.title = t.reward_events;
            }
        }
        return s;
    } catch (e) {
        return section;
    }
}

function getVIP() {
    const image = 'https://i0.hdslb.com/bfs/vip/52f60c8bdae8d4440edbb96dad72916022adf126.png';
    return {
        status: 1,
        type: 2,
        vip_pay_type: 0,
        due_date: 9005270400000,
        tv_vip_status: 1,
        tv_vip_pay_type: 0,
        tv_due_date: 9005270400000,
        role: 15,
        theme_type: 0,
        nickname_color: '#FB7299',
        avatar_subscript: 1,
        avatar_subscript_url: '',
        avatar_icon: { icon_resource: {} },
        label: {
            path: '',
            text: '百年大会员',
            label_theme: 'hundred_annual_vip',
            text_color: '#FFFFFF',
            bg_style: 1,
            bg_color: '#FB7299',
            border_color: '',
            use_img_label: true,
            image,
            img_label_uri_hans: '',
            img_label_uri_hant: '',
            img_label_uri_hans_static: image,
            img_label_uri_hant_static: image,
        },
    };
}

function handleMine(data, t, arg) {
    for (const key of ['answer', 'live_tip', 'vip_section', 'vip_section_v2', 'modular_vip_section']) delete data[key];
    data.vip_type = 2;
    data.vip = getVIP();
    if (!Object.prototype.hasOwnProperty.call(data, 'sections_v2')) return;

    const original = Array.isArray(data.sections_v2) ? data.sections_v2 : [];
    const found = original.find(s => isCreatorSection(s, t));
    const creator = found && String(arg.showCreatorHub) !== '0' ? [buildCreatorSection(found, t)] : [];

    data.sections_v2 = [
        {
            items: [
                { id: 396, title: t.downloads, uri: 'bilibili://user_center/download', icon: 'http://i0.hdslb.com/bfs/archive/5fc84565ab73e716d20cd2f65e0e1de9495d56f8.png', common_op_item: {} },
                { id: 397, title: t.history, uri: 'bilibili://user_center/history', icon: 'http://i0.hdslb.com/bfs/archive/8385323c6acde52e9cd52514ae13c8b9481c1a16.png', common_op_item: {} },
                { id: 3072, title: t.my_favorites, uri: 'bilibili://user_center/favourite?version=2', icon: 'http://i0.hdslb.com/bfs/archive/d79b19d983067a1b91614e830a7100c05204a821.png', common_op_item: {} },
                { id: 2830, title: t.watch_later, uri: 'bilibili://user_center/watch_later_v2', icon: 'http://i0.hdslb.com/bfs/archive/63bb768caa02a68cb566a838f6f2415f0d1d02d6.png', need_login: 1, common_op_item: {} },
            ],
            style: 1,
            button: {},
        },
        ...creator,
        {
            title: t.recommended_services,
            items: [
                { id: 402, title: t.customization, uri: 'https://www.bilibili.com/h5/mall/home?navhide=1&f_source=shop&from=myservice', icon: 'http://i0.hdslb.com/bfs/archive/0bcad10661b50f583969b5a188c12e5f0731628c.png', common_op_item: {} },
                { id: 622, title: t.mall, uri: 'bilibili://mall/home', icon: 'http://i0.hdslb.com/bfs/archive/19c794f01def1a267b894be84427d6a8f67081a9.png', common_op_item: {} },
                { id: 404, title: t.my_wallet, uri: 'bilibili://bilipay/mine_wallet', icon: 'http://i0.hdslb.com/bfs/archive/f416634e361824e74a855332b6ff14e2e7c2e082.png', common_op_item: {} },
                { id: 406, title: t.live_studio, uri: 'bilibili://user_center/live_center', icon: 'http://i0.hdslb.com/bfs/archive/1db5791746a0112890b77a0236baf263d71ecb27.png', common_op_item: {} },
            ],
            style: 1,
            button: {},
        },
        {
            title: t.more_services,
            items: [
                { id: 407, title: t.help_center, uri: 'bilibili://user_center/feedback', icon: 'http://i0.hdslb.com/bfs/archive/7ca840cf1d887a45ee1ef441ab57845bf26ef5fa.png', common_op_item: {} },
                { id: 410, title: t.settings, uri: 'bilibili://user_center/setting', icon: 'http://i0.hdslb.com/bfs/archive/e932404f2ee62e075a772920019e9fbdb4b5656a.png', common_op_item: {} },
            ],
            style: 2,
            button: {},
        },
    ];
}

(() => {
    const url = $request.url;
    let body;
    try {
        body = JSON.parse($response.body);
    } catch (e) {
        return $done({});
    }
    const data = body && body.data;
    if (!isObject(data)) return $done({});

    const arg = getArgument();
    if (/\/x\/resource\/show\/tab\/v2\?/.test(url)) {
        const anchors = [...(Array.isArray(data.bottom) ? data.bottom : []), ...(Array.isArray(data.tab) ? data.tab : [])]
            .filter(i => isObject(i) && (i.uri === 'bilibili://main/home/' || i.uri === 'bilibili://pegasus/promo'))
            .map(i => i.name);
        handleLayout(data, I18N[getLocale(url, anchors)], arg);
    } else if (/\/x\/v2\/account\/mine\?/.test(url)) {
        const anchors = (Array.isArray(data.sections_v2) ? data.sections_v2 : [])
            .flatMap(s => (isObject(s) && Array.isArray(s.items) ? s.items : []))
            .filter(i => isObject(i) && (i.uri === 'bilibili://user_center/history' || i.uri === 'bilibili://user_center/download'))
            .map(i => i.title);
        handleMine(data, I18N[getLocale(url, anchors)], arg);
    } else {
        return $done({});
    }
    $done({ body: JSON.stringify(body) });
})();
