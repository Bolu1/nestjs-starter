/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, UserDetails } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

  async signup(dto: AuthDto) {
    try {

      if(dto.password.length<6){
          throw new ForbiddenException('Password is too short')
      }

      const hash = await argon.hash(dto.password);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      delete user.hash;
      return user;
    } catch (error) {
        if(error instanceof PrismaClientKnownRequestError){
            if(error.code === 'P2002'){
                throw new ForbiddenException("Credentials taken")
            }
        }
        throw error
    }
  }

  async signin(dto:AuthDto) {

    const user = await this.prisma.user.findMany({
        where:{
            email: dto.email,
        }
    })
    if(!user[0]){
        throw new ForbiddenException('Invalid login credentials')
    }
    const match = await argon.verify(user[0].hash, dto.password)
    if(!match){
        throw new ForbiddenException('Invalid login credentials')
    }

    return this.signToken(user[0].id, user[0].email)
    }

    signToken(userId: any, email:string):Promise<string>{
            const payload ={
                sub: userId,
                email
            }
            const secret = this.config.get("JWT_SECRET")
            return this.jwt.signAsync(payload, {expiresIn: '15m', secret: secret})
        }
  }


