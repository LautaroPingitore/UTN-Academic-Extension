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

const electivas = [
    "Cripto", "TACS", "AECH",
    "Ciberseg", "UXA", "GTH",
    "IngReq", "MCEqT", "TAP",
    "TGPC", "TyET", "TransfDig",
    "CGV", "MICT"
];

document.addEventListener("keydown",function(event) {
    if(event.key == "Backspace") {
        localStorage.clear();
    }
})

const estados = ["sinCursar", "cursando", "regularizada", "aprobada"];

let sinCursar = JSON.parse(localStorage.getItem("sinCursar")) || setearLista(materias, estados[0]);
let cursando = JSON.parse(localStorage.getItem("cursando")) || setearLista([], estados[1]);
let regularizadas = JSON.parse(localStorage.getItem("regularizada")) || setearLista([], estados[2]);
let aprobadas = JSON.parse(localStorage.getItem("aprobada")) || setearLista([], estados[3]);
let contadorApro = JSON.parse(localStorage.getItem("contadorApro")) || setearContador("contadorApro");
let contadorRegu = JSON.parse(localStorage.getItem("contadorRegu")) || setearContador("contadorRegu");

const listaEstados = [sinCursar, cursando, regularizadas, aprobadas]

let horasTotales = parseInt(localStorage.getItem("horasTotales")) || 0;
let contadorAproElectivas = JSON.parse(localStorage.getItem("contadorAproElectivas")) || setearContador("contadorAproElectivas");
let contadorReguElectivas = JSON.parse(localStorage.getItem("contadorReguElectivas")) || setearContador("contadorReguElectivas");

function setearLista(lista, nombre) {
    localStorage.setItem(nombre, JSON.stringify(lista));
    return lista;
}

function setearContador(nombre) {
    localStorage.setItem(nombre, 0);
    return 0;
}

function modificarTablas(materia, estado, nombreEstado) {
    for(let i=0; i < listaEstados.length; i++){
        if(listaEstados[i].includes(materia)){ // Verificar si la materia está en el estado actual
            let listaVieja = listaEstados[i];
            listaEstados[i].splice(listaEstados[i].indexOf(materia), 1);
            localStorage.setItem(estados[i], JSON.stringify(listaEstados[i])); // Actualiza en el Local Storage el estado anterior
            break;
        }
    }

    estado.push(materia); // Agregar materia al estado correspondiente
    localStorage.setItem(nombreEstado, JSON.stringify(estado));
}

function manejarCambioEstados(celda, estadoNuevo, estados) {
    if(!esElectiva(celda.id)) {
        modificarContador(celda, estadoNuevo);
    } else {
        modificarContadorElectiva(celda, estadoNuevo);
    }

    if(estadoNuevo != "sinCursar" ) {
        if(puedeCursarla(celda.id, estadoNuevo)) {
            celda.className = estadoNuevo;
            modificarCorrelativas(celda.id, estadoNuevo);
            modificarTablas(celda.id, estados, estadoNuevo);
        }
    } else {
        celda.className = estadoNuevo;
        modificarCorrelativas(celda.id, estadoNuevo);
        modificarTablas(celda.id, estados, estadoNuevo);
    }
}

function esElectiva(materia) {
    return electivas.includes(materia);
}

function modificarCorrelativas(nombreMateria, estadoNuevo) {
    const nombreClaseRegu = nombreMateria + "\.regu";
    let clases = Array.from(document.getElementsByClassName(nombreClaseRegu));
    const nombreClaseApro = nombreMateria + "\.apro";
    const clasesApro = Array.from(document.getElementsByClassName(nombreClaseApro));
    
    if(estadoNuevo == "aprobada" || estadoNuevo == "regularizada") {

        if(estadoNuevo == "aprobada") {
            clases = clases.concat(clasesApro);
        }

        clases.forEach(clase => {
            clase.style.textDecoration = "line-through solid black";
            clase.style.textDecorationThickness = "2px";
        })

    } else {
        clases = clases.concat(clasesApro);
        clases.forEach(clase => {
            clase.style.textDecoration = "none";
        })
    }

}

