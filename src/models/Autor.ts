// src/models/Autor.ts
import { AbstractModel } from './AbstractModel';

export class Autor extends AbstractModel {
    protected tableName = 'autores';

    constructor(data: any = {}) {
        super(data);
    }

// pega um auor por nome/email
    async load(...args: any[]): Promise<this | null> {
        const [identifier] = args;

        if (!identifier) {
            throw new Error('Identificador necessário para carregar autor');
        }

        let autor;

        // verifica se é id ou email
        if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
            autor = await Autor.prisma.autor.findUnique({
                where: { id: Number(identifier) },
                include: { posts: true }
            });
        } else {
            autor = await Autor.prisma.autor.findUnique({
                where: { email: String(identifier) },
                include: { posts: true }
            });
        }

        if (autor) {
            this.setData(autor);
            return this;
        }

        return null;
    }

// salva o autor no banco
    async save(): Promise<this> {
        let autor;

        // atualiza ou cria autor
        if (this.exists()) {
            autor = await Autor.prisma.autor.update({
                where: { id: this.data.id },
                data: {
                    nome: this.data.nome,
                    email: this.data.email,
                    bio: this.data.bio
                }
            });
        } else {
            autor = await Autor.prisma.autor.create({
                data: {
                    nome: this.data.nome,
                    email: this.data.email,
                    bio: this.data.bio
                }
            });
        }

        this.setData(autor);
        return this;
    }

    // deleta autor do banco
    async delete(): Promise<boolean> {
        if (!this.exists()) {
            return false;
        }

        try {
            await Autor.prisma.autor.delete({
                where: { id: this.data.id }
            });
            return true;
        } catch (error) {
            console.error('Erro ao excluir autor:', error);
            return false;
        }
    }

    // busca todos os autores como um getAll
    static async findAll(): Promise<Autor[]> {
        const autores = await this.prisma.autor.findMany({
            include: { posts: true },
            orderBy: { nome: 'asc' }
        });

        return autores.map(autor => {
            const instance = new Autor();
            instance.setData(autor);
            return instance;
        });
    }

    // busca autor que possua paginacao
    static async findPaginated(page: number = 1, limit: number = 10): Promise<{
        autores: Autor[],
        total: number,
        totalPages: number
    }> {
        const skip = (page - 1) * limit;

        const [autores, total] = await Promise.all([
            this.prisma.autor.findMany({
                skip,
                take: limit,
                include: { posts: true },
                orderBy: { nome: 'asc' }
            }),
            this.prisma.autor.count()
        ]);

        return {
            autores: autores.map(autor => {
                const instance = new Autor();
                instance.setData(autor);
                return instance;
            }),
            total,
            totalPages: Math.ceil(total / limit)
        };
    }

    // verifica existencia de email
    static async emailExists(email: string, excludeId?: number): Promise<boolean> {
        const where: any = { email };

        if (excludeId) {
            where.NOT = { id: excludeId };
        }

        const autor = await this.prisma.autor.findFirst({ where });
        return !!autor;
    }

    // getters
    get id(): number { return this.data.id; }
    get nome(): string { return this.data.nome; }
    get email(): string { return this.data.email; }
    get bio(): string { return this.data.bio; }
    get posts(): any[] { return this.data.posts || []; }
}