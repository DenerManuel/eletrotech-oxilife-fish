import {defineField, defineType} from 'sanity'

export const faqType = defineType({
  name: 'faq',
  title: 'FAQ (Perguntas Frequentes)',
  type: 'document',
  fields: [
    defineField({
      name: 'ordem',
      title: 'Ordem de Exibição',
      type: 'number',
      initialValue: 1,
      validation: (rule) => rule.required().integer().positive().error('Use um número inteiro positivo.'),
    }),
    defineField({
      name: 'pergunta',
      title: 'Pergunta',
      type: 'textoTraduzido',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'resposta',
      title: 'Resposta',
      type: 'textoTraduzido',
      validation: (rule) => rule.required(),
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
      title: 'pergunta.pt',
      ordem: 'ordem',
    },
    prepare({title, ordem}) {
      return {
        title: `${ordem ? `${ordem}. ` : ''}${title || 'Sem pergunta'}`,
      }
    },
  },
})
