// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update active section
            sections.forEach(section => {
                if (section.id === targetSection) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });
});

// Copy to clipboard functionality
document.addEventListener('click', function(e) {
    // Handle copy buttons
    if (e.target.classList.contains('copy-btn')) {
        const content = e.target.getAttribute('data-content');
        copyToClipboard(content);
    }
    
    // Handle insert buttons
    if (e.target.classList.contains('insert-btn')) {
        const content = e.target.getAttribute('data-content');
        const title = e.target.getAttribute('data-title') || 'New Note';
        insertToObsidian(content, title);
    }
    
    // Handle icon items
    if (e.target.classList.contains('icon-item')) {
        const icon = e.target.getAttribute('data-copy');
        copyToClipboard(icon);
    }
});

// Copy to clipboard function
function copyToClipboard(text) {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    
    // Select and copy the text
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        showToast('Copied to clipboard!');
    } catch (err) {
        // Fallback for modern browsers
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Copied to clipboard!');
            }).catch(() => {
                showToast('Failed to copy. Please try again.');
            });
        } else {
            showToast('Failed to copy. Please try again.');
        }
    }
    
    // Remove the temporary textarea
    document.body.removeChild(textarea);
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Insert to Obsidian function
function insertToObsidian(content, title) {
    // Check if user has set vault name
    let vaultName = localStorage.getItem('obsidianVault');
    
    if (!vaultName) {
        // Show modal to get vault name
        showVaultModal((vault) => {
            vaultName = vault;
            localStorage.setItem('obsidianVault', vault);
            createObsidianNote(content, title, vault);
        });
    } else {
        createObsidianNote(content, title, vaultName);
    }
}

// Create note in Obsidian
function createObsidianNote(content, title, vaultName) {
    // Check if auto-copy is enabled
    if (localStorage.getItem('autoCopy') === 'true') {
        copyToClipboard(content);
    }
    
    // Encode the content and title for URL
    const encodedTitle = encodeURIComponent(title);
    const encodedContent = encodeURIComponent(content);
    
    // Create Obsidian URI
    const obsidianUri = `obsidian://new?vault=${encodeURIComponent(vaultName)}&name=${encodedTitle}&content=${encodedContent}`;
    
    // Try to open Obsidian
    window.location.href = obsidianUri;
    
    // Show success message
    showToast(`Creating "${title}" in Obsidian...`);
}

// Show vault modal
function showVaultModal(callback) {
    // Create modal HTML
    const modalHtml = `
        <div id="vault-modal" class="modal">
            <div class="modal-content">
                <h3>Setup Obsidian Vault</h3>
                <p>Enter your Obsidian vault name to enable direct insertion:</p>
                <input type="text" id="vault-input" placeholder="My Vault" />
                <div class="modal-buttons">
                    <button id="vault-save" class="save-btn">Save</button>
                    <button id="vault-cancel" class="cancel-btn">Cancel</button>
                </div>
                <p class="modal-note">You can change this later in settings</p>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = document.getElementById('vault-modal');
    const input = document.getElementById('vault-input');
    const saveBtn = document.getElementById('vault-save');
    const cancelBtn = document.getElementById('vault-cancel');
    
    // Focus input
    input.focus();
    
    // Save button click
    saveBtn.addEventListener('click', () => {
        const vaultName = input.value.trim();
        if (vaultName) {
            modal.remove();
            callback(vaultName);
        } else {
            input.style.borderColor = '#ff6b6b';
            input.placeholder = 'Please enter vault name';
        }
    });
    
    // Cancel button click
    cancelBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Enter key in input
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + number to switch sections
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        const sectionIndex = parseInt(e.key) - 1;
        const navButtons = document.querySelectorAll('.nav-btn');
        if (navButtons[sectionIndex]) {
            navButtons[sectionIndex].click();
            e.preventDefault();
        }
    }
    
    // Ctrl/Cmd + 0 for JSON formatter (10th section)
    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        const navButtons = document.querySelectorAll('.nav-btn');
        if (navButtons[9]) {
            navButtons[9].click();
            e.preventDefault();
        }
    }
});

// Add hover effects for better UX
document.addEventListener('DOMContentLoaded', function() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.copy-btn, .nav-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple element
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.5)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s ease-out';
            
            // Position ripple at click location
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            
            // Add ripple to button
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Add settings button functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add settings button to header
    const header = document.querySelector('header');
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'settings-btn';
    settingsBtn.innerHTML = '⚙️';
    settingsBtn.title = 'Settings';
    header.appendChild(settingsBtn);
    
    // Settings button click
    settingsBtn.addEventListener('click', showSettingsModal);
});

// Show settings modal
function showSettingsModal() {
    const currentVault = localStorage.getItem('obsidianVault') || '';
    
    const modalHtml = `
        <div id="settings-modal" class="modal">
            <div class="modal-content">
                <h3>⚙️ Settings</h3>
                <div class="settings-section">
                    <label for="settings-vault">Obsidian Vault Name:</label>
                    <input type="text" id="settings-vault" value="${currentVault}" placeholder="My Vault" />
                    <p class="settings-note">Enter your vault name to enable direct insertion</p>
                </div>
                <div class="settings-section">
                    <label>
                        <input type="checkbox" id="settings-auto-copy" ${localStorage.getItem('autoCopy') === 'true' ? 'checked' : ''} />
                        Auto-copy on insert
                    </label>
                    <p class="settings-note">Also copy to clipboard when inserting to Obsidian</p>
                </div>
                <div class="modal-buttons">
                    <button id="settings-save" class="save-btn">Save</button>
                    <button id="settings-close" class="cancel-btn">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = document.getElementById('settings-modal');
    const vaultInput = document.getElementById('settings-vault');
    const autoCopyInput = document.getElementById('settings-auto-copy');
    const saveBtn = document.getElementById('settings-save');
    const closeBtn = document.getElementById('settings-close');
    
    saveBtn.addEventListener('click', () => {
        const vaultName = vaultInput.value.trim();
        if (vaultName) {
            localStorage.setItem('obsidianVault', vaultName);
        } else {
            localStorage.removeItem('obsidianVault');
        }
        
        localStorage.setItem('autoCopy', autoCopyInput.checked);
        
        modal.remove();
        showToast('Settings saved!');
    });
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
}

