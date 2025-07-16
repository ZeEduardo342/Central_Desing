// Proteger a página (apenas administradores podem acessar)
if (!protectPage('admin')) {
    // Se não for admin, redireciona
}

// Elementos da página
const btnDashboard = document.getElementById('btnDashboard');
const btnEstatisticas = document.getElementById('btnEstatisticas');
const btnLogout = document.getElementById('btnLogout');
const dashboardSection = document.getElementById('dashboard');
const estatisticasSection = document.getElementById('estatisticas');
const modal = document.getElementById('modalPedido');
const closeModal = document.querySelector('.close');

// Filtros
const filtroStatus = document.getElementById('filtroStatus');
const filtroUrgencia = document.getElementById('filtroUrgencia');
const filtroTipo = document.getElementById('filtroTipo');
const filtroCliente = document.getElementById('filtroCliente');

// Navegação entre seções
btnDashboard.addEventListener('click', () => {
    showSection('dashboard');
    setActiveButton(btnDashboard);
    loadDashboard();
});

btnEstatisticas.addEventListener('click', () => {
    showSection('estatisticas');
    setActiveButton(btnEstatisticas);
    loadEstatisticas();
});

btnLogout.addEventListener('click', logout);

// Event listeners para filtros
filtroStatus.addEventListener('change', filterPedidos);
filtroUrgencia.addEventListener('change', filterPedidos);
filtroTipo.addEventListener('change', filterPedidos);
filtroCliente.addEventListener('input', filterPedidos);

// Modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Funções principais
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

function loadDashboard() {
    updateStats();
    loadPedidos();
}

function updateStats() {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    
    const totalPedidos = pedidos.length;
    const pedidosUrgentes = pedidos.filter(p => p.urgencia === 'critica').length;
    const pedidosPendentes = pedidos.filter(p => ['aguardando', 'producao', 'aprovacao'].includes(p.status)).length;
    const pedidosFinalizados = pedidos.filter(p => p.status === 'finalizada').length;
    
    document.getElementById('totalPedidos').textContent = totalPedidos;
    document.getElementById('pedidosUrgentes').textContent = pedidosUrgentes;
    document.getElementById('pedidosPendentes').textContent = pedidosPendentes;
    document.getElementById('pedidosFinalizados').textContent = pedidosFinalizados;
}

