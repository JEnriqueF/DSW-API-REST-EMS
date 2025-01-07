const request = require('supertest');
const app = require('../index');
const { generaToken } = require('../services/jwttoken.js');

const TOKEN = generaToken({
    email: '1',
    password: 'DonajiPaolas@15',
    role: 'medico',
});

describe('POST /api/crearPaciente/crearPaciente', () => {
    const endpoint = '/api/crearPaciente/crearPaciente';

    test('Devolver 400 si faltan datos obligatorios', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                nombre: 'Juan Pérez',
                sexo: 'M',
                correo: 'juan.perez@example.com',
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Faltan datos obligatorios para registrar al paciente.');
    });

    test('Devolver 400 si el formato del correo es inválido', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                nombre: 'Juan Pérez',
                fechaNacimiento: '1990-05-15',
                sexo: 'M',
                correo: 'correo-invalido',
                telefono: '1234567890',
                CURP: 'JUAN900515HDFRZS01',
                contrasena: 'SecurePassword123',
                hospitalRegistro: 1,
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('El formato del correo electrónico no es válido.');
    });

    test('Devolver 400 si el CURP tiene un formato inválido', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                nombre: 'Juan Pérez',
                fechaNacimiento: '1990-05-15',
                sexo: 'M',
                correo: 'juan.perez@example.com',
                telefono: '1234567890',
                CURP: 'CURPINVALIDO123',
                contrasena: 'SecurePassword123',
                hospitalRegistro: 1,
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('El formato del CURP no es válido.');
    });

    test('Devolver 400 si la fecha tiene un formato inválido', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                nombre: 'Juan Pérez',
                fechaNacimiento: '199',
                sexo: 'M',
                correo: 'juan.perez@example.com',
                telefono: '1234567890',
                CURP: 'PEDR900722HDFRZS08',
                contrasena: 'SecurePassword123',
                hospitalRegistro: 1,
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('El formato de la fecha de nacimiento no es válido.');
    });

    test('Devolver 400 si el correo ya está registrado', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                nombre: 'Pedro Gómez',
                fechaNacimiento: '1990-07-22',
                sexo: 'M',
                correo: 'ana.lopez@example.com',
                telefono: '9876543210',
                CURP: 'PEDR900722HDFRZS08',
                contrasena: 'SecurePassword123',
                hospitalRegistro: 1,
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('El correo ya está registrado en el sistema.');
    });

    test('Devolver 201 si el paciente se registra correctamente', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                nombre: 'Alma González',
                fechaNacimiento: '1995-03-10',
                sexo: 'F',
                correo: 'alma.gonzalez@example.com',
                telefono: '9876543210',
                CURP: 'GOAL950310MDFRZS09',
                contrasena: '123',
                alergias: 'Ninguna',
                enfermedadesCronicas: 'Ninguna',
                tratamientoActual: 'Ninguno',
                hospitalRegistro: 2,
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Paciente registrado exitosamente.');
        expect(response.body.idPaciente).toBeDefined();
        expect(response.body.idUsuario).toBeDefined();
    });

});
