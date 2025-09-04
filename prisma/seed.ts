// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar autores
  console.log('👤 Criando autores...');
  const autor1 = await prisma.autor.upsert({
    where: { email: 'joao@exemplo.com' },
    update: {},
    create: {
      nome: 'João Silva',
      email: 'joao@exemplo.com',
      bio: 'Desenvolvedor Full Stack com mais de 5 anos de experiência em JavaScript, Node.js e React.'
    }
  });

  const autor2 = await prisma.autor.upsert({
    where: { email: 'maria@exemplo.com' },
    update: {},
    create: {
      nome: 'Maria Santos',
      email: 'maria@exemplo.com',
      bio: 'Designer UX/UI e desenvolvedora front-end apaixonada por criar experiências incríveis.'
    }
  });

  // Criar categorias
  console.log('📁 Criando categorias...');
  const categoriaJS = await prisma.categoria.upsert({
    where: { slug: 'javascript' },
    update: {},
    create: {
      nome: 'JavaScript',
      slug: 'javascript',
      descricao: 'Artigos sobre JavaScript, Node.js, frameworks e bibliotecas.'
    }
  });

  const categoriaDesign = await prisma.categoria.upsert({
    where: { slug: 'design' },
    update: {},
    create: {
      nome: 'Design',
      slug: 'design',
      descricao: 'Dicas de design, UX/UI e ferramentas para designers.'
    }
  });

  const categoriaTutoriais = await prisma.categoria.upsert({
    where: { slug: 'tutoriais' },
    update: {},
    create: {
      nome: 'Tutoriais',
      slug: 'tutoriais',
      descricao: 'Tutoriais passo a passo sobre programação e desenvolvimento.'
    }
  });

  // Criar tags
  console.log('🏷️ Criando tags...');
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'javascript' },
      update: {},
      create: { nome: 'JavaScript', slug: 'javascript' }
    }),
    prisma.tag.upsert({
      where: { slug: 'nodejs' },
      update: {},
      create: { nome: 'Node.js', slug: 'nodejs' }
    }),
    prisma.tag.upsert({
      where: { slug: 'react' },
      update: {},
      create: { nome: 'React', slug: 'react' }
    }),
    prisma.tag.upsert({
      where: { slug: 'typescript' },
      update: {},
      create: { nome: 'TypeScript', slug: 'typescript' }
    }),
    prisma.tag.upsert({
      where: { slug: 'tutorial' },
      update: {},
      create: { nome: 'Tutorial', slug: 'tutorial' }
    }),
    prisma.tag.upsert({
      where: { slug: 'iniciante' },
      update: {},
      create: { nome: 'Iniciante', slug: 'iniciante' }
    }),
    prisma.tag.upsert({
      where: { slug: 'design' },
      update: {},
      create: { nome: 'Design', slug: 'design' }
    }),
    prisma.tag.upsert({
      where: { slug: 'ux' },
      update: {},
      create: { nome: 'UX', slug: 'ux' }
    })
  ]);

  // Criar posts
  console.log('📝 Criando posts...');
  const post1 = await prisma.post.upsert({
    where: { slug: 'introducao-ao-typescript' },
    update: {},
    create: {
      titulo: 'Introdução ao TypeScript',
      slug: 'introducao-ao-typescript',
      conteudo: `
        <p>TypeScript é uma linguagem de programação desenvolvida pela Microsoft que adiciona tipagem estática ao JavaScript. Neste artigo, vamos explorar os conceitos básicos e como começar a usar TypeScript em seus projetos.</p>
        
        <h3>O que é TypeScript?</h3>
        <p>TypeScript é um superset do JavaScript que compila para JavaScript puro. Isso significa que qualquer código JavaScript válido também é código TypeScript válido.</p>
        
        <h3>Principais Vantagens</h3>
        <ul>
          <li>Detecção de erros em tempo de compilação</li>
          <li>Melhor IntelliSense e autocompletar</li>
          <li>Facilita refatoração de código</li>
          <li>Suporte a recursos modernos do JavaScript</li>
        </ul>
        
        <h3>Como Começar</h3>
        <p>Para instalar o TypeScript, use o npm:</p>
        <pre><code>npm install -g typescript</code></pre>
        
        <p>Depois, compile seus arquivos .ts:</p>
        <pre><code>tsc meuarquivo.ts</code></pre>
      `,
      publicado: true,
      autorId: autor1.id,
      categoriaId: categoriaJS.id
    }
  });

  const post2 = await prisma.post.upsert({
    where: { slug: 'principios-ux-design' },
    update: {},
    create: {
      titulo: 'Princípios Fundamentais do UX Design',
      slug: 'principios-ux-design',
      conteudo: `
        <p>O UX Design (User Experience Design) é fundamental para criar produtos digitais que realmente funcionam para os usuários. Vamos explorar os princípios essenciais que todo designer deveria conhecer.</p>
        
        <h3>1. Usabilidade</h3>
        <p>Um produto deve ser fácil de usar e intuitivo. Os usuários não devem precisar pensar muito para realizar uma tarefa.</p>
        
        <h3>2. Consistência</h3>
        <p>Elementos similares devem funcionar de forma similar em todo o produto. Isso reduz a curva de aprendizado.</p>
        
        <h3>3. Feedback</h3>
        <p>O sistema deve sempre informar o usuário sobre o que está acontecendo através de feedback apropriado.</p>
        
        <h3>4. Hierarquia Visual</h3>
        <p>Use tamanho, cor e posicionamento para guiar a atenção do usuário para os elementos mais importantes.</p>
        
        <h3>5. Acessibilidade</h3>
        <p>Projete para todos os usuários, incluindo aqueles com deficiências ou limitações.</p>
      `,
      publicado: true,
      autorId: autor2.id,
      categoriaId: categoriaDesign.id
    }
  });

  const post3 = await prisma.post.upsert({
    where: { slug: 'criando-api-nodejs-express' },
    update: {},
    create: {
      titulo: 'Criando uma API REST com Node.js e Express',
      slug: 'criando-api-nodejs-express',
      conteudo: `
        <p>Neste tutorial, vamos aprender como criar uma API REST completa usando Node.js e Express. Abordaremos desde a configuração inicial até a implementação de rotas CRUD.</p>
        
        <h3>Configuração Inicial</h3>
        <p>Primeiro, vamos inicializar o projeto e instalar as dependências:</p>
        <pre><code>npm init -y
npm install express cors helmet morgan</code></pre>
        
        <h3>Estrutura Básica</h3>
        <p>Crie o arquivo app.js com a estrutura básica:</p>
        <pre><code>const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});</code></pre>
        
        <h3>Implementando Rotas CRUD</h3>
        <p>Agora vamos criar as rotas para operações básicas:</p>
        <ul>
          <li>GET /api/users - Listar usuários</li>
          <li>POST /api/users - Criar usuário</li>
          <li>GET /api/users/:id - Buscar usuário</li>
          <li>PUT /api/users/:id - Atualizar usuário</li>
          <li>DELETE /api/users/:id - Deletar usuário</li>
        </ul>
      `,
      publicado: true,
      autorId: autor1.id,
      categoriaId: categoriaTutoriais.id
    }
  });

  // Associar tags aos posts
  console.log('🔗 Associando tags aos posts...');
  
  // Post 1: TypeScript + JavaScript + Tutorial + Iniciante
  await Promise.all([
    prisma.postTag.upsert({
      where: { postId_tagId: { postId: post1.id, tagId: tags[3].id } }, // TypeScript
      update: {},
      create: { postId: post1.id, tagId: tags[3].id }
    }),
    prisma.postTag.upsert({
      where: { postId_tagId: { postId: post1.id, tagId: tags[0].id } }, // JavaScript
      update: {},
      create: { postId: post1.id, tagId: tags[0].id }
    }),
    prisma.postTag.upsert({
      where: { postId_tagId: { postId: post1.id, tagId: tags[4].id } }, // Tutorial
      update: {},
      create: { postId: post1.id, tagId: tags[4].id }
    }),
    prisma.postTag.upsert({
      where: { postId_tagId: { postId: post1.id, tagId: tags[5].id } }, // Iniciante
      update: {},
      create: { postId: post1.id, tagId: tags[5].id }
    })
  ]);

  // Post 2: Design + UX
  await Promise.all([
    prisma.postTag.upsert({
      where: { postId_tagId: { postId: post2.id, tagId: tags[6].id } }, // Design
      update: {},
      create: { postId: post2.id, tagId: tags[6].id }
    }),
    prisma.postTag.upsert({
      where: { postId_tagId: { postId: post2.id, tagId: tags[7].id } }, // UX
      update: {},
      create: { postId: post2.id, tagId: tags[7].id }
    })
  ]);

  // Post 3: Node.js + JavaScript + Tutorial
  await Promise.all([
    prisma.postTag.upsert({
      where: { postId_tagId: { postId: post3.id, tagId: tags[1].id } }, // Node.js
      update: {},
      create: { postId: post3.id, tagId: tags[1].id }
    }),
    prisma.postTag.upsert({
      where: { postId_tagId: { postId: post3.id, tagId: tags[0].id } }, // JavaScript
      update: {},
      create: { postId: post3.id, tagId: tags[0].id }
    }),
    prisma.postTag.upsert({
      where: { postId_tagId: { postId: post3.id, tagId: tags[4].id } }, // Tutorial
      update: {},
      create: { postId: post3.id, tagId: tags[4].id }
    })
  ]);

  console.log('✅ Seed concluído com sucesso!');
  console.log(`📊 Dados criados:`);
  console.log(`   - ${await prisma.autor.count()} autores`);
  console.log(`   - ${await prisma.categoria.count()} categorias`);
  console.log(`   - ${await prisma.tag.count()} tags`);
  console.log(`   - ${await prisma.post.count()} posts`);
  console.log(`   - ${await prisma.postTag.count()} associações post-tag`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro durante o seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });