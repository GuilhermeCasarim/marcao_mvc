// src/controllers/CategoryCreateController.ts
import { AbstractController } from './AbstractController';
import { Categoria } from '../models/Categoria';

export class CategoryCreateController extends AbstractController {
    /**
     * Executa a lógica de criação de categorias
     */
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

    //forms para cateogira
    private async showForm(): Promise<void> {
        const data = {
            title: 'Criar Nova Categoria - Blog'
        };

        await this.render('create-category', data);
    }

    //envio forms
    private async handleSubmit(): Promise<void> {
        try {
            const params = this.getParams();

            // valida campos obrigatórios
            const requiredFields = ['nome'];
            const errors = this.validateRequired(requiredFields, params);

            if (errors.length > 0) {
                await this.showFormWithErrors(params, errors);
                return;
            }

            const categoriaData = {
                nome: this.sanitize(params.nome?.trim()),
                descricao: params.descricao ? this.sanitize(params.descricao.trim()) : null
            };

            // verif categoria se tem emsmo niome
            const existingCategoria = new Categoria();
            const slug = this.generateSlug(categoriaData.nome);

            const existing = await existingCategoria.load(slug);
            if (existing) {
                const errors = ['Já existe uma categoria com este nome'];
                await this.showFormWithErrors(params, errors);
                return;
            }

            // cria a categoria
            const categoria = new Categoria(categoriaData);
            await categoria.save();


            this.redirect(`/category/${categoria.slug}`);
        } catch (error) {
            console.error('Erro ao criar categoria:', error);

            const params = this.getParams();
            const errors = ['Erro interno ao criar a categoria'];
            await this.showFormWithErrors(params, errors);
        }
    }

    //exibe erro
    private async showFormWithErrors(formData: any, errors: string[]): Promise<void> {
        const data = {
            title: 'Criar Nova Categoria - Blog',
            errors,
            formData
        };

        await this.render('create-category', data);
    }

    //gera um slug a partir do nome

    private generateSlug(nome: string): string {
        return nome
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
}