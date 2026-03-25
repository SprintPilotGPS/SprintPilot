// SprintPilot - Script de interacción frontend
/* global $, bootstrap */

// Ver detalles del requisito
window.viewRequisito = function (id) {
  $.getJSON(`/api/requisitos/${id}`)
    .done((data) => {
      if (data.success) {
        const req = data.data;
        alert(
          `Detalles de la Tarea:\n\nID: ${req.identificador}\nNombre: ${req.nombre}\nPrioridad: ${req.prioridad}\nEstado: ${req.estado}\nResponsable: ${req.responsable}\nFecha Límite: ${req.fechaFormateada}\nDescripción: ${req.descripcion || "Ninguno"}`
        );
      } else {
        alert("Error al obtener detalles de la tarea");
      }
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      const error = errorThrown || textStatus;
      console.error("Error:", error);
      alert("Error al obtener detalles de la tarea");
    });
};
window.moverArriba = function (id) {
  fetch(`/api/requisitos/${id}/mover-arriba`, { method: "POST" })
    .then(() => location.reload());
};

window.moverAbajo = function (id) {
  fetch(`/api/requisitos/${id}/mover-abajo`, { method: "POST" })
    .then(() => location.reload());
};


// Editar requisito
window.editRequisito = function (id) {
  // Aquí se puede abrir un modal o redirigir a la página de edición
  console.log("Editar tarea:", id);
  alert("Función de edición en desarrollo...\nID de Tarea: " + id);
};

// Eliminar requisito
window.deleteRequisito = function (id) {
  if (confirm("¿Está seguro de que desea eliminar esta tarea?")) {
    $.ajax({
      url: `/api/requisitos/${id}`,
      method: "DELETE",
    })
      .done((data) => {
        if (data.success) {
          alert("Tarea eliminada");
          location.reload();
        } else {
          alert("Error al eliminar");
        }
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        const error = errorThrown || textStatus;
        console.error("Error:", error);
        alert("Error al eliminar la tarea");
      });
  }
};

// Inicialización después de que se cargue la página
$(function () {
  console.log("SprintPilot cargado");

  $("#addRequisitoForm").on("submit", function (event) {
    event.preventDefault();

    const payload = {
      nombre: $("#nombre").val().trim(),
      prioridad: $("#prioridad").val(),
      estado: $("#estado").val(),
      responsable: $("#responsable").val().trim(),
      descripcion: $("#descripcion").val().trim(),
    };

    $.ajax({
      url: "/api/requisitos",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
    })
      .done((response) => {
        if (response.success) {
          const modalElement = document.getElementById("addRequisitoModal");
          const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
          modalInstance.hide();
          this.reset();
          alert("Tarea creada exitosamente");
          location.reload();
        } else {
          alert("No se pudo crear la tarea");
        }
      })
      .fail((jqXHR) => {
        const message =
          jqXHR.responseJSON && jqXHR.responseJSON.error
            ? jqXHR.responseJSON.error
            : "Error al crear la tarea";
        alert(message);
      });
  });

  // Se puede agregar más código de inicialización aquí
  // Por ejemplo: validación de formularios, escuchadores de eventos, etc.
});