// JSON Formatter functionality
document.addEventListener('DOMContentLoaded', function() {
    const jsonInput = document.getElementById('json-input');
    const jsonOutput = document.getElementById('json-output');
    const formatBtn = document.getElementById('format-json');
    const clearBtn = document.getElementById('clear-json');
    const styleSelect = document.getElementById('json-style');
    const jsonButtons = document.getElementById('json-buttons');
    const copyJsonBtn = document.getElementById('copy-json');
    const insertJsonBtn = document.getElementById('insert-json');
    
    let currentFormattedJson = '';
    
    // Format JSON button click
    formatBtn.addEventListener('click', formatJson);
    
    // Clear button click
    clearBtn.addEventListener('click', () => {
        jsonInput.value = '';
        jsonOutput.innerHTML = '';
        jsonButtons.style.display = 'none';
        currentFormattedJson = '';
    });
    
    // Example buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('example-btn')) {
            const exampleJson = e.target.getAttribute('data-example');
            jsonInput.value = exampleJson;
            formatJson();
        }
    });
    
    // Copy JSON button
    copyJsonBtn.addEventListener('click', () => {
        copyToClipboard(currentFormattedJson);
    });
    
    // Insert JSON button
    insertJsonBtn.addEventListener('click', () => {
        insertToObsidian(currentFormattedJson, 'JSON Data');
    });
    
    // Format JSON function
    function formatJson() {
        const inputValue = jsonInput.value.trim();
        if (!inputValue) {
            showToast('Please paste some JSON first');
            return;
        }
        
        try {
            const jsonObj = JSON.parse(inputValue);
            const style = styleSelect.value;
            let displayContent = '';
            
            switch (style) {
                case 'pretty':
                    const prettyJson = JSON.stringify(jsonObj, null, 2);
                    currentFormattedJson = '```json\n' + prettyJson + '\n```';
                    displayContent = prettyJson;
                    jsonOutput.innerHTML = `<pre>${highlightJson(displayContent)}</pre>`;
                    break;
                    
                case 'compact':
                    const compactJson = JSON.stringify(jsonObj);
                    currentFormattedJson = '```json\n' + compactJson + '\n```';
                    displayContent = compactJson;
                    jsonOutput.innerHTML = `<pre>${highlightJson(displayContent)}</pre>`;
                    break;
                    
                case 'markdown':
                    currentFormattedJson = '```json\n' + JSON.stringify(jsonObj, null, 2) + '\n```';
                    jsonOutput.innerHTML = `<pre>${escapeHtml(currentFormattedJson)}</pre>`;
                    break;
                    
                case 'table':
                    currentFormattedJson = jsonToMarkdownTable(jsonObj);
                    jsonOutput.innerHTML = `<pre>${escapeHtml(currentFormattedJson)}</pre>`;
                    break;
                    
                case 'nested-tables':
                    currentFormattedJson = jsonToNestedTables(jsonObj);
                    jsonOutput.innerHTML = `<pre>${escapeHtml(currentFormattedJson)}</pre>`;
                    break;
            }
            
            jsonButtons.style.display = 'flex';
            showToast('JSON formatted successfully!');
        } catch (error) {
            jsonOutput.innerHTML = `<div style="color: #f85149;">Error: ${error.message}</div>`;
            jsonButtons.style.display = 'none';
            showToast('Invalid JSON format');
        }
    }
    
    // Highlight JSON syntax
    function highlightJson(json) {
        return json
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                let cls = 'json-number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'json-key';
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
    }
    
    // Convert JSON to Markdown table
    function jsonToMarkdownTable(obj) {
        if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object') {
            // Array of objects to table
            const headers = Object.keys(obj[0]);
            let table = '| ' + headers.join(' | ') + ' |\n';
            table += '|' + headers.map(() => '---').join('|') + '|\n';
            
            obj.forEach(row => {
                table += '| ' + headers.map(h => String(row[h] || '')).join(' | ') + ' |\n';
            });
            
            return table;
        } else if (typeof obj === 'object' && !Array.isArray(obj)) {
            // Single object to table
            let table = '| Key | Value |\n|-----|-------|\n';
            for (const [key, value] of Object.entries(obj)) {
                const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
                table += `| ${key} | ${valueStr} |\n`;
            }
            return table;
        } else {
            // Fallback to pretty print
            return '```json\n' + JSON.stringify(obj, null, 2) + '\n```';
        }
    }
    
    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Convert nested JSON to multiple tables
    function jsonToNestedTables(obj, parentKey = 'Root', level = 0) {
        const tables = [];
        const processedObjects = new Set();
        
        function processValue(value, key, path) {
            if (value === null || value === undefined) {
                return 'null';
            }
            
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    return '[]';
                }
                
                // Check if it's an array of objects
                if (value.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))) {
                    // Create a table for the array
                    const tableName = `${path} (Array)`;
                    tables.push({ name: tableName, content: arrayToTable(value, tableName) });
                    return `📊 See table: "${tableName}"`;
                } else if (value.every(item => typeof item !== 'object' || item === null)) {
                    // Simple array
                    return value.join(', ');
                } else {
                    // Mixed array
                    return value.map((item, index) => {
                        if (typeof item === 'object' && item !== null) {
                            const itemPath = `${path}[${index}]`;
                            return processValue(item, index, itemPath);
                        }
                        return String(item);
                    }).join(', ');
                }
            }
            
            if (typeof value === 'object' && value !== null) {
                const objId = JSON.stringify(value);
                if (processedObjects.has(objId)) {
                    return '🔄 [Circular Reference]';
                }
                processedObjects.add(objId);
                
                const tableName = `${path}`;
                tables.push({ name: tableName, content: objectToTable(value, tableName) });
                return `📊 See table: "${tableName}"`;
            }
            
            return String(value);
        }
        
        function arrayToTable(arr, tableName) {
            if (arr.length === 0) return '';
            
            // Get all unique keys from all objects
            const allKeys = new Set();
            arr.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    Object.keys(item).forEach(key => allKeys.add(key));
                }
            });
            
            const headers = Array.from(allKeys);
            let table = `### ${tableName}\n\n`;
            table += '| Index | ' + headers.join(' | ') + ' |\n';
            table += '|-------|' + headers.map(() => '-------').join('|') + '|\n';
            
            arr.forEach((item, index) => {
                const row = [`${index}`];
                headers.forEach(header => {
                    const value = item[header];
                    row.push(processValue(value, header, `${tableName}[${index}].${header}`));
                });
                table += '| ' + row.join(' | ') + ' |\n';
            });
            
            return table + '\n';
        }
        
        function objectToTable(obj, tableName) {
            const entries = Object.entries(obj);
            let table = `### ${tableName}\n\n`;
            table += '| Property | Value | Type |\n';
            table += '|----------|-------|------|\n';
            
            entries.forEach(([key, value]) => {
                const type = Array.isArray(value) ? 'array' : typeof value;
                const processedValue = processValue(value, key, `${tableName}.${key}`);
                table += `| ${key} | ${processedValue} | ${type} |\n`;
            });
            
            return table + '\n';
        }
        
        // Start processing
        let result = '# JSON Data Analysis\n\n';
        
        if (Array.isArray(obj)) {
            result += arrayToTable(obj, 'Root Array');
        } else if (typeof obj === 'object' && obj !== null) {
            result += objectToTable(obj, 'Root Object');
        } else {
            result += `**Value**: ${obj}\n**Type**: ${typeof obj}\n`;
        }
        
        // Add all nested tables
        if (tables.length > 0) {
            result += '\n---\n\n## Nested Data Tables\n\n';
            tables.forEach(table => {
                result += table.content;
            });
        }
        
        // Add summary
        result += '\n---\n\n## Summary\n\n';
        result += `- **Total Tables**: ${tables.length + 1}\n`;
        result += `- **Root Type**: ${Array.isArray(obj) ? 'Array' : typeof obj}\n`;
        if (Array.isArray(obj)) {
            result += `- **Array Length**: ${obj.length}\n`;
        } else if (typeof obj === 'object' && obj !== null) {
            result += `- **Properties**: ${Object.keys(obj).length}\n`;
        }
        
        return result;
    }
});

