// OtooWMS(eglogis.otoowms.kr) 입고현황(품목별) 직접 조회 클라이언트.
// 로그인 → /otoowms/p100/p100380/getSearch.do(TABIDX=2, 품목별)를 호출해 수동 다운로드 없이 데이터를 가져온다.
// 반드시 "입고요청일자(WISCHDT)"가 아니라 "입고일자(WIDT)" 기준으로 검색해야 한다 (사용자 지정, 2026-08-03).
const fs = require('fs');

const BASE = 'https://eglogis.otoowms.kr';

const WISTS_LABEL = { '100': '입고예정', '200': '지시완료', '300': '입고중', '400': '입고완료', '99': '취소' };
const WITYPE_LABEL = { STD: '일반', ETC: '기타입고', RET: '매출반품' };

function loadEnv(envPath) {
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  });
  return env;
}

function toYmd(dateStr) {
  // 'YYYY-MM-DD' 또는 'YYYYMMDD' 입력 모두 허용 -> 'YYYYMMDD'로 통일
  return String(dateStr).replace(/-/g, '');
}
function toIsoDate(ymd) {
  if (!ymd) return '';
  const s = String(ymd);
  return s.length === 8 ? `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}` : s;
}

class WmsSession {
  constructor() {
    this.jar = {};
    this.compcd = '00001';
  }
  _setCookiesFromResponse(res) {
    let raw = [];
    if (typeof res.headers.getSetCookie === 'function') raw = res.headers.getSetCookie();
    else if (res.headers.raw) raw = res.headers.raw()['set-cookie'] || [];
    raw.forEach(c => {
      const pair = c.split(';')[0];
      const idx = pair.indexOf('=');
      if (idx > 0) this.jar[pair.slice(0, idx)] = pair.slice(idx + 1);
    });
  }
  _cookieHeader() {
    return Object.entries(this.jar).map(([k, v]) => `${k}=${v}`).join('; ');
  }