function puedeCursarla(materia, estadoNuevo) {
    let bloqueMateria = document.getElementById(materia);

    const spansRegu = bloqueMateria.querySelectorAll("p span[class$='.regu']"); // Obtiene todos los spans que terminan con .regu
    const reguNecesarias = Array.from(spansRegu).map(span => span.textContent); // Mapea los spans a un array de strings
    const cantRegularizadas = reguNecesarias.length;

    const spansApro = bloqueMateria.querySelectorAll("p span[class$='.apro']");
    const aproNecesarias = Array.from(spansApro).map(span => span.textContent);
    const cantAprobadas = aproNecesarias.length;

    if(cantRegularizadas == 0 && cantAprobadas == 0) {
        return true;
    }
    if(cantRegularizadas > 0) {
        if(!estanAprobadasORegularizadas(reguNecesarias)) {
            console.log("No cumplis los requisitos de regularizacion");
            return false;
        }
        console.log("Cumplis requisitos regularizacion");
    }
    if(cantAprobadas > 0) {
        if(!estanAprobadasORegularizadas(aproNecesarias)) {
            console.log("No cumplis los requisitos de aprobacion");
            return false;
        }
        console.log("La podes cursar");
    }

    return true;
}

function estanAprobadasORegularizadas(lista) {
    return lista.every(materia => 
        aprobadas.includes(materia) || regularizadas.includes(materia))
}

function modificarContador(celda, estadoNuevo) {
    if(celda.className == estadoNuevo) {
        return;
    }
    if(celda.className == "aprobada") {
        contadorApro -= 1;
        if(estadoNuevo != "regularizada") {
            contadorRegu -= 1;
        }
    } else if(celda.className == "regularizada") {
        if(estadoNuevo == "aprobada") {
            contadorApro += 1;
        } else {
            contadorRegu -= 1;
        }
    } else if(estadoNuevo == "regularizada") {
        contadorRegu += 1;
    } else if(estadoNuevo == "aprobada") {
        contadorApro += 1;
        contadorRegu += 1;  
    }

    localStorage.setItem("contadorRegu", contadorRegu);
    const contadorReguEl = document.getElementById("contadorRegu");
    contadorReguEl.textContent = contadorRegu + " / 38";

    const contadorAproEl = document.getElementById("contadorApro");
    localStorage.setItem("contadorApro", contadorApro);
    contadorAproEl.textContent = contadorApro + " / 38";
}


