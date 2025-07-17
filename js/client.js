// Proteger a página (apenas clientes podem acessar)
if (!protectPage('client')) {
    // Se não for cliente, redireciona
}

// Elementos da página
const btnEnviarPedido = document.getElementById('btnEnviarPedido');
const btnMinhasDemandas = document.getElementById('btnMinhasDemandas');
const btnLogout = document.getElementById('btnLogout');
const enviarPedidoSection = document.getElementById('enviarPedido');
const minhasDemandasSection = document.getElementById('minhasDemandas');
const pedidoForm = document.getElementById('pedidoForm');
const tipoArteSelect = document.getElementById('tipoArte');
const redeSocialGroup = document.getElementById('redeSocialGroup');

// Navegação entre seções
btnEnviarPedido.addEventListener('click', () => {
    showSection('enviarPedido');
    setActiveButton(btnEnviarPedido);
});

btnMinhasDemandas.addEventListener('click', () => {
    showSection('minhasDemandas');
    setActiveButton(btnMinhasDemandas);
    loadDemandas();
});

btnLogout.addEventListener('click', logout);

// Mostrar/ocultar campo de rede social baseado no tipo de arte
tipoArteSelect.addEventListener('change', function() {
    if (this.value === 'post-feed') {
        redeSocialGroup.style.display = 'block';
        document.getElementById('redeSocial').required = true;
    } else {
        redeSocialGroup.style.display = 'none';
        document.getElementById('redeSocial').required = false;
    }
});

// Submissão do formulário de pedido
pedidoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const pedido = {
        id: Date.now().toString(),
        cliente: getCurrentUser().username,
        nomeCompleto: formData.get('nomeCompleto'),
        email: formData.get('email'),
        telefone: formData.get('telefone'),
        tipoArte: formData.get('tipoArte'),
        redeSocial: formData.get('redeSocial') || '',
        descricao: formData.get('descricao'),
        urgencia: formData.get('urgencia'),
        status: 'aguardando',
        dataEnvio: new Date().toLocaleDateString('pt-BR'),
        arquivos: []
    };
    
    // Simular upload de arquivos (em um sistema real, seria enviado para o servidor)
    const arquivos = document.getElementById('arquivos').files;
    for (let i = 0; i < arquivos.length; i++) {
        pedido.arquivos.push({
            nome: arquivos[i].name,
            tamanho: arquivos[i].size,
            tipo: arquivos[i].type
        });
    }
    
        // 🔧 SALVAR NO FIRESTORE
    try {
        await addDoc(collection(db, 'pedidos'), pedido);
        alert('Pedido enviado com sucesso! Você pode acompanhar o status na seção "Minhas Demandas".');
        this.reset();
        redeSocialGroup.style.display = 'none';
    } catch (error) {
        console.error("Erro ao enviar pedido:", error);
        alert("Ocorreu um erro ao enviar seu pedido. Tente novamente mais tarde.");
    }
});

// Funções auxiliares
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function setActiveButton(activeBtn) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

function savePedido(pedido) {
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
}
// 🔧 CARREGAR PEDIDOS DO FIRESTORE EM VEZ DO LOCALSTORAGE
async function loadDemandas() {
    const listaDemandas = document.getElementById('listaDemandas');
    const currentUser = getCurrentUser();

    try {
        const q = query(collection(db, "pedidos"), where("cliente", "==", currentUser.username));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
        listaDemandas.innerHTML = `
            <div class="empty-state">
                <h3>Nenhuma demanda encontrada</h3>
                <p>Você ainda não enviou nenhum pedido. Clique em "Enviar Pedido" para começar.</p>
            </div>
        `;
        return;
    }
    
    listaDemandas.innerHTML = '';
    
    meusPedidos.forEach(pedido => {
        const demandaCard = createDemandaCard(pedido);
        listaDemandas.appendChild(demandaCard);
    });
}

