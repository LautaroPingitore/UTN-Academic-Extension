const materias = [
    "SyPN", "ASI", "DSI", "AdmSI", "PF",
    "AM1", "AM2", "Ing2", "AN", "IA",
    "LyED", "SySL", "ECO", "IyCS", "GG",
    "AyED", "PdP", "DdS", "Sim", "SG",
    "AdC", "Ing1", "BD", "Leg", "SSI",
    "AGA", "F2", "SI", "IO", "PPS",
    "F1", "SSOO", "CD", "TpA",
    "IngSoc", "PyE", "RD", "CdD"
];
//localStorage.clear();
const estados = ["sinCursar", "cursando", "regularizada", "aprobada"];

let sinCursar = JSON.parse(localStorage.getItem("sinCursar")) || setearEstado(materias, estados[0]);
let cursando = JSON.parse(localStorage.getItem("cursando")) || setearEstado([], estados[1]);
let regularizadas = JSON.parse(localStorage.getItem("regularizada")) || setearEstado([], estados[2]);
let aprobadas = JSON.parse(localStorage.getItem("aprobada")) || setearEstado([], estados[3]);

const listaEstados = [sinCursar, cursando, regularizadas, aprobadas]

function setearEstado(lista, nombre) {
    localStorage.setItem(nombre, JSON.stringify(lista));
    return lista;
}

function modificarTablas(materia, estado, nombreEstado) {
    for(let i=0; i < listaEstados.length; i++){
        if(listaEstados[i].includes(materia)){ // Verificar si la materia está en el estado actual
            let listaVieja = listaEstados[i];
            console.log(typeof listaVieja);
            listaEstados[i].splice(listaEstados[i].indexOf(materia), 1);
            localStorage.setItem(estados[i], JSON.stringify(listaEstados[i])); // Actualiza en el Local Storage el estado anterior
            break;
        }
    }

    estado.push(materia); // Agregar materia al estado correspondiente
    localStorage.setItem(nombreEstado, JSON.stringify(estado));
}

document.addEventListener("DOMContentLoaded", function () {
    // Ocultar la tabla temporalmente
    document.querySelector('table').style.visibility = 'hidden';
    
    // Pequeña pausa antes de aplicar los colores (100ms es apenas perceptible)
    setTimeout(() => {
        // Aplicar clases de estado
        document.querySelectorAll("td").forEach((materia) => {
            if (sinCursar.includes(materia.id)) {
                materia.classList.add("sinCursar");
            } else if (cursando.includes(materia.id)) {
                materia.classList.add("cursando");
            } else if (regularizadas.includes(materia.id)) {
                materia.classList.add("regularizada");
            } else if (aprobadas.includes(materia.id)) {
                materia.classList.add("aprobada");
            }
        });
        
        // Mostrar la tabla después de aplicar los colores
        document.querySelector('table').style.visibility = 'visible';
        
        // Resto de tu código del menú contextual...
        const menu = document.createElement("div");
        menu.id = "context-menu";
        menu.style.position = "absolute";
        menu.style.background = "#fff";
        menu.style.border = "1px solid #ccc";
        menu.style.padding = "5px";
        menu.style.display = "none";
        menu.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.2)";
        document.body.appendChild(menu);

        estados.forEach((estado, i) => {
            let opcion = document.createElement("div");
            opcion.textContent = estado.charAt(0).toUpperCase() + estado.slice(1);
            opcion.style.padding = "5px";
            opcion.style.cursor = "pointer";
            opcion.style.borderBottom = "1px solid #ddd";
            opcion.style.backgroundColor = "#f9f9f9";

            opcion.addEventListener("mouseover", () => (opcion.style.backgroundColor = "#ddd"));
            opcion.addEventListener("mouseout", () => (opcion.style.backgroundColor = "#f9f9f9"));

            opcion.addEventListener("click", function () {
                if (menu.targetCell) {
                    menu.targetCell.classList.remove(...estados);
                    menu.targetCell.classList.add(estados[i]);
                    modificarTablas(menu.targetCell.id, listaEstados[i], estados[i]);
                }
                menu.style.display = "none";
            });

            menu.appendChild(opcion);
        });

        document.querySelectorAll("td").forEach(materia => {
            materia.addEventListener("contextmenu", function (event) {
                event.preventDefault();
                menu.style.left = `${event.pageX}px`;
                menu.style.top = `${event.pageY}px`;
                menu.style.display = "block";
                menu.targetCell = materia;
            });
        });

        document.addEventListener("click", function (event) {
            if (!menu.contains(event.target)) {
                menu.style.display = "none";
            }
        });
        
    }, 100);
});