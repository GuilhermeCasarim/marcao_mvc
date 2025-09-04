// src/controllers/AbstractController.ts
import { Request, Response } from 'express';
import * as Twig from 'twig';
import * as path from 'path';

export abstract class AbstractController {
  protected request: Request;
  protected response: Response;

  constructor(request: Request, response: Response) {
    this.request = request;
    this.response = response;
  }

//executa logica no controller
  abstract execute(): Promise<void>;

//pega os parametros da requisicao
  getParams(): any {
    return {
      ...this.request.params,
      ...this.request.query,
      ...this.request.body
    };
  }

//pega o metodo
  getMethod(): string {
    return this.request.method;
  }

//renderiza view com twig
  protected async render(template: string, data: any = {}): Promise<void> {
    try {
      const viewsPath = path.join(__dirname, '../views');
      
      // config twig (se precisar)
      // if (!Twig.getTemplate) {
      //   Twig.cache(false);
      // }

      const templatePath = path.join(viewsPath, `${template}.twig`);
      
      // dados globais disponíveis em todas as views (quase um static)
      const globalData = {
        request: {
          method: this.getMethod(),
          url: this.request.url,
          params: this.request.params,
          query: this.request.query
        },
        ...data
      };

      const html = await new Promise<string>((resolve, reject) => {
        Twig.renderFile(templatePath, globalData, (error, html) => {
          if (error) {
            reject(error);
          } else {
            resolve(html);
          }
        });
      });

      this.response.send(html);
    } catch (error) {
      console.error('Erro ao renderizar template:', error);
      this.response.status(500).send('Erro interno do servidor');
    }
  }

//retorna resposta json
  protected json(data: any, status: number = 200): void {
    this.response.status(status).json(data);
  }

//faz redirect pra url
  protected redirect(url: string, status: number = 302): void {
    this.response.status(status).redirect(url);
  }

//retorna erro
  protected notFound(message: string = 'Página não encontrada'): void {
    this.response.status(404).send(message);
  }

  protected serverError(message: string = 'Erro interno do servidor'): void {
    this.response.status(500).send(message);
  }

//validacao de campos
  protected validateRequired(fields: string[], data: any): string[] {
    const errors: string[] = [];
    
    for (const field of fields) {
      if (!data[field] || data[field].toString().trim() === '') {
        errors.push(`O campo ${field} é obrigatório`);
      }
    }
    
    return errors;
  }

//previne xss
  protected sanitize(input: string): string {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

//pega params de paginacao
  protected getPaginationParams(): { page: number, limit: number } {
    const params = this.getParams();
    const page = Math.max(1, parseInt(params.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(params.limit) || 10));
    
    return { page, limit };
  }
}