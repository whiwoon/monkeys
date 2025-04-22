// ==UserScript==
// @name         티켓링크_한화 경기 예매 클릭
// @namespace    ticketlink
// @version      2.3
// @description  예매 버튼 감지 및 모달 자동 클릭, 정지 버튼 추가
// @match        https://www.ticketlink.co.kr/sports/137/63*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

// ✅ 페이지 로딩 상태 확인 후 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}

function main() {
    console.log("🚀 스크립트 진입 성공");

    const selectedIndex = sessionStorage.getItem('autoReserveIndex');
    const isActive = sessionStorage.getItem('autoReserveActive') === 'true';

    // ✅ 상단 고정 바 생성
    const topBar = document.createElement('div');
    topBar.style.position = 'fixed';
    topBar.style.top = '0';
    topBar.style.left = '0';
    topBar.style.width = '100%';
    topBar.style.background = 'black';
    topBar.style.color = 'white';
    topBar.style.padding = '10px';
    topBar.style.zIndex = '9999';
    topBar.style.textAlign = 'center';

    const actionBtn = document.createElement('button');
    actionBtn.textContent = '스크립트 동작';
    actionBtn.style.padding = '8px 16px';
    actionBtn.style.cursor = 'pointer';
    actionBtn.style.color = 'white';
    actionBtn.style.backgroundColor = '#333';
    actionBtn.style.border = '1px solid #fff';
    actionBtn.style.marginRight = '10px';

    const stopBtn = document.createElement('button');
    stopBtn.textContent = '스크립트 정지';
    stopBtn.style.padding = '8px 16px';
    stopBtn.style.cursor = 'pointer';
    stopBtn.style.color = 'white';
    stopBtn.style.backgroundColor = 'darkred';
    stopBtn.style.border = '1px solid #fff';
    stopBtn.style.display = isActive ? 'inline-block' : 'none';

    topBar.appendChild(actionBtn);
    topBar.appendChild(stopBtn);
    document.body.appendChild(topBar);

    if (isActive && selectedIndex) {
        console.log(`✅ 자동 예매 진행 중: data-index = ${selectedIndex}`);
        autoCheckAndClick(selectedIndex);
    }

    // ✅ 모달 오버레이 생성
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    overlay.style.zIndex = '9998';
    overlay.style.display = 'none';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    const modalBox = document.createElement('div');
    modalBox.style.backgroundColor = 'white';
    modalBox.style.padding = '20px';
    modalBox.style.borderRadius = '10px';
    modalBox.style.width = '80%';
    modalBox.style.maxWidth = '500px';
    modalBox.style.maxHeight = '70%';
    modalBox.style.overflowY = 'auto';

    overlay.appendChild(modalBox);
    document.body.appendChild(overlay);

    function showSelectionModal() {
        modalBox.innerHTML = '<h3>번호를 클릭하여 예약을 선택하세요</h3><ul id="selectionList" style="padding-left: 0;"></ul>';
        const listItems = document.querySelectorAll('.reserve_lst_bx li[data-index]');
        if (!listItems.length) {
            modalBox.innerHTML = '<p>선택 가능한 항목이 없습니다.</p>';
            overlay.style.display = 'flex';
            return;
        }

        const ul = modalBox.querySelector('#selectionList');
        ul.style.listStyle = 'none';

        listItems.forEach(li => {
            const index = li.getAttribute('data-index');
            const text = li.innerText.replace(/\s+/g, ' ').trim();

            const item = document.createElement('li');
            item.style.padding = '10px';
            item.style.border = '1px solid #ccc';
            item.style.marginBottom = '8px';
            item.style.cursor = 'pointer';
            item.textContent = `${index}: ${text}`;
            item.addEventListener('click', () => confirmSelection(index, text));

            ul.appendChild(item);
        });

        overlay.style.display = 'flex';
    }

    function confirmSelection(index, text) {
        modalBox.innerHTML = `
            <p><strong>${text}</strong></p>
            <p>선택된 예약으로 스크립트를 진행하시겠습니까?</p>
            <div style="margin-top: 20px; display: flex; justify-content: center; gap: 20px;">
                <button id="yesBtn">예</button>
                <button id="noBtn">아니오</button>
            </div>
        `;

        document.getElementById('yesBtn').onclick = () => {
            sessionStorage.setItem('autoReserveIndex', index);
            sessionStorage.setItem('autoReserveActive', 'true');
            location.reload();
        };

        document.getElementById('noBtn').onclick = () => {
            overlay.style.display = 'none';
            console.log('사용자가 "아니오"를 선택했습니다.');
        };
    }

    actionBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
        showSelectionModal();
    });

    stopBtn.addEventListener('click', () => {
        sessionStorage.removeItem('autoReserveIndex');
        sessionStorage.removeItem('autoReserveActive');
        alert('스크립트가 정지되었습니다.');
        stopBtn.style.display = 'none';
        actionBtn.style.display = 'inline-block';
    });

    function autoCheckAndClick(index) {
        const liObserver = new MutationObserver(() => {
            const targetLi = document.querySelector(`li[data-index="${index}"]`);
            if (targetLi) {
                console.log(`✅ li[data-index="${index}"] 감지됨`);
                liObserver.disconnect();
                observeForButton(targetLi);
            }
        });

        liObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        const immediateLi = document.querySelector(`li[data-index="${index}"]`);
        if (immediateLi) {
            console.log(`🔎 초기 li 감지됨`);
            liObserver.disconnect();
            observeForButton(immediateLi);
        }
    }

    function observeForButton(targetLi) {
        const btnObserver = new MutationObserver(() => {
            const reserveBtn = targetLi.querySelector('.match_btn a');
            if (reserveBtn) {
                console.log('✅ 예매 버튼 감지됨');
                btnObserver.disconnect();

                if (reserveBtn.classList.contains('plan_sale')) {
                    console.log('📦 plan_sale 있음 → 새로고침');
                    location.reload();
                } else {
                    console.log('🟢 예매 버튼 클릭!');
                    reserveBtn.click();
                    observeModalAndClickConfirm();
                }
            }
        });

        btnObserver.observe(targetLi, {
            childList: true,
            subtree: true
        });

        const reserveBtn = targetLi.querySelector('.match_btn a');
        if (reserveBtn) {
            btnObserver.disconnect();
            if (reserveBtn.classList.contains('plan_sale')) {
                console.log('📦 초기 plan_sale 있음 → 새로고침');
                location.reload();
            } else {
                console.log('🟢 초기 버튼 클릭!');
                reserveBtn.click();
                observeModalAndClickConfirm();
            }
        }
    }

    function observeModalAndClickConfirm() {
        const modalObserver = new MutationObserver((mutations, obs) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) {
                        const modal = node.classList.contains('common_modal_wrap') ? node :
                                      node.querySelector('.common_modal_wrap');
                        if (modal) {
                            console.log('✅ 모달 감지됨');

                            const buttons = modal.querySelectorAll('.common_modal_close');
                            for (const btn of buttons) {
                                if (btn.textContent.trim() === '확인') {
                                    console.log('🟢 확인 버튼 클릭됨');
                                    btn.click();
                                    obs.disconnect();

                                    sessionStorage.removeItem('autoReserveIndex');
                                    sessionStorage.removeItem('autoReserveActive');
                                    stopBtn.style.display = 'none';
                                    actionBtn.style.display = 'inline-block';
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        });

        modalObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}