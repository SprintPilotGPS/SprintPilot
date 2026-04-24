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

  const goalInput = document.getElementById("sprintGoal");
  const goalError = document.getElementById("sprintGoalError");
  const goalErrorText = document.getElementById("goalErrorText");
  const goalCounter = document.getElementById("goalCounter");

  if (goalInput) {
    const showGoalError = (message) => {
      if (goalError && goalErrorText) {
        goalErrorText.innerText = message;
        goalError.classList.remove("d-none");
        goalInput.classList.add("is-invalid");
      }
    };

    const hideGoalError = () => {
      if (goalError) {
        goalError.classList.add("d-none");
        goalInput.classList.remove("is-invalid");
      }
    };

    const updateCounter = () => {
      const length = goalInput.value.length;
      if (goalCounter) {
        goalCounter.innerText = `${length}/250`;
        if (length > 250) {
          goalCounter.classList.replace("text-muted", "text-danger");
          showGoalError("El Sprint Goal no puede superar los 250 caracteres.");
        } else {
          goalCounter.classList.replace("text-danger", "text-muted");
          if (length > 0) hideGoalError(); // Only hide if not empty, or hide if it was just over limit
          // Actually, we usually want to hide error if user is correcting it
          if (goalErrorText && goalErrorText.innerText.includes("250")) {
             hideGoalError();
          }
        }
      }
    };

    // Initialize counter
    updateCounter();

    goalInput.addEventListener("input", updateCounter);

    goalInput.onkeyup = async (e) => {
      if(e.code == "Enter"){
        const sprintGoal = goalInput.value.trim();

        if (goalInput.value.length > 250) {
          showGoalError("El Sprint Goal no puede superar los 250 caracteres.");
          return;
        }

        if (!sprintGoal) {
          showGoalError("El Sprint Goal no puede estar vacío.");
          return;
        }

        hideGoalError(); // Clear errors before sending

        const projectId = document.getElementById("project_id").value;
        const id = document.getElementById("sprintId").value;

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
            goalInput.blur();
            // Success feedback
            goalInput.style.borderBottomColor = "#48bb78";
            setTimeout(() => goalInput.style.borderBottomColor = "", 1000);
          } else {
            showGoalError(result.error || "Error al cambiar el sprint goal");
          }

        } catch (error) {
          console.error("Error:", error);
          showGoalError("Error de conexión con el servidor");
        }
      }
    };
  }

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