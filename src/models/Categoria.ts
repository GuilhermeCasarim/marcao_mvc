// src/models/Categoria.ts
import { AbstractModel } from './AbstractModel';

export class Categoria extends AbstractModel {
  protected tableName = 'categorias';

  constructor(data: any = {}) {
    super(data);
  }

  
//    pega uma categoria via id/slug
   
  async load(...args: any[]): Promise<this | null> {
    const [identifier] = args;
    
    if (!identifier) {
      throw new Error('Identificador necessário para carregar categoria');
    }

    let categoria;
    
    // verifica e diferencia se é id int ou slug
    if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
      categoria = await Categoria.prisma.categoria.findUnique({
        where: { id: Number(identifier) },
        include: { posts: true }
      });
    } else {
      categoria = await Categoria.prisma.categoria.findUnique({
        where: { slug: String(identifier) },
        include: { posts: true }
      });
    }

    if (categoria) {
      this.setData(categoria);
      return this;
    }

    return null;
  }

//    salva a categoria no banco e se nao tiver fica como slug
  async save(): Promise<this> {
    if (!this.data.slug && this.data.nome) {
      this.data.slug = this.generateSlug(this.data.nome);
    }

    let categoria;

// atualizaa a categoria que ja tem, senao cria
    if (this.exists()) {
      categoria = await Categoria.prisma.categoria.update({
        where: { id: this.data.id },
        data: {
          nome: this.data.nome,
          descricao: this.data.descricao,
          slug: this.data.slug
        }
      });
    } else {
      categoria = await Categoria.prisma.categoria.create({
        data: {
          nome: this.data.nome,
          descricao: this.data.descricao,
          slug: this.data.slug
        }
      });
    }

    this.setData(categoria);
    return this;
  }

//   deleta categoria do banco
  async delete(): Promise<boolean> {
    if (!this.exists()) {
      return false;
    }

    try {
      await Categoria.prisma.categoria.delete({
        where: { id: this.data.id }
      });
      return true;
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      return false;
    }
  }

// faz tipo um getAll nas categorias pra buscar todas
  static async findAll(): Promise<Categoria[]> {
    const categorias = await this.prisma.categoria.findMany({
      include: { posts: true },
      orderBy: { nome: 'asc' }
    });

    return categorias.map(categoria => {
      const instance = new Categoria();
      instance.setData(categoria);
      return instance;
    });
  }

// procura categorias com paginas
  static async findPaginated(page: number = 1, limit: number = 10): Promise<{
    categorias: Categoria[],
    total: number,
    totalPages: number
  }> {
    const skip = (page - 1) * limit;
    
    const [categorias, total] = await Promise.all([
      this.prisma.categoria.findMany({
        skip,
        take: limit,
        include: { posts: true },
        orderBy: { nome: 'asc' }
      }),
      this.prisma.categoria.count()
    ]);

    return {
      categorias: categorias.map(categoria => {
        const instance = new Categoria();
        instance.setData(categoria);
        return instance;
      }),
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

// faz um slug com o nome
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

  // getters
  get id(): number { return this.data.id; }
  get nome(): string { return this.data.nome; }
  get descricao(): string { return this.data.descricao; }
  get slug(): string { return this.data.slug; }
  get posts(): any[] { return this.data.posts || []; }
}