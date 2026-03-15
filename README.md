# Aquário 3D Interativo

Um simulador de aquário 3D desenvolvido com Three.js, featuring peixes com movimento natural e efeitos de aquário realistas.

## 🐠 Funcionalidades

### Características Principais
- **Câmera Frontal**: Simula a parede frontal do aquário como se fosse a tela
- **Peixes Animados**: Sistema de peixes com movimentos naturais baseados em algoritmos de flocking
- **Fallback Visual**: Esferas coloridas como fallback para modelos 3D complexos
- **Fundo de Vídeo**: Tentativa de carregar vídeo em loop com fallback para fundo azul
- **Movimento Fluida**: Sistema de movimentação natural com separação, alinhamento e coesão

### Sistema de Movimentação
- **Flocking Behavior**: Os peixes se movem em cardumes realistas
- **Evitação de Obstáculos**: Desviam naturalmente das paredes do aquário
- **Movimento Aleatório**: Comportamento de wander para movimentos orgânicos
- **Animação de Cauda**: Movimento sincronizado da cauda com a natação

### Elementos do Aquário
- **Paredes de Vidro**: Efeito transparente nas paredes do aquário
- **Decoração**: Plantas aquáticas e areia no fundo
- **Bolhas**: Bolhas de ar subindo periodicamente
- **Iluminação**: Sistema de luzes múltiplas para ambiente realista
- **Sombreamento**: Sombras dinâmicas dos peixes

### Controles Interativos
- **Quantidade de Peixes**: Slider para ajustar de 1 a 50 peixes
- **Velocidade**: Controle de velocidade de natação (0.1x a 3x)
- **Adicionar/Remover**: Botões para adicionar ou remover peixes individualmente
- **Alimentação**: Botão para alimentar os peixes com partículas de comida
- **Toggle Vídeo**: Alternar entre fundo de vídeo e fundo azul

## 🚀 Como Usar

1. Abra o arquivo `index.html` em um navegador moderno
2. Aguarde o carregamento do aquário
3. Use os controles no canto superior esquerdo para interagir

### Controles
- **Slider de Peixes**: Ajusta a quantidade de peixes no aquário
- **Slider de Velocidade**: Controla a velocidade de natação
- **Botão Alimentar**: Solta partículas de comida que os peixes comem
- **Botão Toggle Vídeo**: Alterna o fundo entre vídeo e cor azul

## 🛠️ Tecnologias

- **Three.js**: Biblioteca principal para renderização 3D
- **JavaScript ES6+**: Lógica do simulador
- **HTML5/CSS3**: Estrutura e estilização
- **WebGL**: Renderização acelerada por hardware

## 📁 Estrutura do Projeto

```
aquario3d/
├── index.html          # Página principal
├── aquarium.js         # Lógica do aquário 3D
└── README.md          # Documentação
```

## 🎮 Comportamento dos Peixes

O sistema implementa um algoritmo de flocking completo com:

1. **Separação**: Mantém distância dos outros peixes
2. **Alinhamento**: Alinha direção com peixes próximos
3. **Coesão**: Move-se em direção ao centro do cardume
4. **Wander**: Movimento exploratório aleatório
5. **Evitação**: Desvia das paredes do aquário

## 🌊 Efeitos Visuais

- **Transparência**: Paredes de vidro semi-transparentes
- **Refração**: Efeito de água nas luzes
- **Partículas**: Sistema de bolhas e comida
- **Sombras**: Sombras dinâmicas dos peixes
- **Fog**: Efeito de névoa subaquática

## 🔧 Configuração

O aquário pode ser facilmente personalizado ajustando:

- Dimensões do aquário (`aquariumBounds`)
- Cores dos peixes (array `colors`)
- Intensidade das luzes
- Comportamento de flocking (pesos das forças)

## 📱 Compatibilidade

- Navegadores modernos com suporte a WebGL
- Chrome, Firefox, Safari, Edge
- Resolução responsiva (adapta ao tamanho da tela)

## 🎯 Melhorias Futuras

- Modelos 3D mais detalhados para peixes
- Mais espécies de peixes com comportamentos diferentes
- Interação com mouse/touch
- Sistema de som ambiente
- Mais opções de decoração
- Modo tela cheia
