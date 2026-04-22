document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const submitBtn = document.getElementById('submit-btn');
    const copyBtn = document.getElementById('copy-btn');
    const gridContainer = document.getElementById('grid-container');
    const outputSection = document.getElementById('output-section');
    const outputCode = document.getElementById('output-code');
    const rowsInput = document.getElementById('rows');
    const colsInput = document.getElementById('cols');
    const modeDropdown = document.getElementById('mode-dropdown');
    const dropdownTrigger = document.getElementById('dropdown-trigger');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const currentModeText = document.getElementById('current-mode-text');
    const shortcutsSection = document.getElementById('shortcuts-section');
    const latexOptions = document.getElementById('latex-options');
    const augmentedCheckbox = document.getElementById('augmented-matrix');

    let currentRows = 0;
    let currentCols = 0;
    let currentMode = 'numpy';

    generateBtn.addEventListener('click', generateGrid);
    resetBtn.addEventListener('click', resetApp);
    submitBtn.addEventListener('click', generateCode);
    copyBtn.addEventListener('click', copyToClipboard);

    // Custom Dropdown Logic
    dropdownTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        modeDropdown.classList.toggle('open');
    });

    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const value = item.getAttribute('data-value');
            currentMode = value;
            currentModeText.textContent = item.textContent;

            dropdownItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            modeDropdown.classList.remove('open');
            handleModeChange();
        });
    });

    document.addEventListener('click', () => {
        modeDropdown.classList.remove('open');
    });

    augmentedCheckbox.addEventListener('change', () => {
        if (currentMode === 'latex') {
            updateAugmentedStyle();
            if (outputSection.style.display !== 'none') {
                generateCode();
            }
        }
    });

    function updateAugmentedStyle() {
        const gridWrapper = document.getElementById('grid-wrapper');
        let existingLine = gridWrapper.querySelector('.augmented-line');
        if (augmentedCheckbox.checked && currentMode === 'latex' && currentCols > 1) {
            if (!existingLine) {
                existingLine = document.createElement('div');
                existingLine.className = 'augmented-line';
                gridWrapper.appendChild(existingLine);
            }

            const prevCell = gridContainer.querySelector(`.grid-cell[data-col="${currentCols - 2}"]`);
            const nextCell = gridContainer.querySelector(`.grid-cell[data-col="${currentCols - 1}"]`);
            
            if (prevCell && nextCell) {
                // Calculate the center of the gap in viewport coordinates
                const gapCenter = (prevCell.getBoundingClientRect().right + nextCell.getBoundingClientRect().left) / 2;
                
                // Calculate the center of the wrapper in viewport coordinates
                const wrapperRect = gridWrapper.getBoundingClientRect();
                const wrapperCenter = (wrapperRect.left + wrapperRect.right) / 2;
                
                // The offset from the center of the wrapper
                const offsetFromCenter = gapCenter - wrapperCenter;
                
                // Position relative to 50% of the wrapper. 
                // Since the wrapper grows symmetrically (10px left, 10px right), 
                // the 50% mark stays at the same absolute screen position, 
                // keeping the line perfectly static while the box grows.
                existingLine.style.left = `50%`;
                existingLine.style.marginLeft = `${offsetFromCenter}px`;
            }

            gridWrapper.classList.add('augmented');
            setTimeout(() => {
                gridWrapper.classList.add('augmented-spread');
            }, 250);
        } else {
            gridWrapper.classList.remove('augmented-spread');
            setTimeout(() => {
                gridWrapper.classList.remove('augmented');
                const line = gridWrapper.querySelector('.augmented-line');
                if (line) line.remove();
            }, 200);
        }
    }

    function handleModeChange() {
        if (currentMode === 'latex') {
            latexOptions.classList.remove('hidden');
            updateAugmentedStyle();
        } else {
            latexOptions.classList.add('hidden');
            const gridWrapper = document.getElementById('grid-wrapper');
            gridWrapper.classList.remove('augmented', 'augmented-spread');
            const line = gridWrapper.querySelector('.augmented-line');
            if (line) line.remove();
        }

        // Regenerate code if already visible
        if (outputSection.style.display !== 'none') {
            generateCode();
        }
    }

    function resetApp() {
        rowsInput.value = '3';
        colsInput.value = '3';
        gridContainer.innerHTML = '';
        submitBtn.style.display = 'none';
        outputSection.style.display = 'none';
        currentRows = 0;
        currentCols = 0;

        // Regenerate default grid
        generateGrid();
    }

    function generateGrid() {
        const rows = parseInt(rowsInput.value, 10);
        const cols = parseInt(colsInput.value, 10);

        if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
            alert('Please enter valid numbers for rows and columns.');
            return;
        }

        currentRows = rows;
        currentCols = cols;

        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, auto)`;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = '0';
                input.className = 'grid-cell';
                input.dataset.row = i;
                input.dataset.col = j;

                // Mark columns for augmented spreading
                if (j < currentCols - 1) {
                    input.setAttribute('data-col-type', 'left');
                } else {
                    input.setAttribute('data-col-type', 'right');
                }

                input.addEventListener('keydown', (e) => {
                    const r = parseInt(input.dataset.row, 10);
                    const c = parseInt(input.dataset.col, 10);
                    let target;

                    if (e.key === 'ArrowRight') {
                        target = gridContainer.querySelector(`.grid-cell[data-row="${r}"][data-col="${c + 1}"]`);
                    } else if (e.key === 'ArrowLeft') {
                        target = gridContainer.querySelector(`.grid-cell[data-row="${r}"][data-col="${c - 1}"]`);
                    } else if (e.key === 'ArrowDown') {
                        target = gridContainer.querySelector(`.grid-cell[data-row="${r + 1}"][data-col="${c}"]`);
                    } else if (e.key === 'ArrowUp') {
                        target = gridContainer.querySelector(`.grid-cell[data-row="${r - 1}"][data-col="${c}"]`);
                    } else if (e.key === 'Enter') {
                        generateCode();
                    }

                    if (target) {
                        e.preventDefault();
                        target.focus();
                    }
                });

                // Select text on focus for easier editing (tabbing through and directly typing)
                input.addEventListener('focus', function () {
                    this.select();
                });

                gridContainer.appendChild(input);
            }
        }

        submitBtn.style.display = 'block';
        outputSection.style.display = 'none';

        // Update line if needed
        updateAugmentedStyle();

        // Focus the first cell
        const firstCell = gridContainer.querySelector('.grid-cell');
        if (firstCell) {
            firstCell.focus();
        }
    }

    function generateCode() {
        if (currentRows === 0 || currentCols === 0) return;

        const cells = document.querySelectorAll('.grid-cell');
        const mode = currentMode;
        let arrayData = [];

        if (mode === 'numpy') {
            for (let i = 0; i < currentRows; i++) {
                let rowData = [];
                for (let j = 0; j < currentCols; j++) {
                    const index = i * currentCols + j;
                    let cellValue = cells[index].value.trim();

                    if (cellValue === '') {
                        cellValue = '0';
                    } else {
                        // Replace constants
                        const constRegex = /\b(np\.)?(pi|inf|nan)\b/g;
                        cellValue = cellValue.replace(constRegex, 'np.$2');

                        // Replace functions and ensure closed parentheses
                        const funcRegex = /\b(np\.)?(sqrt|sin|cos|tan|exp|log|arcsin|arccos|arctan)\(([^)]*)(?:\)|$)/g;
                        cellValue = cellValue.replace(funcRegex, 'np.$2($3)');
                    }
                    rowData.push(cellValue);
                }
                arrayData.push(`[${rowData.join(', ')}]`);
            }
            const numpyCode = `np.array([\n    ${arrayData.join(',\n    ')}\n])`;
            outputCode.textContent = numpyCode;
        } else {
            // LaTeX mode
            let latexRows = [];
            for (let i = 0; i < currentRows; i++) {
                let rowData = [];
                for (let j = 0; j < currentCols; j++) {
                    const index = i * currentCols + j;
                    let cellValue = cells[index].value.trim();

                    if (cellValue === '') {
                        cellValue = '0';
                    } else {
                        // Basic LaTeX replacements
                        cellValue = cellValue
                            .replace(/\b(np\.)?pi\b/g, '\\pi')
                            .replace(/\b(np\.)?inf\b/g, '\\infty')
                            .replace(/\b(np\.)?nan\b/g, '\\text{NaN}')
                            .replace(/\b(np\.)?sqrt\(([^)]*)(?:\)|$)/g, '\\sqrt{$2}')
                            .replace(/\b(np\.)?sin\(([^)]*)(?:\)|$)/g, '\\sin($2)')
                            .replace(/\b(np\.)?cos\(([^)]*)(?:\)|$)/g, '\\cos($2)')
                            .replace(/\b(np\.)?tan\(([^)]*)(?:\)|$)/g, '\\tan($2)')
                            .replace(/\b(np\.)?exp\(([^)]*)(?:\)|$)/g, 'e^{$2}')
                            .replace(/\b(np\.)?log\(([^)]*)(?:\)|$)/g, '\\ln($2)')
                            .replace(/\*/g, ' \\cdot ');
                    }
                    rowData.push(cellValue);
                }
                latexRows.push(rowData.join(' & '));
            }
            const isAugmented = augmentedCheckbox.checked && currentCols > 1;
            const latexEnv = isAugmented ? 'augmat' : 'pmatrix';
            const envArg = isAugmented ? `{${currentCols - 1}}` : '';

            const latexCode = `$$\n\\begin{${latexEnv}}${envArg}\n    ${latexRows.join(' \\\\\n    ')}\n\\end{${latexEnv}}\n$$`;
            outputCode.textContent = latexCode;
        }

        outputSection.style.display = 'block';

        // Reset copy button state
        copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy
        `;
        copyBtn.classList.remove('copied');

        // Scroll to output
        outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    async function copyToClipboard() {
        const textToCopy = outputCode.textContent;
        try {
            await navigator.clipboard.writeText(textToCopy);
            copyBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Copied!
            `;
            copyBtn.classList.add('copied');

            setTimeout(() => {
                copyBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy
                `;
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard.');
        }
    }

    // Generate initial grid on load
    generateGrid();
});