function createDemandaCard(pedido) {
    const card = document.createElement('div');
    card.className = 'demanda-card';
    
    const statusClass = `status-${pedido.status.replace(' ', '-').toLowerCase()}`;
    const statusText = getStatusText(pedido.status);
    const urgenciaText = getUrgenciaText(pedido.urgencia);
    const tipoArteText = getTipoArteText(pedido.tipoArte);
    
    card.innerHTML = `
        <div class="demanda-header">
            <div class="demanda-title">${tipoArteText}</div>
            <div class="status-badge ${statusClass}">${statusText}</div>
        </div>
        
        <div class="demanda-info">
            <div class="info-item">
                <div class="info-label">Data do Pedido</div>
                <div class="info-value">${pedido.dataEnvio}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Urgência</div>
                <div class="info-value">${urgenciaText}</div>
            </div>
            <div class="info-item">
                <div class="info-label">E-mail</div>
                <div class="info-value">${pedido.email}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Telefone</div>
                <div class="info-value">${pedido.telefone}</div>
            </div>
        </div>
        
        <div class="info-item">
            <div class="info-label">Descrição</div>
            <div class="info-value">${pedido.descricao}</div>
        </div>
        
        ${pedido.arteUrl ? `
            <div class="info-item">
                <div class="info-label">Arte para Aprovação</div>
                <img src="${pedido.arteUrl}" alt="Arte para aprovação" class="arte-preview">
            </div>
        ` : ''}
        
        ${pedido.status === 'aprovacao' ? `
            <div class="demanda-actions">
                <button class="btn-aprovar" onclick="aprovarPedido('${pedido.id}')">✅ Aprovar</button>
                <button class="btn-reprovar" onclick="reprovarPedido('${pedido.id}')">❌ Reprovar</button>
            </div>
        ` : ''}
        
        ${pedido.observacoes ? `
            <div class="info-item">
                <div class="info-label">Observações</div>
                <div class="info-value">${pedido.observacoes}</div>
            </div>
        ` : ''}
    `;
    
    return card;
}

function getStatusText(status) {
    const statusMap = {
        'aguardando': 'Aguardando Análise',
        'producao': 'Em Produção',
        'aprovacao': 'Aguardando Aprovação',
        'finalizada': 'Aprovada e Finalizada',
        'reprovada': 'Reprovada'
    };
    return statusMap[status] || status;
}

function getUrgenciaText(urgencia) {
    const urgenciaMap = {
        'critica': 'Urgência Crítica - Até 24h',
        'moderada': 'Urgência Moderada - 24h a 3 dias úteis',
        'leve': 'Urgência Leve - 3 a +7 dias úteis'
    };
    return urgenciaMap[urgencia] || urgencia;
}

function getTipoArteText(tipo) {
    const tipoMap = {
        'folders-flyers': 'Folders e Flyers',
        'post-feed': 'Post para Feed',
        'post-stories': 'Post para Stories',
        'arte-reels': 'Arte para Reels/TikTok',
        'capas-destaques': 'Capas para Destaques',
        'avatar-perfil': 'Avatar / Foto de Perfil'
    };
    return tipoMap[tipo] || tipo;
}

function aprovarPedido(pedidoId) {
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const pedidoIndex = pedidos.findIndex(p => p.id === pedidoId);
    
    if (pedidoIndex !== -1) {
        pedidos[pedidoIndex].status = 'finalizada';
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        loadDemandas();
        alert('Pedido aprovado com sucesso!');
    }
}

function reprovarPedido(pedidoId) {
    const motivo = prompt('Por favor, informe o motivo da reprovação:');
    if (motivo) {
        let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        const pedidoIndex = pedidos.findIndex(p => p.id === pedidoId);
        
        if (pedidoIndex !== -1) {
            pedidos[pedidoIndex].status = 'reprovada';
            pedidos[pedidoIndex].observacoes = `Reprovado pelo cliente: ${motivo}`;
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            loadDemandas();
            alert('Pedido reprovado. O motivo foi enviado para o administrador.');
        }
    }
}

// Carregar demandas ao inicializar a página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se deve mostrar a seção de demandas baseado na URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('section') === 'demandas') {
        showSection('minhasDemandas');
        setActiveButton(btnMinhasDemandas);
        loadDemandas();
    }
});

