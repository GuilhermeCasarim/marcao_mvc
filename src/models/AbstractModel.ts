// src/models/AbstractModel.ts -> endereco
import { PrismaClient } from '@prisma/client';

export abstract class AbstractModel {
  protected static prisma = new PrismaClient();
  protected tableName: string = '';
  protected primaryKey: string = 'id';
  protected data: any = {};

  constructor(data: any = {}) {
    this.data = data;
  }

  /**
   * @param args tipo de registro do banco
   */
  abstract load(...args: any[]): Promise<this | null>;

  /**
   * salva o modelo no banco
   */
  abstract save(): Promise<this>;

  /**
   * deleta o registro do banco
   */
  abstract delete(): Promise<boolean>;

  /**
   * pega valor do atributo
   */
  get(key: string): any {
    return this.data[key];
  }

  /**
   * muda valor do atributo
   */
  set(key: string, value: any): void {
    this.data[key] = value;
  }

  /**
   * pega todos os dados
   */
  getData(): any {
    return this.data;
  }

  /**
   * muda os dados
   */
  setData(data: any): void {
    this.data = data;
  }

  /**
   * ve se o modelo ja é existente no banco
   */
  exists(): boolean {
    return this.data[this.primaryKey] && this.data[this.primaryKey] > 0;
  }

  /**
   * converte JSON
   */
  toJSON(): any {
    return this.data;
  }
}