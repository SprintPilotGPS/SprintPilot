document.addEventListener("DOMContentLoaded", () => {
  const sprintModal = document.getElementById("sprintModal");
  const sprintForm = document.getElementById("sprintForm");
  const huSelectionModal = document.getElementById("selectionModal");
  const huSelectionForm = document.getElementById("huSelectionForm");

  // Abrir modal de crear sprint
  const openSprintBtn = document.querySelectorAll(".openModalSprintCreate");
  openSprintBtn.forEach((e) => {
    e.onclick = () => sprintModal.classList.add("show");
  });

  // Cerrar modal de crear sprint
  const closeSprintBtn = document.getElementById("closeSprintModal");
  if (closeSprintBtn) {
    closeSprintBtn.onclick = () => {
      sprintModal.classList.remove("show");
      sprintForm.reset();
    };
  }

  if (sprintForm) {
    sprintForm.onsubmit = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const fechaFin = document.getElementById("fechaFin").value;
      const projectId = document.getElementById("project_id").value;

      const data = { fechaFin };

      try {
        const response = await fetch(`/api/${projectId}/crearSprint`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          window.location.reload();
        } else {
          alert(result.error || "Error al crear el sprint");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión con el servidor");
      }
    };
  }

  // Abrir modal de selección de HUs
  const openHuSelectionBtn = document.querySelectorAll(".openModalAniadirHUs");
  openHuSelectionBtn.forEach((e) => {
    e.onclick = () => huSelectionModal.classList.add("show");
  });

  // Cerrar modal de selección de HUs
  const closeHuSelectionBtn = document.getElementById("closeSelectionModal");
  if (closeHuSelectionBtn) {
    closeHuSelectionBtn.onclick = () => {
      huSelectionModal.classList.remove("show");
    };
  }

  if (huSelectionForm) {
    huSelectionForm.onsubmit = async (e) => {
      e.preventDefault();

      const projectId = document.getElementById("selection_project_id").value;
      const sprintId = document.getElementById("selection_sprint_id").value;

      if (!sprintId) {
        alert("No hay un sprint activo para actualizar.");
        return;
      }

      const huIds = Array.from(document.querySelectorAll(".hu-selection-checkbox:checked")).map(
        (checkbox) => Number(checkbox.value)
      );

      try {
        const response = await fetch(`/api/${projectId}/sprint/${sprintId}/hu`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hu_ids: huIds }),
        });

        const result = await response.json();

        if (response.ok) {
          window.location.reload();
        } else {
          alert(result.error || "Error al actualizar las HUs del sprint");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión con el servidor");
      }
    };
  }
});
