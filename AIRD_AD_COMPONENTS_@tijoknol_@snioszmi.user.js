// ==UserScript==
// @name         AIRD AD COMPONENTS @tijoknol @snioszmi
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Tworzy checkboxy z opcjami Ad Components
// @match        https://content-risk-engine-iad.iad.proxy.amazon.com/experiments/update*
// @match        https://content-risk-engine-iad.iad.proxy.amazon.com/experiments/create*
// @match        https://content-risk-engine-iad.iad.proxy.amazon.com/keyword-management/create*
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
 // Create outer container (biały)
    const outerContainer = document.createElement('div');
    outerContainer.style.cssText = `
        position: fixed;
        bottom: 60px;
        left: 10px;
        padding: 10px;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 5px;
        z-index: 9999;
        width: 280px;
        box-sizing: border-box;
        height: 530px;  // Stała wysokość całego kontenera
    `;

    // Add title
    const title = document.createElement('div');
    title.textContent = 'Ad Program:';
    title.style.cssText = `
        font-size: 14px;
        font-weight: bold;
        color: #333;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #ddd;
        height: 25px;
        box-sizing: border-box;
    `;
    outerContainer.appendChild(title);

    // Program selector container
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
        height: 140px;
        box-sizing: border-box;
    `;

    let currentProgram = 'SP';

    // Tworzenie pill buttons dla programów
    Object.keys(programMappings).forEach(program => {
        const button = document.createElement('button');
        button.textContent = program;
        button.style.cssText = `
            padding: 4px 8px;
            font-size: 11px;
            border: 1px solid #ccc;
            border-radius: 3px;
            cursor: pointer;
            background-color: ${program === 'SP' ? '#fdda5e' : '#fff'};
            border-color: ${program === 'SP' ? '#ffc107' : '#ccc'};
            transition: all 0.2s;
            width: 100%;
            text-align: center;
        `;

        button.addEventListener('click', () => {
            // Reset all buttons
            programSelector.querySelectorAll('button').forEach(btn => {
                btn.style.backgroundColor = '#fff';
                btn.style.borderColor = '#ccc';
            });

            // Highlight selected button
            button.style.backgroundColor = '#fdda5e';
            button.style.borderColor = '#ffc107';

            currentProgram = program;
            updateCheckboxes(program);
        });

        programSelector.appendChild(button);
    });

    outerContainer.appendChild(programSelector);
 // Create checkbox container
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

        // Najpierw dodanie zwykłych checkboxów
        Object.entries(options).forEach(([displayName, value]) => {
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

        // Dodanie separatora
        const separator = document.createElement('div');
        separator.style.cssText = `
            border-top: 1px solid #ddd;
            margin: 10px 0;
        `;
        checkboxContainer.appendChild(separator);

        // Dodanie checkboxa "Select All" na końcu
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

        // Event listener dla Select All
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = checkboxContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (checkbox !== selectAllCheckbox) {
                    checkbox.checked = selectAllCheckbox.checked;
                }
            });
        });

        // Event listener dla pozostałych checkboxów do aktualizacji stanu Select All
        const updateSelectAll = () => {
            const checkboxes = Array.from(checkboxContainer.querySelectorAll('input[type="checkbox"]'))
                .filter(cb => cb !== selectAllCheckbox);
            const allChecked = checkboxes.every(cb => cb.checked);
            selectAllCheckbox.checked = allChecked;
        };

        checkboxContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectAll);
        });

        selectAllDiv.appendChild(selectAllCheckbox);
        selectAllDiv.appendChild(selectAllLabel);
        checkboxContainer.appendChild(selectAllDiv);
    }

    // Initialize checkboxes with default program (SP)
    updateCheckboxes(currentProgram);
    outerContainer.appendChild(checkboxContainer);

    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        height: 40px;
        box-sizing: border-box;
        margin-top: auto;
    `;
// Create copy button
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

    copyButton.addEventListener('mouseover', () => {
        copyButton.style.backgroundColor = '#ffc107';
    });

    copyButton.addEventListener('mouseout', () => {
        copyButton.style.backgroundColor = '#fdda5e';
    });

    copyButton.addEventListener('click', function() {
        const currentOptions = programMappings[currentProgram];
        const selectedOptions = Object.values(currentOptions).filter(value =>
            document.getElementById(value)?.checked
        );

        if (selectedOptions.length > 0) {
            GM_setClipboard(selectedOptions.join('\n'));

            // Zmiana koloru przycisku po skopiowaniu
            copyButton.textContent = 'Copied!';
            copyButton.style.backgroundColor = '#2e7d32';
            copyButton.style.borderColor = '#1b5e20';
            copyButton.style.color = '#fff';

            // Przywrócenie oryginalnego wyglądu po 2 sekundach
            setTimeout(() => {
                copyButton.textContent = 'Copy to clipboard';
                copyButton.style.backgroundColor = '#fdda5e';
                copyButton.style.borderColor = '#ffc107';
                copyButton.style.color = '#000';
            }, 2000);
        }
    });

    // Create clear button
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

    clearButton.addEventListener('mouseover', () => {
        clearButton.style.backgroundColor = '#357abd';
    });

    clearButton.addEventListener('mouseout', () => {
        clearButton.style.backgroundColor = '#4a90e2';
    });

    clearButton.addEventListener('click', function() {
        const currentOptions = programMappings[currentProgram];
        Object.values(currentOptions).forEach(value => {
            const checkbox = document.getElementById(value);
            if (checkbox) checkbox.checked = false;
        });
        // Upewnij się, że Select All też jest odznaczony
        const selectAllCheckbox = document.getElementById('selectAll');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
    });

    buttonContainer.appendChild(copyButton);
    buttonContainer.appendChild(clearButton);
    outerContainer.appendChild(buttonContainer);

    // Add container to body
    document.body.appendChild(outerContainer);
})();
