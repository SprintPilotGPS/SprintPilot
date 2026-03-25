$(document).ready(function () {
  const modal = document.getElementById("projectModal");

  $("#openModal").on("click", function () {
    modal.showModal(); // Esto hará que aparezca con el fondo oscuro
  });
  // Cerrar el modal
  $("#closeModal").on("click", function () {
    modal.close();
    $("#projectForm")[0].reset();
  });

  // Envío AJAX
  $("#projectForm").on("submit", function (e) {
    e.preventDefault();

    const formData = {
      nombre: $("#nombre").val().trim(),
      id: $("#identificador").val().trim(),
      descripcion: $("#descripcion").val().trim(), // Enviará "" si está vacío
    };

    $.ajax({
      url: "/api/projects",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(formData),
      success: function (response) {
        alert("✅ Proyecto guardado correctamente");
        modal.close();
        location.reload(); // Recarga la página para ver los cambios
      },
      error: function (xhr) {
        const msg = xhr.responseJSON ? xhr.responseJSON.error : "Error al guardar";
        alert("❌ " + msg);
      },
    });
  });
});
