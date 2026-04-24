document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("sprintModal");
  const form = document.getElementById("sprintForm");
  const goalInput = document.getElementById("sprintGoal");
  const goalError = document.getElementById("sprintGoalError");
  const goalErrorText = document.getElementById("goalErrorText");
  const goalCounter = document.getElementById("goalCounter");

  const checkSprintGoalRequirement = () => {
    if (!goalInput) return { valid: true };
    const length = goalInput.value.trim().length;
    if (length === 0) return { valid: false, error: "No puedes iniciar un nuevo sprint hasta que el actual tenga un objetivo." };
    if (length > 250) return { valid: false, error: "No puedes iniciar un nuevo sprint si el objetivo actual supera los 250 caracteres." };
    return { valid: true };
  };

  // Abrir modal
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
      modal.classList.add("show");
    }
  });

  // Cerrar modal
  const closeBtn = document.getElementById("closeModal");
  closeBtn.onclick = () => {
    modal.classList.remove("show");
    form.reset();
  };

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

  if (!form) return;

  form.onsubmit = async (e) => {
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
      currentGoal // Enviamos el objetivo actual para que el backend lo persista al cerrar el sprint
    };

    try {
      const response = await fetch(`/api/${projectId}/crearSprint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const result = await response.json();
        alert(result.error || "Error al crear el sprint");
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  };
});