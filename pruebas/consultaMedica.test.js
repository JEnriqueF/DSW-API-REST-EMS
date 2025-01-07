const request = require('supertest');
const app = require('../index');
const { generaToken } = require('../services/jwttoken.js');

const TOKEN = generaToken({
    email: '1',
    password: 'DonajiPaolas@15',
    role: 'medico',
});

describe('POST /api/consultaMedica/recuperarConsultas', () => {
    const endpoint = '/api/consultaMedica/recuperarConsultas';

    test('Devolver 400 si no se proporciona CURP', async () => {
        const response = await request(app).post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.mensaje).toBe('CURP es obligatorio');
    });

    test('Devolver 404 si no se encuentran consultas para la CURP proporcionada', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({ CURP: 'NAAD010415MVZVRN79' }); 
        expect(response.status).toBe(404);
        expect(response.body.mensaje).toBe('CURP no encontrada.');
    });

    test('Devolver 200 si se obtienen las consultas médicas', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({ CURP: 'JUPR900515HDFRZN01' });
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });
});

describe('POST /api/consultaMedica/totalConsultas', () => {
    const endpoint = '/api/consultaMedica/totalConsultas';

    test('Devolver 400 si no se proporciona CURP', async () => {
        const response = await request(app).post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.mensaje).toBe('CURP es obligatorio');
    });

    test('Devolver 200 si se obtiene el total de consultas médicas', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({ CURP: 'JUPR900515HDFRZN01' }); 
        expect(response.status).toBe(200);
        expect(response.body.totalConsultas).toBeDefined();
    });
});

describe('POST /api/consultaMedica/insertarConsultaMedica', () => {
    const endpoint = '/api/consultaMedica/insertarConsultaMedica';

    test('Devolver 200 si la consulta médica se inserta correctamente', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                diagnostico: 'Oso',
                tratamiento: 'Tigre',
                fechaConsulta: '2025-01-07',
                idPaciente: 14,
                idPersonalMedico: 13,
            });

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe('Consulta médica insertada y tratamiento actualizado con éxito');
        expect(response.body.idConsultaMedica).toBeDefined();
    });
});

describe('POST /api/consultaMedica/insertarArchivoConsulta', () => {
    const endpoint = '/api/consultaMedica/insertarArchivoConsulta';

    test('Devolver 400 si no se ha recibido ningún archivo', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({ idConsultaMedica: 1 });
        expect(response.status).toBe(400);
        expect(response.body.mensaje).toBe('No se ha recibido ningún archivo.');
    });

    test('Devolver 200 si el archivo se sube correctamente', async () => {
        const response = await request(app)
            .post(endpoint)
            .field('idConsultaMedica', 6)
            .set('Authorization', `Bearer ${TOKEN}`)
            .attach('archivo', `${__dirname}/archivosPruebas/recetaTest.pdf`);
        
        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe('Archivo subido correctamente');
    });
});

describe('POST /api/consultaMedica/verificarArchivo', () => {
    const endpoint = '/api/consultaMedica/verificarArchivo';

    test('Devolver 400 si no se proporciona idConsultaMedica', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.mensaje).toBe('El idConsultaMedica es obligatorio');
    });

    test('Devolver 200 si no hay archivo asociado a la consulta médica', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({ idConsultaMedica: 8 });
        expect(response.status).toBe(200);
        expect(response.body.archivoAsociado).toBe(false);
    });

    test('Devolver 200 si el archivo está asociado a la consulta médica', async () => {
        const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({ idConsultaMedica: 4 });
        expect(response.status).toBe(200);
        expect(response.body.archivoAsociado).toBe(true);
    });
});

describe('GET /api/consultaMedica/obtenerArchivoConsulta/:idConsultaMedica', () => {
    const endpoint = '/api/consultaMedica/obtenerArchivoConsulta/';

    test('Devolver 404 si no se encuentra el archivo asociado a la consulta médica', async () => {
        const response = await request(app)
            .get(endpoint + '999')
            .set('Authorization', `Bearer ${TOKEN}`); 
        expect(response.status).toBe(404);
        expect(response.body.mensaje).toBe('No se encontró el archivo asociado a la consulta médica.');
    });

    test('Devolver 200 si se obtiene el archivo asociado a la consulta médica', async () => {
        const response = await request(app)
            .get(endpoint + '4')        
            .set('Authorization', `Bearer ${TOKEN}`)
            ; 
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/pdf');
    });
});

