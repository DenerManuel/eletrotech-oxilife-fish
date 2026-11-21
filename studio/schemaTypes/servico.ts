import {defineField, defineType} from 'sanity'

export const servicoType = defineType({
  name: 'servico',
  title: 'Serviços',
  type: 'document',
  fields: [
    defineField({
      name: 'nome',
      title: 'Nome do Serviço',
      type: 'textoTraduzido',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'setor',
      title: 'Setor / Categoria',
      type: 'string',
      description: 'Ex: Agroindustrial, Oficina Própria, Residencial, Comercial',
      validation: (rule) => rule.required().error('Informe o setor do serviço.'),
    }),
    defineField({
      name: 'descricao',
      title: 'Descrição do Serviço',
      type: 'textoTraduzido',
    }),
    defineField({
      name: 'beneficios',
      title: 'Lista de Benefícios (Itens com check)',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'icone',
      title: 'Ícone FontAwesome (opcional)',
      type: 'string',
      description: 'Ex: fa-solid fa-industry, fa-solid fa-screwdriver-wrench',
      initialValue: 'fa-solid fa-bolt',
    }),
    defineField({
      name: 'imagem',
      title: 'Imagem Ilustrativa (opcional)',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {
      title: 'nome.pt',
      subtitle: 'setor',
      media: 'imagem',
    },
  },
})
