const request = require('supertest');
const app = require('../index');  

describe('GET /api/hospital/obtenerHospitales', () => {

    test('Devolver lista de hospitales con status 200', async () => {
        const response = await request(app).get('/api/hospital/obtenerHospitales');

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array); 
    });
});
