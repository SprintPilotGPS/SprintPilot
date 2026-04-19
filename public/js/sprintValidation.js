document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("sprintModal");
  const form = document.getElementById("sprintForm");

  // Abrir modal (para todos los botones que tengan la clase)
  document.querySelectorAll(".openModalSprintCreate").forEach(btn => {
    btn.onclick = () => modal.classList.add("show");
  });

  // Cerrar modal
  const closeBtn = document.getElementById("closeModal");
  closeBtn.onclick = () => {
    modal.classList.remove("show");
    form.reset();
  };

  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    const fechaIni = document.getElementById("fechaIni").value;
    const fechaFin = document.getElementById("fechaFin").value;
    const projectId = document.getElementById("project_id").value;
    
    // Recolectar HUs seleccionadas
    const selectedHUs = Array.from(document.querySelectorAll(".hu-checkbox:checked")).map(cb => Number(cb.value));

    const data = {
      fechaIni,
      fechaFin,
      HU: selectedHUs
    };

    try {
      const response = await fetch(`/api/${projectId}/crearSprint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        // éxito → recargar o actualizar UI
        window.location.reload();
      } else {
        alert(result.error || "Error al crear el sprint");
      }

    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión con el servidor");
    }
  };

  // --- Lógica del nuevo modal "Añadir HU" ---
  const addHUModal = document.getElementById("addHUModal");
  const openAddHUBtn = document.getElementById("openAddHUModal");
  const closeAddHUBtn = document.getElementById("closeAddHUModal");
  const saveAddHUBtn = document.getElementById("saveAddHU");

  if (openAddHUBtn) {
    openAddHUBtn.onclick = () => addHUModal.classList.add("show");
  }

  if (closeAddHUBtn) {
    closeAddHUBtn.onclick = () => {
      addHUModal.classList.remove("show");
      // Desmarcar checkboxes
      document.querySelectorAll(".hu-checkbox-add").forEach(cb => cb.checked = false);
    };
  }

  if (saveAddHUBtn) {
    saveAddHUBtn.onclick = async () => {
      const selectedHUs = Array.from(document.querySelectorAll(".hu-checkbox-add:checked")).map(cb => Number(cb.value));
      const projectId = document.getElementById("project_id").value;
      const sprintId = document.getElementById("current_sprint_id").value;

      if (selectedHUs.length === 0) {
        alert("Selecciona al menos una Historia de Usuario.");
        return;
      }

      try {
        const response = await fetch(`/api/${projectId}/sprints/${sprintId}/add-hus`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ HU: selectedHUs })
        });

        if (response.ok) {
          window.location.reload();
        } else {
          const result = await response.json();
          alert(result.error || "Error al añadir HUs");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión");
      }
    };
  }
});