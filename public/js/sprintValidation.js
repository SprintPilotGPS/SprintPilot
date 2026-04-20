document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("sprintModal");
  const form = document.getElementById("sprintForm");

  // Abrir modal
  const openBtn = document.querySelector(".openModalSprintCreate");
  openBtn.onclick = () => modal.classList.add("show");

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

    const fechaFin = document.getElementById("fechaFin").value;
    const projectId = document.getElementById("project_id").value;

    const data = {fechaFin};

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
});