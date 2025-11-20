// ==UserScript==
// @name         AIRD Name Generator Global @snioszmi
// @namespace    tampermonkey.net/
// @version      2.0
// @description  Generuje nazwy eksperymentów dla AIRD
// @match        content-risk-engine-iad.iad.proxy.amazon.com/experiments/update/*
// @match        content-risk-engine-iad.iad.proxy.amazon.com/experiments/create*
// @match        content-risk-engine-iad.iad.proxy.amazon.com/keyword-management/create*
// @author       Michał Śnioszek
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const processMapping = {
        'SP': 'SPONSORED_PRODUCTS',
        'SB': 'HSA4V_PRODUCTS',
        'AD POST': 'AD_POST',
        'STORES': 'STORES_MODERATION',
        'BOOKS': 'SPONSORED_BOOKS',
        'SBV': 'SPONSORED_BRANDS_VIDEO'
    };

    function updateProcess(adType) {
        const processSelects = document.querySelectorAll('select');
        processSelects.forEach(select => {
            const options = select.options;
            if (Array.from(options).some(option => option.value === 'SPONSORED_PRODUCTS')) {
                select.value = processMapping[adType];
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }

    function getWeekNumber() {
        const now = new Date();
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        return ('0' + weekNumber).slice(-2);
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

    function createDropdown(options, defaultOption) {
        const select = document.createElement('select');
        select.style.cssText = `
            margin-bottom: 10px;
            padding: 5px;
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 3px;
            background-color: #f0f0f0;
        `;

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            if (option === defaultOption) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });

        return select;
    }

    function saveSelectedRegion(region) {
        localStorage.setItem('selectedRegion', region);
    }

    function getSelectedRegion() {
        return localStorage.getItem('selectedRegion') || 'JP';
    }

    function saveSelectedMP(mp) {
        localStorage.setItem('selectedMP', mp);
    }

    function getSelectedMP() {
        return localStorage.getItem('selectedMP') || 'JP';
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
                    case 'Parity':
                        select.value = 'COVERAGE_EXTENSION';
                        break;
                    case 'CriticalEvent':
                        select.value = 'CEP';
                        break;
                    case 'DART':
                        select.value = 'DART';
                        break;
                    default:
                        select.value = 'EXP_TEAM';
                        break;
                }
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }

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

    const container = document.createElement('div');
    container.style.cssText = `
        position: absolute;
        right: 15px;
        top: 60px;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 0;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        width: 300px;
        z-index: 9999;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: #fdda5e;
        border-bottom: 1px solid #ffc107;
        border-radius: 5px 5px 0 0;
        cursor: move;
    `;

    const headerTitle = document.createElement('span');
    headerTitle.textContent = 'AIRD Name Generator';
    headerTitle.style.cssText = `
        font-weight: bold;
        font-size: 14px;
        color: #333;
    `;

    const toggleButton = document.createElement('button');
    toggleButton.textContent = '−';
    toggleButton.style.cssText = `
        background: none;
        border: none;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        color: #333;
        padding: 0;
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
    `;

    header.appendChild(headerTitle);
    header.appendChild(toggleButton);

    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
        padding: 10px;
        display: block;
    `;

    let isMinimized = false;

    toggleButton.addEventListener('click', (e) => {
        e.stopPropagation();
        isMinimized = !isMinimized;

        if (isMinimized) {
            contentContainer.style.display = 'none';
            toggleButton.textContent = '+';
            container.style.width = '200px';
        } else {
            contentContainer.style.display = 'block';
            toggleButton.textContent = '−';
            container.style.width = '300px';
        }
    });

    toggleButton.addEventListener('mouseover', () => {
        toggleButton.style.backgroundColor = 'rgba(0,0,0,0.1)';
        toggleButton.style.borderRadius = '3px';
    });

    toggleButton.addEventListener('mouseout', () => {
        toggleButton.style.backgroundColor = 'transparent';
    });

    const typeSelect = document.createElement('select');
    typeSelect.style.cssText = `
        margin-bottom: 10px;
        padding: 5px;
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 3px;
        background-color: #f0f0f0;
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
        background-color: #f0f0f0;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 3px;
        margin-bottom: 10px;
        text-align: center;
        width: 100%;
        box-sizing: border-box;
        font-size: 12px;
        color: #000;
        font-weight: bold;
    `;

    const marketplacesByRegion = {
        EN: ['AE', 'AU', 'CA', 'IN', 'SG', 'UK', 'US', 'ZA'].sort(),
        ROW: ['BE', 'DE', 'ES', 'FR', 'IT', 'MX'].sort(),
        IXP: ['BR', 'EG', 'NL', 'PL', 'SA', 'SE', 'TR'].sort(),
        JP: ['JP']
    };

    let selectedMP = getSelectedMP();

    const marketplaceButtonsContainer = document.createElement('div');
    marketplaceButtonsContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 5px;
        margin-bottom: 10px;
    `;

    function updateMarketplaceButtons(region) {
        marketplaceButtonsContainer.innerHTML = '';
        const mps = marketplacesByRegion[region];

        if (!mps.includes(selectedMP)) {
            selectedMP = mps;
            saveSelectedMP(selectedMP);
        }

        mps.forEach(mp => {
            const button = document.createElement('button');
            button.textContent = mp;
            button.style.cssText = `
                padding: 5px;
                border: 1px solid #ccc;
                border-radius: 3px;
                cursor: pointer;
                background-color: #fff;
                font-size: 12px;
                transition: all 0.3s;
            `;

            if (mp === selectedMP) {
                button.style.backgroundColor = '#fdda5e';
                button.style.borderColor = '#ffc107';
            }

            button.addEventListener('click', () => {
                marketplaceButtonsContainer.querySelectorAll('button').forEach(btn => {
                    btn.style.backgroundColor = '#fff';
                    btn.style.borderColor = '#ccc';
                });

                button.style.backgroundColor = '#fdda5e';
                button.style.borderColor = '#ffc107';

                selectedMP = mp;
                saveSelectedMP(mp);
                updateMarketplace(mp);
            });

            marketplaceButtonsContainer.appendChild(button);
        });
    }

    const regionToggle = document.createElement('div');
    regionToggle.style.cssText = `
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    `;

    const regions = ['EN', 'ROW', 'IXP', 'JP'];
    const savedRegion = getSelectedRegion();

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        input[type="radio"] {
            accent-color: #ffc107;
        }
    `;
    document.head.appendChild(styleSheet);

    regions.forEach(region => {
        const label = document.createElement('label');
        label.style.cssText = `
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 5px;
            font-size: 12px;
        `;

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'region';
        radio.value = region;
        radio.style.marginRight = '5px';
        if (region === savedRegion) radio.checked = true;

        radio.addEventListener('change', () => {
            updateMarketplaceButtons(region);
            saveSelectedRegion(region);
        });

        label.appendChild(radio);
        label.appendChild(document.createTextNode(region));
        regionToggle.appendChild(label);
    });

    const weekDisplay = document.createElement('div');
    weekDisplay.textContent = 'Wk' + getWeekNumber();
    weekDisplay.style.cssText = `
        background-color: #f0f0f0;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 3px;
        margin-bottom: 10px;
        text-align: center;
        width: 100%;
        box-sizing: border-box;
        font-size: 12px;
        color: #000;
        font-weight: bold;
    `;

    const adTypeOptions = ['SP', 'SB', 'AD POST', 'STORES', 'BOOKS', 'SBV'];
    const adTypeSelect = createDropdown(adTypeOptions, 'SP');

    adTypeSelect.addEventListener('change', (e) => {
        updateProcess(e.target.value);
    });

    const rulenameInput = document.createElement('input');
    rulenameInput.type = 'text';
    rulenameInput.placeholder = 'Enter rule name';
    rulenameInput.style.cssText = `
        padding: 5px;
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #000000;
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
        background-color: #f0f0f0;
        min-height: 20px;
        word-break: break-all;
        width: 100%;
        box-sizing: border-box;
        font-size: 12px;
    `;

    function generateName() {
        if (!selectedMP) {
            alert('Please select a marketplace!');
            return;
        }

        const type = typeSelect.value;
        const month = getMonthName();
        const week = 'Wk' + getWeekNumber();
        const rulename = rulenameInput.value.trim();
        const adType = adTypeSelect.value;

        if (!rulename) {
            alert('Please enter a rule name!');
            return;
        }

        const selectedRegion = document.querySelector('input[name="region"]:checked').value;

        let finalAdType = adType;
        if ((selectedRegion === 'EN' || selectedRegion === 'ROW') && adType === 'SP') {
            finalAdType = 'M2';
        }

        const generatedName = `${type}_${month}_${week}_${selectedMP}_${rulename}_${finalAdType}`;
        previewDiv.textContent = generatedName;

        navigator.clipboard.writeText(generatedName);

        // NOWE: Aktualizacja pola Marketplace na stronie
        updateMarketplace(selectedMP);

        // Obsługa pól tekstowych (type="text")
        const textInputs = document.querySelectorAll('input[type="text"]');
        textInputs.forEach(input => {
            const label = input.previousElementSibling;
            if (label) {
                const labelText = label.textContent;

                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    'value'
                ).set;

                if (labelText === 'Experiment Name') {
                    nativeInputValueSetter.call(input, generatedName);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    input.dispatchEvent(new Event('blur', { bubbles: true }));
                }

                if (labelText === 'Rule Name') {
                    nativeInputValueSetter.call(input, generatedName);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    input.dispatchEvent(new Event('blur', { bubbles: true }));
                }
            }
        });

        // Obsługa pól numerycznych (type="number")
        const numberInputs = document.querySelectorAll('input[type="number"]');
        numberInputs.forEach(input => {
            const label = input.previousElementSibling;
            if (label && label.textContent === 'Source Keyword Count') {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    'value'
                ).set;

                nativeInputValueSetter.call(input, '1');
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.dispatchEvent(new Event('blur', { bubbles: true }));
            }
        });

        generateButton.textContent = 'Copied to clipboard!';
        generateButton.style.backgroundColor = '#2e7d32';
        generateButton.style.borderColor = '#1b5e20';

        setTimeout(() => {
            generateButton.textContent = 'Generate Name';
            generateButton.style.backgroundColor = '#fdda5e';
            generateButton.style.borderColor = '#ffc107';
        }, 2000);
    }

    generateButton.addEventListener('mouseover', () => {
        generateButton.style.backgroundColor = '#ffc107';
    });

    generateButton.addEventListener('mouseout', () => {
        generateButton.style.backgroundColor = '#fdda5e';
    });

    generateButton.addEventListener('click', generateName);

    updateMarketplaceButtons(savedRegion);
    updateProcess('SP');

    contentContainer.appendChild(createLabel('Type:'));
    contentContainer.appendChild(typeSelect);
    contentContainer.appendChild(createLabel('Month:'));
    contentContainer.appendChild(monthDisplay);
    contentContainer.appendChild(createLabel('Region:'));
    contentContainer.appendChild(regionToggle);
    contentContainer.appendChild(createLabel('Marketplace:'));
    contentContainer.appendChild(marketplaceButtonsContainer);
    contentContainer.appendChild(createLabel('Week:'));
    contentContainer.appendChild(weekDisplay);
    contentContainer.appendChild(createLabel('Ad Programe:'));
    contentContainer.appendChild(adTypeSelect);
    contentContainer.appendChild(createLabel('Rule Name:'));
    contentContainer.appendChild(rulenameInput);
    contentContainer.appendChild(generateButton);
    contentContainer.appendChild(previewDiv);

    container.appendChild(header);
    container.appendChild(contentContainer);
    document.body.appendChild(container);

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    header.addEventListener('mousedown', e => {
        if (e.target === header || e.target === headerTitle) {
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
            container.style.right = 'auto';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
})();
