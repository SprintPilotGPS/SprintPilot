const Proyectos = require("../models/Proyecto");
const Requisito = require("../models/Requisito");

const getAllProyectos = async (req, res) => {
    try {
        const proyectos = await Proyectos.find();
        res.render("frontendProyectos", {
            title: "Lista de Proyectos",
            proyectos: proyectos
        });
        console.log("Enviado la lista de proyectos correctamente");
    } catch (error) {
        console.error("Error: no se pudo cargar los proyectos");
        res.status(500).render("frontendProyectos", {
            title: "Error Lista de Proyectos",
            proyectos: [],
            error: "No se pudo cargar la lista."
        });
    }
};

module.exports = {
    getAllProyectos
}