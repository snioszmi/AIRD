// ==UserScript==
// @name         AIRD Associated Policy Search Field @snioszmi
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Wyszukuje podobne słowa w polu wyboru Associated Policy na stronie Content Risk Engine
// @match        https://content-risk-engine-iad.iad.proxy.amazon.com/experiments/update/*
// @match        https://content-risk-engine-iad.iad.proxy.amazon.com/experiments/create*
// @match        https://content-risk-engine-iad.iad.proxy.amazon.com/keyword-management/create*
// @author       Michał Śnioszek
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function waitForSelect() {
        console.log("Czekam na pojawienie się Associated Policy...");

        const observer = new MutationObserver((mutations, obs) => {
            const selectElement = document.querySelector('.rule-basic-details select');
            if (selectElement) {
                console.log("Znaleziono select Associated Policy!");
                obs.disconnect();
                if (!document.querySelector('#policySearchTool')) {
                    initializeSearchTool();
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function initializeSearchTool() {
        const floatingContainer = document.createElement('div');
        floatingContainer.id = 'policySearchTool';
        floatingContainer.style.cssText = `
            position: absolute;
            right: 15px;
            top: 670px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            width: 300px;
            z-index: 9999;
        `;

        const titleLabel = document.createElement('div');
        titleLabel.textContent = 'Associated Policy Search:';
        titleLabel.style.cssText = `
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
        `;

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Enter policy name...';
        searchInput.style.cssText = `
            padding: 5px;
            width: 100%;
            margin-right: 5px;
            border: 1px solid #000000;
            border-radius: 3px;
        `;

        const searchButton = document.createElement('button');
        searchButton.textContent = 'Search';
        searchButton.style.cssText = `
            padding: 5px 10px;
            background-color: #fdda5e;
            color: #000;
            border: 1px solid #ffc107;
            border-radius: 3px;
            cursor: pointer;
            width: 100%;
            box-sizing: border-box;
            transition: all 0.3s;
            margin-top: 5px;
        `;

        searchButton.addEventListener('moumouseover', () => {
            searchButton.style.backgroundColor = '#ffc107';
        });

        searchButton.addEventListener('mouseout', () => {
            searchButton.style.backgroundColor = '#fdda5e';
        });

        const counter = document.createElement('div');
        counter.style.cssText = `
            font-size: 12px;
            margin-top: 5px;
            color: #666;
        `;

        const resultsContainer = document.createElement('div');
        resultsContainer.style.cssText = `
            margin-top: 10px;
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #ccc;
            border-radius: 3px;
            background: #f0f0f0;
            padding: 5px;
        `;

        floatingContainer.appendChild(titleLabel);
        floatingContainer.appendChild(searchInput);
        floatingContainer.appendChild(searchButton);
        floatingContainer.appendChild(counter);
        floatingContainer.appendChild(resultsContainer);

        document.body.appendChild(floatingContainer);

        function performSearch() {
            const selectElement = document.querySelector('.rule-basic-details select');
            if (!selectElement) {
                console.log("Nie znaleziono elementu select");
                return;
            }

            const searchText = searchInput.value.toLowerCase();
            let foundCount = 0;
            let resultsHTML = '';

            Array.from(selectElement.options).forEach((option, index) => {
                if (option.text.toLowerCase().includes(searchText)) {
                    foundCount++;
                    resultsHTML += `
                        <div class="search-result" data-index="${index}" style="padding: 5px; cursor: pointer; border-bottom: 1px solid #eee;">
                            ${option.text}
                        </div>
                    `;
                }
            });

            counter.textContent = `Found: ${foundCount} elements`;
            resultsContainer.innerHTML = resultsHTML;

            // Zmiana tekstu i koloru przycisku
            searchButton.textContent = 'Click below ↓';
            searchButton.style.backgroundColor = '#2e7d32';
            searchButton.style.borderColor = '#1b5e20';

            // Przywrócenie oryginalnego wyglądu po 2 sekundach
            setTimeout(() => {
                searchButton.textContent = 'Search';
                searchButton.style.backgroundColor = '#fdda5e';
                searchButton.style.borderColor = '#ffc107';
            }, 2000);

            const searchResults = resultsContainer.getElementsByClassName('search-result');
            Array.from(searchResults).forEach(result => {
                result.addEventListener('click', () => {
                    const index = result.getAttribute('data-index');
                    selectElement.selectedIndex = index;
                    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                });
            });
        }

        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    waitForSelect();
})();

