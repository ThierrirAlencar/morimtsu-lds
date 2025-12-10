import { PrismaClient, Rank } from "@prisma/client";


const prisma = new PrismaClient();

interface PromotionConfigSeed {
  name: string;
  ref_rank: Rank;
  module: string;
  needed_frequency: number;
}

async function main() {
  console.log('🌱 Iniciando seed de configurações de promoção...');

  const promotionConfigs: PromotionConfigSeed[] = [
    {
      name: 'Promoção para Faixa Branca',
      ref_rank: 'BRANCA',
      module: 'app',
      needed_frequency: 80,
    },
    {
      name: 'Promoção para Faixa Cinza Branca',
      ref_rank: 'CINZA_BRANCA',
      module: 'app',
      needed_frequency: 85,
    },
    {
      name: 'Promoção para Faixa Cinza',
      ref_rank: 'CINZA',
      module: 'app',
      needed_frequency: 85,
    },
    {
      name: 'Promoção para Faixa Cinza Preta',
      ref_rank: 'CINZA_PRETA',
      module: 'app',
      needed_frequency: 85,
    },
    {
      name: 'Promoção para Faixa Amarela Branca',
      ref_rank: 'AMARELA_BRANCA',
      module: 'app',
      needed_frequency: 90,
    },
    {
      name: 'Promoção para Faixa Amarela',
      ref_rank: 'AMARELA',
      module: 'app',
      needed_frequency: 90,
    },
    {
      name: 'Promoção para Faixa Amarela Preta',
      ref_rank: 'AMARELA_PRETA',
      module: 'app',
      needed_frequency: 90,
    },
    {
      name: 'Promoção para Faixa Laranja Branca',
      ref_rank: 'LARANJA_BRANCA',
      module: 'app',
      needed_frequency: 95,
    },
    {
      name: 'Promoção para Faixa Laranja',
      ref_rank: 'LARANJA',
      module: 'app',
      needed_frequency: 95,
    },
    {
      name: 'Promoção para Faixa Laranja Preta',
      ref_rank: 'LARANJA_PRETA',
      module: 'app',
      needed_frequency: 95,
    },
    {
      name: 'Promoção para Faixa Verde Branca',
      ref_rank: 'VERDE_BRANCA',
      module: 'app',
      needed_frequency: 100,
    },
    {
      name: 'Promoção para Faixa Verde',
      ref_rank: 'VERDE',
      module: 'app',
      needed_frequency: 100,
    },
    {
      name: 'Promoção para Faixa Verde Preta',
      ref_rank: 'VERDE_PRETA',
      module: 'app',
      needed_frequency: 100,
    },
    {
      name: 'Promoção para Faixa Azul',
      ref_rank: 'AZUL',
      module: 'app',
      needed_frequency: 100,
    },
    {
      name: 'Promoção para Faixa Roxa',
      ref_rank: 'ROXA',
      module: 'app',
      needed_frequency: 100,
    },
    {
      name: 'Promoção para Faixa Marrom',
      ref_rank: 'MARROM',
      module: 'app',
      needed_frequency: 100,
    },
    {
      name: 'Promoção para Faixa Preta',
      ref_rank: 'PRETA',
      module: 'app',
      needed_frequency: 100,
    },
    {
      name: 'Promoção para Faixa Vermelha',
      ref_rank: 'VERMELHA',
      module: 'app',
      needed_frequency: 100,
    },
    {
      name: 'Promoção para Faixa Kids',
      ref_rank: 'KIDS',
      module: 'app',
      needed_frequency: 75,
    },
    {
      name: 'Promoção para Faixa Juvenil',
      ref_rank: 'JUVENIL',
      module: 'app',
      needed_frequency: 80,
    },
  ];

  try {
    for (const config of promotionConfigs) {
      const existingConfig = await prisma.promotion_config.findFirst({
        where: {
          ref_rank: config.ref_rank,
        },
      });

      if (existingConfig) {
        console.log(
          `⚠️  Configuração para ${config.ref_rank} já existe. Pulando...`,
        );
        continue;
      }

      const createdConfig = await prisma.promotion_config.create({
        data: config,
      });

      console.log(
        `✅ Configuração criada: ${createdConfig.name} (${createdConfig.ref_rank})`,
      );
    }

    console.log('🎉 Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
