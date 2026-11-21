import {defineField, defineType} from 'sanity'

export const categoriaType = defineType({
  name: 'categoria',
  title: 'Categorias',
  type: 'document',
  fields: [
    defineField({
      name: 'nome',
      title: 'Nome da Categoria',
      type: 'string',
      validation: (rule) => rule.required().error('O nome da categoria é obrigatório.'),
    }),
    defineField({
      name: 'slug',
      title: 'Identificador (Slug)',
      type: 'slug',
      description: 'Usado nos filtros do site (ex: sensores, automacao). Clique em "Generate".',
      options: {
        source: 'nome',
        maxLength: 80,
      },
      validation: (rule) => rule.required().error('Clique em "Generate" para gerar o slug.'),
    }),
  ],
})
