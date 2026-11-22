import {defineField, defineType} from 'sanity'

export const depoimentoType = defineType({
  name: 'depoimento',
  title: 'Depoimentos',
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
      name: 'nomeProdutor',
      title: 'Nome do Produtor / Cliente',
      type: 'string',
      validation: (rule) => rule.required().error('O nome do produtor é obrigatório.'),
    }),
    defineField({
      name: 'cidade',
      title: 'Cidade / UF',
      type: 'string',
      description: 'Ex: Toledo/PR',
    }),
    defineField({
      name: 'tempoCliente',
      title: 'Detalhe / Tempo de Cliente',
      type: 'string',
      description: 'Ex: Cliente há 2 anos, Piscicultura Intensiva',
    }),
    defineField({
      name: 'nota',
      title: 'Nota (1 a 5 estrelas)',
      type: 'number',
      initialValue: 5,
      validation: (rule) => rule.required().min(1).max(5).integer().error('Escolha uma nota de 1 a 5.'),
    }),
    defineField({
      name: 'texto',
      title: 'Depoimento (em Português)',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().error('O texto do depoimento é obrigatório.'),
    }),
    defineField({
      name: 'foto',
      title: 'Foto do Produtor (opcional)',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'videoUrl',
      title: 'Link de Vídeo (opcional)',
      description: 'Link completo começando com https://',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
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
      title: 'nomeProdutor',
      subtitle: 'cidade',
      media: 'foto',
    },
  },
})
