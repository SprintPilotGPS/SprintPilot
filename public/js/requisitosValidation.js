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

/* Para odenar los requisitos */
window.moverArriba = function (id) {
  fetch(`/api/requisitos/${id}/mover-arriba`, { method: "POST" }).then(() => location.reload());
};
window.moverAbajo = function (id) {
  let project_id = document.querySelector("#project_id").value;
  $.ajax({
    url: `/api/${project_id}/requisitos/${id}/mover-abajo`,
    method: "POST",
  })
    .done(() => {
      location.reload();
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      const error = errorThrown || textStatus;
      console.error("Error:", error);
      alert("Error al mover la tarea hacia abajo");
    });
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
    let project_id = document.querySelector("#project_id").value;
    $.ajax({
      url: `/api/${project_id}/requisitos/${id}`,
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

function showCreate(res) {
  let noti = document.querySelector("#noti");
  let table = document.querySelector("#table-body");

  if (res.success) {
    noti.innerHTML = `<p class="badge bg-success fs-5">Requisito creado correctamente</p>`;

    let classEstado;
    if (res.data.estado.toLowerCase() == "pending") classEstado = "bg-secondary";
    else if (res.data.estado.toLowerCase() == "in-progress") classEstado = "bg-primary";
    else classEstado = "bg-success";

    let classPrioridad;
    if (res.data.prioridad.toLowerCase() == "high") classPrioridad = "bg-danger";
    else if (res.data.prioridad.toLowerCase() == "medium") classPrioridad = "bg-warning";
    else classPrioridad = "bg-info";

    let requisito =
      `
      <tr>
        <td>` +
      res.data.project_id +
      `-` +
      res.data.identificador +
      `</td>
        <td>` +
      res.data.nombre +
      `</td>
        <td class="text-center">
          <span class="badge fw-bold ` +
      classPrioridad +
      `">` +
      res.data.prioridad +
      `</span>
        </td>
        <td class="text-center">
          <span class="status-badge fw-bold text-white ` +
      classEstado +
      `">` +
      res.data.estado +
      `</span>
        </td>
        <td>` +
      res.data.responsable +
      `</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-light" onclick="moverArriba('` +
      res.data.identificador +
      `')">
              ⬆️
            </button>
            <button class="btn btn-sm btn-light" onclick="moverAbajo('` +
      res.data.identificador +
      `')">
              ⬇️
            </button>
            <button class="btn btn-sm btn-view" onclick="viewRequisito('` +
      res.data.identificador +
      `')">
              Ver
            </button>
            <button class="btn btn-sm btn-edit" onclick="editRequisito('` +
      res.data.identificador +
      `')">
              Editar
            </button>
          </div>
        </td>
      </tr>
    `;
    if (document.querySelector("#empty") == null) table.innerHTML += requisito;
    else table.innerHTML = requisito;

    bootstrap.Modal.getOrCreateInstance(document.querySelector("#addRequisitoModal")).hide();
  } else {
    noti.innerHTML = `<p class="badge bg-warning fs-5">` + res.error + `</p>`;
  }
  noti.classList.add("show");
  setTimeout(() => noti.classList.remove("show"), 5000);
}

// Inicialización después de que se cargue la página
$(function () {
  console.log("SprintPilot cargado");

  $("#addRequisitoForm").on("submit", function (event) {
    event.preventDefault();

    let project_id = document.querySelector("#project_id").value;
    const payload = {
      nombre: $("#nombre").val().trim(),
      prioridad: $("#prioridad").val(),
      estado: $("#estado").val(),
      responsable: $("#responsable").val().trim(),
      descripcion: $("#descripcion").val().trim(),
      project_id: project_id,
    };
    $.ajax({
      url: "/api/" + project_id + "/requisitos",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
    })
      .done((res) => {
        showCreate(res);
      })
      .fail((jqXHR) => {
        const message =
          jqXHR.responseJSON && jqXHR.responseJSON.error
            ? jqXHR.responseJSON.error
            : "Error al crear la tarea";
        showCreate({ success: false, error: message });
      });
  });
});
