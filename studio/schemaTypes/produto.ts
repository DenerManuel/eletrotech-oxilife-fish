import {defineField, defineType} from 'sanity'

export const produtoType = defineType({
  name: 'produto',
  title: 'Produtos',
  type: 'document',
  fields: [
    defineField({
      name: 'titulo',
      title: 'Nome do Produto',
      type: 'string',
      validation: (rule) => rule.required().error('O nome do produto é obrigatório.'),
    }),
    defineField({
      name: 'sku',
      title: 'Código SKU',
      type: 'string',
      description: 'Ex: OXI-01, OXI-MANUAL',
    }),
    defineField({
      name: 'categoria',
      title: 'Categoria',
      type: 'reference',
      to: [{type: 'categoria'}],
      validation: (rule) => rule.required().error('Selecione uma categoria.'),
    }),
    defineField({
      name: 'descricao',
      title: 'Descrição do Produto',
      type: 'textoTraduzido',
    }),
    defineField({
      name: 'imagem',
      title: 'Foto Principal (Capa do Card)',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'galeria',
      title: 'Galeria de Fotos Extras',
      description: 'Substitui a antiga tabela produto_imagens do SQL.',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
    }),
    defineField({
      name: 'destaque',
      title: 'Produto em Destaque?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'ativo',
      title: 'Exibir no site?',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'titulo',
      subtitle: 'sku',
      media: 'imagem',
    },
  },
})
