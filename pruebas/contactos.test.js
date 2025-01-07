const request = require('supertest');
const app = require('../index');
const { generaToken } = require('../services/jwttoken.js');

const TOKEN = generaToken({
    email: '1',
    password: 'DonajiPaolas@15',
    role: 'medico',
});

describe('GET /api/contactos/obtenerContactos/:idPaciente', () => {

    test('Devolver 200 y la lista de contactos de emergencia', async () => {
        const response = await request(app)
            .get('/api/contactos/obtenerContactos/12')
            .set('Authorization', `Bearer ${TOKEN}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('Devolver 404 si no se encuentra al paciente', async () => {
        const response = await request(app)
            .get('/api/constactos/obtenerContactos/999999')
            .set('Authorization', `Bearer ${TOKEN}`);

        expect(response.status).toBe(404);
    });
});

describe('POST /api/contactos/insertarContacto', () => {
    test('Devolver 200 si el contacto de emergencia se inserta correctamente', async () => {
        const response = await request(app)
            .post('/api/contactos/insertarContacto')
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                contactoEmergencia: 'Carlos Sultano',
                telefonoContacto1: '0987654321',
                parentesco: 'Hermano',
                esTutor: false,
                idPaciente: 12,
                esRegistroPaciente: true,
            });

        expect(response.status).toBe(200);
    });
});

describe('PUT /api/actualizarContacto', () => {
    test('Devolver 200 si el contacto de emergencia se actualiza correctamente', async () => {
        const response = await request(app)
            .put('/api/contactos/actualizarContacto')
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                idPaciente: 12,
                idInformacionEmergencia: 25,
                telefonoContacto1: '9999999',
                parentesco: 'Primo',
                esTutor: false,
            });

        expect(response.status).toBe(200);
    });
});

describe('DELETE /api/contactos/eliminarContacto/:idInformacionEmergencia', () => {
    test('Devolver 404 si no se proporciona un ID de contacto', async () => {
        const response = await request(app)
            .delete('/api/contactos/eliminarContacto/')
            .set('Authorization', `Bearer ${TOKEN}`);

        expect(response.status).toBe(404);
    });

    test('Devolver 200 si el contacto de emergencia se elimina correctamente', async () => {
        const response = await request(app)
            .delete('/api/contactos/eliminarContacto/27')
            .set('Authorization', `Bearer ${TOKEN}`);

        expect(response.status).toBe(200);
    });
});