const listaFrutasElemento = document.getElementById('frutas');
const itemsCarritoElemento = document.getElementById('items-carrito');
const precioTotalElemento = document.getElementById('precio-total');
const botonRealizarCompra = document.getElementById('realizar-compra');
const carritoIcono = document.getElementById('carrito-icono');
const carritoElemento = document.getElementById('carrito');
const contadorCarrito = document.getElementById('contador-carrito');
const mensajeCarritoVacio = document.getElementById('mensaje-carrito-vacio');

let carrito = cargarCarritoDesdeLocalStorage();

function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
}

function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

async function cargarFrutas() {
    try {
        const response = await fetch('../db/frutas.json');
        if (!response.ok) {
            throw new Error('Error al cargar las frutas: ' + response.status);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function renderizarListaFrutas() {
    const frutas = await cargarFrutas();
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

function agregarAlCarrito(fruta) {
    const itemExistente = carrito.find(item => item.nombre === fruta.nombre);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({ ...fruta, cantidad: 1 });
    }
    actualizarYGuardarCarrito();
}

function actualizarYGuardarCarrito() {
    actualizarCarrito();
    guardarCarritoEnLocalStorage();
}

function eliminarDelCarrito(nombre) {
    carrito = carrito.filter(item => item.nombre !== nombre);
    actualizarYGuardarCarrito();
}


function actualizarCarrito() {
    itemsCarritoElemento.innerHTML = '';
    let precioTotal = 0;
    let totalItems = 0;
    if (carrito.length === 0) {
        mensajeCarritoVacio.style.display = 'block';
        precioTotalElemento.textContent = '';
        contadorCarrito.textContent = '0';
    } else {
        mensajeCarritoVacio.style.display = 'none';
        for (const item of carrito) {
            const li = document.createElement('li');
            li.innerHTML = `${item.nombre} - $${item.precio.toFixed(2)} x 
                            <input type="number" min="1" value="${item.cantidad}" class="cantidad" data-nombre="${item.nombre}">
                            <button class="boton-eliminar">Eliminar</button>`;
            
            const cantidadInput = li.querySelector('.cantidad');
            cantidadInput.onchange = () => actualizarCantidad(item.nombre, parseInt(cantidadInput.value, 10));

            const botonEliminar = li.querySelector('.boton-eliminar');
            botonEliminar.onclick = () => eliminarDelCarrito(item.nombre);

            itemsCarritoElemento.appendChild(li);
            precioTotal += item.precio * item.cantidad;
            totalItems += item.cantidad;
        }
        precioTotalElemento.textContent = precioTotal.toFixed(2);
        contadorCarrito.textContent = totalItems;
    }
}

function actualizarCantidad(nombre, cantidad) {
    const item = carrito.find(item => item.nombre === nombre);
    if (item) {
        item.cantidad = cantidad;
        if (item.cantidad <= 0) {
            eliminarDelCarrito(nombre);
        } else {
            actualizarYGuardarCarrito();
        }
    }
}

botonRealizarCompra.addEventListener('click', () => {
    if (carrito.length === 0) {
        Swal.fire('Carrito vacío', 'Tu carrito está vacío. Añade productos antes de realizar la compra.', 'warning');
        return;
    }

    Swal.fire({
        title: '¿Deseas realizar la compra?',
        showCancelButton: true,
        confirmButtonText: 'Sí, realizar compra',
        cancelButtonText: 'No, cerrar'
    }).then((result) => {
        if (result.isConfirmed) {
            mostrarDatosUsuario();
        } else {
            
            Swal.fire({
                title: '¿Estás seguro de cancelar la compra?',
                text: 'El carrito quedará vacío.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'No, volver'
            }).then((result) => {
                if (result.isConfirmed) {
                    reiniciarCompra();
                    Swal.fire('Carrito vaciado', 'Tu carrito ha sido vaciado.', 'success');
                }
                
            });
        }
    });
});



async function mostrarDatosUsuario() {
    const { value: formValues } = await Swal.fire({
        title: 'Ingresa tus datos',
        html:
            '<input id="nombre" class="swal2-input" placeholder="Nombre">' +
            '<input id="telefono" class="swal2-input" placeholder="Número de Teléfono">' +
            '<input id="email" class="swal2-input" placeholder="Email">' +
            '<input id="dni" class="swal2-input" placeholder="DNI">',
        focusConfirm: false,
        showCloseButton: true, 
        preConfirm: () => {
            const nombre = document.getElementById('nombre').value;
            const telefono = document.getElementById('telefono').value;
            const email = document.getElementById('email').value;
            const dni = document.getElementById('dni').value;

            if (!nombre || !telefono || !email || !dni) {
                Swal.showValidationMessage('Debe completar todos los campos');
                return false;
            }

            return { nombre, telefono, email, dni };
        }
    });

    if (formValues) {
        confirmarCompra(formValues);
    }
}


function confirmarCompra(datos) {
    const totalCompra = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    Swal.fire({
        title: 'Gracias por su compra',
        html: `
            <p>Nombre: ${datos.nombre}</p>
            <p>Número de Teléfono: ${datos.telefono}</p>
            <p>Email: ${datos.email}</p>
            <p>DNI: ${datos.dni}</p>
            <p>Total a pagar: $${totalCompra.toFixed(2)}</p>
        `,
        icon: 'success'
    }).then(() => {
        reiniciarCompra();
    });
}



function reiniciarCompra() {
    carrito = [];
    actualizarYGuardarCarrito();
    carritoElemento.style.display = 'none';
}

function mostrarAnuncioDerulix() {
    const anuncio = document.getElementById('anuncio-descuento');
    anuncio.classList.remove('oculto');
    setTimeout(() => {
        anuncio.classList.add('oculto');
    }, 10000); 
}

document.getElementById('cerrar-anuncio').addEventListener('click', () => {
    document.getElementById('anuncio-descuento').classList.add('oculto');
});



carritoIcono.addEventListener('click', () => {
    carritoElemento.style.display = carritoElemento.style.display === 'block' ? 'none' : 'block';
});


setInterval(mostrarAnuncioDerulix, 25000);


renderizarListaFrutas();
actualizarCarrito();