// DBDiagram Parser functionality
document.addEventListener('DOMContentLoaded', function() {
    const dbdiagramInput = document.getElementById('dbdiagram-input');
    const dbdiagramOutput = document.getElementById('dbdiagram-output');
    const parseBtn = document.getElementById('parse-dbdiagram');
    const clearBtn = document.getElementById('clear-dbdiagram');
    const styleSelect = document.getElementById('dbdiagram-style');
    const dbdiagramButtons = document.getElementById('dbdiagram-buttons');
    const copyBtn = document.getElementById('copy-dbdiagram');
    const insertBtn = document.getElementById('insert-dbdiagram');
    
    let currentParsedTable = '';
    
    // Parse button click
    parseBtn.addEventListener('click', parseDBDiagram);
    
    // Clear button click
    clearBtn.addEventListener('click', () => {
        dbdiagramInput.value = '';
        dbdiagramOutput.innerHTML = '';
        dbdiagramButtons.style.display = 'none';
        currentParsedTable = '';
    });
    
    // Example buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('dbdiagram-example')) {
            const example = e.target.getAttribute('data-example');
            dbdiagramInput.value = example;
            parseDBDiagram();
        }
    });
    
    // Copy button
    copyBtn.addEventListener('click', () => {
        copyToClipboard(currentParsedTable);
    });
    
    // Insert button
    insertBtn.addEventListener('click', () => {
        const tableName = extractTableName(dbdiagramInput.value) || 'Table Documentation';
        insertToObsidian(currentParsedTable, tableName);
    });
    
    // Extract table name from DBDiagram
    function extractTableName(input) {
        const match = input.match(/Table\s+(\w+)/i);
        return match ? match[1] : null;
    }
    
    // Parse DBDiagram function
    function parseDBDiagram() {
        const input = dbdiagramInput.value.trim();
        if (!input) {
            showToast('Please paste a DBDiagram table definition');
            return;
        }
        
        try {
            const parsed = parseDBDiagramSyntax(input);
            const style = styleSelect.value;
            
            switch (style) {
                case 'full':
                    currentParsedTable = generateFullDocumentationTable(parsed);
                    break;
                case 'simple':
                    currentParsedTable = generateSimpleTable(parsed);
                    break;
                case 'data-dictionary':
                    currentParsedTable = generateDataDictionary(parsed);
                    break;
                case 'diagram':
                    currentParsedTable = generateSVGDiagram(parsed);
                    // Extract just the SVG for display
                    const svgMatch = currentParsedTable.match(/<svg[^>]*>[\s\S]*?<\/svg>/);
                    if (svgMatch) {
                        dbdiagramOutput.innerHTML = svgMatch[0];
                    } else {
                        dbdiagramOutput.innerHTML = `<pre>${escapeHtml(currentParsedTable)}</pre>`;
                    }
                    dbdiagramButtons.style.display = 'flex';
                    showToast('Diagram generated successfully!');
                    return;
                case 'mermaid':
                    currentParsedTable = generateMermaidDiagram(parsed);
                    break;
                case 'visual-table':
                    currentParsedTable = generateVisualTable(parsed);
                    break;
            }
            
            dbdiagramOutput.innerHTML = `<pre>${escapeHtml(currentParsedTable)}</pre>`;
            dbdiagramButtons.style.display = 'flex';
            showToast('DBDiagram parsed successfully!');
        } catch (error) {
            dbdiagramOutput.innerHTML = `<div style="color: #f85149;">Error: ${error.message}</div>`;
            dbdiagramButtons.style.display = 'none';
            showToast('Failed to parse DBDiagram');
        }
    }
    
    // Parse DBDiagram syntax
    function parseDBDiagramSyntax(input) {
        const lines = input.split('\n');
        const result = {
            tableName: '',
            columns: [],
            currentSection: '',
            tableNote: ''
        };
        
        // Extract table name
        const tableMatch = input.match(/Table\s+(\w+)(?:\s*\[([^\]]+)\])?/i);
        if (tableMatch) {
            result.tableName = tableMatch[1];
        }
        
        // Extract table note
        const noteMatch = input.match(/Note:\s*"([^"]+)"/);
        if (noteMatch) {
            result.tableNote = noteMatch[1];
        }
        
        // Parse columns
        let inTable = false;
        let currentComment = '';
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Start of table
            if (trimmed.includes('{')) {
                inTable = true;
                continue;
            }
            
            // End of table
            if (trimmed.includes('}')) {
                break;
            }
            
            if (!inTable) continue;
            
            // Section comment
            if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) {
                currentComment = trimmed.slice(2, -2).trim();
                result.currentSection = currentComment;
                continue;
            }
            
            // Skip empty lines
            if (!trimmed) continue;
            
            // Skip indexes block
            if (trimmed.startsWith('indexes')) {
                // Skip until closing brace
                continue;
            }
            
            // Parse column
            const columnMatch = trimmed.match(/^(\w+)\s+([^\[]+?)(?:\s*\[([^\]]+)\])?$/);
            if (columnMatch) {
                const [, name, type, constraints] = columnMatch;
                const column = {
                    name: name,
                    type: type.trim(),
                    constraints: constraints ? parseConstraints(constraints) : {},
                    section: result.currentSection
                };
                result.columns.push(column);
            }
        }
        
        return result;
    }
    
    // Parse constraints
    function parseConstraints(constraintStr) {
        const constraints = {};
        const parts = constraintStr.split(',').map(s => s.trim());
        
        parts.forEach(part => {
            if (part === 'pk') constraints.primaryKey = true;
            if (part === 'unique') constraints.unique = true;
            if (part === 'not null') constraints.notNull = true;
            if (part === 'increment') constraints.autoIncrement = true;
            if (part.startsWith('default:')) {
                constraints.default = part.split(':')[1].trim().replace(/[`'"]/g, '');
            }
            if (part.startsWith('ref:')) {
                constraints.reference = part.split(':')[1].trim();
            }
        });
        
        return constraints;
    }
    
    // Generate full documentation table
    function generateFullDocumentationTable(parsed) {
        let output = `# ${parsed.tableName} Documentation\n\n`;
        
        if (parsed.tableNote) {
            output += `> ${parsed.tableNote}\n\n`;
        }
        
        output += '| Column Name | Data Type | Definition | Constraints | Source/Mapping | Transformation | Example Value | Notes |\n';
        output += '|-------------|-----------|------------|-------------|----------------|----------------|---------------|-------|\n';
        
        let currentSection = '';
        
        parsed.columns.forEach(column => {
            // Add section header
            if (column.section && column.section !== currentSection) {
                currentSection = column.section;
                output += `| **${currentSection}** | | | | | | | |\n`;
            }
            
            // Build constraints string
            const constraints = [];
            if (column.constraints.primaryKey) constraints.push('PK');
            if (column.constraints.unique) constraints.push('UNIQUE');
            if (column.constraints.notNull) constraints.push('NOT NULL');
            if (column.constraints.autoIncrement) constraints.push('AUTO_INCREMENT');
            if (column.constraints.default) constraints.push(`DEFAULT: ${column.constraints.default}`);
            if (column.constraints.reference) constraints.push(`FK: ${column.constraints.reference}`);
            
            // Generate example based on type
            const example = generateExample(column.name, column.type);
            
            output += `| ${column.name} | ${column.type} | | ${constraints.join(', ')} | | | ${example} | |\n`;
        });
        
        output += '\n## Column Definitions\n\n';
        output += '_Please fill in the Definition, Source/Mapping, Transformation, and Notes columns for each field._\n\n';
        
        output += '## Data Quality Rules\n\n';
        output += '- [ ] Primary key uniqueness\n';
        output += '- [ ] Foreign key integrity\n';
        output += '- [ ] Not null constraints\n';
        output += '- [ ] Data type validation\n';
        output += '- [ ] Business rule validation\n';
        
        return output;
    }
    
    // Generate simple table
    function generateSimpleTable(parsed) {
        let output = `# ${parsed.tableName}\n\n`;
        
        output += '| Column | Type | Constraints |\n';
        output += '|--------|------|-------------|\n';
        
        parsed.columns.forEach(column => {
            const constraints = [];
            if (column.constraints.primaryKey) constraints.push('PK');
            if (column.constraints.unique) constraints.push('UNIQUE');
            if (column.constraints.notNull) constraints.push('NOT NULL');
            if (column.constraints.default) constraints.push(`DEFAULT: ${column.constraints.default}`);
            
            output += `| ${column.name} | ${column.type} | ${constraints.join(', ')} |\n`;
        });
        
        return output;
    }
    
    // Generate data dictionary format
    function generateDataDictionary(parsed) {
        let output = `# Data Dictionary: ${parsed.tableName}\n\n`;
        
        if (parsed.tableNote) {
            output += `## Description\n${parsed.tableNote}\n\n`;
        }
        
        output += '## Table Structure\n\n';
        
        let currentSection = '';
        
        parsed.columns.forEach(column => {
            if (column.section && column.section !== currentSection) {
                currentSection = column.section;
                output += `\n### ${currentSection}\n\n`;
            }
            
            output += `#### ${column.name}\n`;
            output += `- **Type:** ${column.type}\n`;
            
            if (Object.keys(column.constraints).length > 0) {
                output += '- **Constraints:**\n';
                if (column.constraints.primaryKey) output += '  - Primary Key\n';
                if (column.constraints.unique) output += '  - Unique\n';
                if (column.constraints.notNull) output += '  - Not Null\n';
                if (column.constraints.autoIncrement) output += '  - Auto Increment\n';
                if (column.constraints.default) output += `  - Default: ${column.constraints.default}\n`;
                if (column.constraints.reference) output += `  - Foreign Key: ${column.constraints.reference}\n`;
            }
            
            output += `- **Description:** _[Add description]_\n`;
            output += `- **Example:** ${generateExample(column.name, column.type)}\n`;
            output += '\n';
        });
        
        return output;
    }
    
    // Generate example values based on column name and type
    function generateExample(name, type) {
        const lowerName = name.toLowerCase();
        const lowerType = type.toLowerCase();
        
        // Name-based examples
        if (lowerName.includes('id')) return '12345';
        if (lowerName.includes('name')) return "'John Doe'";
        if (lowerName.includes('email')) return "'john@example.com'";
        if (lowerName.includes('phone')) return "'+1-555-0123'";
        if (lowerName.includes('date')) return "'2024-01-06'";
        if (lowerName.includes('timestamp')) return "'2024-01-06 10:30:00'";
        if (lowerName.includes('amount') || lowerName.includes('price')) return '99.99';
        if (lowerName.includes('quantity') || lowerName.includes('qty')) return '10';
        if (lowerName.includes('flag') || lowerName.includes('is_')) return 'true';
        if (lowerName.includes('status')) return "'active'";
        if (lowerName.includes('type')) return "'standard'";
        if (lowerName.includes('key')) return "'ABC123'";
        
        // Type-based examples
        if (lowerType.includes('int') || lowerType.includes('number')) return '100';
        if (lowerType.includes('decimal') || lowerType.includes('numeric')) return '99.99';
        if (lowerType.includes('varchar') || lowerType.includes('string')) return "'example'";
        if (lowerType.includes('text')) return "'Lorem ipsum...'";
        if (lowerType.includes('bool')) return 'true';
        if (lowerType.includes('date')) return "'2024-01-06'";
        if (lowerType.includes('time')) return "'10:30:00'";
        if (lowerType.includes('json')) return "'{\"key\": \"value\"}'";
        
        return "'value'";
    }
    
    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Generate SVG Diagram
    function generateSVGDiagram(parsed) {
        const columnHeight = 25;
        const headerHeight = 40;
        const sectionHeight = 30;
        const padding = 10;
        const width = 400;
        
        // Calculate sections and total height
        const sections = [];
        let currentSection = { name: '', columns: [] };
        let totalColumns = 0;
        
        parsed.columns.forEach(column => {
            if (column.section && column.section !== currentSection.name) {
                if (currentSection.columns.length > 0) {
                    sections.push(currentSection);
                }
                currentSection = { name: column.section, columns: [] };
            }
            currentSection.columns.push(column);
            totalColumns++;
        });
        if (currentSection.columns.length > 0) {
            sections.push(currentSection);
        }
        
        const height = headerHeight + (sections.length * sectionHeight) + (totalColumns * columnHeight) + (padding * 2);
        
        // Generate SVG with white background for better visibility
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Add background rect and styles
        svg += `<rect width="${width}" height="${height}" fill="white"/>`;
        svg += `<defs>
            <style>
                .table-header { fill: #1e3a8a; font-size: 16px; font-weight: bold; font-family: Arial, sans-serif; }
                .section-header { fill: #1f2937; font-size: 14px; font-weight: bold; font-family: Arial, sans-serif; }
                .column-name { fill: #111827; font-size: 12px; font-family: monospace; }
                .column-type { fill: #6b7280; font-size: 11px; font-family: monospace; }
                .constraint { fill: #2563eb; font-size: 10px; font-family: monospace; }
                .header-rect { fill: #dbeafe; stroke: #60a5fa; stroke-width: 2; }
                .section-rect { fill: #f3f4f6; stroke: #d1d5db; }
                .column-rect { fill: #ffffff; stroke: #e5e7eb; }
                .pk-indicator { fill: #fbbf24; stroke: #f59e0b; stroke-width: 1; }
                .fk-indicator { fill: #60a5fa; stroke: #3b82f6; stroke-width: 1; }
            </style>
        </defs>`;
        
        // Table header
        svg += `<rect class="header-rect" x="0" y="0" width="${width}" height="${headerHeight}" />`;
        svg += `<text class="table-header" x="${width/2}" y="25" text-anchor="middle">${parsed.tableName}</text>`;
        
        let y = headerHeight;
        
        // Draw sections and columns
        sections.forEach(section => {
            // Section header
            if (section.name) {
                svg += `<rect class="section-rect" x="0" y="${y}" width="${width}" height="${sectionHeight}" />`;
                svg += `<text class="section-header" x="10" y="${y + 20}">${section.name}</text>`;
                y += sectionHeight;
            }
            
            // Columns
            section.columns.forEach(column => {
                svg += `<rect class="column-rect" x="0" y="${y}" width="${width}" height="${columnHeight}" />`;
                
                // Key indicators
                let x = 10;
                if (column.constraints.primaryKey) {
                    svg += `<circle class="pk-indicator" cx="${x + 5}" cy="${y + 12}" r="4" />`;
                    svg += `<text class="constraint" x="${x}" y="${y + 16}" font-size="8">PK</text>`;
                    x += 25;
                }
                if (column.constraints.reference) {
                    svg += `<circle class="fk-indicator" cx="${x + 5}" cy="${y + 12}" r="4" />`;
                    svg += `<text class="constraint" x="${x}" y="${y + 16}" font-size="8">FK</text>`;
                    x += 25;
                }
                
                // Column name and type
                svg += `<text class="column-name" x="${x + 10}" y="${y + 16}">${column.name}</text>`;
                svg += `<text class="column-type" x="${width - 150}" y="${y + 16}">${column.type}</text>`;
                
                // Constraints
                const constraints = [];
                if (column.constraints.unique) constraints.push('UNIQUE');
                if (column.constraints.notNull) constraints.push('NOT NULL');
                if (constraints.length > 0) {
                    svg += `<text class="constraint" x="${width - 10}" y="${y + 16}" text-anchor="end">${constraints.join(', ')}</text>`;
                }
                
                y += columnHeight;
            });
        });
        
        svg += '</svg>';
        
        // For Obsidian, we'll provide instructions and the raw SVG
        let output = `# ${parsed.tableName} Diagram\n\n`;
        output += `## How to use this diagram in Obsidian:\n\n`;
        output += `1. **Option 1 - Save as SVG file:**\n`;
        output += `   - Copy the SVG code below\n`;
        output += `   - Save it as \`${parsed.tableName}.svg\` in your vault\n`;
        output += `   - Reference it with \`![[${parsed.tableName}.svg]]\`\n\n`;
        output += `2. **Option 2 - Use Mermaid instead:**\n`;
        output += `   - Select "Mermaid Diagram" from the dropdown for a native Obsidian diagram\n\n`;
        output += `3. **Option 3 - Use an online converter:**\n`;
        output += `   - Copy the SVG code to [svg2png.com](https://svg2png.com) to convert to PNG\n`;
        output += `   - Save the PNG to your vault\n\n`;
        output += `## SVG Code\n\n`;
        output += `\`\`\`svg\n${svg}\n\`\`\`\n\n`;
        output += `## Preview\n\n`;
        output += `> The diagram shows the table structure with:\n`;
        output += `> - 🟡 Primary Keys (PK)\n`;
        output += `> - 🔵 Foreign Keys (FK)\n`;
        output += `> - Sections from comments\n`;
        output += `> - Column names, types, and constraints\n`;
        
        return output;
    }
    
    // Generate Mermaid Diagram
    function generateMermaidDiagram(parsed) {
        let output = `# ${parsed.tableName} Entity Diagram\n\n`;
        
        // First, create a visual table-like diagram using Mermaid
        output += '## Visual Table Structure\n\n';
        output += '```mermaid\ngraph TD\n';
        output += `    subgraph "${parsed.tableName}"\n`;
        
        let nodeId = 0;
        let currentSection = '';
        
        parsed.columns.forEach((column, index) => {
            // Add section headers
            if (column.section && column.section !== currentSection) {
                currentSection = column.section;
                output += `        SEC${nodeId}["<b>${currentSection}</b>"]\n`;
                output += `        style SEC${nodeId} fill:#f3f4f6,stroke:#333,stroke-width:2px,color:#000\n`;
                nodeId++;
            }
            
            // Create node for each column
            const nodeLabel = [];
            if (column.constraints.primaryKey) nodeLabel.push('🔑');
            if (column.constraints.reference) nodeLabel.push('🔗');
            nodeLabel.push(`<b>${column.name}</b>`);
            nodeLabel.push(`<i>${column.type}</i>`);
            
            const constraints = [];
            if (column.constraints.unique) constraints.push('UNIQUE');
            if (column.constraints.notNull) constraints.push('NOT NULL');
            if (constraints.length > 0) {
                nodeLabel.push(`<small>${constraints.join(', ')}</small>`);
            }
            
            output += `        COL${index}["${nodeLabel.join('<br/>')}"]\n`;
            
            // Style based on constraints
            if (column.constraints.primaryKey) {
                output += `        style COL${index} fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#000\n`;
            } else if (column.constraints.reference) {
                output += `        style COL${index} fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#000\n`;
            } else {
                output += `        style COL${index} fill:#fff,stroke:#e5e7eb,stroke-width:1px,color:#000\n`;
            }
        });
        
        output += '    end\n';
        output += '```\n\n';
        
        // Then add the standard ERD
        output += '## Entity Relationship Diagram\n\n';
        output += '```mermaid\nerDiagram\n';
        output += `    ${parsed.tableName} {\n`;
        
        parsed.columns.forEach(column => {
            let type = column.type.replace(/[()]/g, '');
            let constraints = '';
            
            if (column.constraints.primaryKey) constraints += ' PK';
            if (column.constraints.reference) constraints += ' FK';
            if (column.constraints.unique) constraints += ' UK';
            
            output += `        ${type} ${column.name}${constraints ? ' "' + constraints.trim() + '"' : ''}\n`;
        });
        
        output += '    }\n';
        
        // Add relationships if there are foreign keys
        const relationships = [];
        parsed.columns.forEach(column => {
            if (column.constraints.reference) {
                const ref = column.constraints.reference;
                const match = ref.match(/>\s*(\w+)\.(\w+)/);
                if (match) {
                    const [, refTable, refColumn] = match;
                    relationships.push(`    ${parsed.tableName} ||--o{ ${refTable} : "${column.name} -> ${refColumn}"`);
                }
            }
        });
        
        if (relationships.length > 0) {
            output += '\n' + relationships.join('\n') + '\n';
        }
        
        output += '```\n\n';
        
        // Add a more detailed class diagram version
        output += '## Detailed Class Diagram\n\n';
        output += '```mermaid\nclassDiagram\n';
        output += `    class ${parsed.tableName} {\n`;
        
        let classDiagramSection = '';
        parsed.columns.forEach(column => {
            if (column.section && column.section !== classDiagramSection) {
                classDiagramSection = column.section;
                output += `        %% ${classDiagramSection}\n`;
            }
            
            let prefix = '';
            if (column.constraints.primaryKey) prefix = '+';
            else if (column.constraints.reference) prefix = '#';
            else if (column.constraints.notNull) prefix = '*';
            else prefix = '-';
            
            output += `        ${prefix}${column.type} ${column.name}\n`;
        });
        
        output += '    }\n';
        
        // Add notes for constraints
        output += '\n    note for ' + parsed.tableName + ' "Constraints:\\n';
        parsed.columns.forEach(column => {
            const constraints = [];
            if (column.constraints.primaryKey) constraints.push('PK');
            if (column.constraints.unique) constraints.push('UNIQUE');
            if (column.constraints.notNull) constraints.push('NOT NULL');
            if (column.constraints.default) constraints.push(`DEFAULT: ${column.constraints.default}`);
            if (column.constraints.reference) constraints.push(`FK: ${column.constraints.reference}`);
            
            if (constraints.length > 0) {
                output += `${column.name}: ${constraints.join(', ')}\\n`;
            }
        });
        output += '"\n';
        
        output += '```\n\n';
        
        // Add legend
        output += '### Legend\n';
        output += '- `+` Primary Key\n';
        output += '- `#` Foreign Key\n';
        output += '- `*` Not Null\n';
        output += '- `-` Optional\n';
        
        return output;
    }
    
    // Generate Visual Table with emojis and formatting
    function generateVisualTable(parsed) {
        let output = `# ${parsed.tableName} - Visual Schema\n\n`;
        
        // Add a legend
        output += '## Legend\n\n';
        output += '| Symbol | Meaning |\n';
        output += '|--------|----------|\n';
        output += '| 🔑 | Primary Key |\n';
        output += '| 🔗 | Foreign Key |\n';
        output += '| ⭐ | Unique |\n';
        output += '| ❗ | Not Null |\n';
        output += '| 🔄 | Auto Increment |\n';
        output += '| 📝 | Has Default Value |\n\n';
        
        // Main table
        output += `## Table: ${parsed.tableName}\n\n`;
        output += '| Column | Type | Constraints | Description |\n';
        output += '|--------|------|-------------|-------------|\n';
        
        let currentSection = '';
        
        parsed.columns.forEach(column => {
            // Add section headers
            if (column.section && column.section !== currentSection) {
                currentSection = column.section;
                output += `| **${currentSection}** | | | |\n`;
            }
            
            // Build visual indicators
            const indicators = [];
            if (column.constraints.primaryKey) indicators.push('🔑');
            if (column.constraints.reference) indicators.push('🔗');
            if (column.constraints.unique) indicators.push('⭐');
            if (column.constraints.notNull) indicators.push('❗');
            if (column.constraints.autoIncrement) indicators.push('🔄');
            if (column.constraints.default) indicators.push('📝');
            
            // Build constraints details
            const constraintDetails = [];
            if (column.constraints.primaryKey) constraintDetails.push('PRIMARY KEY');
            if (column.constraints.reference) constraintDetails.push(`FK → ${column.constraints.reference}`);
            if (column.constraints.unique) constraintDetails.push('UNIQUE');
            if (column.constraints.notNull) constraintDetails.push('NOT NULL');
            if (column.constraints.autoIncrement) constraintDetails.push('AUTO_INCREMENT');
            if (column.constraints.default) constraintDetails.push(`DEFAULT: ${column.constraints.default}`);
            
            // Format column name with indicators
            const columnDisplay = indicators.length > 0 
                ? `${indicators.join(' ')} **${column.name}**` 
                : column.name;
            
            // Add to table
            output += `| ${columnDisplay} | \`${column.type}\` | ${constraintDetails.join('<br>')} | |\n`;
        });
        
        // Add relationships section if there are foreign keys
        const foreignKeys = parsed.columns.filter(col => col.constraints.reference);
        if (foreignKeys.length > 0) {
            output += '\n## Relationships\n\n';
            output += '```mermaid\ngraph LR\n';
            
            foreignKeys.forEach((col, index) => {
                const ref = col.constraints.reference;
                const match = ref.match(/>\s*(\w+)\.(\w+)/);
                if (match) {
                    const [, refTable, refColumn] = match;
                    output += `    ${parsed.tableName}[${parsed.tableName}] -->|${col.name}| ${refTable}[${refTable}]\n`;
                }
            });
            
            output += '```\n';
        }
        
        // Add quick stats
        output += '\n## Quick Stats\n\n';
        output += `- **Total Columns:** ${parsed.columns.length}\n`;
        output += `- **Primary Keys:** ${parsed.columns.filter(c => c.constraints.primaryKey).length}\n`;
        output += `- **Foreign Keys:** ${foreignKeys.length}\n`;
        output += `- **Required Fields:** ${parsed.columns.filter(c => c.constraints.notNull).length}\n`;
        output += `- **Unique Fields:** ${parsed.columns.filter(c => c.constraints.unique).length}\n`;
        
        return output;
    }
});