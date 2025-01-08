const request = require('supertest');
const app = require('../index');

describe('GET /api/obtenerPaciente/porCURP/:CURP', () => {
    test('Devolver error 404 si el CURP no se encuentra', async () => {
        const CURP = 'CURPNOEXISTE000';
        const response = await request(app).get(`/api/obtenerPaciente/porCURP/${CURP}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('CURP no encontrada.');
    });

    test('Devolver un paciente si el CURP es encontrado', async () => {
        const CURP = 'JUPR900515HDFRZN01';
        const response = await request(app).get(`/api/obtenerPaciente/porCURP/${CURP}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('CURP encontrada.');
        expect(response.body.data).toHaveProperty('nombre');
    });
    
});
