// src/controllers/TagCreateController.ts
import { AbstractController } from './AbstractController';
import { Tag } from '../models/Tag';

export class TagCreateController extends AbstractController {
//criar tag a partir dos forms
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

//criar tag
  private async showForm(): Promise<void> {
    const data = {
      title: 'Criar Nova Tag - Blog'
    };

    await this.render('create-tag', data);
  }

//envia forms
  private async handleSubmit(): Promise<void> {
    try {
      const params = this.getParams();

      // validar campos
      const requiredFields = ['nome'];
      const errors = this.validateRequired(requiredFields, params);

      if (errors.length > 0) {
        await this.showFormWithErrors(params, errors);
        return;
      }

      const tagData = {
        nome: this.sanitize(params.nome?.trim())
      };

      // verif se existe tag igual
      const existingTag = new Tag();
      const slug = Tag.generateSlugStatic(tagData.nome);
      
      const existing = await existingTag.load(slug);
      if (existing) {
        const errors = ['Já existe uma tag com este nome'];
        await this.showFormWithErrors(params, errors);
        return;
      }

      //nova tag
      const tag = new Tag(tagData);
      await tag.save();

      // redirect tela inicial
      this.redirect('/');
    } catch (error) {
      console.error('Erro ao criar tag:', error);
      
      const params = this.getParams();
      const errors = ['Erro interno ao criar a tag'];
      await this.showFormWithErrors(params, errors);
    }
  }

//form erros
  private async showFormWithErrors(formData: any, errors: string[]): Promise<void> {
    const data = {
      title: 'Criar Nova Tag - Blog',
      errors,
      formData
    };

    await this.render('create-tag', data);
  }
}