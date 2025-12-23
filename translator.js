const languages = [
  { code: 'auto', name: '自动检测' },
  { code: 'en', name: '英语' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日语' },
  { code: 'ko', name: '韩语' },
  { code: 'fr', name: '法语' },
  { code: 'es', name: '西班牙语' },
  { code: 'de', name: '德语' },
  { code: 'ru', name: '俄语' },
];

const $ = (sel) => document.querySelector(sel);
const fromSel = $('#from');
const toSel = $('#to');
const srcInput = $('#source');
const dstInput = $('#result');
const statusEl = $('#status');
const endpointInput = $('#endpoint');
const keyInput = $('#apiKey');

function initSelects() {
  fromSel.innerHTML = languages.map(opt => `<option value="${opt.code}">${opt.name}</option>`).join('');
  toSel.innerHTML = languages.filter(l => l.code !== 'auto').map(opt => `<option value="${opt.code}">${opt.name}</option>`).join('');
  fromSel.value = 'auto';
  toSel.value = 'en';
}

async function translate() {
  const text = srcInput.value.trim();
  if (!text) {
    setStatus('请输入要翻译的内容');
    return;
  }
  setStatus('翻译中...');
  const endpoint = endpointInput.value.trim() || 'https://libretranslate.de/translate';
  const body = {
    q: text,
    source: fromSel.value,
    target: toSel.value,
    format: 'text',
  };
  if (keyInput.value.trim()) body.api_key = keyInput.value.trim();

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = data.translatedText || data.translation || data.result;
    if (!translated) throw new Error('未找到翻译字段');
    dstInput.value = translated;
    setStatus('翻译成功');
  } catch (err) {
    console.warn('翻译失败，改用本地演示模式：', err);
    dstInput.value = localFallback(text);
    setStatus('已使用本地演示翻译（接口不可用）');
  }
}

function localFallback(text) {
  // 简单演示：翻转字符串并标注
  return `[本地演示] ${text.split('').reverse().join('')}`;
}

function swapLang() {
  const prevFrom = fromSel.value;
  fromSel.value = toSel.value === 'auto' ? 'en' : toSel.value;
  toSel.value = prevFrom === 'auto' ? 'en' : prevFrom;
}

function clearAll() {
  srcInput.value = '';
  dstInput.value = '';
  setStatus('');
  srcInput.focus();
}

function setStatus(msg) {
  statusEl.textContent = msg;
}

$('#translate').addEventListener('click', translate);
$('#clear').addEventListener('click', clearAll);
$('#swap').addEventListener('click', swapLang);

srcInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
    translate();
  }
});

initSelects();
setStatus('准备就绪，可直接使用默认接口');


