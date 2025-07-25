// ==UserScript==
// @name         AIRD Name Generator @snioszmi
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Generuje nazwy eksperymentów dla AIRD
// @match        https://content-risk-engine-iad.iad.proxy.amazon.com/experiments/update/*
// @match        https://content-risk-engine-iad.iad.proxy.amazon.com/experiments/create*
// @author       Michał Śnioszek
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function getWeekNumber() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now - start;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        const weekNumber = Math.floor(diff / oneWeek);
        return ('0' + (weekNumber + 1)).slice(-2);
    }

    function getMonthName() {
        const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[new Date().getMonth()];
    }

    function createLabel(text) {
        const label = document.createElement('div');
        label.textContent = text;
        label.style.cssText = `
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
        `;
        return label;
    }

    function updateKeywordSource(selectedType) {
        const keywordSourceSelects = document.querySelectorAll('select');
        keywordSourceSelects.forEach(select => {
            const label = select.previousElementSibling;
            if (label && label.textContent === 'Keyword Source') {
                switch(selectedType) {
                    case 'DAV1K':
                        select.value = 'IMPRESSION_AUDITS';
                        break;
                    case 'PDS':
                        select.value = 'PDS';
                        break;
                    default:
                        select.value = 'EXP_TEAM';
                        break;
                }
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }

    const container = document.createElement('div');
    container.style.cssText = `
        position: absolute;
        right: 150px;
        top: 220px;
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        width: 250px;
        z-index: 9999;
    `;

    const typeSelect = document.createElement('select');
    typeSelect.style.cssText = `
        margin-bottom: 10px;
        padding: 5px;
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 3px;
    `;

    const types = ['DiveDeep', 'DAV1K', 'PDS', 'DART', 'FATALRIR', 'Appeals', 'ATPI', 'TS', 'Parity', 'CriticalEvent', 'KnowHow'];
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });

    typeSelect.addEventListener('change', (event) => {
        updateKeywordSource(event.target.value);
    });

    const monthDisplay = document.createElement('div');
    monthDisplay.textContent = getMonthName();
    monthDisplay.style.cssText = `
        background-color: #fff;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 3px;
        margin-bottom: 10px;
        text-align: center;
        width: 100%;
        box-sizing: border-box;
        font-size: 12px;
        color: #666;
    `;

    function updateMarketplace(newMP) {
        const marketplaceSelects = document.querySelectorAll('select');
        marketplaceSelects.forEach(select => {
            const label = select.previousElementSibling;
            if (label && label.textContent === 'Marketplace') {
                select.value = newMP;
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }

    const mpButtonsContainer = document.createElement('div');
    mpButtonsContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 3px;
        margin-bottom: 10px;
        justify-content: center;
    `;
 let selectedMP = 'PL';

    function generateName() {
        if (!selectedMP) {
            alert('Please select a marketplace!');
            return;
        }

        const type = typeSelect.value;
        const month = getMonthName();
        const week = 'Wk' + getWeekNumber();
        const rulename = rulenameInput.value.trim();

        if (!rulename) {
            alert('Please enter a rulename!');
            return;
        }

        const generatedName = `${type}_${month}_${week}_${selectedMP}_${rulename}_SP`;
        previewDiv.textContent = generatedName;

        const experimentNameInput = document.querySelector('input[type="text"]');
        if (experimentNameInput) {
            experimentNameInput.value = generatedName;
            const event = new Event('input', { bubbles: true });
            experimentNameInput.dispatchEvent(event);
        }
    }

    const marketplaces = ['BR', 'NL', 'SE', 'PL', 'TR', 'SA', 'EG'];
    marketplaces.forEach(mp => {
        const button = document.createElement('button');
        button.textContent = mp;
        button.style.cssText = `
            padding: 5px 10px;
            border: 1px solid #ccc;
            border-radius: 3px;
            cursor: pointer;
            background-color: #fff;
            flex: 0 0 auto;
            transition: all 0.3s;
            font-size: 12px;
        `;

        if (mp === 'PL') {
            button.style.backgroundColor = '#fdda5e';
            button.style.borderColor = '#ffc107';
        }

        button.addEventListener('click', () => {
            mpButtonsContainer.querySelectorAll('button').forEach(btn => {
                btn.style.backgroundColor = '#fff';
                btn.style.color = '#000';
                btn.style.borderColor = '#ccc';
            });
            button.style.backgroundColor = '#fdda5e';
            button.style.color = '#000';
            button.style.borderColor = '#ffc107';
            selectedMP = mp;

            updateMarketplace(mp);

            if (previewDiv.textContent) {
                setTimeout(() => {
                    const experimentNameInput = document.querySelector('input[type="text"]');
                    if (experimentNameInput) {
                        const type = typeSelect.value;
                        const month = getMonthName();
                        const week = 'Wk' + getWeekNumber();
                        const rulename = rulenameInput.value.trim();
                        const generatedName = `${type}_${month}_${week}_${selectedMP}_${rulename}_SP`;

                        experimentNameInput.value = generatedName;
                        experimentNameInput.dispatchEvent(new Event('input', { bubbles: true }));
                        experimentNameInput.dispatchEvent(new Event('change', { bubbles: true }));
                        previewDiv.textContent = generatedName;
                    }
                }, 300);
            }
        });

        mpButtonsContainer.appendChild(button);
    });

    const weekDisplay = document.createElement('div');
    weekDisplay.textContent = 'Wk' + getWeekNumber();
    weekDisplay.style.cssText = `
        background-color: #fff;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 3px;
        margin-bottom: 10px;
        text-align: center;
        width: 100%;
        box-sizing: border-box;
        font-size: 12px;
        color: #666;
    `;

    const rulenameInput = document.createElement('input');
    rulenameInput.type = 'text';
    rulenameInput.placeholder = 'Enter rulename';
    rulenameInput.style.cssText = `
        padding: 5px;
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 3px;
        margin-bottom: 10px;
    `;

    const generateButton = document.createElement('button');
    generateButton.textContent = 'Generate Name';
    generateButton.style.cssText = `
        padding: 5px 10px;
        background-color: #fdda5e;
        color: #000;
        border: 1px solid #ffc107;
        border-radius: 3px;
        cursor: pointer;
        width: 100%;
        box-sizing: border-box;
        transition: all 0.3s;
        margin-bottom: 10px;
    `;

    const previewDiv = document.createElement('div');
    previewDiv.style.cssText = `
        padding: 5px;
        border: 1px solid #ddd;
        border-radius: 3px;
        background-color: #fff;
        min-height: 20px;
        word-break: break-all;
        width: 100%;
        box-sizing: border-box;
        font-size: 12px;
    `;

    generateButton.addEventListener('mouseover', () => {
        generateButton.style.backgroundColor = '#ffc107';
    });

    generateButton.addEventListener('mouseout', () => {
        generateButton.style.backgroundColor = '#fdda5e';
    });

    generateButton.addEventListener('click', generateName);

    container.appendChild(createLabel('Type:'));
    container.appendChild(typeSelect);
    container.appendChild(createLabel('Month:'));
    container.appendChild(monthDisplay);
    container.appendChild(createLabel('Marketplace:'));
    container.appendChild(mpButtonsContainer);
    container.appendChild(createLabel('Week:'));
    container.appendChild(weekDisplay);
    container.appendChild(createLabel('Rule Name:'));
    container.appendChild(rulenameInput);
    container.appendChild(generateButton);
    container.appendChild(previewDiv);

    document.body.appendChild(container);

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    container.addEventListener('mousedown', e => {
        if (e.target === container) {
            isDragging = true;
            initialX = e.clientX - container.offsetLeft;
            initialY = e.clientY - container.offsetTop;
        }
    });

    document.addEventListener('mousemove', e => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            container.style.left = currentX + 'px';
            container.style.top = currentY + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
})();

