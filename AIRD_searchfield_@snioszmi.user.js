// ==UserScript==
// @name         AIRD Associated Policy Search Field @snioszmi
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Wyszukuje podobne słowa w polu wyboru na stronie Content Risk Engine
// @match        https://content-risk-engine-iad.iad.proxy.amazon.com/experiments/update/*
// @match        https://content-risk-engine-iad.iad.proxy.amazon.com/experiments/create*
// @author       Michał Śnioszek
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function waitForSelect() {
        const selectContainer = document.querySelector('.rule-basic-details');
        if (selectContainer) {
            initializeSearchTool(selectContainer);
        } else {
            setTimeout(waitForSelect, 1000);
        }
    }

    function initializeSearchTool(selectContainer) {
        // Stwórz kontener dla pływającego przycisku
        const floatingContainer = document.createElement('div');
        floatingContainer.style.cssText = `
            position: absolute;
            left: 200px;
            top: 460px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            width: 250px;
        `;

        // Dodaj tytuł "Associated Policy"
        const titleLabel = document.createElement('div');
        titleLabel.textContent = 'Associated Policy:';
        titleLabel.style.cssText = `
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
        `;

        // Stwórz pole input
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Wpisz tekst do wyszukania...';
        searchInput.style.cssText = `
            padding: 5px;
            width: 150px;
            margin-right: 5px;
            border: 1px solid #ccc;
            border-radius: 3px;
        `;

        // Stwórz przycisk wyszukiwania
        const searchButton = document.createElement('button');
        searchButton.textContent = 'Szukaj';
        searchButton.style.cssText = `
            padding: 5px;
            margin-left: 5px;
            border: 1px solid #ccc;
            border-radius: 3px;
            background: #fff;
            cursor: pointer;
        `;

        // Dodaj licznik znalezionych elementów
        const counter = document.createElement('div');
        counter.style.cssText = `
            font-size: 12px;
            margin-top: 5px;
            color: #666;
        `;

        // Stwórz kontener na wyniki
        const resultsContainer = document.createElement('div');
        resultsContainer.style.cssText = `
            margin-top: 10px;
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #ccc;
            border-radius: 3px;
            background: white;
            padding: 5px;
            display: none;
        `;

        // Dodaj elementy do kontenera
        floatingContainer.appendChild(titleLabel);
        floatingContainer.appendChild(searchInput);
        floatingContainer.appendChild(searchButton);
        floatingContainer.appendChild(counter);
        floatingContainer.appendChild(resultsContainer);

        // Dodaj kontener do strony
        document.body.appendChild(floatingContainer);

        function levenshteinDistance(str1, str2) {
            const track = Array(str2.length + 1).fill(null).map(() =>
                Array(str1.length + 1).fill(null));

            for (let i = 0; i <= str1.length; i++) track[0][i] = i;
            for (let j = 0; j <= str2.length; j++) track[j][0] = j;

            for (let j = 1; j <= str2.length; j++) {
                for (let i = 1; i <= str1.length; i++) {
                    const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                    track[j][i] = Math.min(
                        track[j][i - 1] + 1,
                        track[j - 1][i] + 1,
                        track[j - 1][i - 1] + indicator
                    );
                }
            }
            return track[str2.length][str1.length];
        }

        function findSimilarWords(input, text) {
            // Zamień podkreślniki na spacje
            input = input.toLowerCase().replace(/_/g, ' ');
            text = text.toLowerCase().replace(/_/g, ' ');

            // Jeśli tekst zawiera dokładne dopasowanie, zwróć true
            if (text.includes(input)) return true;

            // Podziel tekst na słowa
            const inputWords = input.split(' ');
            const textWords = text.split(' ');

            // Sprawdź każde słowo wejściowe
            for (let inputWord of inputWords) {
                if (inputWord.length < 3) continue; // Pomijaj bardzo krótkie słowa

                let foundMatch = false;
                for (let textWord of textWords) {
                    // Jeśli słowa są podobnej długości (różnica max 2 znaki)
                    if (Math.abs(textWord.length - inputWord.length) <= 2) {
                        const distance = levenshteinDistance(inputWord, textWord);
                        // Dopuszczaj tylko 1-2 błędy literowe
                        if (distance <= 2) {
                            foundMatch = true;
                            break;
                        }
                    }
                }

                if (!foundMatch) return false;
            }

            return true;
        }

        // Funkcja wykonująca wyszukiwanie
        function performSearch() {
            const selectElement = selectContainer.querySelector('select');
            if (selectElement) {
                const searchText = searchInput.value;
                let foundCount = 0;
                let resultsHTML = '';

                Array.from(selectElement.options).forEach((option, index) => {
                    if (findSimilarWords(searchText, option.text)) {
                        option.selected = true;
                        option.style.backgroundColor = '#fdda5e';
                        foundCount++;
                        if (foundCount === 1) {
                            option.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }

                        resultsHTML += `
                            <div class="search-result"
                                 style="padding: 5px; cursor: pointer; border-bottom: 1px solid #eee;"
                                 data-index="${index}">
                                ${option.text}
                            </div>
                        `;
                    } else {
                        option.selected = false;
                        option.style.backgroundColor = '';
                    }
                });

                counter.textContent = `Znaleziono: ${foundCount} elementów`;

                if (foundCount > 0) {
                    resultsContainer.innerHTML = resultsHTML;
                    resultsContainer.style.display = 'block';

                    const searchResults = resultsContainer.getElementsByClassName('search-result');
                    Array.from(searchResults).forEach(result => {
                        result.addEventListener('mouseover', () => {
                            result.style.backgroundColor = '#f0f0f0';
                        });

                        result.addEventListener('mouseout', () => {
                            result.style.backgroundColor = 'white';
                        });

                        result.addEventListener('click', () => {
                            const index = result.getAttribute('data-index');
                            const option = selectElement.options[index];
                            option.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            option.selected = true;

                            const originalBackground = option.style.backgroundColor;
                            option.style.backgroundColor = '#fdda5e';
                            setTimeout(() => {
                                option.style.backgroundColor = originalBackground;
                            }, 1000);
                        });
                    });
                } else {
                    resultsContainer.innerHTML = '<div style="padding: 5px;">Brak wyników</div>';
                    resultsContainer.style.display = 'block';
                }
            }
        }

        // Nasłuchiwanie zdarzeń
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Rozpocznij inicjalizację
    waitForSelect();
})();
