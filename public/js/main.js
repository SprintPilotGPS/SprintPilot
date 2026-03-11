// SprintPilot - Script de interacción frontend

// Ver detalles del requisito
function viewRequisito(id) {
    fetch(/api/requisitos/${id})
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const req = data.data;
                alert(Detalles de la Tarea:\n\nID: ${req.identificador}\nNombre: ${req.nombre}\nPrioridad: ${req.prioridad}\nEstado: ${req.estado}\nResponsable: ${req.responsable}\nFecha Límite: ${req.fechaFormateada}\nDescripción: ${req.descripcion || 'Ninguno'});
            } else {
                alert('Error al obtener detalles de la tarea');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al obtener detalles de la tarea');
        });
}

// Editar requisito
function editRequisito(id) {
    // Aquí se puede abrir un modal o redirigir a la página de edición
    console.log('Editar tarea:', id);
    alert('Función de edición en desarrollo...\nID de Tarea: ' + id);
}

// Eliminar requisito
function deleteRequisito(id) {
    if (confirm('¿Está seguro de que desea eliminar esta tarea?')) {
        fetch(/api/requisitos/${id}, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Tarea eliminada');
                location.reload();
            } else {
                alert('Error al eliminar');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar la tarea');
        });
    }
}

// Inicialización después de que se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('SprintPilot cargado');

    // Se puede agregar más código de inicialización aquí
    // Por ejemplo: validación de formularios, escuchadores de eventos, etc.
});