// ==UserScript==
// @name         AIRD AD COMPONENTS @tijoknol @snioszmi
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Tworzy checkboxy z opcjami Ad Components
// @match        https://content-risk-engine-iad.iad.proxy.amazon.com/experiments/update*
// @match        https://content-risk-engine-iad.iad.proxy.amazon.com/experiments/create*
// @match        https://content-risk-engine-iad.iad.proxy.amazon.com/keyword-management/create*
// @author      Tijo Knol,  Michał Śnioszek
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    const options = [
        'asinAssetsProductTitle',
        'imageText',
        'asinAssetsProductDescription',
        'asinAssetsFeatureBullets',
        'asinAssetsBrowseNodes',
        'asinAssetsBrand',
        'asinAssetsGLProductGroupType'
    ];

    // Create outer container (biały)
    const outerContainer = document.createElement('div');
    outerContainer.style.position = 'fixed';
    outerContainer.style.bottom = '10px';
    outerContainer.style.left = '10px';
    outerContainer.style.padding = '10px';
    outerContainer.style.backgroundColor = '#fff';
    outerContainer.style.border = '1px solid #ddd';
    outerContainer.style.borderRadius = '5px';
    outerContainer.style.zIndex = '9999';

    // Add title
    const title = document.createElement('div');
    title.textContent = 'Ad components:';
    title.style.cssText = `
        font-size: 14px;
        font-weight: bold;
        color: #333;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #ddd;
    `;
    outerContainer.appendChild(title);

    // Create inner container (szary) dla checkboxów
    const checkboxContainer = document.createElement('div');
    checkboxContainer.style.backgroundColor = '#f0f0f0';
    checkboxContainer.style.padding = '10px';
    checkboxContainer.style.borderRadius = '3px';
    checkboxContainer.style.marginBottom = '10px';
    checkboxContainer.style.border = '1px solid #ddd';

    // Create checkboxes
    options.forEach(option => {
        const div = document.createElement('div');
        div.style.marginBottom = '8px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = option;
        checkbox.value = option;
        checkbox.style.width = '20px';
        checkbox.style.height = '20px';
        checkbox.style.cursor = 'pointer';
        checkbox.style.accentColor = '#ffc107';

        const label = document.createElement('label');
        label.htmlFor = option;
        label.textContent = option;
        label.style.marginLeft = '8px';
        label.style.cursor = 'pointer';
        label.style.fontSize = '14px';
        label.style.verticalAlign = 'middle';

        div.appendChild(checkbox);
        div.appendChild(label);
        checkboxContainer.appendChild(div);
    });

    // Dodajemy szary kontener do białego
    outerContainer.appendChild(checkboxContainer);

    // Przyciski (na białym tle)
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';

    // Create copy button
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy to clipboard';
    copyButton.style.padding = '8px 10px';
    copyButton.style.width = '73%';
    copyButton.style.cursor = 'pointer';
    copyButton.style.fontSize = '14px';
    copyButton.style.backgroundColor = '#fdda5e';
    copyButton.style.border = '1px solid #ffc107';
    copyButton.style.borderRadius = '3px';
    copyButton.style.color = '#000';
    copyButton.style.transition = 'all 0.3s';

    copyButton.addEventListener('mouseover', () => {
        copyButton.style.backgroundColor = '#ffc107';
    });

    copyButton.addEventListener('mouseout', () => {
        copyButton.style.backgroundColor = '#fdda5e';
    });

    copyButton.addEventListener('click', function() {
        const selectedOptions = options.filter(option =>
            document.getElementById(option).checked
        );

        if (selectedOptions.length > 0) {
            GM_setClipboard(selectedOptions.join('\n'));

            // Dodajemy efekt zielonego przycisku
            copyButton.textContent = 'Copied!';
            copyButton.style.backgroundColor = '#2e7d32';
            copyButton.style.borderColor = '#1b5e20';
            copyButton.style.color = '#fff';

            // Przywracamy oryginalny wygląd po 2 sekundach
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
    clearButton.style.padding = '8px 10px';
    clearButton.style.width = '25%';
    clearButton.style.cursor = 'pointer';
    clearButton.style.fontSize = '14px';
    clearButton.style.backgroundColor = '#4a90e2';
    clearButton.style.border = '1px solid #357abd';
    clearButton.style.borderRadius = '3px';
    clearButton.style.color = '#fff';
    clearButton.style.transition = 'all 0.3s';

    clearButton.addEventListener('mouseover', () => {
        clearButton.style.backgroundColor = '#357abd';
    });

    clearButton.addEventListener('mouseout', () => {
        clearButton.style.backgroundColor = '#4a90e2';
    });

    clearButton.addEventListener('click', function() {
        options.forEach(option => {
            document.getElementById(option).checked = false;
        });
    });

    buttonContainer.appendChild(copyButton);
    buttonContainer.appendChild(clearButton);

    // Dodajemy przyciski do białego kontenera
    outerContainer.appendChild(buttonContainer);

    // Dodajemy całość do body
    document.body.appendChild(outerContainer);
})();
