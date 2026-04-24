document.addEventListener('DOMContentLoaded', () => {
  const comoInput = document.getElementById('como');
  const siInput = document.getElementById('si');
  const entoncesInput = document.getElementById('entonces');
  const preview = document.getElementById('preview');
  const caForm = document.getElementById('caForm');

  if (!comoInput || !siInput || !entoncesInput || !preview || !caForm) return;

  function updatePreview() {
    const como = comoInput.value.trim();
    const si = siInput.value.trim();
    const entonces = entoncesInput.value.trim();

    if (como || si || entonces) {
      let html = "";
      if (como) html += `<strong>Como</strong>&nbsp;${como}`;
      if (si) html += (html ? `,&nbsp;<strong>si</strong>&nbsp;${si}` : `<strong>Si</strong>&nbsp;${si}`);
      if (entonces) html += (html ? `,&nbsp;<strong>entonces</strong>&nbsp;${entonces}` : `<strong>Entonces</strong>&nbsp;${entonces}`);
      
      if (html) html += ".";

      preview.innerHTML = html;
      preview.classList.add('active');
    } else {
      preview.textContent = "Empieza a escribir para ver el resultado...";
      preview.classList.remove('active');
    }
  }

  comoInput.addEventListener('input', updatePreview);
  siInput.addEventListener('input', updatePreview);
  entoncesInput.addEventListener('input', updatePreview);

  caForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const finalCA = preview.textContent;
    console.log("Criterio a guardar:", finalCA);
    alert("Criterio guardado (simulado):\n" + finalCA);
    // Aquí iría el envío al backend en el futuro
  });
});
