# DOCUMENTO DE REQUISITOS DO PROJETO

**Nome do Projeto:** Site Dinâmico e Catálogo Institucional - Eletrotech  
**Produto Em Destaque:** Sonda Inteligente Oxilife Fish  
**Equipe do Projeto:** Grupo 3  
**Curso:** Análise e Desenvolvimento de Sistemas (2° Período) - Turma B  

---

## 1. REQUISITOS FUNCIONAIS (RFs)

### RF-001: Banner Principal de Impacto (Hero Section)
- **Descrição:** O site deve exibir na página inicial um banner de abertura de alto impacto focado no Oxilife Fish.
- **Detalhes:** Deve conter frase de efeito (slogan), imagem/vídeo de destaque do produto e botão principal de ação (Call-To-Action) direcionando para atendimento imediato no WhatsApp.

### RF-002: Página / Seção "Quem Somos" (História Institucional)
- **Descrição:** O site deve apresentar a trajetória de mercado da Eletrotech.
- **Detalhes:** Deve ressaltar os mais de 8 anos de atuação e contar a origem dos fundadores como ex-piscicultores, reforçando a autoridade e a credibilidade no desenvolvimento da tecnologia.

### RF-003: Seção Especializada do Oxilife Fish
- **Descrição:** O sistema deve conter uma área dedicada exclusivamente à sonda inteligente Oxilife Fish.
- **Detalhes:** Deve detalhar o funcionamento em tanques escavados, integração com a automação de aeradores, demonstração visual dos alertas emitidos no celular, fotos reais de instalações em campo e vídeos de depoimentos de produtores.

### RF-004: Catálogo Dinâmico de Produtos com Filtros
- **Descrição:** O site deve exibir uma lista organizada de todos os equipamentos e componentes comercializados.
- **Detalhes:** Deve permitir filtragem por categoria. Todos os produtos devem apresentar o botão "Consultar Orçamento via WhatsApp". Inclui painel de login em `JavaScript` para os administradores inserirem, editarem e removerem produtos.

### RF-005: Exibição de Serviços Elétricos e de Automação
- **Descrição:** O site deve conter uma seção descritiva dos serviços prestados pela Eletrotech.
- **Detalhes:** Deve detalhar serviços de elétrica industrial, comercial, residencial, manutenção de motores, automação e atendimento de emergência.

### RF-006: Central de Assistência Técnica e FAQ
- **Descrição:** O sistema deve disponibilizar uma área com orientações técnicas e perguntas frequentes.
- **Detalhes:** Deve conter orientações rápidas sobre instalação de painéis, procedimentos em caso de falta de energia e respostas explicativas para as dúvidas mais comuns dos produtores.

### RF-007: Canais de Contato Direto e Formulário
- **Descrição:** O site deve fornecer múltiplos meios simples para o visitante entrar em contato com a equipe.
- **Detalhes:** Deve incluir formulário simples de mensagem, botão flutuante permanente do WhatsApp no canto da tela e links diretos para redes sociais.

### RF-008: Rodapé Informativo (Footer)
- **Descrição:** O site deve apresentar um rodapé padronizado em todas as páginas.
- **Detalhes:** Deve conter endereço completo da matriz em Marechal Cândido Rondon/PR, horários de atendimento, mapa de localização, dados de contato e links de navegação rápida.

### RF-009: Preparação Estrutural Multilíngue
- **Descrição:** O site deve conter uma chave seletora visual de idiomas.
- **Detalhes:** Deve disponibilizar a estrutura técnica preparada para alternar o conteúdo do site entre Português (PT-BR), Espanhol (ES) e Inglês (EN) para atender à expansão internacional.

---

## 2. REQUISITOS NÃO-FUNCIONAIS (RNFs)

### RNF-001: Design Responsivo (Mobile First)
- **Descrição:** O site deve ser projetado priorizando a visualização e usabilidade em telas de celulares.
- **Critério:** Todas as tabelas, botões, menus e imagens devem se reorganizar perfeitamente em telas pequenas de smartphones Android e iOS sem cortar informações.

### RNF-002: Usabilidade e Navegação Simples
- **Descrição:** A interface do site deve ser extremamente intuitiva e amigável.
- **Critério:** Um produtor rural com pouca afinidade com tecnologia deve conseguir localizar informações do Oxilife Fish ou solicitar um orçamento em até 3 cliques.

### RNF-003: Desempenho e Velocidade de Carregamento
- **Descrição:** O site deve carregar rapidamente, mesmo em conexões de internet móvel instáveis no campo.
- **Critério:** As imagens e vídeos do site devem passar por otimização prévia de compressão para garantir tempo de carregamento inicial inferior a 3 segundos em redes `3G/4G`.

### RNF-004: Compatibilidade com Navegadores Principais
- **Descrição:** O sistema deve ser totalmente compatível com os navegadores web mais utilizados do mercado.
- **Critério:** Funcionamento uniforme verificado nos navegadores Google Chrome, Apple Safari, Microsoft Edge e Mozilla Firefox em versões modernas.

### RNF-005: Organização e Clareza Visual (Acessibilidade Básica)
- **Descrição:** O visual do site deve seguir um padrão claro, limpo e profissional.
- **Critério:** Utilização das cores oficiais da marca (Azul Noturno `#071A38`, Azul Oceano `#10326F` e Branco `#FFFFFF`) com contraste adequado entre texto e fundo para facilitar a leitura sob a luz do sol.

### RNF-006: Validação no Lado do Cliente via JavaScript
- **Descrição:** Todos os formulários e campos interativos do site devem passar por verificação antes do envio.
- **Critério:** O sistema deve validar no navegador (client-side) se campos obrigatórios foram preenchidos (como telefone e nome) e se o login administrativo possui credenciais válidas antes de processar as ações.

---

## 3. REGRAS DE NEGÓCIO (RNs)

### RN-001: Ocultação de Preços Financeiros
- **Descrição:** Em nenhuma hipótese o catálogo do site exibirá preços numéricos ou valores fixos de produtos ou serviços.
- **Justificativa:** Devido às variações técnicas de cada projeto elétrico ou tamanho do tanque de piscicultura, todo orçamento exige atendimento personalizado direto com a equipe comercial via WhatsApp.

### RN-002: Destaque Prioritário do Oxilife Fish
- **Descrição:** A sonda Oxilife Fish deve ter visibilidade prioritária superior em relação aos serviços elétricos tradicionais.
- **Justificativa:** O Oxilife Fish é o produto tecnológico de maior valor agregado e o principal vetor da estratégia de expansão geográfica da Eletrotech para outros estados e países.