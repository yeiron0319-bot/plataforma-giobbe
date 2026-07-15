// =========================================================================
// LÓGICA DEL FRONTEND - PLATAFORMA GIOBBE & ACADEMIA CLAVE
// Autor: Yeiron Rivas López - Aprendiz SENA
// =========================================================================

window.addEventListener('DOMContentLoaded', () => {
    // 1. CAPTURA DE ELEMENTOS DEL SPLASH SCREEN (PANTALLA DE CARGA)
    const logo = document.getElementById('logo-animado');
    const texto = document.getElementById('texto-carga');
    const splash = document.getElementById('splash-screen');
    
    // Forzamos que el primer logo (escudo-giobbe.png.png) esté 100% visible al arrancar
    if (logo) {
        logo.style.opacity = '1';
    }

    // PASO A: A los 2.5 segundos, desvanecemos el escudo de GIOBBE y cargamos Academia Clave
    setTimeout(() => {
        if (logo) {
            logo.style.opacity = '0'; // Efecto desvanecer hacia afuera
            
            setTimeout(() => {
                // Cambiamos la ruta al segundo escudo
                // Nota: Asegúrate de tener el archivo 'escudo-academia-clave.png' en tu carpeta public/
                logo.src = "escudo-academia-clave.png"; 
                logo.style.opacity = '1'; // Efecto desvanecer hacia adentro con el nuevo logo
                texto.innerText = "Conectando con Academia Clave...";
            }, 500); // Pequeña espera para que termine de ocultarse el primero
        }
    }, 2500);

    // PASO B: A los 5.5 segundos, desvanecemos toda la pantalla negra para revelar la web
    setTimeout(() => {
        if (splash) {
            splash.style.opacity = '0'; // Se vuelve transparente de forma suave
            
            setTimeout(() => {
                splash.style.display = 'none'; // Se remueve del flujo para poder dar clics en la página
            }, 800); // Espera a que termine la transición de opacidad
        }
    }, 5500);

    // 2. EJECUTAR CONSULTA DE VACANTES A LA BASE DE DATOS
    cargarVacantes();
});

// === FUNCIÓN PARA RENDERIZAR LAS VACANTES DESDE LA API (MYSQL + NODE) ===
function cargarVacantes() {
    fetch('/api/vacantes')
        .then(res => res.json())
        .then(vacantes => {
            const contenedor = document.getElementById('contenedor-vacantes');
            contenedor.innerHTML = ''; // Limpiamos el texto inicial de "Buscando..."

            // Si la base de datos está vacía, mostramos un mensaje amigable
            if (vacantes.length === 0) {
                contenedor.innerHTML = '<p style="text-align:center; color:#666; font-size:1.1rem; margin-top:30px;">No hay requerimientos activos en este momento. Vuelve más tarde.</p>';
                return;
            }

            // Recorremos cada fila que nos devolvió la consulta SQL
            vacantes.forEach(v => {
                const card = document.createElement('div');
                card.className = 'oferta-card';
                
                // Determinamos qué botón e interactividad renderizar según el tipo de convocatoria
                let botonHTML = '';
                if (v.tipo_convocatoria === 'Masiva') {
                    botonHTML = `
                        <button class="btn-presentarse" onclick="abrirConvocatoriaMasiva(event, \`${v.detalles_presentacion}\`, \`${v.ubicacion_maps}\`)">Presentarse Directamente</button>
                        <div class="info-masiva" style="display:none;"></div>
                    `;
                } else {
                    botonHTML = `
                        <button class="btn-postular" onclick="abrirModalPostular('${v.correo}', '${v.telefono}', '${v.cargo}')">Postular mi Hoja de Vida</button>
                    `;
                }

                // Inyectamos la estructura HTML de la tarjeta de empleo
                card.innerHTML = `
                    <h2>${v.cargo}</h2>
                    <p><strong>Empresa contratante:</strong> ${v.empresa}</p>
                    <div class="badges-container">
                        <span class="badge">${v.genero}</span>
                        <span class="badge">${v.experiencia}</span>
                        <span class="badge badge-tipo">Convocatoria ${v.tipo_convocatoria}</span>
                    </div>
                    ${botonHTML}
                `;
                contenedor.appendChild(card);
            });
        })
        .catch(err => {
            console.error("Error al conectar con la API: ", err);
            document.getElementById('contenedor-vacantes').innerHTML = '<p style="color:red; text-align:center;">Error al conectar con el servidor backend.</p>';
        });
}

// === INTERACTIVIDAD DEL MODAL (POSTULACIÓN INDIVIDUAL) ===
function abrirModalPostular(correo, telefono, cargo) {
    document.getElementById('modal-postular').style.display = 'block';
    document.getElementById('postula-correo').value = correo;
    document.getElementById('postula-telefono').value = telefono;
    document.getElementById('postula-cargo').value = cargo;
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube la pantalla suavemente para ver el formulario
}

function cerrarModal() {
    document.getElementById('modal-postular').style.display = 'none';
    document.getElementById('form-postulacion').reset();
}

// Control de envío del formulario (Sube el PDF y abre WhatsApp de la empresa)
document.getElementById('form-postulacion').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const archivoInput = document.getElementById('postula-pdf');
    const formData = new FormData();
    formData.append('nombrePostulante', document.getElementById('postula-nombre').value);
    formData.append('correoEmpresa', document.getElementById('postula-correo').value);
    formData.append('cargo', document.getElementById('postula-cargo').value);
    formData.append('hojaVida', archivoInput.files[0]);

    // Enviamos el archivo PDF al backend usando Fetch Multipart
    fetch('/api/postular', {
        method: 'POST',
        body: formData
    })
    .then(res => {
        if(res.ok) {
            // Disparador automático de la API de WhatsApp de la empresa contratante
            const tel = document.getElementById('postula-telefono').value;
            const cargo = document.getElementById('postula-cargo').value;
            const mensajeWhatsapp = `Hola, me acabo de postular a la vacante de ${cargo} mediante la plataforma GIOBBE. Mi hoja de vida en formato PDF ya fue enviada directamente a su correo institucional.`;
            
            // Abre una pestaña nueva con el chat directo de la empresa
            window.open(`https://whatsapp.com{tel}&text=${encodeURIComponent(mensajeWhatsapp)}`, '_blank');
            
            alert('¡Postulación realizada con éxito! El correo con tu hoja de vida fue enviado y se ha abierto el chat de WhatsApp corporativo.');
            cerrarModal();
        } else {
            alert('Hubo un problema al subir tu archivo PDF al servidor.');
        }
    });
});

// === INTERACTIVIDAD CONVOCATORIAS MASIVAS (DESPLEGAR DIRECCIÓN Y MAPA) ===
function abrirConvocatoriaMasiva(event, detalles, mapaUrl) {
    const boton = event.target;
    const divInfo = boton.nextElementSibling; // Apunta al bloque .info-masiva que está justo abajo del botón
    
    divInfo.style.display = 'block';
    divInfo.innerHTML = `
        <p><strong>📋 Indicaciones para presentarse:</strong></p>
        <p>${detalles}</p>
        <p><a href="${mapaUrl}" target="_blank" style="color:#0056b3; font-weight:bold; text-decoration:none;">📍 Ver ubicación exacta en Google Maps</a></p>
    `;
}
