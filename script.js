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

    let currentRows = 0;
    let currentCols = 0;

    generateBtn.addEventListener('click', generateGrid);
    resetBtn.addEventListener('click', resetApp);
    submitBtn.addEventListener('click', generateNumpyCode);
    copyBtn.addEventListener('click', copyToClipboard);

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
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = '0';
                input.className = 'grid-cell';
                input.dataset.row = i;
                input.dataset.col = j;
                
                // Select text on focus for easier editing (tabbing through and directly typing)
                input.addEventListener('focus', function() {
                    this.select();
                });

                gridContainer.appendChild(input);
            }
        }

        submitBtn.style.display = 'block';
        outputSection.style.display = 'none';
        
        // Focus the first cell
        const firstCell = gridContainer.querySelector('.grid-cell');
        if (firstCell) {
            firstCell.focus();
        }
    }

    function generateNumpyCode() {
        if (currentRows === 0 || currentCols === 0) return;

        const cells = document.querySelectorAll('.grid-cell');
        let arrayData = [];

        for (let i = 0; i < currentRows; i++) {
            let rowData = [];
            for (let j = 0; j < currentCols; j++) {
                const index = i * currentCols + j;
                let cellValue = cells[index].value.trim();
                
                if (cellValue === '') {
                    cellValue = '0';
                } else {
                    const npRegex = /\b(np\.)?(pi|e|inf|nan|sqrt|sin|cos|tan|exp|log|arcsin|arccos|arctan)\b/g;
                    cellValue = cellValue.replace(npRegex, 'np.$2');
                }
                
                rowData.push(cellValue);
            }
            arrayData.push(`[${rowData.join(', ')}]`);
        }

        const numpyCode = `np.array([\n    ${arrayData.join(',\n    ')}\n])`;

        outputCode.textContent = numpyCode;
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
