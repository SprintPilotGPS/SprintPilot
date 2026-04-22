document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("sprintModal");
  const form = document.getElementById("sprintForm");

  // Abrir modal
  const openBtn = document.querySelectorAll(".openModalSprintCreate");
  openBtn.forEach((e) => e.onclick = () => modal.classList.add("show"));

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

  let goalElem = document.querySelector("#sprintGoal");
  if(goalElem){
    goalElem.onkeyup = async (e) => {
      if(e.code == "Enter"){
        const projectId = document.querySelector("#project_id").value;
        const id = document.querySelector("#sprintId").value;
        let sprintGoal = goalElem.value;

        try {
          const response = await fetch(`/api/${projectId}/sprint/${id}/goal`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({sprintGoal})
          });

          const result = await response.json();

          if (response.ok) {
            console.log("Sprint Goal actualizado");
            goalElem.blur();
          } else {
            alert(result.error || "Error al cambiar el sprint goal");
          }

        } catch (error) {
          console.error("Error:", error);
          alert("Error de conexión con el servidor");
        }
      }
    }
  }
});