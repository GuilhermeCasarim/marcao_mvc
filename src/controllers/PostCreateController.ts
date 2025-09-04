// src/controllers/PostCreateController.ts
import { AbstractController } from './AbstractController';
import { Post } from '../models/Post';
import { Categoria } from '../models/Categoria';
import { Autor } from '../models/Autor';
import { Tag } from '../models/Tag';

export class PostCreateController extends AbstractController {
//criacao de posts
  async execute(): Promise<void> {
    const method = this.getMethod();

    if (method === 'GET') {
      await this.showForm();
    } else if (method === 'POST') {
      await this.handleSubmit();
    } else {
      this.notFound();
    }
  }

//form para criar post
  private async showForm(): Promise<void> {
    try {
      const categorias = await Categoria.findAll();
      const autores = await Autor.findAll();
      const tags = await Tag.findAll();

      const data = {
        title: 'Criar Novo Post - Blog',
        categorias: categorias.map(categoria => ({
          id: categoria.id,
          nome: categoria.nome
        })),
        autores: autores.map(autor => ({
          id: autor.id,
          nome: autor.nome
        })),
        tags: tags.map(tag => ({
          id: tag.id,
          nome: tag.nome
        }))
      };

      await this.render('create-post', data);
    } catch (error) {
      console.error('Erro ao exibir formulário de post:', error);
      this.serverError('Erro ao carregar o formulário');
    }
  }

//envio forms
  private async handleSubmit(): Promise<void> {
    try {
      const params = this.getParams();

      //validacoes
      const requiredFields = ['titulo', 'conteudo', 'autorId', 'categoriaId'];
      const errors = this.validateRequired(requiredFields, params);

      if (errors.length > 0) {
        await this.showFormWithErrors(params, errors);
        return;
      }

      const postData = {
        titulo: this.sanitize(params.titulo?.trim()),
        conteudo: params.conteudo?.trim(), // Manter HTML no conteúdo
        autorId: parseInt(params.autorId),
        categoriaId: parseInt(params.categoriaId),
        publicado: params.publicado === 'on' || params.publicado === true
      };

      //cria post
      const post = new Post(postData);
      await post.save();

      //processa tags
      if (params.tags && params.tags.length > 0) {
        let tagIds: number[] = [];

        if (Array.isArray(params.tags)) {
          tagIds = params.tags.map((id: string) => parseInt(id)).filter(id => !isNaN(id));
        } else if (typeof params.tags === 'string') {
          const tagNames = params.tags.split(',').map(name => name.trim()).filter(name => name);
          const tags = await Tag.findOrCreateByNames(tagNames);
          tagIds = tags.map(tag => tag.id);
        }

        if (tagIds.length > 0) {
          await post.attachTags(tagIds);
        }
      }

      // Redirecionar para o post criado
      this.redirect(`/post/${post.slug}`);
    } catch (error) {
      console.error('Erro ao criar post:', error);
      
      const params = this.getParams();
      const errors = ['Erro interno ao criar o post'];
      await this.showFormWithErrors(params, errors);
    }
  }

//form erro
  private async showFormWithErrors(formData: any, errors: string[]): Promise<void> {
    try {
      const categorias = await Categoria.findAll();
      const autores = await Autor.findAll();
      const tags = await Tag.findAll();

      const data = {
        title: 'Criar Novo Post - Blog',
        errors,
        formData,
        categorias: categorias.map(categoria => ({
          id: categoria.id,
          nome: categoria.nome
        })),
        autores: autores.map(autor => ({
          id: autor.id,
          nome: autor.nome
        })),
        tags: tags.map(tag => ({
          id: tag.id,
          nome: tag.nome
        }))
      };

      await this.render('create-post', data);
    } catch (error) {
      console.error('Erro ao exibir formulário com erros:', error);
      this.serverError('Erro interno do servidor');
    }
  }
}