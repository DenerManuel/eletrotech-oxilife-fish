import {defineField, defineType} from 'sanity'

export const categoriaType = defineType({
  name: 'categoria',
  title: 'Categorias',
  type: 'document',
  fields: [
    defineField({
      name: 'ordem',
      title: 'Ordem de Exibição',
      type: 'number',
      initialValue: 1,
      validation: (rule) => rule.integer().positive().error('Use um número inteiro positivo.'),
    }),
    defineField({
      name: 'nome',
      title: 'Nome da Categoria',
      type: 'textoTraduzidoLinha',
      validation: (rule) => rule.required().error('O nome da categoria é obrigatório.'),
    }),
    defineField({
      name: 'slug',
      title: 'Identificador (Slug)',
      type: 'slug',
      description: 'Usado nos filtros do site (ex: sondas, paineis). Use apenas letras minúsculas, números e hífen.',
      options: {
        source: 'nome.pt',
        maxLength: 80,
      },
      validation: (rule) =>
        rule.required().custom((slug) => {
          if (!slug?.current) return 'Clique em "Generate" para gerar o identificador.'
          if (!/^[a-z0-9-]+$/.test(slug.current)) {
            return 'Use apenas letras minúsculas sem acento, números e hífen (ex: sondas).'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {
      titlePt: 'nome.pt',
      titleRaw: 'nome',
      subtitle: 'slug.current',
    },
    prepare({titlePt, titleRaw, subtitle}) {
      const title = typeof titleRaw === 'string' ? titleRaw : titlePt
      return {
        title: title || 'Categoria sem nome',
        subtitle: subtitle ? `Filtro: ${subtitle}` : 'Sem slug',
      }
    },
  },
})
