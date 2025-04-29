// ==UserScript==
// @name         all_code_down
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  렌더링 완료된 페이지의 Elements HTML을 다운로드
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 로그 출력 on/off 전역 변수
    let LOG_ON = true;

    function log(msg) {
        if (LOG_ON) {
            console.log('[Elements Download]', msg);
        }
    }

    // 다운로드 함수
    function downloadHTML() {
        log('다운로드 시작');
        const html = document.documentElement.outerHTML;
        const blob = new Blob([html], {type: 'text/html'});
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = (document.title || 'page') + '.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => URL.revokeObjectURL(url), 1000);
        log('다운로드 완료');
    }

    // 버튼 생성 함수
    function createDownloadButton() {
        log('다운로드 버튼 생성');
        const btn = document.createElement('button');
        btn.innerText = 'HTML 다운로드';
        btn.style.position = 'fixed';
        btn.style.top = '10px';
        btn.style.right = '10px';
        btn.style.zIndex = 9999;
        btn.style.background = '#222';
        btn.style.color = '#fff';
        btn.style.padding = '8px 16px';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.onclick = downloadHTML;
        document.body.appendChild(btn);
    }

    // 렌더링 완료 시점 감지 및 버튼 생성
    function onReady(fn) {
        if (document.readyState === 'complete') {
            log('readyState complete');
            setTimeout(fn, 1000); // 혹시 모를 지연을 위해 1초 대기
        } else {
            window.addEventListener('load', function() {
                log('window load');
                setTimeout(fn, 1000);
            });
        }
    }

    // 실행 시작 로그
    log('스크립트 시작');
    onReady(createDownloadButton);

    // (선택) F2 키로 LOG_ON 토글
    window.addEventListener('keydown', function(e) {
        if (e.key === 'F2') {
            LOG_ON = !LOG_ON;
            log('LOG_ON: ' + LOG_ON);
        }
    });
})();
