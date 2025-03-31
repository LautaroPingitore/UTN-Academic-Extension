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

document.addEventListener("keydown",function(event) {
    if(event.key == "Backspace") {
        localStorage.clear();
    }
}) 

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

function manejarCambioEstados(celda, estadoNuevo, estados) {
    if(estadoNuevo != "sinCursar" ) {
        if(puedeCursarla(celda.id)) {
            celda.classList.remove(...estados);
            celda.classList.add(estadoNuevo);
            modificarTablas(celda.id, estados, estadoNuevo);
        }
        // else te muestra un mensaje diciendo que te faltan x materias
    } else {
        celda.classList.remove(...estados);
        celda.classList.add(estadoNuevo);
        modificarTablas(celda.id, estados, estadoNuevo);
    }
}

function puedeCursarla(materia) {
    let bloqueMateria = document.getElementById(materia);
    console.log(bloqueMateria);

    const spansRegu = bloqueMateria.querySelectorAll("p span[id$='.regu']"); // Obtiene todos los spans que terminan con .regu
    const reguNecesarias = Array.from(spansRegu).map(span => span.textContent); // Mapea los spans a un array de strings

    const spansApro = bloqueMateria.querySelectorAll("p span[id$='.apro']");
    const aproNecesarias = Array.from(spansApro).map(span => span.textContent);

    console.log(reguNecesarias, aproNecesarias);

    return true;
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
        menu.classList.add("menu")
        document.body.appendChild(menu);

        estados.forEach((estado, i) => {
            let opcion = document.createElement("div");
            opcion.textContent = estado.charAt(0).toUpperCase() + estado.slice(1);
            opcion.classList.add("opcion");

            opcion.addEventListener("mouseover", () => (opcion.style.backgroundColor = "#ddd"));
            opcion.addEventListener("mouseout", () => (opcion.style.backgroundColor = "#f9f9f9"));

            opcion.addEventListener("click", function () {
                if (menu.targetCell) {
                    manejarCambioEstados(menu.targetCell, estados[i], listaEstados[i]);
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