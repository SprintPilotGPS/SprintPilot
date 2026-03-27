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
        <div class="p-4 card scale-card card-proj">
            <div class="d-flex justify-content-between">
              <h2 class="mb-1">` + res.data.nombre + `</h2>
              <p class="fs-5 mb-1 align-self-center badge bg-primary">` + res.data.identificador + `</p>
            </div>
            <hr />
            <p>` + descripcion + `</p>
        </div>`
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

  function redirectToRequisitos(p){
    let id = p.querySelector("p.id").innerHTML;
    
  }

  document.querySelectorAll(".proj").forEach((p) => {
    p.onclick = e => redirectToRequisitos(p);
  });
});
