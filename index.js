import { parse } from './Back/analizador/analizador.js';
import { CompilerVisitor } from './Back/compilador.js';

let tabCount = 0;
let openedTabs = {};
let errCount = 0;

const editor = document.getElementById('codigoFuente')
const cons = document.getElementById('consolaOutput')
const tablaErrores = document.getElementById('tablaErrores');
const tablaSimbolos = document.getElementById('tablaSimbolos');

document.getElementById('ejecutarBtn').addEventListener('click', analizador);
document.getElementById('crearArchivoBtn').addEventListener('click', crearArchivo);
document.getElementById('abrirArchivoBtn').addEventListener('click', abrirArchivo);
document.getElementById('guardarArchivoBtn').addEventListener('click', guardarArchivo);
document.getElementById('reporteErroresBtn').addEventListener('click', mostrarErrores);
document.getElementById('reporteSimbolosBtn').addEventListener('click', mostrarSimbolos);

function crearArchivo() {
    tabCount++;
    const tabId = `Archivo${tabCount}`;
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.innerText = tabId;
    tab.dataset.tabId = tabId;

    document.querySelector('.tabs').appendChild(tab);
    openedTabs[tabId] = ''; 
    seleccionarTab(tab);
    tab.addEventListener('click', () => seleccionarTab(tab));
}

function abrirArchivo() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.oak';
    input.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                tabCount++;
                const tabId = file.name;
                const tab = document.createElement('div');
                tab.className = 'tab';
                tab.innerText = tabId;
                tab.dataset.tabId = tabId;

                document.querySelector('.tabs').appendChild(tab);
                openedTabs[tabId] = content; 
                seleccionarTab(tab);
                tab.addEventListener('click', () => seleccionarTab(tab));
            };
            reader.readAsText(file);
        }
    });

    input.click();
}

function guardarArchivo() {
    const currentTab = document.querySelector('.tab.active');
    if (currentTab) {
        const tabId = currentTab.dataset.tabId;
        const fileContent = document.getElementById('codigoFuente').value;
        
        let fileName = tabId;
        if (!fileName.endsWith('.oak')) {
            fileName += '.oak';
        }

        const blob = new Blob([fileContent], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
        openedTabs[tabId] = fileContent;
    } else {
        alert("No hay ninguna pestaña seleccionada para guardar.");
    }
}

function seleccionarTab(tab) {
    const currentTab = document.querySelector('.tab.active');
    if (currentTab) {
        const currentTabId = currentTab.dataset.tabId;
        openedTabs[currentTabId] = document.getElementById('codigoFuente').value;
    }
    
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const tabId = tab.dataset.tabId;
    document.getElementById('codigoFuente').value = openedTabs[tabId] || '';
}

function analizador() {
    const codigoFuente = editor.value;
    consolaOutput.innerHTML = '';
    errCount = 0;
    tablaErrores.innerHTML = '';
    tablaSimbolos.innerHTML = '';
    try {
        const arbol = parse(codigoFuente);
        console.log("AST generado:", JSON.stringify(arbol, null, 2))
        const compilador = new CompilerVisitor()
        console.log({arbol})
        arbol.forEach(tree => tree.accept(compilador))
        cons.innerHTML = compilador.code.toString();
        llenarTablaSimbolos(compilador.symbolTable);
        llenarTablaErrores(compilador.errors);
    } catch (error) {
        console.error(error);
        //errs.addError(error.message, error.location.start.line, error.location.start.column, 'Sintáctico');
    }
}

function llenarTablaErrores(erra) {
    if (erra.length > 0) {
        let rows = erra.map((error, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${error.descripcion}</td>
                <td>${error.linea}</td>
                <td>${error.columna}</td>
                <td>${error.tipo}</td>
            </tr>
        `).join('');
        tablaErrores.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Descripción</th>
                    <th>Linea</th>
                    <th>Columna</th>
                    <th>Tipo</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
    }
}

function llenarTablaSimbolos(symbols) {
    if (symbols.length > 0) {
        let rows = symbols.map((symbol, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${symbol.id}</td>
                <td>${symbol.tipoSimbolo}</td>
                <td>${symbol.tipoDato}</td>
                <td>${symbol.ambito}</td>
                <td>${symbol.linea}</td>
                <td>${symbol.columna}</td>
            </tr>
        `).join('');
        tablaSimbolos.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>ID variable</th>
                        <th>Tipo símbolo</th>
                        <th>Tipo dato</th>
                        <th>Ámbito</th>
                        <th>Línea</th>
                        <th>Columna</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }
}

function mostrarErrores() {
    const contenidoErrores = tablaErrores.innerHTML;
    openReport(contenidoErrores, 'Reporte de Errores');
}

function mostrarSimbolos() {
    const contenidoSimbolos = tablaSimbolos.innerHTML;
    openReport(contenidoSimbolos, 'Reporte Tabla de Símbolos');
}

function openReport(contenido, titulo) {
    const nuevaVentana = window.open('', titulo, 'width=800,height=600');
    nuevaVentana.document.write(`
        <html>
            <head>
                <title>${titulo}</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 20px;
                        background: linear-gradient(135deg, #2C3E50, #4CA1AF);
                        color: #FFFFFF;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        background-color: #F9F9F9;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    th, td {
                        padding: 15px;
                        border: 1px solid #ddd;
                        text-align: left;
                    }
                    th {
                        background-color: #34495E; 
                        color: #ECF0F1; 
                        text-transform: uppercase;
                        font-weight: bold;
                    }
                    td {
                        color: #2C3E50; 
                    }
                    tr:nth-child(even) {
                        background-color: #EAECEE; 
                    }
                    tr:hover {
                        background-color: #D5DBDB;
                        transition: background-color 0.3s ease;
                    }
                    caption {
                        margin-bottom: 15px;
                        font-size: 1.7em;
                        font-weight: bold;
                        color: #ECF0F1; 
                        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
                    }
                </style>
            </head>
            <body>
                <table>
                    <caption>${titulo}</caption>
                    ${contenido}
                </table>
            </body>
        </html>
    `);
    nuevaVentana.document.close();
}
