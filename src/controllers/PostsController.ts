// src/controllers/PostsController.ts
import { AbstractController } from './AbstractController';
import { Post } from '../models/Post';

export class PostsController extends AbstractController {
//lista os posts
  async execute(): Promise<void> {
    try {
      const { page, limit } = this.getPaginationParams();
      
      //busca posts com paginação
      const { posts, total, totalPages } = await Post.findPaginated(page, limit, false);

      // Calcular informações de paginação
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      const nextPage = hasNextPage ? page + 1 : null;
      const prevPage = hasPrevPage ? page - 1 : null;

      //dados para a view
      const data = {
        title: 'Todos os Posts - Blog',
        posts: posts.map(post => ({
          id: post.id,
          titulo: post.titulo,
          slug: post.slug,
          excerpt: post.getExcerpt(300),
          autor: post.autor,
          categoria: post.categoria,
          tags: post.getTagsData(),
          criadoEm: post.criadoEm
        })),
        pagination: {
          currentPage: page,
          totalPages,
          total,
          hasNextPage,
          hasPrevPage,
          nextPage,
          prevPage,
          limit,
          startItem: (page - 1) * limit + 1,
          endItem: Math.min(page * limit, total)
        }
      };

      await this.render('posts', data);
    } catch (error) {
      console.error('Erro no PostsController:', error);
      this.serverError('Erro ao carregar os posts');
    }
  }
}