import {
  Injectable, ConflictException, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name:     dto.name,
        email:    dto.email,
        password: hash,
        wallet:   { create: { balance: 0 } }, // carteira criada junto com o usuário
      },
      include: { wallet: true },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where:   { email: dto.email },
      include: { wallet: true },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: any) {
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return {
      accessToken: token,
      user: {
        id:      user.id,
        name:    user.name,
        email:   user.email,
        balance: user.wallet?.balance ?? 0,
      },
    };
  }
}
