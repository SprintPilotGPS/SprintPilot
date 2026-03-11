const Requisito = require('../models/Requisito');

// conseguir todo los requisitos
const getAllRequisitos = async (req, res) => {
    try {
        const requisitos = await Requisito.find().sort({ fechaLimite: 1 });
        res.render('index', { 
            title: 'Sprint Pilot',
            requisitos: requisitos
        });
    } catch (error) {
        console.error('Error al obtener requisitos:', error);
        res.status(500).render('index', {
            title: 'Sprint Pilot',
            requisitos: [],
            error: 'Error al cargar los datos'
        });
    }
};

// Crear nuevo requisito
const createRequisito = async (req, res) => {
    try {
        const requisito = new Requisito(req.body);
        await requisito.save();
        res.status(201).json({
            success: true,
            data: requisito
        });
    } catch (error) {
        console.error('Error al crear requisito:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};