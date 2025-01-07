const request = require('supertest');
const app = require('../index');
const { generaToken } = require('../services/jwttoken.js');

const TOKEN = generaToken({
    email: '1',
    password: 'DonajiPaolas@15',
    role: 'medico',
});

describe('GET /api/consultaEmergencia/obtenerConsultaEmergencia:CURP', () => {
    const endpoint = '/api/consultaEmergencia/obtenerConsultaEmergencia/';
    
    test('Devolver 404 si no se encuentran consultas para la CURP proporcionada', async () => {
        const response = await request(app).get(endpoint + 'JUPR900515HDFRZN11')
        .set('Authorization', `Bearer ${TOKEN}`);

        expect(response.status).toBe(404);
        expect(response.body.mensaje).toBe('No se encontraron consultas de emergencia para la CURP proporcionada.');
    });

    test('Devolver 200 si se obtiene la consulta de emergencia', async () => {
        const response = await request(app).get(endpoint + 'JUPR900515HDFRZN01')
        .set('Authorization', `Bearer ${TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe('Consulta de emergencia obtenida correctamente');
        expect(response.body.consultaEmergencia).toBeDefined();
    });
});

describe('POST /api/consultaEmergencia/insertar', () => {
    const endpoint = '/api/consultaEmergencia/insertar';

    test('Devolver 400 si faltan campos obligatorios', async () => {
        const response = await request(app)
            .post(endpoint)
            .send({
                diagnosticoEmergencia: 'Fractura',
                tratamientoEmergencia: 'Enyesado',
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Todos los campos son obligatorios');
    });

    test('Devolver 201 si la consulta de emergencia se inserta correctamente', async () => {
        const response = await request(app)
            .post(endpoint)
            .send({
                diagnosticoEmergencia: 'Cortes super profundos',
                tratamientoEmergencia: 'Suturas, muchas, bastantes',
                fechaEmergencia: '2025-01-07',
                idPaciente: 1,
                idPersonalMedico: 1,
            });

        expect(response.status).toBe(201);
        expect(response.body.mensaje).toBe('Consulta de emergencia registrada correctamente.');
    });
});