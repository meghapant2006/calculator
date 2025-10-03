const display = document.getElementById('display');
const historyPanel = document.getElementById('historyPanel');
const historyBtn = document.getElementById('historyBtn');
let current = '';
let history = [];

function updateDisplay(){
    display.textContent = current || '0';
}

function appendNumber(n){
    if(current === '0') current = '';
    current += n;
}

function appendOperator(op){
    if(!current) return;
    if(/[-+*/]$/.test(current)){
        current = current.slice(0,-1) + op;
    } else {
        current += op;
    }
}

function backspace(){
    current = current.slice(0,-1);
}

function clearAll(){
    current = '';
}

function applyPercent(){
    const match = current.match(/(\d+\.?\d*)$/);
    if(match){
        const num = parseFloat(match[0]) / 100;
        current = current.slice(0, -match[0].length) + num;
    }
}

function calculate(){
    if(!current) return;
    try {
        if(/[-+*/.]$/.test(current)) current = current.slice(0,-1);
        const expr = current;
        const result = Function('return ' + expr)();
        history.push(expr + ' = ' + result);
        renderHistory();
        current = (result !== undefined ? result : '').toString();
    } catch(e){
        current = 'Error';
        setTimeout(()=>{ current=''; updateDisplay(); }, 900);
    }
}

function renderHistory(){
    if(!historyPanel) return;
    const last = history.slice(-12).reverse();
    historyPanel.innerHTML = last.map(line=>`<div>${line}</div>`).join('');
}

if(historyBtn){
    historyBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        historyPanel.classList.toggle('hidden');
        const expanded = !historyPanel.classList.contains('hidden');
        historyBtn.setAttribute('aria-expanded', expanded.toString());
        if(expanded){
            historyPanel.style.maxHeight = historyPanel.scrollHeight + 'px';
        } else {
            historyPanel.style.maxHeight = '0px';
        }
    });
}

document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
        const num = btn.dataset.num;
        const op = btn.dataset.op;
        const action = btn.dataset.action;

        if(num !== undefined){
            if(num === '.'){
                const parts = current.split(/[-+*/]/);
                if(parts[parts.length-1].includes('.')) return;
            }
            appendNumber(num);
        } else if(op){
            appendOperator(op);
        } else if(action){
            if(action === 'clear') clearAll();
            else if(action === 'back') backspace();
            else if(action === 'percent') applyPercent();
        }
        updateDisplay();
    });
});

document.getElementById('equals').addEventListener('click', ()=>{
    calculate();
    updateDisplay();
});

window.addEventListener('keydown', (e)=>{
    if(/^[0-9]$/.test(e.key)) { appendNumber(e.key); }
    else if(['+','-','*','/'].includes(e.key)) { appendOperator(e.key); }
    else if(e.key === 'Enter' || e.key === '=') { calculate(); }
    else if(e.key === 'Escape') { clearAll(); }
    else if(e.key === 'Backspace') { backspace(); }
    else if(e.key === '%') { applyPercent(); }
    else if(e.key === '.') {
        const parts = current.split(/[-+*/]/);
        if(!parts[parts.length-1].includes('.')) appendNumber('.');
    }
    updateDisplay();
});

updateDisplay();
