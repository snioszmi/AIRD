// ==UserScript==
// @name         AIRD Associated Policy Search Field @snioszmi
// @namespace    tampermonkey.net/ 
// @version      2.0
// @description  Wyszukuje podobne słowa w polu wyboru Associated Policy na stronie Content Risk Engine
// @match        content-risk-engine-iad.iad.proxy.amazon.com/experiments/update/*
// @match        content-risk-engine-iad.iad.proxy.amazon.com/experiments/create*
// @match        content-risk-engine-iad.iad.proxy.amazon.com/keyword-management/create*
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
            top: 790px;
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
        `;

        const titleLabel = document.createElement('div');
        titleLabel.textContent = 'Associated Policy Search';
        titleLabel.style.cssText = `
            font-size: 14px;
            font-weight: bold;
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
        `;

        header.appendChild(titleLabel);
        header.appendChild(toggleButton);

        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            padding: 10px;
            display: block;
        `;

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Enter policy name...';
        searchInput.style.cssText = `
            padding: 5px;
            width: 100%;
            border: 1px solid #000000;
            border-radius: 3px;
            box-sizing: border-box;
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

        searchButton.addEventListener('mouseover', () => {
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

        contentContainer.appendChild(searchInput);
        contentContainer.appendChild(searchButton);
        contentContainer.appendChild(counter);
        contentContainer.appendChild(resultsContainer);

        floatingContainer.appendChild(header);
        floatingContainer.appendChild(contentContainer);
        document.body.appendChild(floatingContainer);

        let isMinimized = false;
        toggleButton.onclick = function() {
            isMinimized = !isMinimized;
            if (isMinimized) {
                contentContainer.style.display = 'none';
                toggleButton.textContent = '+';
            } else {
                contentContainer.style.display = 'block';
                toggleButton.textContent = '−';
            }
        };

        // Funkcja rozmytego wyszukiwania
        function fuzzyMatch(searchText, optionText) {
            // Normalizacja: małe litery, usunięcie podkreślników i spacji
            const normalizedSearch = searchText.toLowerCase().replace(/[_\s]/g, '');
            const normalizedOption = optionText.toLowerCase().replace(/[_\s]/g, '');

            // Sprawdź czy wszystkie słowa z wyszukiwania są w opcji
            const searchWords = searchText.toLowerCase().split(/[\s_]+/).filter(w => w.length > 0);
            const optionWords = optionText.toLowerCase().split(/[\s_]+/).filter(w => w.length > 0);

            // Jeśli każde słowo z wyszukiwania pasuje do początku jakiegoś słowa w opcji
            const allWordsMatch = searchWords.every(searchWord => {
                return optionWords.some(optionWord => optionWord.startsWith(searchWord));
            });

            if (allWordsMatch) return true;

            // Sprawdź czy wyszukiwany tekst jest zawarty w opcji (bez spacji/podkreślników)
            if (normalizedOption.includes(normalizedSearch)) return true;

            return false;
        }

        function performSearch() {
            const selectElement = document.querySelector('.rule-basic-details select');
            if (!selectElement) {
                console.log("Nie znaleziono elementu select");
                return;
            }

            const searchText = searchInput.value.trim();
            if (!searchText) {
                counter.textContent = 'Please enter search text';
                resultsContainer.innerHTML = '';
                return;
            }

            let foundCount = 0;
            let resultsHTML = '';

            Array.from(selectElement.options).forEach((option, index) => {
                if (fuzzyMatch(searchText, option.text)) {
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

            searchButton.textContent = 'Click below ↓';
            searchButton.style.backgroundColor = '#2e7d32';
            searchButton.style.borderColor = '#1b5e20';

            setTimeout(() => {
                searchButton.textContent = 'Search';
                searchButton.style.backgroundColor = '#fdda5e';
                searchButton.style.borderColor = '#ffc107';
            }, 2000);

            const searchResults = resultsContainer.getElementsByClassName('search-result');
            Array.from(searchResults).forEach(result => {
                result.onclick = function() {
                    const index = result.getAttribute('data-index');
                    selectElement.selectedIndex = index;
                    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                };
            });
        }

        searchButton.onclick = performSearch;
        searchInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        };
    }

    waitForSelect();
})();
