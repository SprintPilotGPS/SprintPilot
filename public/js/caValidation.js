document.addEventListener("DOMContentLoaded", () => {
  const cuandoInput = document.getElementById("cuando");
  const siInput = document.getElementById("si");
  const entoncesInput = document.getElementById("entonces");
  const preview = document.getElementById("preview");
  const caForm = document.getElementById("caForm");

  if (!cuandoInput || !siInput || !entoncesInput || !preview || !caForm) return;

  const projectId = caForm.dataset.projectId;
  const huId = caForm.dataset.huId;

  function updatePreview() {
    const cuando = cuandoInput.value.trim();
    const si = siInput.value.trim();
    const entonces = entoncesInput.value.trim();

    if (cuando || si || entonces) {
      let html = "";
      if (cuando) html += `<strong>Cuando</strong>&nbsp;${cuando}`;
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

  cuandoInput.addEventListener("input", updatePreview);
  siInput.addEventListener("input", updatePreview);
  entoncesInput.addEventListener("input", updatePreview);

  caForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isPreviewActive = preview.classList.contains("active");
    const cuando = cuandoInput.value.trim();
    const si = siInput.value.trim();
    const entonces = entoncesInput.value.trim();
    let finalCA = preview.innerHTML;

    if (!isPreviewActive || !finalCA || finalCA.trim() === "" || cuando == "" || entonces == "") {
      document.querySelector("#message").innerHTML = `
        <p class="p-2 bg-warning-subtle fw-bold text-center border border-warning rounded-3">⚠️ Debes rellenar todos los campos obligatorios.</p>
      `;
      return;
    }

    if (!projectId || !huId) {
      document.querySelector("#message").innerHTML = `
        <p class="p-2 bg-danger-subtle fw-bold text-center border border-danger rounded-3">❌ No se encontraron el proyecto o la HU para guardar el criterio</p>
      `;
      return;
    }

    try {
      const response = await fetch(`/api/${projectId}/HU/${huId}/crearCA`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cuando,
          si,
          entonces,
          texto: finalCA,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "Error al guardar");
      }

      console.log("Guardado:", data);
      
      // Redirigir al detalle de la HU para ver el criterio añadido
      window.location.href = `/${projectId}/hus/${huId}/view`;
    } catch (error) {
      console.error(error);
      document.querySelector("#message").innerHTML = `
        <p class="p-2 bg-danger-subtle fw-bold text-center border border-danger rounded-3">❌ Error al guardar el criterio: ${error.message}</p>
      `;
    }
  });
});
