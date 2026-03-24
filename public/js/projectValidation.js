document.getElementById('projectForm').addEventListener('submit', function(e) {
    const nombre = document.getElementById('nombre').value.trim();
    const id = document.getElementById('identificador').value.trim();
    const desc = document.getElementById('descripcion').value.trim();

    // Validación: El ID debe ser un string no vacío
    if (id.length === 0) {
        e.preventDefault();
        alert("El ID es obligatorio.");
        return;
    }

    // Ejemplo: Evitar que el ID tenga espacios (común en IDs de sistemas)
    if (id.includes(" ")) {
        e.preventDefault();
        alert("El ID no debe contener espacios. Usa guiones como 'PROY-01'.");
        return;
    }

    if (nombre.length < 1) {
        e.preventDefault();
        alert("El nombre es demasiado corto.");
        return;
    }

    console.log("Enviando nuevo proyecto con ID string:", id);
});