function loadPedidos() {
    const listaPedidos = document.getElementById('listaPedidos');
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    
    if (pedidos.length === 0) {
        listaPedidos.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum pedido encontrado</h3>
                <p>Ainda não há pedidos no sistema.</p>
            </div>
        `;
        return;
    }
    
    // Ordenar por data (mais recentes primeiro) e urgência
    const pedidosOrdenados = pedidos.sort((a, b) => {
        // Primeiro por urgência
        const urgenciaOrder = { 'critica': 3, 'moderada': 2, 'leve': 1 };
        const urgenciaA = urgenciaOrder[a.urgencia] || 0;
        const urgenciaB = urgenciaOrder[b.urgencia] || 0;
        
        if (urgenciaA !== urgenciaB) {
            return urgenciaB - urgenciaA;
        }
        
        // Depois por data
        return new Date(b.dataEnvio) - new Date(a.dataEnvio);
    });
    
    listaPedidos.innerHTML = '';
    
    pedidosOrdenados.forEach(pedido => {
        const pedidoCard = createPedidoCard(pedido);
        listaPedidos.appendChild(pedidoCard);
    });
}

function createPedidoCard(pedido) {
    const card = document.createElement('div');
    card.className = 'pedido-card';
    card.onclick = () => openPedidoModal(pedido);
    
    const statusClass = `status-${pedido.status.replace(' ', '-').toLowerCase()}`;
    const statusText = getStatusText(pedido.status);
    const urgenciaClass = `urgencia-${pedido.urgencia}`;
    const urgenciaText = getUrgenciaText(pedido.urgencia);
    const tipoArteText = getTipoArteText(pedido.tipoArte);
    
    card.innerHTML = `
        <div class="pedido-header">
            <div>
                <span class="pedido-title">${tipoArteText}</span>
                <span class="pedido-id">#${pedido.id}</span>
                <span class="urgencia-badge ${urgenciaClass}">${urgenciaText.split(' - ')[0]}</span>
            </div>
            <div class="status-badge ${statusClass}">${statusText}</div>
        </div>
        
        <div class="pedido-info">
            <div class="info-item">
                <div class="info-label">Cliente</div>
                <div class="info-value">${pedido.nomeCompleto}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Data do Pedido</div>
                <div class="info-value">${pedido.dataEnvio}</div>
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
        
        <div class="pedido-actions" onclick="event.stopPropagation()">
            ${getActionButtons(pedido)}
        </div>
    `;
    
    return card;
}

function getActionButtons(pedido) {
    let buttons = '';
    
    switch (pedido.status) {
        case 'aguardando':
            buttons = `
                <button class="btn btn-primary" onclick="changeStatus('${pedido.id}', 'producao')">Iniciar Produção</button>
                <button class="btn btn-danger" onclick="changeStatus('${pedido.id}', 'reprovada')">Reprovar</button>
            `;
            break;
        case 'producao':
            buttons = `
                <button class="btn btn-warning" onclick="uploadArte('${pedido.id}')">Upload Arte</button>
                <button class="btn btn-success" onclick="changeStatus('${pedido.id}', 'aprovacao')">Enviar p/ Aprovação</button>
            `;
            break;
        case 'aprovacao':
            buttons = `
                <button class="btn btn-primary" onclick="uploadArte('${pedido.id}')">Atualizar Arte</button>
            `;
            break;
        case 'reprovada':
            buttons = `
                <button class="btn btn-primary" onclick="changeStatus('${pedido.id}', 'producao')">Reiniciar Produção</button>
            `;
            break;
        case 'finalizada':
            buttons = `
                <button class="btn btn-success" disabled>Finalizado</button>
            `;
            break;
    }
    
    return buttons;
}

function changeStatus(pedidoId, novoStatus) {
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const pedidoIndex = pedidos.findIndex(p => p.id === pedidoId);
    
    if (pedidoIndex !== -1) {
        if (novoStatus === 'reprovada') {
            const motivo = prompt('Motivo da reprovação:');
            if (!motivo) return;
            pedidos[pedidoIndex].observacoes = `Reprovado pelo admin: ${motivo}`;
        }
        
        pedidos[pedidoIndex].status = novoStatus;
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        loadDashboard();
        
        const statusText = getStatusText(novoStatus);
        alert(`Status alterado para: ${statusText}`);
    }
}

function uploadArte(pedidoId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            // Simular upload (em um sistema real, seria enviado para o servidor)
            const reader = new FileReader();
            reader.onload = function(e) {
                let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
                const pedidoIndex = pedidos.findIndex(p => p.id === pedidoId);
                
                if (pedidoIndex !== -1) {
                    pedidos[pedidoIndex].arteUrl = e.target.result;
                    pedidos[pedidoIndex].status = 'aprovacao';
                    localStorage.setItem('pedidos', JSON.stringify(pedidos));
                    loadDashboard();
                    alert('Arte enviada para aprovação do cliente!');
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

function openPedidoModal(pedido) {
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="form-group">
            <label>ID do Pedido:</label>
            <input type="text" value="#${pedido.id}" readonly>
        </div>
        
        <div class="form-group">
            <label>Cliente:</label>
            <input type="text" value="${pedido.nomeCompleto}" readonly>
        </div>
        
        <div class="form-group">
            <label>E-mail:</label>
            <input type="email" value="${pedido.email}" readonly>
        </div>
        
        <div class="form-group">
            <label>Telefone:</label>
            <input type="tel" value="${pedido.telefone}" readonly>
        </div>
        
        <div class="form-group">
            <label>Tipo de Arte:</label>
            <input type="text" value="${getTipoArteText(pedido.tipoArte)}" readonly>
        </div>
        
        ${pedido.redeSocial ? `
            <div class="form-group">
                <label>Rede Social:</label>
                <input type="text" value="${pedido.redeSocial}" readonly>
            </div>
        ` : ''}
        
        <div class="form-group">
            <label>Urgência:</label>
            <input type="text" value="${getUrgenciaText(pedido.urgencia)}" readonly>
        </div>
        
        <div class="form-group">
            <label>Status:</label>
            <input type="text" value="${getStatusText(pedido.status)}" readonly>
        </div>
        
        <div class="form-group">
            <label>Data do Pedido:</label>
            <input type="text" value="${pedido.dataEnvio}" readonly>
        </div>
        
        <div class="form-group">
            <label>Descrição:</label>
            <textarea readonly>${pedido.descricao}</textarea>
        </div>
        
        ${pedido.arquivos && pedido.arquivos.length > 0 ? `
            <div class="form-group">
                <label>Arquivos de Referência:</label>
                <ul>
                    ${pedido.arquivos.map(arquivo => `<li>${arquivo.nome} (${(arquivo.tamanho / 1024).toFixed(1)} KB)</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        
        ${pedido.arteUrl ? `
            <div class="form-group">
                <label>Arte Atual:</label>
                <img src="${pedido.arteUrl}" alt="Arte" style="max-width: 100%; height: auto; border-radius: 4px;">
            </div>
        ` : ''}
        
        <div class="form-group">
            <label for="observacoesAdmin">Observações Internas:</label>
            <textarea id="observacoesAdmin" placeholder="Adicione observações internas...">${pedido.observacoesAdmin || ''}</textarea>
        </div>
        
        <div class="pedido-actions">
            <button class="btn btn-primary" onclick="salvarObservacoes('${pedido.id}')">Salvar Observações</button>
            ${getActionButtons(pedido)}
        </div>
    `;
    
    modal.style.display = 'block';
}

function salvarObservacoes(pedidoId) {
    const observacoes = document.getElementById('observacoesAdmin').value;
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const pedidoIndex = pedidos.findIndex(p => p.id === pedidoId);
    
    if (pedidoIndex !== -1) {
        pedidos[pedidoIndex].observacoesAdmin = observacoes;
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        alert('Observações salvas com sucesso!');
    }
}

function filterPedidos() {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const statusFilter = filtroStatus.value;
    const urgenciaFilter = filtroUrgencia.value;
    const tipoFilter = filtroTipo.value;
    const clienteFilter = filtroCliente.value.toLowerCase();
    
    const pedidosFiltrados = pedidos.filter(pedido => {
        const matchStatus = !statusFilter || pedido.status === statusFilter;
        const matchUrgencia = !urgenciaFilter || pedido.urgencia === urgenciaFilter;
        const matchTipo = !tipoFilter || pedido.tipoArte === tipoFilter;
        const matchCliente = !clienteFilter || 
            pedido.nomeCompleto.toLowerCase().includes(clienteFilter) ||
            pedido.cliente.toLowerCase().includes(clienteFilter);
        
        return matchStatus && matchUrgencia && matchTipo && matchCliente;
    });
    
    displayFilteredPedidos(pedidosFiltrados);
}

function displayFilteredPedidos(pedidos) {
    const listaPedidos = document.getElementById('listaPedidos');
    
    if (pedidos.length === 0) {
        listaPedidos.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum pedido encontrado</h3>
                <p>Nenhum pedido corresponde aos filtros aplicados.</p>
            </div>
        `;
        return;
    }
    
    listaPedidos.innerHTML = '';
    
    pedidos.forEach(pedido => {
        const pedidoCard = createPedidoCard(pedido);
        listaPedidos.appendChild(pedidoCard);
    });
}

function loadEstatisticas() {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    
    // Estatísticas por tipo
    const estatisticasTipo = {};
    pedidos.forEach(pedido => {
        const tipo = getTipoArteText(pedido.tipoArte);
        estatisticasTipo[tipo] = (estatisticasTipo[tipo] || 0) + 1;
    });
    
    displayEstatisticas('estatisticasTipo', estatisticasTipo);
    
    // Estatísticas por urgência
    const estatisticasUrgencia = {};
    pedidos.forEach(pedido => {
        const urgencia = getUrgenciaText(pedido.urgencia).split(' - ')[0];
        estatisticasUrgencia[urgencia] = (estatisticasUrgencia[urgencia] || 0) + 1;
    });
    
    displayEstatisticas('estatisticasUrgencia', estatisticasUrgencia);
    
    // Estatísticas por status
    const estatisticasStatus = {};
    pedidos.forEach(pedido => {
        const status = getStatusText(pedido.status);
        estatisticasStatus[status] = (estatisticasStatus[status] || 0) + 1;
    });
    
    displayEstatisticas('estatisticasStatus', estatisticasStatus);
    
    // Tempo médio de entrega (simulado)
    const tempoMedio = document.getElementById('tempoMedio');
    const pedidosFinalizados = pedidos.filter(p => p.status === 'finalizada');
    if (pedidosFinalizados.length > 0) {
        tempoMedio.textContent = '2.5 dias úteis';
    } else {
        tempoMedio.textContent = 'Sem dados suficientes';
    }
}

function displayEstatisticas(elementId, dados) {
    const elemento = document.getElementById(elementId);
    
    if (Object.keys(dados).length === 0) {
        elemento.innerHTML = '<p>Sem dados disponíveis</p>';
        return;
    }
    
    elemento.innerHTML = '';
    
    Object.entries(dados).forEach(([nome, count]) => {
        const item = document.createElement('div');
        item.className = 'stat-item';
        item.innerHTML = `
            <span class="stat-name">${nome}</span>
            <span class="stat-count">${count}</span>
        `;
        elemento.appendChild(item);
    });
}

// Funções auxiliares (reutilizadas do client.js)
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

// Inicializar dashboard ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
});

