// Cloudflare Worker — Edge TTS proxy
// Uses fetch() with Upgrade:websocket to set Origin header + Sec-MS-GEC token

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const CHROMIUM_FULL_VERSION = '143.0.3650.75';
const CHROMIUM_MAJOR_VERSION = CHROMIUM_FULL_VERSION.split('.')[0];
const SEC_MS_GEC_VERSION = `1-${CHROMIUM_FULL_VERSION}`;
const WIN_EPOCH = 11644473600;
const S_TO_NS = 1e9;
const EDGE_ORIGIN = 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold';

async function generateSecMsGec() {
  let ticks = Date.now() / 1000;
  ticks += WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= S_TO_NS / 100;
  const strToHash = `${ticks.toFixed(0)}${TRUSTED_CLIENT_TOKEN}`;
  const data = new TextEncoder().encode(strToHash);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function connectId() {
  return crypto.randomUUID().replace(/-/g, '');
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildConfigMessage() {
  return (
    'Content-Type:application/json; charset=utf-8\r\n' +
    'Path:speech.config\r\n\r\n' +
    '{"context":{"synthesis":{"audio":{"metadataoptions":{' +
    '"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},' +
    '"outputFormat":"audio-24khz-48kbitrate-mono-mp3"' +
    '}}}}\r\n'
  );
}

function buildSSMLMessage(requestId, text, voice, rate, pitch) {
  const ssml =
    `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='es-ES'>` +
    `<voice name='${voice}'>` +
    `<prosody pitch='${pitch}' rate='${rate}' volume='+0%'>` +
    escapeXml(text) +
    `</prosody></voice></speak>`;

  return (
    `X-RequestId:${requestId}\r\n` +
    'Content-Type:application/ssml+xml\r\n' +
    'Path:ssml\r\n\r\n' +
    ssml
  );
}

function extractAudioFromBinaryFrame(data) {
  if (data.byteLength < 2) return null;
  const view = new DataView(data);
  const headerLen = view.getUint16(0);
  if (2 + headerLen > data.byteLength) return null;
  const headerBytes = new Uint8Array(data, 2, headerLen);
  const header = new TextDecoder().decode(headerBytes);
  if (!header.includes('Path:audio')) return null;
  const audioData = new Uint8Array(data, 2 + headerLen);
  return audioData.length > 0 ? audioData : null;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/tts') {
      return new Response('GET or POST /tts', { status: 404, headers: CORS_HEADERS });
    }

    let text, voice, rate, pitch;

    if (request.method === 'GET') {
      text = url.searchParams.get('text');
      voice = url.searchParams.get('voice') || 'es-ES-ElviraNeural';
      rate = url.searchParams.get('rate') || '-10%';
      pitch = url.searchParams.get('pitch') || '+0Hz';
    } else if (request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response('Invalid JSON', { status: 400, headers: CORS_HEADERS });
      }
      text = body.text;
      voice = body.voice || 'es-ES-ElviraNeural';
      rate = body.rate || '-10%';
      pitch = body.pitch || '+0Hz';
    } else {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
    }

    if (!text || typeof text !== 'string') {
      return new Response('Missing "text" parameter', { status: 400, headers: CORS_HEADERS });
    }
    const requestId = connectId();
    const gecToken = await generateSecMsGec();
    const muid = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    // Use HTTPS for CF Workers fetch-based WebSocket upgrade
    const wsUrl = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${gecToken}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}&ConnectionId=${connectId()}`;

    try {
      const wsResp = await fetch(wsUrl, {
        headers: {
          'Upgrade': 'websocket',
          'Origin': EDGE_ORIGIN,
          'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM_MAJOR_VERSION}.0.0.0 Safari/537.36 Edg/${CHROMIUM_MAJOR_VERSION}.0.0.0`,
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache',
          'Cookie': `muid=${muid};`,
        },
      });

      if (wsResp.status !== 101) {
        const errBody = await wsResp.text();
        return new Response(`Edge TTS HTTP ${wsResp.status}: ${errBody}`, {
          status: 502,
          headers: CORS_HEADERS,
        });
      }

      const ws = wsResp.webSocket;
      if (!ws) {
        return new Response('No webSocket on 101 response', { status: 502, headers: CORS_HEADERS });
      }

      ws.accept();

      const audioChunks = [];

      ws.send(buildConfigMessage());
      ws.send(buildSSMLMessage(requestId, text, voice, rate, pitch));

      const audioPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          try { ws.close(); } catch {}
          reject(new Error('Timeout after 15s'));
        }, 15000);

        ws.addEventListener('message', (event) => {
          if (typeof event.data === 'string') {
            if (event.data.includes('Path:turn.end')) {
              clearTimeout(timeout);
              try { ws.close(); } catch {}
              resolve();
            }
          } else {
            const buf = event.data instanceof ArrayBuffer ? event.data : event.data;
            const audio = extractAudioFromBinaryFrame(buf);
            if (audio) audioChunks.push(audio);
          }
        });

        ws.addEventListener('error', () => {
          clearTimeout(timeout);
          reject(new Error('WS stream error'));
        });

        ws.addEventListener('close', () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      await audioPromise;

      if (audioChunks.length === 0) {
        return new Response('No audio data received', { status: 502, headers: CORS_HEADERS });
      }

      const totalLen = audioChunks.reduce((sum, c) => sum + c.length, 0);
      const mp3 = new Uint8Array(totalLen);
      let offset = 0;
      for (const chunk of audioChunks) {
        mp3.set(chunk, offset);
        offset += chunk.length;
      }

      return new Response(mp3, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch (err) {
      return new Response(`TTS error: ${err.message}`, {
        status: 502,
        headers: CORS_HEADERS,
      });
    }
  },
};
