// ==UserScript==
// @name         AIRD AD COMPONENTS @tijoknol @snioszmi
// @namespace    tampermonkey.net/
// @version      2.0
// @description  Tworzy checkboxy z opcjami Ad Components
// @match        content-risk-engine-iad.iad.proxy.amazon.com/experiments/update*
// @match        content-risk-engine-iad.iad.proxy.amazon.com/experiments/create*
// @match        content-risk-engine-iad.iad.proxy.amazon.com/keyword-management/create*
// @author      Tijo Knol,  Michał Śnioszek
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    const programMappings = {
        'SP': {
            'Product Description': 'asinAssetsProductDescription',
            'Feature Bullets': 'asinAssetsFeatureBullets',
            'ASIN Brand': 'asinAssetsBrand',
            'GL': 'asinAssetsGLProductGroupType',
            'Browse Nodes': 'asinAssetsBrowseNodes',
            'OCR Text': 'imageText',
            'Product Title': 'asinAssetsProductTitle'
        },
        'SB': {
            'Product Title': 'asinAssetsProductTitle',
            'OCR Text': 'imageText',
            'Product Description': 'asinAssetsProductDescription',
            'Custom Headline': 'textAssets$customHeadline',
            'Feature Bullets': 'asinAssetsFeatureBullets',
            'Brand': 'asinAssetsBrand',
            'Browse Nodes': 'asinAssetsBrowseNodes',
            'Landing Page Asin Title': 'landingPageAsinProductTitle',
            'Landing Page Asin Description': 'landingPageAsinProductDescription',
            'Landing Page Asin Browse Nodes': 'landingPageAsinBrowseNodes',
            'Landing Page Asin Brands': 'landingPageAsinBrands'
        },
        'AD POST': {
            'Product Title': 'asinAssetsProductTitle',
            'OCR Text': 'imageText',
            'Product Description': 'asinAssetsProductDescription',
            'Feature Bullets': 'asinAssetsFeatureBullets',
            'Brand': 'asinAssetsBrand',
            'Caption': 'textAssets$caption'
        },
        'STORES': {
            'Product Title': 'asinAssetsProductTitle',
            'OCR Text': 'imageText',
            'Product Description': 'asinAssetsProductDescription',
            'Feature Bullets': 'asinAssetsFeatureBullets',
            'Brand': 'asinAssetsBrand',
            'All Text': 'textAssets',
            'Browse Nodes': 'asinAssetsBrowseNodes'
        },
        'BOOKS': {
            'Book Title': 'bookTitle',
            'AuthorNames': 'asinAssetsAuthorNames',
            'OCR Text': 'imageText',
            'Custom Headline': 'textAssets$customHeadline',
            'Product Title': 'asinAssetsProductTitle',
            'Product Description': 'asinAssetsProductDescription',
            'Feature Bullets': 'asinAssetsFeatureBullets',
            'ASIN Brand': 'asinAssetsBrand',
            'Browse Nodes': 'asinAssetsBrowseNodes',
            'Landing Page Asin Title': 'landingPageAsinProductTitle',
            'Landing Page Asin Description': 'landingPageAsinProductDescription',
            'Landing Page Asin Browse Nodes': 'landingPageAsinBrowseNodes',
            'Landing Page Asin Brands': 'landingPageAsinBrands',
            'All Text': 'textAssets'
        },
        'SBV': {
            'Product Title': 'asinAssetsProductTitle',
            'Product Description': 'asinAssetsProductDescription',
            'Feature Bullets': 'asinAssetsFeatureBullets',
            'Brand': 'asinAssetsBrand',
            'All Text': 'textAssets',
            'Browse Nodes': 'asinAssetsBrowseNodes'
        }
    };

    const outerContainer = document.createElement('div');
    outerContainer.style.cssText = `
        position: fixed;
        bottom: 60px;
        left: 10px;
        padding: 0;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 5px;
        z-index: 9999;
        width: 280px;
        box-sizing: border-box;
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
    `;

    const headerTitle = document.createElement('span');
    headerTitle.textContent = 'AIRD AD Components';
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

    toggleButton.addEventListener('click', function(e) {
        e.stopPropagation();
        isMinimized = !isMinimized;

        if (isMinimized) {
            contentContainer.style.display = 'none';
            toggleButton.textContent = '+';
            outerContainer.style.width = '200px';
        } else {
            contentContainer.style.display = 'block';
            toggleButton.textContent = '−';
            outerContainer.style.width = '280px';
        }
    });

    toggleButton.addEventListener('mouseover', function() {
        toggleButton.style.backgroundColor = 'rgba(0,0,0,0.1)';
        toggleButton.style.borderRadius = '3px';
    });

    toggleButton.addEventListener('mouseout', function() {
        toggleButton.style.backgroundColor = 'transparent';
    });

    const title = document.createElement('div');
    title.textContent = 'Ad Program:';
    title.style.cssText = `
        font-size: 14px;
        font-weight: bold;
        color: #333;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #ddd;
    `;
    contentContainer.appendChild(title);

    const programSelector = document.createElement('div');
    programSelector.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
        margin-bottom: 20px;
        background-color: #f0f0f0;
        padding: 5px;
        border-radius: 3px;
        border: 1px solid #ddd;
    `;

    let currentProgram = 'SP';

    Object.keys(programMappings).forEach(function(program) {
        const button = document.createElement('button');
        button.textContent = program;
        button.style.cssText = `
            padding: 4px 8px;
            font-size: 11px;
            border: 1px solid #ccc;
            border-radius: 3px;
            cursor: pointer;
            background-color: ` + (program === 'SP' ? '#fdda5e' : '#fff') + `;
            border-color: ` + (program === 'SP' ? '#ffc107' : '#ccc') + `;
            transition: all 0.2s;
            width: 100%;
            text-align: center;
        `;

        button.addEventListener('click', function() {
            programSelector.querySelectorAll('button').forEach(function(btn) {
                btn.style.backgroundColor = '#fff';
                btn.style.borderColor = '#ccc';
            });

            button.style.backgroundColor = '#fdda5e';
            button.style.borderColor = '#ffc107';

            currentProgram = program;
            updateCheckboxes(program);
        });

        programSelector.appendChild(button);
    });

    contentContainer.appendChild(programSelector);

    const checkboxContainer = document.createElement('div');
    checkboxContainer.style.cssText = `
        background-color: #f0f0f0;
        padding: 10px;
        border-radius: 3px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        height: 320px;
        box-sizing: border-box;
        overflow: auto;
    `;

    function updateCheckboxes(program) {
        checkboxContainer.innerHTML = '';

        const options = programMappings[program];

        Object.entries(options).forEach(function(entry) {
            const displayName = entry[0];
            const value = entry[1];

            const div = document.createElement('div');
            div.style.marginBottom = '8px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = value;
            checkbox.value = value;
            checkbox.style.cssText = `
                width: 20px;
                height: 20px;
                cursor: pointer;
                accent-color: #ffc107;
            `;

            const label = document.createElement('label');
            label.htmlFor = value;
            label.textContent = displayName;
            label.style.cssText = `
                margin-left: 8px;
                cursor: pointer;
                font-size: 14px;
                vertical-align: middle;
            `;

            div.appendChild(checkbox);
            div.appendChild(label);
            checkboxContainer.appendChild(div);
        });

        const separator = document.createElement('div');
        separator.style.cssText = `
            border-top: 1px solid #ddd;
            margin: 10px 0;
        `;
        checkboxContainer.appendChild(separator);

        const selectAllDiv = document.createElement('div');
        selectAllDiv.style.marginTop = '8px';

        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.id = 'selectAll';
        selectAllCheckbox.style.cssText = `
            width: 20px;
            height: 20px;
            cursor: pointer;
            accent-color: #ffc107;
        `;

        const selectAllLabel = document.createElement('label');
        selectAllLabel.htmlFor = 'selectAll';
        selectAllLabel.textContent = 'Select All';
        selectAllLabel.style.cssText = `
            margin-left: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            vertical-align: middle;
        `;

        selectAllCheckbox.addEventListener('change', function(e) {
            const checkboxes = checkboxContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(function(checkbox) {
                if (checkbox !== selectAllCheckbox) {
                    checkbox.checked = selectAllCheckbox.checked;
                }
            });
        });

        const updateSelectAll = function() {
            const checkboxes = Array.from(checkboxContainer.querySelectorAll('input[type="checkbox"]'))
                .filter(function(cb) { return cb !== selectAllCheckbox; });
            const allChecked = checkboxes.every(function(cb) { return cb.checked; });
            selectAllCheckbox.checked = allChecked;
        };

        checkboxContainer.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
            checkbox.addEventListener('change', updateSelectAll);
        });

        selectAllDiv.appendChild(selectAllCheckbox);
        selectAllDiv.appendChild(selectAllLabel);
        checkboxContainer.appendChild(selectAllDiv);
    }

    updateCheckboxes(currentProgram);
    contentContainer.appendChild(checkboxContainer);

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
    `;

    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy to clipboard';
    copyButton.style.cssText = `
        padding: 8px 10px;
        width: 73%;
        cursor: pointer;
        font-size: 14px;
        background-color: #fdda5e;
        border: 1px solid #ffc107;
        border-radius: 3px;
        color: #000;
        transition: all 0.3s;
    `;

    copyButton.addEventListener('mouseover', function() {
        copyButton.style.backgroundColor = '#ffc107';
    });

    copyButton.addEventListener('mouseout', function() {
        copyButton.style.backgroundColor = '#fdda5e';
    });

    copyButton.addEventListener('click', function() {
        const currentOptions = programMappings[currentProgram];
        const selectedOptions = Object.values(currentOptions).filter(function(value) {
            const checkbox = document.getElementById(value);
            return checkbox && checkbox.checked;
        });

        if (selectedOptions.length > 0) {
            GM_setClipboard(selectedOptions.join('\n'));

            copyButton.textContent = 'Copied!';
            copyButton.style.backgroundColor = '#2e7d32';
            copyButton.style.borderColor = '#1b5e20';
            copyButton.style.color = '#fff';

            setTimeout(function() {
                copyButton.textContent = 'Copy to clipboard';
                copyButton.style.backgroundColor = '#fdda5e';
                copyButton.style.borderColor = '#ffc107';
                copyButton.style.color = '#000';
            }, 2000);
        }
    });

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear';
    clearButton.style.cssText = `
        padding: 8px 10px;
        width: 25%;
        cursor: pointer;
        font-size: 14px;
        background-color: #4a90e2;
        border: 1px solid #357abd;
        border-radius: 3px;
        color: #fff;
        transition: all 0.3s;
    `;

    clearButton.addEventListener('mouseover', function() {
        clearButton.style.backgroundColor = '#357abd';
    });

    clearButton.addEventListener('mouseout', function() {
        clearButton.style.backgroundColor = '#4a90e2';
    });

    clearButton.addEventListener('click', function() {
        const currentOptions = programMappings[currentProgram];
        Object.values(currentOptions).forEach(function(value) {
            const checkbox = document.getElementById(value);
            if (checkbox) checkbox.checked = false;
        });
        const selectAllCheckbox = document.getElementById('selectAll');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
    });

    buttonContainer.appendChild(copyButton);
    buttonContainer.appendChild(clearButton);
    contentContainer.appendChild(buttonContainer);

    outerContainer.appendChild(header);
    outerContainer.appendChild(contentContainer);
    document.body.appendChild(outerContainer);
})();
