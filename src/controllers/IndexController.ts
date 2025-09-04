// src/controllers/IndexController.ts
import { AbstractController } from './AbstractController';
import { Post } from '../models/Post';
import { Categoria } from '../models/Categoria';
import { Tag } from '../models/Tag';

export class IndexController extends AbstractController {

  async execute(): Promise<void> {
    try {
      //busca os últimos posts publicados
      const { posts } = await Post.findPaginated(1, 6, false);
      
      //busca tosda as categorias
      const categorias = await Categoria.findAll();
      
      //busca tags mais utilizadas
      const tags = await Tag.findAll();
      
      //dados para a view
      const data = {
        title: 'Blog - Página Inicial',
        posts: posts.map(post => ({
          id: post.id,
          titulo: post.titulo,
          slug: post.slug,
          excerpt: post.getExcerpt(200),
          autor: post.autor,
          categoria: post.categoria,
          tags: post.getTagsData(),
          criadoEm: post.criadoEm
        })),
        categorias: categorias.map(categoria => ({
          id: categoria.id,
          nome: categoria.nome,
          slug: categoria.slug,
          postsCount: categoria.posts.length
        })),
        tags: tags.slice(0, 20).map(tag => ({
          id: tag.id,
          nome: tag.nome,
          slug: tag.slug,
          postsCount: tag.posts.length
        }))
      };

      await this.render('index', data);
    } catch (error) {
      console.error('Erro no IndexController:', error);
      this.serverError('Erro ao carregar a página inicial');
    }
  }
}