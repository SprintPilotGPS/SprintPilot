document.addEventListener('DOMContentLoaded', () => {
    const addForm = document.getElementById('addRequisitoForm');

    if (addForm) {
        // Usamos onclick o onsubmit directo para asegurar que solo haya UN controlador
        addForm.onsubmit = async (e) => {
            e.preventDefault();
            e.stopImmediatePropagation(); // Detiene cualquier otro trigger fantasma

            const projectId = document.getElementById('project_id').value;
            const formData = new FormData(addForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`/api/${projectId}/requisitos`, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    // Si todo va bien, recargamos la página para ver el nuevo requisito
                    window.location.reload();
                } else {
                    alert(result.error || "Error al guardar el requisito");
                }
            } catch (error) {
                console.error("Error en la petición fetch:", error);
                alert("Error de conexión con el servidor");
            }
        };
    }
});