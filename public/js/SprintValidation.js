$(function () {
  console.log("Controlador de Sprints cargado");

  const modal = document.getElementById("sprintModal");

  $("#openModal").on("click", function () {
    if (modal) {
      modal.showModal();
    }
  });

  $("#closeSprintModal").on("click", function () {
    if (modal) {
      modal.close();
    }
  });

  $("#sprintForm").on("submit", function (event) {
    event.preventDefault();

    const projectId = $("#project_id").val();
    if (!projectId) {
      alert("No se encontró el proyecto para crear el sprint.");
      return;
    }

    const rawIdentificador = $("#identificador").val().trim();
    const parsedIdentificador = Number(rawIdentificador);

    const payload = {
      identificador:
        rawIdentificador !== "" && Number.isInteger(parsedIdentificador) && parsedIdentificador > 0
          ? parsedIdentificador
          : undefined,
      sprintGoal: $("#sprintGoal").val().trim(),
    };

    $.ajax({
      url: `/api/${encodeURIComponent(projectId)}/sprints`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
    })
      .done(() => {
        alert("Sprint creado y marcado como actual.");
        if (modal) {
          modal.close();
        }
        this.reset();
        location.reload();
      })
      .fail((jqXHR) => {
        const errorMsg =
          jqXHR.responseJSON && jqXHR.responseJSON.error
            ? jqXHR.responseJSON.error
            : "Error al guardar el sprint";
        alert(errorMsg);
      });
  });

  $(".set-current-sprint").on("click", function () {
    const projectId = $("#project_id").val();
    const sprintId = $(this).data("sprintId");

    if (!projectId || !sprintId) {
      alert("No se pudo cambiar el sprint actual.");
      return;
    }

    $.ajax({
      url: `/api/${encodeURIComponent(projectId)}/sprints/${encodeURIComponent(sprintId)}/current`,
      method: "PUT",
    })
      .done(() => {
        alert("Sprint actual actualizado correctamente.");
        location.reload();
      })
      .fail((jqXHR) => {
        const errorMsg =
          jqXHR.responseJSON && jqXHR.responseJSON.error
            ? jqXHR.responseJSON.error
            : "No se pudo cambiar el sprint actual";
        alert(errorMsg);
      });
  });
});