document.addEventListener("DOMContentLoaded", function () {
    // Ocultar la tabla temporalmente
    document.querySelector('table').style.visibility = 'hidden';
    
    // Pequeña pausa antes de aplicar los colores
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
            modificarCorrelativas(materia.id, materia.classList);
        });
        
        // Mostrar la tabla después de aplicar los colores
        document.querySelector('table').style.visibility = 'visible';

        const contadorAproEl = document.getElementById("contadorApro");
        contadorAproEl.textContent = contadorApro + " / 38";
        
        const contadorReguEl = document.getElementById("contadorRegu");
        contadorReguEl.textContent = contadorRegu + " / 38";

        const contadorAproElectivasEl = document.getElementById("contadorElectivasApro");
        contadorAproElectivasEl.textContent = contadorAproElectivas;

        const contadorReguElectivasEl = document.getElementById("contadorElectivasRegu");
        contadorReguElectivasEl.textContent = contadorReguElectivas;

        const horasElectivasEl = document.getElementById("contadorHoras");
        horasElectivasEl.textContent = horasTotales + " hs";

        // Crear el menu contextual
        const menu = document.createElement("div");
        menu.classList.add("menu");
        document.body.appendChild(menu);

        // Añadir opciones al menú
        estados.forEach((estado, i) => {
            let opcion = document.createElement("div");
            opcion.textContent = estado.charAt(0).toUpperCase() + estado.slice(1);
            opcion.classList.add("opcion");

            // Efectos hover
            opcion.addEventListener("mouseover", () => (opcion.style.backgroundColor = "#ddd"));
            opcion.addEventListener("mouseout", () => (opcion.style.backgroundColor = "#f9f9f9"));

            // Manejar clic en opción
            opcion.addEventListener("click", function () {
                if (menu.targetCell) {
                    manejarCambioEstados(menu.targetCell, estados[i], listaEstados[i]);
                }
                menu.style.display = "none";
            });

            menu.appendChild(opcion);
        });

        // Manejar clic derecho en celdas
        document.querySelectorAll("td").forEach(materia => {

            materia.addEventListener("contextmenu", function (event) {
                // Verificar si es celda no deseada
                if (materia.id === "vacia") {
                    return;
                }
                
                event.preventDefault();
                
                // Dimensiones del menú
                const menuWidth = menu.offsetWidth || 150; // Ancho del menú
                const menuHeight = menu.offsetHeight || (estados.length * 40); // Alto del menú
                
                // Posición del cursor
                let left = event.clientX;
                let top = event.clientY;
                
                // Ajustar si se sale por la derecha
                if (left + menuWidth > window.innerWidth) {
                    left = window.innerWidth - menuWidth - 5;
                }
                
                // Ajustar si se sale por abajo
                if (top + menuHeight > window.innerHeight) {
                    top = window.innerHeight - menuHeight - 5;
                }
                
                // Posicionar el menú
                menu.style.left = `${left}px`;
                menu.style.top = `${top}px`;
                menu.style.display = "block";
                menu.targetCell = materia;
            });
        });

        // Ocultar menú al hacer clic fuera
        document.addEventListener("click", function (event) {
            if (!menu.contains(event.target)) {
                menu.style.display = "none";
            }
        });

        const btnElectivas = document.getElementById("btnElectivas")

        btnElectivas.addEventListener("click", abrirModalElectivas);

        const btnSubir = document.getElementById("btnSubirHoras");
        const btnBajar = document.getElementById("btnBajarHoras");

        btnSubir.addEventListener("click", () => modificarHora(1));
        btnBajar.addEventListener("click", () => modificarHora(-1));
        
    }, 100);
});

function abrirModalElectivas() {
    const modal = document.getElementById("modalElectivas");
    modal.style.display = "flex";
}

function cerrarModalElectivas() {
    const modal = document.getElementById("modalElectivas");
    modal.style.display = "none";
}

window.addEventListener("click", function(event) {
    const modal = document.getElementById("modalElectivas");
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

function modificarContadorElectiva(celda, estadoNuevo) {
    if(celda.className == estadoNuevo) {
        return;
    }

    if(celda.className == "aprobada") {
        contadorAproElectivas -= 1;
        if(estadoNuevo != "regularizada") {
            contadorReguElectivas -= 1;
        }
    } else if(celda.className == "regularizada") {
        if(estadoNuevo == "aprobada") {
            contadorAproElectivas += 1;
        } else {
            contadorReguElectivas -= 1;
        }
    } else if(estadoNuevo == "regularizada") {
        contadorReguElectivas += 1;
    } else if(estadoNuevo == "aprobada") {
        contadorAproElectivas += 1;
        contadorReguElectivas += 1;  
    }

    localStorage.setItem("contadorReguElectivas", contadorReguElectivas);
    const contadorElectivasRegu = document.getElementById("contadorElectivasRegu");
    contadorElectivasRegu.textContent = contadorReguElectivas;

    const contadorElectivasApro = document.getElementById("contadorElectivasApro");
    localStorage.setItem("contadorAproElectivas", contadorAproElectivas);
    contadorElectivasApro.textContent = contadorAproElectivas;
}

function modificarHora(cant) {
    if(horasTotales == 0 && cant == -1) return
    horasTotales += cant;
    localStorage.setItem("horasTotales", horasTotales);
    const horasTotalesEl = document.getElementById("contadorHoras");
    horasTotalesEl.textContent = horasTotales + " hs";
}