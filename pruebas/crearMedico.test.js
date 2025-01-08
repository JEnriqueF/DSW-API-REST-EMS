const request = require('supertest');
const app = require('../index');
const { generaToken } = require('../services/jwttoken.js');

const TOKEN = generaToken({
    email: '1',
    password: 'DonajiPaolas@15',
    role: 'medico',
});

describe('POST /api/crearMedico/', () => {
    const endpoint = '/api/crearMedico/';

    test('Devolver error 400 si faltan campos obligatorios', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                CURP: 'TEST010203HDFABC01',
                contrasena: 'password123',
                tipoPersonal: 'Médico',
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Faltan campos obligatorios para registrar al personal médico.');
    });

    test('Devolver error 400 si el tipo de personal no es permitido', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                CURP: 'TEST010203HDFABC01',
                cedulaProfesional: '1234567',
                contrasena: 'password123',
                tipoPersonal: 'NoVálido',
                hospitalTrabajo: 1,
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('El tipo de personal debe ser uno de los siguientes: Médico, Emergencia.');
    });

    test('Devolver error 404 si el CURP no existe', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                CURP: 'NAAD010415MVZVRN79',
                cedulaProfesional: '1234567',
                contrasena: 'password123',
                tipoPersonal: 'Médico',
                hospitalTrabajo: 1,
            });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('CURP no encontrada. No se puede registrar al personal médico.');
    });

    test('Devolver error 400 si ya existe un perfil médico asociado', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                CURP: 'NAAD010415MVZVRN77',
                cedulaProfesional: '1234567',
                contrasena: 'password123',
                tipoPersonal: 'Médico',
                hospitalTrabajo: 1,
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('El usuario ya tiene un perfil médico asociado. No se puede crear otro perfil.');
    });

    test('Devolver 201 si el médico se registra correctamente', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                CURP: 'PEAL950310MDFRZS09',
                cedulaProfesional: '9',
                contrasena: '123',
                tipoPersonal: 'Médico',
                hospitalTrabajo: 1,
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Personal médico registrado exitosamente.');
        expect(response.body.idPersonalMedico).toBeDefined();
    });
});
