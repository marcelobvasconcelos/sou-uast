const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('=== Teste 1: Buscar membros da equipe ===');
  const members = await prisma.teamMember.findMany({ orderBy: [{ order: 'asc' }] });
  console.log('Total de membros:', members.length);
  members.forEach(m => console.log(` - ${m.name} (${m.projectRole}) [ordem ${m.order}] [foto: ${m.photoUrl || 'SEM FOTO'}]`));

  console.log('\n=== Teste 2: Criar membro sem foto (teste de fallback de iniciais) ===');
  const tempMember = await prisma.teamMember.create({
    data: {
      name: 'Carlos Eduardo Nogueira',
      degree: 'Graduando em Agronomia',
      role: 'Monitor Voluntário',
      projectRole: 'Monitor',
      photoUrl: null,
      order: 4,
      isActive: true,
    }
  });
  console.log('Criado membro temporário ID:', tempMember.id);

  console.log('\n=== Teste 3: Atualizar membro ===');
  const updated = await prisma.teamMember.update({
    where: { id: tempMember.id },
    data: { projectRole: 'Colaborador Técnico' },
  });
  console.log('Atualizado papel para:', updated.projectRole);

  console.log('\n=== Teste 4: Remover membro temporário ===');
  await prisma.teamMember.delete({ where: { id: tempMember.id } });
  console.log('Membro temporário removido com sucesso.');

  console.log('\n=== Teste 5: Verificar configurações de posicionamento da equipe ===');
  const settings = await prisma.siteSetting.findUnique({ where: { id: 'site_settings' } });
  console.log('Posição atual da seção de equipe:', settings.teamSectionPosition);
  console.log('Título:', settings.teamSectionTitle);
  console.log('Subtítulo:', settings.teamSectionSubtitle);

  console.log('\n=== TODOS OS TESTES PASSARAM COM SUCESSO! ===');
}

test()
  .catch((err) => {
    console.error('Falha nos testes:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
