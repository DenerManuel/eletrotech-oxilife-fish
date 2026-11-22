import {defineField, defineType} from 'sanity'

export const servicoType = defineType({
  name: 'servico',
  title: 'Serviços',
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
      title: 'Nome do Serviço',
      type: 'textoTraduzidoLinha',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'setor',
      title: 'Setor / Categoria',
      type: 'textoTraduzidoLinha',
      description: 'Ex: Agroindustrial, Oficina Própria, Campo & Redes, Emergência 24h',
      validation: (rule) => rule.required().error('Informe o setor do serviço.'),
    }),
    defineField({
      name: 'descricao',
      title: 'Descrição do Serviço',
      type: 'textoTraduzido',
      validation: (rule) => rule.required().error('A descrição em português é obrigatória.'),
    }),
    defineField({
      name: 'beneficios',
      title: 'Lista de Benefícios (Itens com check)',
      type: 'array',
      of: [{type: 'textoTraduzidoLinha'}],
    }),
    defineField({
      name: 'icone',
      title: 'Ícone do Card',
      type: 'string',
      initialValue: 'fa-solid fa-bolt',
      options: {
        list: [
          {title: 'Indústria / Automação', value: 'fa-solid fa-industry'},
          {title: 'Oficina / Manutenção', value: 'fa-solid fa-screwdriver-wrench'},
          {title: 'Campo / Redes Elétricas', value: 'fa-solid fa-plug-circle-bolt'},
          {title: 'Atendimento Rápido / Emergência', value: 'fa-solid fa-truck-fast'},
          {title: 'Tecnologia / Sonda', value: 'fa-solid fa-microchip'},
          {title: 'Elétrica Geral (Raio)', value: 'fa-solid fa-bolt'},
        ],
      },
    }),
    defineField({
      name: 'destaqueEmergencia',
      title: 'Exibir selo vermelho de Emergência?',
      description: 'Ative para deixar a etiqueta do setor vermelha (ex: Emergência 24h).',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'tipoBotao',
      title: 'Ação do Botão',
      type: 'string',
      initialValue: 'contato',
      options: {
        list: [
          {title: 'Ir para página de Contato (botão azul)', value: 'contato'},
          {title: 'Abrir WhatsApp direto (botão verde)', value: 'whatsapp'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'textoBotao',
      title: 'Texto do Botão (opcional)',
      description: 'Ex: Solicitar Visita Técnica, Acionar Plantão no WhatsApp',
      type: 'textoTraduzidoLinha',
    }),
    defineField({
      name: 'imagem',
      title: 'Imagem Ilustrativa (opcional)',
      type: 'image',
      options: {hotspot: true},
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
      title: 'nome.pt',
      setorPt: 'setor.pt',
      setorRaw: 'setor',
      media: 'imagem',
    },
    prepare({title, setorPt, setorRaw, media}) {
      const subtitle = typeof setorRaw === 'string' ? setorRaw : setorPt
      return {
        title: title || 'Serviço sem nome',
        subtitle: subtitle || '',
        media,
      }
    },
  },
})
