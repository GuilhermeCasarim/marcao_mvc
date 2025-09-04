// src/controllers/CategoryController.ts
import { AbstractController } from './AbstractController';
import { Post } from '../models/Post';
import { Categoria } from '../models/Categoria';

export class CategoryController extends AbstractController {
  //exibe post filtrado por categoria
  async execute(): Promise<void> {
    try {
      const params = this.getParams();
      const slug = params.slug;
      const { page, limit } = this.getPaginationParams();

      if (!slug) {
        this.notFound('Categoria não encontrada');
        return;
      }

      // carrega a categoria pelo slug
      const categoria = new Categoria();
      const loadedCategoria = await categoria.load(slug);

      if (!loadedCategoria) {
        this.notFound('Categoria não encontrada');
        return;
      }

      // busca posts da categoria com paginação
      const { posts, total, totalPages } = await Post.findByCategory(slug, page, limit);

      // gerencia a paginacao
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      const nextPage = hasNextPage ? page + 1 : null;
      const prevPage = hasPrevPage ? page - 1 : null;

      //dados view
      const data = {
        title: `${loadedCategoria.nome} - Categoria - Blog`,
        categoria: {
          id: loadedCategoria.id,
          nome: loadedCategoria.nome,
          slug: loadedCategoria.slug,
          descricao: loadedCategoria.descricao
        },
        posts: posts.map(post => ({
          id: post.id,
          titulo: post.titulo,
          slug: post.slug,
          excerpt: post.getExcerpt(250),
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

      await this.render('category', data);
    } catch (error) {
      console.error('Erro no CategoryController:', error);
      this.serverError('Erro ao carregar a categoria');
    }
  }
}