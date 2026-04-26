document.addEventListener("DOMContentLoaded", () => {
  const comoInput = document.getElementById("como");
  const siInput = document.getElementById("si");
  const entoncesInput = document.getElementById("entonces");
  const preview = document.getElementById("preview");
  const caForm = document.getElementById("caForm");

  if (!comoInput || !siInput || !entoncesInput || !preview || !caForm) return;

  const projectId = caForm.dataset.projectId;
  const huId = caForm.dataset.huId;

  function updatePreview() {
    const como = comoInput.value.trim();
    const si = siInput.value.trim();
    const entonces = entoncesInput.value.trim();

    if (como || si || entonces) {
      let html = "";
      if (como) html += `<strong>Como</strong>&nbsp;${como}`;
      if (si)
        html += html ? `,&nbsp;<strong>si</strong>&nbsp;${si}` : `<strong>Si</strong>&nbsp;${si}`;
      if (entonces)
        html += html
          ? `,&nbsp;<strong>entonces</strong>&nbsp;${entonces}`
          : `<strong>Entonces</strong>&nbsp;${entonces}`;

      if (html) html += ".";

      preview.innerHTML = html;
      preview.classList.add("active");
    } else {
      preview.textContent = "Empieza a escribir para ver el resultado...";
      preview.classList.remove("active");
    }
  }

  comoInput.addEventListener("input", updatePreview);
  siInput.addEventListener("input", updatePreview);
  entoncesInput.addEventListener("input", updatePreview);

  caForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const finalCA = preview.textContent;

    if (!finalCA || finalCA.trim() === "") {
      alert("El criterio está vacío");
      return;
    }

    if (!projectId || !huId) {
      alert("No se encontraron el proyecto o la HU para guardar el criterio");
      return;
    }

    try {
      const response = await fetch(`/api/${projectId}/HU/${huId}/crearCA`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          texto: finalCA,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "Error al guardar");
      }

      console.log("Guardado:", data);
      alert("✅ Criterio guardado correctamente");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar el criterio");
    }
  });
});
