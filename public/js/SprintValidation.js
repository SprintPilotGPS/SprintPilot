$(function () {
    console.log("Controlador de Sprints cargado");

    // Referencia al elemento <dialog>
    const modal = document.getElementById('sprintModal');

    // 1. Abrir el modal cuando se pulsa el botón
    $('#openModal').on('click', function() {
        if (modal) {
            modal.showModal();
        }
    });

    // 2. Cerrar el modal cuando se pulsa el botón Cancelar
    $('#closeSprintModal').on('click', function() {
        if (modal) {
            modal.close();
        }
    });

    // 3. Envío del formulario mediante AJAX de jQuery
    $('#sprintForm').on('submit', function (event) {
        // Evitamos que el formulario recargue la página
        event.preventDefault();

        // Recogemos únicamente los datos de las fechas (sin inventar campos)
        const payload = {
            fechaInicio: $('#fechaInicio').val(),
            fechaFin: $('#fechaFin').val()
        };

        // Realizamos la petición POST al servidor
        $.ajax({
            url: "/api/sprints", // Endpoint para guardar sprints
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(payload),
        })
        .done((response) => {
            // Si todo va bien (el servidor responde éxito)
            alert("¡Sprint creado con éxito!");
            
            if (modal) {
                modal.close(); // Cerramos el modal
            }
            this.reset(); // Limpiamos las fechas del formulario
            location.reload(); // Recargamos la pantalla para ver el nuevo sprint
        })
        .fail((jqXHR) => {
            // Si el servidor devuelve un error
            const errorMsg = jqXHR.responseJSON && jqXHR.responseJSON.error 
                             ? jqXHR.responseJSON.error 
                             : "Error al guardar el sprint";
            alert(errorMsg);
            console.error("Detalle del error:", jqXHR.responseText);
        });
    });
});