  async login(username, password) {
    const res1 = await fetch(`${BASE}/comm/login.do`);
    this._setCookiesFromResponse(res1);

    const res2 = await fetch(`${BASE}/comm/getLogin.do`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'METHOD_ID': 'AJAX',
        'Cookie': this._cookieHeader(),
      },
      body: JSON.stringify({
        paramData: { SHOPBYCODE: '', Language: 'kr', USERCD: username, PASSWD: password, checkIdPw: 'N', SELECTTHEME: 'blue' },
      }),
    });
    this._setCookiesFromResponse(res2);
    const json = await res2.json();
    if (json.resultLoginCode !== 'S') {
      throw new Error('WMS 로그인 실패: ' + (json.resultLoginMsg || json.resultLoginCode || 'unknown'));
    }
    this.username = json.loginUsercd;
    return json;
  }

  /**
   * 입고현황(품목별, TABIDX=2)을 "입고일자(WIDT)" 기준으로 조회.
   * @param {string} dateFrom 'YYYY-MM-DD' 또는 'YYYYMMDD'
   * @param {string} dateTo   'YYYY-MM-DD' 또는 'YYYYMMDD' (포함)
   */
  async fetchInboundByReceivedDate(dateFrom, dateTo) {
    const res = await fetch(`${BASE}/otoowms/p100/p100380/getSearch.do`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'METHOD_ID': 'sid_getSearch',
        'Cookie': this._cookieHeader(),
      },
      body: JSON.stringify({
        paramData: {
          S_COMPCD: this.compcd,
          TABIDX: 2, // 품목별 탭 (전표+품목코드 단위로 이미 그룹핑됨)
          S_WIDT_FROM: toYmd(dateFrom),
          S_WIDT_TO: toYmd(dateTo),
        },
      }),
    });
    this._setCookiesFromResponse(res);
    const json = await res.json();
    if (json.CODE !== 0) {
      throw new Error('WMS 입고현황 조회 실패: ' + (json.MESSAGE || json.CODE));
    }
    return (json.resultList || []).map(mapRow);
  }

  /**
   * 재고조회 화면(P800100)의 "화주x창고x로케이션별"(3번째 탭, 로트 단위) 재고를 조회.
   * @param {string} [orgFilter] 지정 시 화주명(ORGNM)이 정확히 일치하는 행만 반환 (예: '이그니스')
   */
  async fetchStockByOrgWhLoc(orgFilter) {
    const paramData = {
      S_COMPCD: this.compcd, S_ORGCD: '', S_WHCD: '', S_INVFLG: 'Y', S_LOCCD: '', S_ITEM: '',
      S_LOT1: '', S_LOTDAMAGE: '', S_ITEMCATCD: '', S_LOT2: '', S_ITEMCDS: [], S_BARCODE: '',
      S_KEEPTEMP: '', S_LOTKEY: '',
    };
    for (let i = 1; i <= 20; i++) paramData['S_F_USER' + String(i).padStart(2, '0')] = '';

    const res = await fetch(`${BASE}/otoowms/p800/p800100/getSearch3.do`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'METHOD_ID': 'sid_getSearch3',
        'Cookie': this._cookieHeader(),
      },
      body: JSON.stringify({ paramData }),
    });
    this._setCookiesFromResponse(res);
    const json = await res.json();
    if (json.CODE !== 0) {
      throw new Error('WMS 재고현황 조회 실패: ' + (json.MESSAGE || json.CODE));
    }
    let rows = json.resultList || [];
    if (orgFilter) rows = rows.filter(r => r.ORGNM === orgFilter);
    return rows;
  }

  /**
   * P200200(주문등록) 화면의 "엑셀업로드" 팝업(popE000)이 실제로 쓰는 중복확인 API.
   * COL_0A~COL_AV 필드가 있는 행 배열을 보내면, 서버가 나머지 COL_xx를 빈 문자열로 채우고
   * SEQ/CHKMSG(문제 있으면 메시지, 없으면 "") 등을 덧붙여 돌려준다 — 이 반환값을 그대로
   * uploadRows()에 다시 넣어야 한다(2026-09-15, 실제 네트워크 캡처로 확인).
   */
  async setCheck(pgmid, orgcd, whcd, rows) {
    const res = await fetch(`${BASE}/sys/popup/popE000/setCheck.do`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'METHOD_ID': 'AJAX',
        'Cookie': this._cookieHeader(),
      },
      body: JSON.stringify({ paramData: { PGMID: pgmid, ORGCD: orgcd, WHCD: whcd }, paramList: rows }),
    });
    this._setCookiesFromResponse(res);
    const json = await res.json();
    if (json.CODE !== 0) {
      throw new Error('WMS 중복확인 실패: ' + (json.MESSAGE || json.CODE));
    }
    return json.resultList || [];
  }

  /**
   * setCheck()의 결과(resultList)를 그대로 받아 실제로 주문을 등록한다.
   * PROCNAME은 캡처된 실제 값 "USX_UploadP220"(P200200 전용) 고정.
   */
  async uploadRows(pgmid, orgcd, whcd, rows) {
    const res = await fetch(`${BASE}/sys/popup/popE000/upload.do`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'METHOD_ID': 'AJAX',
        'Cookie': this._cookieHeader(),
      },
      body: JSON.stringify({
        paramData: { PGMID: pgmid, ORGCD: orgcd, WHCD: whcd, PROCNAME: 'USX_UploadP220' },
        paramList: rows,
      }),
    });
    this._setCookiesFromResponse(res);
    const json = await res.json();
    if (json.CODE !== 0) {
      throw new Error('WMS 업로드 실패: ' + (json.MESSAGE || json.CODE));
    }
    return json;
  }
}

function mapRow(r) {
  return {
    입고번호: r.WIKEY,
    입고요청일자: toIsoDate(r.WISCHDT),
    입고일자: toIsoDate(r.WIDT),
    입고상태: WISTS_LABEL[r.WISTS] || r.WISTS,
    입고유형: WITYPE_LABEL[r.WITYPE] || r.WITYPE,
    창고코드: r.WHCD,
    창고명: r.WHNM,
    거래처코드: r.CUSTCD,
    거래처명: r.CUSTNM,
    품목코드: r.ITEMCD,
    품목명: r.ITEMNM,
    단위: r.UNITCD,
    PLT입수량: r.INPLTQTY,
    BOX입수량: r.INBOXQTY,
    입고수량: r.WIQTY,
    입고PLT: r.WIQTYCTN,
    입고BOX: r.WIQTYBOX,
    입고EA: r.WIQTYEA,
    소비기한: toIsoDate(r.LOT1),
    LOT: r.LOT2,
    입고일자로트: toIsoDate(r.LOTWIDT),
    단가: r.UNITPRICE,
    품목대분류: r.ITEMCATEGORYNM1,
    품목중분류: r.ITEMCATEGORYNM2,
    비고: r.REMARK,
    _raw: r,
  };
}

module.exports = { WmsSession, loadEnv };
