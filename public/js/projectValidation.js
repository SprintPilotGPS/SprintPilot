document.getElementById('projectForm').addEventListener('submit', function(e) {
    const nombre = document.getElementById('nombre').value.trim();
    const id = document.getElementById('identificador').value.trim();
    const desc = document.getElementById('descripcion').value.trim();

    // Validación: El ID debe ser un string no vacío
    if (id.length === 0) {
        e.preventDefault();
        alert("El ID es obligatorio.");
        return;
    }

    // Ejemplo: Evitar que el ID tenga espacios (común en IDs de sistemas)
    if (id.includes(" ")) {
        e.preventDefault();
        alert("El ID no debe contener espacios. Usa guiones como 'PROY-01'.");
        return;
    }

    if (nombre.length < 1) {
        e.preventDefault();
        alert("El nombre es demasiado corto.");
        return;
    }

    console.log("Enviando nuevo proyecto con ID string:", id);
});
$(document).ready(function () {
  const modal = document.getElementById("projectModal");

  $("#openModal").on("click", function () {
    modal.classList.add("show"); // Esto hará que aparezca con el fondo oscuro
  });
  // Cerrar el modal
  $("#closeModal").on("click", function () {
    modal.classList.remove("show");
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

    function showResponse(res) {
      let noti = document.querySelector("#noti");
      let cards = document.querySelector("#projects-cards");

      if (res.success) {
        noti.innerHTML = `<p class="badge bg-success fs-5">Proyecto creado correctamente</p>`;
        
        let descripcion = (res.data.descripcion == "")? "No hay descripción." : res.data.descripcion;
        let card = `
        <a class="p-4 card scale-card card-proj text-decoration-none" href="/`+ res.data.identificador +`/backlog">
            <div class="d-flex justify-content-between">
              <h2 class="mb-1">` + res.data.nombre + `</h2>
              <p class="fs-5 mb-1 align-self-center badge bg-primary">` + res.data.identificador + `</p>
            </div>
            <hr />
            <p>` + descripcion + `</p>
        </a>`
        if(document.querySelector("#projects-cards > p") == null)
          cards.innerHTML += card;
        else
          cards.innerHTML = card;

        modal.classList.remove("show");
      } else {
        noti.innerHTML = `<p class="badge bg-warning fs-5">` + res.error + `</p>`;
      }
      noti.classList.add("show");
      setTimeout(() => noti.classList.remove("show"), 5000);
    }

    $.ajax({
      url: "/api/projects",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(formData),
      success: function (response) {
        //modal.classList.remove("show");
        showResponse(response);
      },
      error: function (xhr) {
        const msg = xhr.responseJSON ? xhr.responseJSON.error : "Error al guardar";
        showResponse({success: false, error: msg});
      },
    });
  });
});
