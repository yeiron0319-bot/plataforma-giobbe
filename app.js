// =========================================================================
// FRONTEND PRINCIPAL (LOGICA CLIENTE) - PLATAFORMA GIOBBE
// Autor: Yeiron Rivas López - Aprendiz SENA
// =========================================================================

// ENLACE OFICIAL DE PRODUCCIÓN EN RENDER (Reemplaza por completo a localhost)
const API_URL = 'https://onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // Detectar en qué página estamos para cargar las funciones correctas
    if (document.getElementById('contenedor-vacantes')) {
        cargarVacantes();
    }
    if (document.getElementById('formulario-empresa')) {
        configurarPanelAdmin();
    }
});

// =========================================================================
// 👥 VISTA DE CANDIDATOS: OBTENER Y MOSTRAR VACANTES
// =========================================================================
async function cargarVacantes() {
    const contenedor = document.getElementById('contenedor-vacantes');
    
    try {
        const respuesta = await fetch(`${API_URL}/vacantes`);
        if (!respuesta.ok) throw new Error('Error al obtener datos del servidor');
        
        const vacantes = await respuesta.json();
        contenedor.innerHTML = ''; // Limpiar mensaje de carga o error

        if (vacantes.length === 0) {
            contenedor.innerHTML = '<p class="sin-datos">No hay vacantes disponibles en este momento.</p>';
            return;
        }

        vacantes.forEach(oferta => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta-vacante';
            tarjeta.innerHTML = `
                <h3>${oferta.cargo}</h3>
                <p><strong>Empresa:</strong> ${oferta.empresa}</p>
                <p><strong>Género requerido:</strong> ${oferta.genero}</p>
                <p><strong>Experiencia:</strong> ${oferta.experiencia}</p>
                <p><strong>Convocatoria:</strong> ${oferta.tipo_convocatoria}</p>
                <p><strong>Detalles:</strong> ${oferta.detalles_presentacion}</p>
                <a href="https://wa.me{oferta.telefono}?text=Hola,%20estoy%20interesado%20en%20la%20vacante%20de%20${encodeURIComponent(oferta.cargo)}" 
                   target="_blank" class="btn-postular">
                   Postularse por WhatsApp
                </a>
            `;
            contenedor.appendChild(tarjeta);
        });

    } catch (error) {
        console.error('Error:', error);
        contenedor.innerHTML = '<p class="error-rojo">Error al conectar con el servidor backend.</p>';
    }
}

// =========================================================================
// 🏢 VISTA ADMINISTRADOR: REGISTROS Y GESTIÓN
// =========================================================================
function configurarPanelAdmin() {
    const formEmpresa = document.getElementById('formulario-empresa');
    const formVacante = document.getElementById('formulario-vacante');
    const selectEmpresas = document.getElementById('select-empresas');

    // Cargar selector de empresas para poder asignar la vacante
    cargarSelectorEmpresas(selectEmpresas);

    // Guardar una nueva Empresa
    formEmpresa.addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = {
            nombre: document.getElementById('emp-nombre').value,
            telefono: document.getElementById('emp-telefono').value,
            correo: document.getElementById('emp-correo').value,
            direccion: document.getElementById('emp-direccion').value,
            ubicacion_maps: document.getElementById('emp-maps').value
        };

        try {
            const res = await fetch(`${API_URL}/empresas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            if (res.ok) {
                alert('Empresa guardada con éxito en la nube');
                formEmpresa.reset();
                cargarSelectorEmpresas(selectEmpresas); // Recargar lista
            }
        } catch (err) {
            alert('Error al guardar la empresa');
        }
    });

    // Guardar una nueva Vacante/Requerimiento
    formVacante.addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = {
            empresa_id: selectEmpresas.value,
            cargo: document.getElementById('vac-cargo').value,
            genero: document.getElementById('vac-genero').value,
            experiencia: document.getElementById('vac-experiencia').value,
            tipo_convocatoria: document.getElementById('vac-convocatoria').value,
            detalles_presentacion: document.getElementById('vac-detalles').value
        };

        try {
            const res = await fetch(`${API_URL}/vacantes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            if (res.ok) {
                alert('Requerimiento publicado con éxito');
                formVacante.reset();
            }
        } catch (err) {
            alert('Error al publicar la vacante');
        }
    });
}

// Auxiliar para rellenar las empresas en los formularios
async function cargarSelectorEmpresas(elementoSelect) {
    if (!elementoSelect) return;
    try {
        const res = await fetch(`${API_URL}/empresas`);
        const empresas = await res.json();
        elementoSelect.innerHTML = '<option value="">Seleccione una empresa...</option>';
        empresas.forEach(emp => {
            elementoSelect.innerHTML += `<option value="${emp.id}">${emp.nombre}</option>`;
        });
    } catch (err) {
        console.error('Error al cargar empresas en el formulario');
    }
}
