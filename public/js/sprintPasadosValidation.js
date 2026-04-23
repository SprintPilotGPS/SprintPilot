


document.querySelectorAll(".sprint").forEach(card => {
  card.onclick = () => {
    const id = card.querySelector("input").value;
    viewSprintDetails(id);
  };
});


async function viewSprintDetails(numero) {
        const modal = document.getElementById("modal-view-sprint");
        const title = document.getElementById("modal-sprint-title");
        const content = document.getElementById("modal-sprint-content");
        const project_id = document.querySelector("#project_id").value;
        
        modal.classList.add("show");

        title.innerText = `Detalles del Sprint #${numero}`;
        content.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></div>';

        try {
          const response = await fetch(`/api/${project_id}/sprints/${numero}`);
          const result = await response.json();
          
          if (result.success) {
            const { hus } = result.data;
            if (hus && hus.length > 0) {
              let html = '<div class="list-group list-group-flush">';
              hus.forEach(hu => {
                html += `
                  <div class="list-group-item px-0 py-3 border-light">
                    <div class="d-flex justify-content-between">
                      <h6 class="fw-bold mb-1">HU-${hu.identificador}: ${hu.titulo}</h6>
                    </div>
                    <p class="text-muted small mb-0">${hu.descripcion || 'Sin descripción'}</p>
                  </div>
                `;
              });
              html += '</div>';
              content.innerHTML = html;
            } else {
              content.innerHTML = '<p class="text-center text-muted py-4">No se encontraron HUs en este sprint.</p>';
            }
          } else {
            content.innerHTML = `<p class="text-danger text-center py-4">${result.error}</p>`;
          }
        } catch (error) {
          console.log(error);
          content.innerHTML = '<p class="text-danger text-center py-4">Error al cargar los datos.</p>';
        }
      }

function hideDetailsModal() {
document.getElementById("modal-view-sprint").classList.remove("show");
}