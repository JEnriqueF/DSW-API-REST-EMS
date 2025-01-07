const request = require('supertest');
const app = require('../index');
const { generaToken } = require('../services/jwttoken.js');

const TOKEN = generaToken({
    email: '1',
    password: 'DonajiPaolas@15',     
    role: 'medico',             
});

describe('PUT /api/paciente/validarPaciente/:CURP', () => {
    test('Paciente validado correctamente', async () => {
        const CURP = 'GOAL950310MDFRZS09';
        const response = await request(app)
            .put(`/api/paciente/validarPaciente/${CURP}`)
            .set('Authorization', `Bearer ${TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe('Paciente validado correctamente.');
    });

    test('CURP no encontrado', async () => {
        const CURP = 'CURPNOEXISTE000';
        const response = await request(app)
            .get(`/api/paciente/validarPaciente/${CURP}`)
            .set('Authorization', `Bearer ${TOKEN}`);

        expect(response.status).toBe(404); 
    });
});

describe('GET /api/paciente/verificarValidacion/:idPaciente', () => {
    test('Paciente está validado', async () => {
        const response = await request(app)
            .get('/api/paciente/verificarValidacion/1') 
            .set('Authorization', `Bearer ${TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe('El paciente está validado.');
    });

    test('Paciente no está validado', async () => {
        const response = await request(app)
            .get('/api/paciente/verificarValidacion/13')
            .set('Authorization', `Bearer ${TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe('El paciente no está validado.');
    });

    test('Paciente no existe', async () => {
        const response = await request(app)
            .get('/api/paciente/verificarValidacion/9999') 
            .set('Authorization', `Bearer ${TOKEN}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Paciente no encontrado');
    });
});
