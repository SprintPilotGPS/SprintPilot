document.addEventListener("DOMContentLoaded", () => {
  const sprintModal = document.getElementById("sprintModal");
  const sprintForm = document.getElementById("sprintForm");
  const huSelectionModal = document.getElementById("selectionModal");
  const huSelectionForm = document.getElementById("huSelectionForm");
  const goalInput = document.getElementById("sprintGoal");
  const goalError = document.getElementById("sprintGoalError");
  const goalErrorText = document.getElementById("goalErrorText");
  const goalCounter = document.getElementById("goalCounter");

  // Abrir modal de crear sprint
  const openBtn = document.querySelectorAll(".openModalSprintCreate");
  openBtn.forEach((e) => {
    e.onclick = () => {
      const validation = checkSprintGoalRequirement();
      if (!validation.valid) {
        showGoalError(validation.error);
        goalInput.focus();
        goalInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      sprintModal.classList.add("show");
    }
  });

  // Cerrar modal de crear sprint
  const closeSprintBtn = document.getElementById("closeSprintModal");
  if (closeSprintBtn) {
    closeSprintBtn.onclick = () => {
      sprintModal.classList.remove("show");
      sprintForm.reset();
    };
  }

  // Para no poder terminar el sprint sin un goal
  const checkSprintGoalRequirement = () => {
    if (!goalInput) return { valid: true };
    const length = goalInput.value.trim().length;
    if (length === 0) return { valid: false, error: "No puedes iniciar un nuevo sprint hasta que el actual tenga un objetivo." };
    if (length > 250) return { valid: false, error: "No puedes iniciar un nuevo sprint si el objetivo actual supera los 250 caracteres." };
    return { valid: true };
  };

  /* ------ Para el Sprint Goal ------ */
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

  if (goalInput) {
    const updateCounter = () => {
      const length = goalInput.value.length;
      if (goalCounter) {
        goalCounter.innerText = `${length}/250`;
        if (length > 250) {
          goalCounter.classList.replace("text-muted", "text-danger");
          showGoalError("El Sprint Goal no puede superar los 250 caracteres.");
        } else {
          goalCounter.classList.replace("text-danger", "text-muted");
          if (length > 0) {
            if (goalErrorText && (goalErrorText.innerText.includes("250") || goalErrorText.innerText.includes("objetivo"))) {
              hideGoalError();
            }
          }
        }
      }
    };

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

        hideGoalError();
        const projectId = document.getElementById("project_id").value;
        const id = document.getElementById("sprintId").value;

        try {
          const response = await fetch(`/api/${projectId}/sprint/${id}/goal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({sprintGoal})
          });

          if (response.ok) {
            goalInput.blur();
            goalInput.style.borderBottomColor = "#48bb78";
            setTimeout(() => goalInput.style.borderBottomColor = "", 1000);
          } else {
            const result = await response.json();
            showGoalError(result.error || "Error al cambiar el sprint goal");
          }
        } catch (error) {
          showGoalError("Error de conexión con el servidor");
        }
      }
    };
  }

  /* ------ Para el Form Sprint ------ */
  if (sprintForm) {
    sprintForm.onsubmit = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const fechaFin = document.getElementById("fechaFin").value;
      const projectId = document.getElementById("project_id").value;

      // Capturamos el objetivo actual para guardarlo en el último momento si ha cambiado
      const currentGoal = goalInput ? goalInput.value.trim() : "";

      if (currentGoal.length > 250) {
        showGoalError("El objetivo del sprint actual no puede superar los 250 caracteres.");
        goalInput.focus();
        return;
      }

      const data = { 
        fechaFin,
        currentGoal
      };

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
