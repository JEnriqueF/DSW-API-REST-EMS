const request = require('supertest');
const app = require('../index');

describe('POST /api/iniciarSesion/iniciarSesion', () => {
    const endpoint = '/api/iniciarSesion/iniciarSesion';

    test('Devolver error 400 si faltan credenciales o rol', async () => {
        const response = await request(app)
            .post(endpoint)
            .send({
                email: '',
                password: '',
                role: '',
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Faltan credenciales o el rol para iniciar sesión.');
    });

    test('Devolver error 401 si las credenciales son incorrectas', async () => {
        const response = await request(app)
            .post(endpoint)
            .send({
                email: 'test@example.com',
                password: 'wrongpassword',
                role: 'admin',
            });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Credenciales incorrectas.');
    });

    test('Devolver token si las credenciales son correctas (admin)', async () => {
        const response = await request(app)
            .post(endpoint)
            .send({
                email: 'dnieta@gmail.com',
                password: 'DonajiPaolas@15',
                role: 'admin',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Inicio de sesión exitoso.');
        expect(response.body.token).toBeDefined();
        expect(response.body.role).toBe('admin');
    });

    test('Devolver token si las credenciales son correctas (medico)', async () => {
        const response = await request(app)
            .post(endpoint)
            .send({
                email: '1',
                password: 'DonajiPaolas@15',
                role: 'medico',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Inicio de sesión exitoso.');
        expect(response.body.token).toBeDefined(); 
        expect(response.body.role).toBe('medico');
    });

    test('Devolver token si las credenciales son correctas (paciente)', async () => {
        const response = await request(app)
            .post(endpoint)
            .send({
                email: 'PEVY060503MPZXZSA0',
                password: 'DonajiPaolas@15',
                role: 'paciente',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Inicio de sesión exitoso.');
        expect(response.body.token).toBeDefined(); 
        expect(response.body.role).toBe('paciente');
    });
});
