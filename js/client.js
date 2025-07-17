// Importar configuração do Firebase
import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";

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
pedidoForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(this);
        const pedido = {
            cliente: getCurrentUser().username,
            nomeCompleto: formData.get('nomeCompleto'),
            email: formData.get('email'),
            telefone: formData.get('telefone'),
            tipoArte: formData.get('tipoArte'),
            redeSocial: formData.get('redeSocial') || '',
            descricao: formData.get('descricao'),
            urgencia: formData.get('urgencia'),
            status: 'aguardando',
            dataEnvio: new Date().toISOString(),
            dataEnvioFormatada: new Date().toLocaleDateString('pt-BR'),
            arquivos: []
        };
        
        // Processar arquivos (em um sistema real, seria enviado para o Firebase Storage)
        const arquivos = document.getElementById('arquivos').files;
        for (let i = 0; i < arquivos.length; i++) {
            pedido.arquivos.push({
                nome: arquivos[i].name,
                tamanho: arquivos[i].size,
                tipo: arquivos[i].type
            });
        }
        
        // Salvar pedido no Firestore
        await savePedidoFirebase(pedido);
        
        // Mostrar mensagem de sucesso
        alert('Pedido enviado com sucesso! Você pode acompanhar o status na seção "Minhas Demandas".');
        
        // Limpar formulário
        this.reset();
        redeSocialGroup.style.display = 'none';
        
    } catch (error) {
        console.error('Erro ao enviar pedido:', error);
        alert('Erro ao enviar pedido. Tente novamente.');
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

// Função para salvar pedido no Firebase
async function savePedidoFirebase(pedido) {
    try {
        const docRef = await addDoc(collection(db, "pedidos"), pedido);
        console.log("Pedido salvo com ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Erro ao salvar pedido: ", error);
        throw error;
    }
}

// Função para carregar demandas do Firebase
async function loadDemandas() {
    const listaDemandas = document.getElementById('listaDemandas');
    const currentUser = getCurrentUser();
    
    try {
        // Buscar pedidos do usuário atual no Firestore
        const q = query(collection(db, "pedidos"), where("cliente", "==", currentUser.username));
        const querySnapshot = await getDocs(q);
        
        const meusPedidos = [];
        querySnapshot.forEach((doc) => {
            meusPedidos.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        if (meusPedidos.length === 0) {
            listaDemandas.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhuma demanda encontrada</h3>
                    <p>Você ainda não enviou nenhum pedido. Clique em "Enviar Pedido" para começar.</p>
                </div>
            `;
            return;
        }
        
        listaDemandas.innerHTML = '';
        
        // Ordenar por data de envio (mais recente primeiro)
        meusPedidos.sort((a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio));
        
        meusPedidos.forEach(pedido => {
            const demandaCard = createDemandaCard(pedido);
            listaDemandas.appendChild(demandaCard);
        });
        
    } catch (error) {
        console.error("Erro ao carregar demandas: ", error);
        listaDemandas.innerHTML = `
            <div class="empty-state">
                <h3>Erro ao carregar demandas</h3>
                <p>Ocorreu um erro ao carregar suas demandas. Tente novamente.</p>
            </div>
        `;
    }
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
                <div class="info-value">${pedido.dataEnvioFormatada}</div>
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

// Função para aprovar pedido no Firebase
async function aprovarPedido(pedidoId) {
    try {
        const pedidoRef = doc(db, "pedidos", pedidoId);
        await updateDoc(pedidoRef, {
            status: 'finalizada'
        });
        
        loadDemandas();
        alert('Pedido aprovado com sucesso!');
    } catch (error) {
        console.error("Erro ao aprovar pedido: ", error);
        alert('Erro ao aprovar pedido. Tente novamente.');
    }
}

// Função para reprovar pedido no Firebase
async function reprovarPedido(pedidoId) {
    const motivo = prompt('Por favor, informe o motivo da reprovação:');
    if (motivo) {
        try {
            const pedidoRef = doc(db, "pedidos", pedidoId);
            await updateDoc(pedidoRef, {
                status: 'reprovada',
                observacoes: `Reprovado pelo cliente: ${motivo}`
            });
            
            loadDemandas();
            alert('Pedido reprovado. O motivo foi enviado para o administrador.');
        } catch (error) {
            console.error("Erro ao reprovar pedido: ", error);
            alert('Erro ao reprovar pedido. Tente novamente.');
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

