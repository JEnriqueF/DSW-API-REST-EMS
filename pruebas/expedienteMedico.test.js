const request = require('supertest');
const app = require('../index');
const { generaToken } = require('../services/jwttoken.js');

const TOKEN = generaToken({
    email: '1',
    password: 'DonajiPaolas@15',     
    role: 'medico',             
});

describe('PUT /api/expedienteMedico/corregirExpedienteMedico/:CURP', () => {
    const CURP = 'NAAD010415MVZVRU77';

    test('Corregir el expediente médico', async () => {
        const response = await request(app)
            .put(`/api/expedienteMedico/corregirExpedienteMedico/${CURP}`)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                alergias: 'Jugo',
                enfermedadesCronicas: 'De',
                tratamientoActual: 'Algo',
            });

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe('Expediente médico actualizado correctamente.');
    });
});

describe('POST /api/expedienteMedico/recuperar', () => {
    test('Debe devolver el expediente médico correctamente si el CURP es válido', async () => {
        const CURP = 'NAAD010415MVZVRN77';
        const response = await request(app)
            .post('/api/expedienteMedico/recuperar')
            .send({ CURP });

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBeDefined();
        expect(response.body.resultado).toBeDefined();
    });
});

describe('PUT /api/expedienteMedico/modificar', () => {
    const CURP = 'JUPR900515HDFRZN01';

    test('Modificar el expediente médico correctamente si el CURP existe', async () => {
        const response = await request(app)
            .put(`/api/expedienteMedico/modificar`)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                CURP, 
                alergias: 'Agua',
                enfermedadesCronicas: 'Cate',
            });

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe('Expediente actualizado.');
    });
});