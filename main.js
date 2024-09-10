const frutas = [
    { nombre: 'Manzana', precio: 800 },
    { nombre: 'Banana', precio: 600 },
    { nombre: 'Naranja', precio: 1200 },
    { nombre: 'Uvas', precio: 1500 },
    
];

const listaFrutasElemento = document.getElementById('frutas');
const itemsCarritoElemento = document.getElementById('items-carrito');
const precioTotalElemento = document.getElementById('precio-total');
const botonRealizarCompra = document.getElementById('realizar-compra');
const mensajeConfirmacionElemento = document.getElementById('mensaje-confirmacion');
    const botonHacerOtraCompra = document.getElementById('hacer-otra-compra');
const botonCerrarMensaje = document.getElementById('cerrar-mensaje');

   // Cargar carrito desde localStorage
function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
}

let carrito = cargarCarritoDesdeLocalStorage();

    // Función para guardar el carrito en localSto
    function guardarCarritoEnLocalStorage() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

// Fución para actualizar y guardar el carrito en localSto
function actualizarYGuardarCarrito() {
    actualizarCarrito();
    guardarCarritoEnLocalStorage();
}

// Función para renderizar la lista de frutas en el DOM
function renderizarListaFrutas() {
    listaFrutasElemento.innerHTML = '';
    for (const fruta of frutas) {
        const li = document.createElement('li');

        li.textContent = `${fruta.nombre} - $${fruta.precio.toFixed(2)}`;
        const boton = document.createElement('button');
        boton.textContent = 'Agregar Fruta';

        boton.onclick = () => agregarAlCarrito(fruta);
        li.appendChild(boton);
        listaFrutasElemento.appendChild(li);
    }
}

// Función para agrgar fruta al carrito
function agregarAlCarrito(fruta) {
    const itemExistente = carrito.find(item => item.nombre === fruta.nombre);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({ ...fruta, cantidad: 1 });
    }
    actualizarYGuardarCarrito();
}

// Fnción para eliminar fruta del carrito
function eliminarDelCarrito(nombre) {
    carrito = carrito.filter(item => item.nombre !== nombre);
    actualizarYGuardarCarrito();
}

// Función para actualizar el carrito en el DOM
function actualizarCarrito() {
    itemsCarritoElemento.innerHTML = '';
    let precioTotal = 0;
    for (const item of carrito) {
        const li = document.createElement('li');
        li.textContent = `${item.nombre} - $${item.precio.toFixed(2)} x ${item.cantidad}`;

        const boton = document.createElement('button');
        boton.textContent = 'Eliminar';
        boton.classList.add('boton-eliminar');

        boton.onclick = () => eliminarDelCarrito(item.nombre);
        li.appendChild(boton);

        itemsCarritoElemento.appendChild(li);
        precioTotal += item.precio * item.cantidad;
    }
    precioTotalElemento.textContent = precioTotal.toFixed(2);
}

// Función para realizar la compra
function realizarCompra() {
    if (carrito.length === 0) {
        alert('Tu canasta está vacía.');
        return;
    }

    const totalCompra = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    mensajeConfirmacionElemento.querySelector('p').textContent = `Gracias por su compra en Rulix. Total a pagar: $${totalCompra.toFixed(2)}. ¿Deseas hacer otra compra?`;
    mensajeConfirmacionElemento.style.display = 'block'; 
}

    // Función para reiniciar la compra
    function reiniciarCompra() {
        carrito = []; // 
        actualizarYGuardarCarrito();
        mensajeConfirmacionElemento.style.display = 'none';
    }

// Función para cerrar el mensaje de confirmación
function cerrarMensaje() {
    mensajeConfirmacionElemento.style.display = 'none'; 
}

// Evento listeners
botonRealizarCompra.addEventListener('click', realizarCompra);
botonHacerOtraCompra.addEventListener('click', reiniciarCompra);
botonCerrarMensaje.addEventListener('click', cerrarMensaje);

// Renderizar la lista de frutas y el carrit al cargar la página
renderizarListaFrutas();
actualizarCarrito();
