import {defineField, defineType} from 'sanity'

// Objeto reutilizável para títulos, categorias e itens curtos em PT / ES / EN
export const textoTraduzidoLinhaType = defineType({
  name: 'textoTraduzidoLinha',
  title: 'Texto Curto Traduzido (PT / ES / EN)',
  type: 'object',
  fields: [
    defineField({
      name: 'pt',
      title: 'Português (Padrão)',
      type: 'string',
      validation: (rule) => rule.required().error('O texto em português é obrigatório.'),
    }),
    defineField({
      name: 'es',
      title: 'Espanhol (ES)',
      type: 'string',
    }),
    defineField({
      name: 'en',
      title: 'Inglês (EN)',
      type: 'string',
    }),
  ],
})
