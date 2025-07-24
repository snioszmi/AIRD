// ==UserScript==
// @name         Wyszukiwarka z przesuwalnym przyciskiem dla Content Risk Engine
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Wyszukuje podobne słowa w polu wyboru na stronie Content Risk Engine
// @match        https://content-risk-engine-iad.iad.proxy.amazon.com/experiments/update/*
// @author       @snioszmi
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
            z-index: 9999;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            cursor: move;
            left: -350px;
            margin-top: 32px;
        `;

        // Stwórz pole input
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Wpisz tekst do wyszukania...';
        searchInput.style.cssText = `
            padding: 5px;
            width: 200px;
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

        // Dodaj elementy do kontenera
        floatingContainer.appendChild(searchInput);
        floatingContainer.appendChild(searchButton);
        floatingContainer.appendChild(counter);

        // Dodaj kontener do strony
        const targetElement = selectContainer.querySelector('select').parentElement;
        targetElement.style.position = 'relative';
        targetElement.appendChild(floatingContainer);

        // Funkcja wyszukiwania
        function findSimilarWords(input, text) {
            input = input.toLowerCase();
            text = text.toLowerCase();
            return text.includes(input);
        }

        // Funkcja wykonująca wyszukiwanie
        function performSearch() {
            const selectElement = selectContainer.querySelector('select');
            if (selectElement) {
                const searchText = searchInput.value;
                let foundCount = 0;

                Array.from(selectElement.options).forEach(option => {
                    if (findSimilarWords(searchText, option.text)) {
                        option.selected = true;
                        option.style.backgroundColor = '#fdda5e';
                        foundCount++;
                        if (foundCount === 1) {
                            option.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    } else {
                        option.selected = false;
                        option.style.backgroundColor = '';
                    }
                });

                counter.textContent = `Znaleziono: ${foundCount} elementów`;
            }
        }

        // Obsługa przeciągania
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        floatingContainer.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            if (e.target === searchInput || e.target === searchButton) return;
            initialX = e.clientX - floatingContainer.offsetLeft;
            initialY = e.clientY - floatingContainer.offsetTop;
            isDragging = true;
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                floatingContainer.style.left = currentX + 'px';
                floatingContainer.style.top = currentY + 'px';
            }
        }

        function dragEnd() {
            isDragging = false;
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
