import {defineField, defineType} from 'sanity'

// Objeto reutilizável para campos com tradução em Português, Espanhol e Inglês
export const textoTraduzidoType = defineType({
  name: 'textoTraduzido',
  title: 'Texto Traduzido (PT / ES / EN)',
  type: 'object',
  fields: [
    defineField({
      name: 'pt',
      title: 'Português (Padrão)',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().error('O texto em português é obrigatório.'),
    }),
    defineField({
      name: 'es',
      title: 'Espanhol (ES)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'en',
      title: 'Inglês (EN)',
      type: 'text',
      rows: 3,
    }),
  ],
})
