import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Rank } from 'generated/prisma';

export class createConfigDTO {
  @ApiProperty({
    description: 'Nome da configuração de promoção',
    example: 'Promoção para Faixa Branca',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Rank de referência',
    enum: [
      'BRANCA',
      'CINZA',
      'AMARELA',
      'LARANJA',
      'VERMELHA',
      'ROXA',
      'MARROM',
      'PRETA',
    ],
    example: 'BRANCA',
  })
  @IsEnum([
    'BRANCA',
    'CINZA',
    'AMARELA',
    'LARANJA',
    'VERMELHA',
    'ROXA',
    'MARROM',
    'PRETA',
  ])
  ref_rank: Rank;

  @ApiProperty({
    description: 'Módulo associado à promoção',
    example: "rank",
    nullable:true
  })
  @IsNumber()
  module?: string;

  @ApiProperty({
    description: 'Frequência necessária para promoção',
    example: 80,
  })
  @IsNumber()
  needed_frequency: number;
}

export class updateConfigDTO {
  @ApiPropertyOptional({
    description: 'Nome da configuração de promoção',
    example: 'Promoção para Faixa Branca',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Rank de referência',
    enum: [
      'BRANCA',
      'CINZA',
      'AMARELA',
      'LARANJA',
      'VERMELHA',
      'ROXA',
      'MARROM',
      'PRETA',
    ],
    example: 'BRANCA',
  })
  @IsEnum([
    'BRANCA',
    'CINZA',
    'AMARELA',
    'LARANJA',
    'VERMELHA',
    'ROXA',
    'MARROM',
    'PRETA',
  ])
  @IsOptional()
  ref_rank?: Rank;

  @ApiPropertyOptional({
    description: 'Módulo associado à promoção',
    example: "class",
    nullable:true
  })
  @IsNumber()
  @IsOptional()
  module?: string;

  @ApiPropertyOptional({
    description: 'Frequência necessária para promoção',
    example: 80,
  })
  @IsNumber()
  @IsOptional()
  needed_frequency?: number;
}
