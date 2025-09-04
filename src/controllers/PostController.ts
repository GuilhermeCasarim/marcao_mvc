// src/controllers/PostController.ts
import { AbstractController } from './AbstractController';
import { Post } from '../models/Post';

export class PostController extends AbstractController {
//o execute serve para exibir post especifico
  async execute(): Promise<void> {
    try {
      const params = this.getParams();
      const slug = params.slug;

      if (!slug) {
        this.notFound('Post não encontrado');
        return;
      }

      // carrega o post pelo slug
      const post = new Post();
      const loadedPost = await post.load(slug);

      if (!loadedPost) {
        this.notFound('Post não encontrado');
        return;
      }

      // Verificar se o post está publicado (exceto se for admin/autor)
      if (!loadedPost.publicado) {
        this.notFound('Post não encontrado');
        return;
      }

      // busca posts relacionados (que tem a mesma categoria)
      const { posts: relatedPosts } = await Post.findByCategory(
        loadedPost.categoria.slug, 
        1, 
        4
      );

      // filtra o post atual dos relacionados
      const filteredRelatedPosts = relatedPosts
        .filter(p => p.id !== loadedPost.id)
        .slice(0, 3);

      // dados para a view
      const data = {
        title: `${loadedPost.titulo} - Blog`,
        post: {
          id: loadedPost.id,
          titulo: loadedPost.titulo,
          conteudo: loadedPost.conteudo,
          slug: loadedPost.slug,
          autor: loadedPost.autor,
          categoria: loadedPost.categoria,
          tags: loadedPost.getTagsData(),
          criadoEm: loadedPost.criadoEm,
          atualizadoEm: loadedPost.atualizadoEm
        },
        relatedPosts: filteredRelatedPosts.map(relatedPost => ({
          id: relatedPost.id,
          titulo: relatedPost.titulo,
          slug: relatedPost.slug,
          excerpt: relatedPost.getExcerpt(150),
          autor: relatedPost.autor,
          categoria: relatedPost.categoria,
          criadoEm: relatedPost.criadoEm
        }))
      };

      await this.render('post', data);
    } catch (error) {
      console.error('Erro no PostController:', error);
      this.serverError('Erro ao carregar o post');
    }
  }
}