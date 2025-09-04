// src/models/Post.ts
import { AbstractModel } from './AbstractModel';
import { Tag } from './Tag';

export class Post extends AbstractModel {
    protected tableName = 'posts';

    constructor(data: any = {}) {
        super(data);
    }


    // pega post por id/slug
    async load(...args: any[]): Promise<this | null> {
        const [identifier] = args;

        if (!identifier) {
            throw new Error('Identificador necessário para carregar post');
        }

        let post;

        // verifica se é id/slug
        if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
            post = await Post.prisma.post.findUnique({
                where: { id: Number(identifier) },
                include: {
                    autor: true,
                    categoria: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                }
            });
        } else {
            post = await Post.prisma.post.findUnique({
                where: { slug: String(identifier) },
                include: {
                    autor: true,
                    categoria: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                }
            });
        }

        if (post) {
            this.setData(post);
            return this;
        }

        return null;
    }


    //  salva o post
    async save(): Promise<this> {
        // gerar slug se nao tiver
        if (!this.data.slug && this.data.titulo) {
            this.data.slug = this.generateSlug(this.data.titulo);
        }

        let post;

        if (this.exists()) {
            // att ou cria novo post
            post = await Post.prisma.post.update({
                where: { id: this.data.id },
                data: {
                    titulo: this.data.titulo,
                    conteudo: this.data.conteudo,
                    slug: this.data.slug,
                    publicado: this.data.publicado || false,
                    autorId: this.data.autorId,
                    categoriaId: this.data.categoriaId
                },
                include: {
                    autor: true,
                    categoria: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                }
            });
        } else {
            post = await Post.prisma.post.create({
                data: {
                    titulo: this.data.titulo,
                    conteudo: this.data.conteudo,
                    slug: this.data.slug,
                    publicado: this.data.publicado || false,
                    autorId: this.data.autorId,
                    categoriaId: this.data.categoriaId
                },
                include: {
                    autor: true,
                    categoria: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                }
            });
        }

        this.setData(post);
        return this;
    }

// deleta post
    async delete(): Promise<boolean> {
        if (!this.exists()) {
            return false;
        }

        try {
            await Post.prisma.post.delete({
                where: { id: this.data.id }
            });
            return true;
        } catch (error) {
            console.error('Erro ao excluir post:', error);
            return false;
        }
    }

// relacao entre post e tag
    async attachTags(tagIds: number[]): Promise<void> {
        if (!this.exists()) {
            throw new Error('Post deve ser salvo antes de associar tags');
        }

        // remove as associações existentes
        await Post.prisma.postTag.deleteMany({
            where: { postId: this.data.id }
        });

        // cira novas associações
        const postTags = tagIds.map(tagId => ({
            postId: this.data.id,
            tagId
        }));

        await Post.prisma.postTag.createMany({
            data: postTags
        });
    }

//getAll nos posts
    static async findAll(includeUnpublished: boolean = false): Promise<Post[]> {
        const where: any = {};

        if (!includeUnpublished) {
            where.publicado = true;
        }

        const posts = await this.prisma.post.findMany({
            where,
            include: {
                autor: true,
                categoria: true,
                tags: {
                    include: {
                        tag: true
                    }
                }
            },
            orderBy: { criadoEm: 'desc' }
        });

        return posts.map(post => {
            const instance = new Post();
            instance.setData(post);
            return instance;
        });
    }

//get com paginacao
    static async findPaginated(
        page: number = 1,
        limit: number = 10,
        includeUnpublished: boolean = false
    ): Promise<{
        posts: Post[],
        total: number,
        totalPages: number
    }> {
        const skip = (page - 1) * limit;
        const where: any = {};

        if (!includeUnpublished) {
            where.publicado = true;
        }

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                skip,
                take: limit,
                include: {
                    autor: true,
                    categoria: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                },
                orderBy: { criadoEm: 'desc' }
            }),
            this.prisma.post.count({ where })
        ]);

        return {
            posts: posts.map(post => {
                const instance = new Post();
                instance.setData(post);
                return instance;
            }),
            total,
            totalPages: Math.ceil(total / limit)
        };
    }

//get por categoria
    static async findByCategory(
        categoriaSlug: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{
        posts: Post[],
        total: number,
        totalPages: number
    }> {
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: {
                    publicado: true,
                    categoria: {
                        slug: categoriaSlug
                    }
                },
                skip,
                take: limit,
                include: {
                    autor: true,
                    categoria: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                },
                orderBy: { criadoEm: 'desc' }
            }),
            this.prisma.post.count({
                where: {
                    publicado: true,
                    categoria: {
                        slug: categoriaSlug
                    }
                }
            })
        ]);

        return {
            posts: posts.map(post => {
                const instance = new Post();
                instance.setData(post);
                return instance;
            }),
            total,
            totalPages: Math.ceil(total / limit)
        };
    }

//get por tag
    static async findByTag(
        tagSlug: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{
        posts: Post[],
        total: number,
        totalPages: number
    }> {
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: {
                    publicado: true,
                    tags: {
                        some: {
                            tag: {
                                slug: tagSlug
                            }
                        }
                    }
                },
                skip,
                take: limit,
                include: {
                    autor: true,
                    categoria: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                },
                orderBy: { criadoEm: 'desc' }
            }),
            this.prisma.post.count({
                where: {
                    publicado: true,
                    tags: {
                        some: {
                            tag: {
                                slug: tagSlug
                            }
                        }
                    }
                }
            })
        ]);

        return {
            posts: posts.map(post => {
                const instance = new Post();
                instance.setData(post);
                return instance;
            }),
            total,
            totalPages: Math.ceil(total / limit)
        };
    }

//gera slug com o title
    private generateSlug(titulo: string): string {
        return titulo
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

 //getters
    get id(): number { return this.data.id; }
    get titulo(): string { return this.data.titulo; }
    get conteudo(): string { return this.data.conteudo; }
    get slug(): string { return this.data.slug; }
    get publicado(): boolean { return this.data.publicado; }
    get criadoEm(): Date { return this.data.criadoEm; }
    get atualizadoEm(): Date { return this.data.atualizadoEm; }
    get autorId(): number { return this.data.autorId; }
    get categoriaId(): number { return this.data.categoriaId; }
    get autor(): any { return this.data.autor; }
    get categoria(): any { return this.data.categoria; }
    get tags(): any[] { return this.data.tags || []; }

//get tags
    getTagsData(): any[] {
        return this.tags.map(postTag => postTag.tag);
    }

//get resumo
    getExcerpt(length: number = 150): string {
        if (!this.conteudo) return '';

        if (this.conteudo.length <= length) {
            return this.conteudo;
        }

        return this.conteudo.substring(0, length).trim() + '...';
    }
}