import {defineField, defineType} from 'sanity'

export const produtoType = defineType({
  name: 'produto',
  title: 'Produtos',
  type: 'document',
  fields: [
    defineField({
      name: 'ordem',
      title: 'Ordem de Exibição',
      type: 'number',
      description: 'Produtos em destaque aparecem primeiro; os demais seguem esta ordem.',
      initialValue: 10,
      validation: (rule) => rule.integer().positive().error('Use um número inteiro positivo.'),
    }),
    defineField({
      name: 'titulo',
      title: 'Nome do Produto',
      type: 'textoTraduzidoLinha',
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
      validation: (rule) => rule.required().error('A descrição em português é obrigatória.'),
    }),
    defineField({
      name: 'imagem',
      title: 'Foto Principal (Capa do Card)',
      description: 'O site redimensiona e comprime automaticamente para 3G/4G.',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'galeria',
      title: 'Galeria de Fotos Extras',
      description: 'Fotos adicionais exibidas apenas quando o cliente clicar em "Ver mais fotos".',
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
      titlePt: 'titulo.pt',
      titleRaw: 'titulo',
      subtitle: 'sku',
      media: 'imagem',
    },
    prepare({titlePt, titleRaw, subtitle, media}) {
      const title = typeof titleRaw === 'string' ? titleRaw : titlePt
      return {
        title: title || 'Produto sem nome',
        subtitle: subtitle ? `SKU: ${subtitle}` : 'Sem SKU',
        media,
      }
    },
  },
})
