document.addEventListener('DOMContentLoaded', () => {
    const addForm = document.getElementById('addHUForm');

    if (addForm) {
        // Usamos onclick o onsubmit directo para asegurar que solo haya UN controlador
        addForm.onsubmit = async (e) => {
            e.preventDefault();
            e.stopImmediatePropagation(); // Detiene cualquier otro trigger fantasma

            const projectId = document.getElementById('project_id').value;
            const formData = new FormData(addForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`/api/${projectId}/hus`, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    // Si todo va bien, recargamos la página para ver el nuevo hu
                    window.location.reload();
                } else {
                    alert(result.error || "Error al guardar el hu");
                }
            } catch (error) {
                console.error("Error en la petición fetch:", error);
                alert("Error de conexión con el servidor");
            }
        };
    }

    // Lógica de Flechas (Movimiento)
    document.querySelectorAll(".action-buttons").forEach((action) => {
        let req_id = action.querySelector("input").value;
        action.querySelector(".move-up").onclick = e => moverArriba(req_id);
        action.querySelector(".move-down").onclick = e => moverAbajo(req_id);
    });

    async function moverArriba(id) {
    try {
        const project_id = document.querySelector("#project_id").value;
        const response = await fetch(`/api/${project_id}/hus/${id}/mover-arriba`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) location.reload();
        else alert("No se puede subir más este hu");
    } catch (error) { console.error("Error:", error); }
    }

    async function moverAbajo(id) {
    try {
        const project_id = document.querySelector("#project_id").value;
        const response = await fetch(`/api/${project_id}/hus/${id}/mover-abajo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) location.reload();
        else alert("No se puede bajar más este hu");
    } catch (error) { console.error("Error:", error); }
    }

    // Lógica de Guardado (SIN DUPLICADOS)
    // Usamos .onsubmit para asegurarnos de que solo haya un controlador de evento
    const form = document.getElementById('addHUForm');
    if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        const projectId = document.getElementById('project_id').value;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
        const response = await fetch(`/api/${projectId}/hus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            location.reload();
        } else {
            const result = await response.json();
            alert(result.error || "Error al guardar");
        }
        } catch (error) {
        console.error("Error:", error);
        }
    };
    }
    
});