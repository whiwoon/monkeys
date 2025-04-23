// ==UserScript==
// @name         청사관리본부_식당메뉴 통합 출력
// @namespace    gbmo.go.kr
// @version      1.4
// @description  식단 이미지 새로운 div에 순서대로 출력 + 제목 표시
// @match        *://gbmo.go.kr/chungsa/dv/dietView/selectDietCalendarView.do*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log("[식단 스크립트] 실행 시작");

    const rcValues = ["1029", "1032", "1033"];
    const url = "https://gbmo.go.kr/chungsa/dv/dietView/selectDietCalendarView.do";

    const getRcTitle = (rc) => {
        const select = document.querySelector('select[name="rc"]');
        if (!select) {
            console.warn(`[식단 스크립트] select[name="rc"] 요소를 찾을 수 없음`);
            return `청사 ${rc}`;
        }
        const option = [...select.options].find(opt => opt.value === rc);
        const title = option?.getAttribute("title") || option?.text || `청사 ${rc}`;
        console.log(`[식단 스크립트] rc=${rc} → title='${title}'`);
        return title;
    };

    const formData = (rc) => new URLSearchParams({
        gbd: "CD002",
        rc: rc,
        submit: "",
        mi: "1277"
    });

    const insertImagesFromHTML = (htmlText, rc, container) => {
        console.log(`[식단 스크립트] rc=${rc} 응답 처리 시작`);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;

        const imgElements = tempDiv.querySelectorAll("div.scl_img img");
        const rcTitle = getRcTitle(rc);

        const blockWrapper = document.createElement("div");
        blockWrapper.style.marginBottom = "30px";

        const titleEl = document.createElement("h3");
        titleEl.innerText = rcTitle;
        titleEl.style.fontSize = "18px";
        titleEl.style.fontWeight = "bold";
        titleEl.style.marginBottom = "10px";
        blockWrapper.appendChild(titleEl);

        if (imgElements.length === 0) {
            console.log(`[식단 스크립트] rc=${rc} 이미지 없음`);
            const noImg = document.createElement("p");
            noImg.textContent = `[${rc}] 식단 이미지 없음`;
            blockWrapper.appendChild(noImg);
        } else {
            console.log(`[식단 스크립트] rc=${rc} 이미지 ${imgElements.length}개 삽입`);
            imgElements.forEach(img => {
                const clone = img.cloneNode(true);
                clone.style.border = "2px solid #333";
                clone.style.margin = "5px 0";
                clone.style.maxWidth = "100%";
                blockWrapper.appendChild(clone);
            });
        }

        container.appendChild(blockWrapper);
        console.log(`[식단 스크립트] rc=${rc} 블록 삽입 완료`);
    };

    const createCustomContainer = () => {
        const existing = document.getElementById("custom_scl_img");
        if (existing) {
            console.log("[식단 스크립트] 기존 custom_scl_img 제거");
            existing.remove();
        }

        const sclImg = document.querySelector(".scl_img");
        if (!sclImg || !sclImg.parentElement) {
            console.warn("[식단 스크립트] scl_img 기준 div 찾기 실패");
            return null;
        }

        const newDiv = document.createElement("div");
        newDiv.id = "custom_scl_img";
        newDiv.style.marginTop = "40px";
        newDiv.style.padding = "10px";
        newDiv.style.borderTop = "2px solid #ccc";
        sclImg.parentElement.appendChild(newDiv);
        console.log("[식단 스크립트] custom_scl_img 생성 완료");
        return newDiv;
    };

    const loadAllImages = () => {
        const container = createCustomContainer();
        if (!container) return;

        let promiseChain = Promise.resolve();

        rcValues.forEach(rc => {
            promiseChain = promiseChain.then(() => {
                console.log(`[식단 스크립트] rc=${rc} 요청 시작`);
                return fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: formData(rc).toString()
                })
                    .then(response => {
                        console.log(`[식단 스크립트] rc=${rc} 응답 수신 성공`);
                        return response.text();
                    })
                    .then(html => insertImagesFromHTML(html, rc, container))
                    .catch(err => {
                        const errMsg = document.createElement("p");
                        errMsg.textContent = `[${rc}] 식단 로딩 실패`;
                        container.appendChild(errMsg);
                        console.error(`[식단 스크립트] rc=${rc} 요청 실패`, err);
                    });
            });
        });
    };

    window.addEventListener("load", () => {
        console.log("[식단 스크립트] window load 이벤트 발생");
        loadAllImages();
    });
})();
