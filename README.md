# Sistema de Pedidos de Artes Gráficas - Design Express

## Descrição
Sistema interno completo para gestão de artes gráficas com funcionalidades para clientes e administradores.

## Funcionalidades

### Para Clientes:
- Login seguro
- Envio de pedidos de arte com upload de arquivos
- Acompanhamento de demandas
- Aprovação/reprovação de artes
- Diferentes tipos de arte (folders, posts, stories, etc.)
- Sistema de urgência

### Para Administradores:
- Dashboard completo de pedidos
- Filtros avançados (status, urgência, tipo, cliente)
- Gerenciamento de status dos pedidos
- Upload de artes para aprovação
- Observações internas
- Estatísticas do sistema

## Estrutura de Arquivos

```
sistema_artes_graficas/
├── index.html              # Página de login
├── css/
│   ├── style.css           # Estilos da página de login
│   ├── client.css          # Estilos da página do cliente
│   └── admin.css           # Estilos da página do administrador
├── js/
│   ├── script.js           # Lógica de autenticação
│   ├── client.js           # Funcionalidades do cliente
│   └── admin.js            # Funcionalidades do administrador
├── pages/
│   ├── client.html         # Página do cliente
│   └── admin.html          # Página do administrador
└── img/                    # Pasta para imagens (vazia)
```

## Como Usar

### 1. Configuração
- Extraia todos os arquivos em uma pasta
- Abra um servidor web local (pode usar Python: `python -m http.server 8000`)
- Acesse `http://localhost:8000` no navegador

### 2. Credenciais de Acesso

**Administrador:**
- Usuário: `admin`
- Senha: `admin`

**Clientes de Teste:**
- Usuário: `cliente1` / Senha: `123456`
- Usuário: `cliente2` / Senha: `123456`

### 3. Fluxo de Trabalho

1. **Cliente faz login** e acessa o painel
2. **Cliente envia pedido** preenchendo o formulário completo
3. **Administrador recebe** o pedido no dashboard
4. **Administrador inicia produção** alterando o status
5. **Administrador faz upload** da arte quando pronta
6. **Cliente aprova/reprova** a arte na seção "Minhas Demandas"
7. **Pedido é finalizado** quando aprovado pelo cliente

## Recursos Técnicos

- **Frontend:** HTML5, CSS3, JavaScript puro
- **Armazenamento:** LocalStorage (para demonstração)
- **Responsivo:** Layout adaptável para desktop e mobile
- **Autenticação:** Sistema simples baseado em localStorage
- **Upload:** Simulação de upload de arquivos

## Personalizações Possíveis

- Adicionar novos tipos de arte no arquivo `client.js` e `admin.js`
- Modificar cores e estilos nos arquivos CSS
- Adicionar novos usuários no arquivo `script.js`
- Integrar com backend real substituindo localStorage

## Observações

- Este é um protótipo funcional para demonstração
- Em produção, recomenda-se usar um backend real com banco de dados
- O sistema de upload é simulado (arquivos não são realmente enviados)
- As credenciais estão hardcoded para fins de demonstração

## Suporte

Para dúvidas ou personalizações, consulte a documentação do código ou entre em contato com o desenvolvedor.

