import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Carteira — Testes de Integração (e2e)', () => {
  let app:    INestApplication;
  let prisma: PrismaService;

  let tokenAlice:  string;
  let tokenBruno:  string;
  let aliceId:     string;
  let brunoId:     string;
  let depositTxId: string;
  let transferTxId: string;

  // Setup
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);

    // Aqui limpo o banco de teste
    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  // AUTH
  describe('POST /auth/register', () => {
    it('deve criar Alice com sucesso', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Alice Test', email: 'alice@test.dev', password: 'senha123' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toBe('alice@test.dev');
      tokenAlice = res.body.accessToken;
      aliceId    = res.body.user.id;
    });

    it('deve criar Bruno com sucesso', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Bruno Test', email: 'bruno@test.dev', password: 'senha123' })
        .expect(201);

      tokenBruno = res.body.accessToken;
      brunoId    = res.body.user.id;
    });

    it('deve rejeitar e-mail duplicado (409)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Duplicado', email: 'alice@test.dev', password: 'senha123' })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('deve logar com credenciais corretas', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'alice@test.dev', password: 'senha123' })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
    });

    it('deve rejeitar credenciais inválidas (401)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'alice@test.dev', password: 'errada' })
        .expect(401);
    });
  });

  // WALLET
  describe('GET /wallet/balance', () => {
    it('deve retornar saldo zerado após registro', async () => {
      const res = await request(app.getHttpServer())
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${tokenAlice}`)
        .expect(200);

      expect(Number(res.body.balance)).toBe(0);
    });

    it('deve rejeitar sem token (401)', async () => {
      await request(app.getHttpServer()).get('/wallet/balance').expect(401);
    });
  });

  describe('POST /wallet/deposit', () => {
    it('deve depositar R$500 para Alice', async () => {
      const res = await request(app.getHttpServer())
        .post('/wallet/deposit')
        .set('Authorization', `Bearer ${tokenAlice}`)
        .send({ amount: 500, description: 'Depósito inicial' })
        .expect(201);

      expect(Number(res.body.balance)).toBe(500);
      expect(res.body.transaction.type).toBe('DEPOSIT');
      depositTxId = res.body.transaction.id;
    });

    it('deve rejeitar valor negativo (400)', async () => {
      await request(app.getHttpServer())
        .post('/wallet/deposit')
        .set('Authorization', `Bearer ${tokenAlice}`)
        .send({ amount: -10 })
        .expect(400);
    });

    it('deve depositar em saldo negativo e acrescentar ao valor', async () => {
      await prisma.wallet.update({
        where: { userId: brunoId },
        data:  { balance: -100 },
      });

      const res = await request(app.getHttpServer())
        .post('/wallet/deposit')
        .set('Authorization', `Bearer ${tokenBruno}`)
        .send({ amount: 150 })
        .expect(201);

      // -100 + 150 = 50
      expect(Number(res.body.balance)).toBe(50);
    });
  });

  describe('POST /wallet/transfer', () => {
    it('deve transferir R$100 de Alice para Bruno', async () => {
      const res = await request(app.getHttpServer())
        .post('/wallet/transfer')
        .set('Authorization', `Bearer ${tokenAlice}`)
        .send({ receiverUserId: brunoId, amount: 100, description: 'Teste' })
        .expect(201);

      expect(Number(res.body.balance)).toBe(400); // Alice: 500 - 100
      transferTxId = res.body.transaction.id;
    });

    it('deve rejeitar auto-transferência (400)', async () => {
      await request(app.getHttpServer())
        .post('/wallet/transfer')
        .set('Authorization', `Bearer ${tokenAlice}`)
        .send({ receiverUserId: aliceId, amount: 10 })
        .expect(400);
    });

    it('deve rejeitar saldo insuficiente (422)', async () => {
      await request(app.getHttpServer())
        .post('/wallet/transfer')
        .set('Authorization', `Bearer ${tokenAlice}`)
        .send({ receiverUserId: brunoId, amount: 9999 })
        .expect(422);
    });
  });

  describe('POST /wallet/reverse/:id', () => {
    it('deve reverter o depósito de Alice', async () => {
      await request(app.getHttpServer())
        .post(`/wallet/reverse/${depositTxId}`)
        .set('Authorization', `Bearer ${tokenAlice}`)
        .expect(200);

      // Verificar o saldo: 400 - 500 = -100
      const res = await request(app.getHttpServer())
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${tokenAlice}`)
        .expect(200);

      expect(Number(res.body.balance)).toBe(-100);
    });

    it('deve rejeitar reversão duplicada (400)', async () => {
      await request(app.getHttpServer())
        .post(`/wallet/reverse/${depositTxId}`)
        .set('Authorization', `Bearer ${tokenAlice}`)
        .expect(400);
    });

    it('deve reverter a transferência', async () => {
      await request(app.getHttpServer())
        .post(`/wallet/reverse/${transferTxId}`)
        .set('Authorization', `Bearer ${tokenAlice}`)
        .expect(200);
    });
  });

  describe('GET /wallet/transactions', () => {
    it('deve listar transações com paginação', async () => {
      const res = await request(app.getHttpServer())
        .get('/wallet/transactions?page=1&limit=10')
        .set('Authorization', `Bearer ${tokenAlice}`)
        .expect(200);

      expect(res.body.items).toBeDefined();
      expect(res.body.total).toBeGreaterThan(0);
      expect(res.body.page).toBe(1);
    });
  });
});
