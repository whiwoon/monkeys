// ==UserScript==
// @name         청사관리본부_식당메뉴 통합 출력
// @namespace    gbmo.go.kr
// @version      1.3
// @description  식단 이미지 새로운 div에 순서대로 출력 + 제목 표시
// @match        *://gbmo.go.kr/chungsa/dv/dietView/selectDietCalendarView.do*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const rcValues = ["1029", "1032", "1033"];
    const url = "https://gbmo.go.kr/chungsa/dv/dietView/selectDietCalendarView.do";

    const getRcTitle = (rc) => {
        const select = document.querySelector('select[name="rc"]');
        if (!select) return `청사 ${rc}`;
        const option = [...select.options].find(opt => opt.value === rc);
        return option?.getAttribute("title") || option?.text || `청사 ${rc}`;
    };

    const formData = (rc) => new URLSearchParams({
        gbd: "CD002",
        rc: rc,
        submit: "",
        mi: "1277"
    });

    const insertImagesFromHTML = (htmlText, rc, container) => {
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
            const noImg = document.createElement("p");
            noImg.textContent = `[${rc}] 식단 이미지 없음`;
            blockWrapper.appendChild(noImg);
        } else {
            imgElements.forEach(img => {
                const clone = img.cloneNode(true);
                clone.style.border = "2px solid #333";
                clone.style.margin = "5px 0";
                clone.style.maxWidth = "100%";
                blockWrapper.appendChild(clone);
            });
        }

        container.appendChild(blockWrapper);
    };

    const createCustomContainer = () => {
        const existing = document.getElementById("custom_scl_img");
        if (existing) existing.remove();

        const sclImg = document.querySelector(".scl_img");
        if (!sclImg || !sclImg.parentElement) {
            console.warn("기준이 되는 scl_img를 찾을 수 없습니다.");
            return null;
        }

        const newDiv = document.createElement("div");
        newDiv.id = "custom_scl_img";
        newDiv.style.marginTop = "40px";
        newDiv.style.padding = "10px";
        newDiv.style.borderTop = "2px solid #ccc";
        sclImg.parentElement.appendChild(newDiv);
        return newDiv;
    };

    const loadAllImages = () => {
        const container = createCustomContainer();
        if (!container) return;

        let promiseChain = Promise.resolve();

        // 순서를 보장하기 위해 순차 실행
        rcValues.forEach(rc => {
            promiseChain = promiseChain.then(() =>
                fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: formData(rc).toString()
                })
                    .then(response => response.text())
                    .then(html => insertImagesFromHTML(html, rc, container))
                    .catch(err => {
                        const errMsg = document.createElement("p");
                        errMsg.textContent = `[${rc}] 식단 로딩 실패`;
                        container.appendChild(errMsg);
                        console.error(`rc=${rc} 요청 실패`, err);
                    })
            );
        });
    };

    window.addEventListener("load", loadAllImages);
})();