// src/models/Tag.ts
import { AbstractModel } from './AbstractModel';

export class Tag extends AbstractModel {
    protected tableName = 'tags';

    constructor(data: any = {}) {
        super(data);
    }
    
    //  pega tag por id ou slug
    async load(...args: any[]): Promise<this | null> {
        const [identifier] = args;

        if (!identifier) {
            throw new Error('Identificador necessário para carregar tag');
        }

        let tag;

        // verifica se é id ou slug
        if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
            tag = await Tag.prisma.tag.findUnique({
                where: { id: Number(identifier) },
                include: {
                    posts: {
                        include: {
                            post: {
                                include: {
                                    autor: true,
                                    categoria: true
                                }
                            }
                        }
                    }
                }
            });
        } else {
            tag = await Tag.prisma.tag.findUnique({
                where: { slug: String(identifier) },
                include: {
                    posts: {
                        include: {
                            post: {
                                include: {
                                    autor: true,
                                    categoria: true
                                }
                            }
                        }
                    }
                }
            });
        }

        if (tag) {
            this.setData(tag);
            return this;
        }

        return null;
    }

    //   salva a tag e faz slug se nao tiver
    async save(): Promise<this> {
        if (!this.data.slug && this.data.nome) {
            this.data.slug = this.generateSlug(this.data.nome);
        }

        let tag;

        if (this.exists()) {
            // atualiza ou cria tag
            tag = await Tag.prisma.tag.update({
                where: { id: this.data.id },
                data: {
                    nome: this.data.nome,
                    slug: this.data.slug
                }
            });
        } else {
            tag = await Tag.prisma.tag.create({
                data: {
                    nome: this.data.nome,
                    slug: this.data.slug
                }
            });
        }

        this.setData(tag);
        return this;
    }

    // deleta tag
    async delete(): Promise<boolean> {
        if (!this.exists()) {
            return false;
        }

        try {
            await Tag.prisma.tag.delete({
                where: { id: this.data.id }
            });
            return true;
        } catch (error) {
            console.error('Erro ao excluir tag:', error);
            return false;
        }
    }

    // busca todas as tags
    static async findAll(): Promise<Tag[]> {
        const tags = await this.prisma.tag.findMany({
            include: {
                posts: {
                    include: {
                        post: true
                    }
                }
            },
            orderBy: { nome: 'asc' }
        });

        return tags.map(tag => {
            const instance = new Tag();
            instance.setData(tag);
            return instance;
        });
    }

    // busca tag que possua paginacao
    static async findPaginated(page: number = 1, limit: number = 10): Promise<{
        tags: Tag[],
        total: number,
        totalPages: number
    }> {
        const skip = (page - 1) * limit;

        const [tags, total] = await Promise.all([
            this.prisma.tag.findMany({
                skip,
                take: limit,
                include: {
                    posts: {
                        include: {
                            post: true
                        }
                    }
                },
                orderBy: { nome: 'asc' }
            }),
            this.prisma.tag.count()
        ]);

        return {
            tags: tags.map(tag => {
                const instance = new Tag();
                instance.setData(tag);
                return instance;
            }),
            total,
            totalPages: Math.ceil(total / limit)
        };
    }

    // busca ou cria tags via nome
    static async findOrCreateByNames(nomes: string[]): Promise<Tag[]> {
        const tags: Tag[] = [];

        for (const nome of nomes) {
            const slug = this.generateSlugStatic(nome);

            let tag = await this.prisma.tag.findUnique({
                where: { slug }
            });

            if (!tag) {
                tag = await this.prisma.tag.create({
                    data: { nome: nome.trim(), slug }
                });
            }

            const instance = new Tag();
            instance.setData(tag);
            tags.push(instance);
        }

        return tags;
    }


    //   gera um slug com o nome
    private generateSlug(nome: string): string {
        return Tag.generateSlugStatic(nome);
    }

    //gera slug com o nome(porem aqui é estatico)
    static generateSlugStatic(nome: string): string {
        return nome
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    // g
    get id(): number { return this.data.id; }
    get nome(): string { return this.data.nome; }
    get slug(): string { return this.data.slug; }
    get posts(): any[] { return this.data.posts || []; }

    // pega os posts formatados
    getPostsData(): any[] {
        return this.posts.map(postTag => postTag.post);
    }
}