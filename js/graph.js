export async function initGraph() {
    const container = document.getElementById('digital-brain-container');
    if (!container) return;

    container.innerHTML = '<div style="color: #64748b;">Laddar Digital Hjärna...</div>';
    
    // Sätt relative position så att sidopanelen positioneras korrekt inom boxen
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    try {
        const response = await fetch('http://localhost:3000/graph');
        const data = await response.json();

        container.innerHTML = ''; // Clear loading

        if (!data.nodes || data.nodes.length === 0) {
            container.innerHTML = '<div style="color: #64748b;">Ingen data tillgänglig från Wikin.</div>';
            return;
        }

        const connectionCounts = {};
        data.links.forEach(link => {
            connectionCounts[link.source] = (connectionCounts[link.source] || 0) + 1;
            connectionCounts[link.target] = (connectionCounts[link.target] || 0) + 1;
        });

        const visNodes = new vis.DataSet(data.nodes.map(node => {
            const connections = connectionCounts[node.id] || 0;
            return {
                id: node.id,
                label: node.title,
                value: 10 + (connections * 5),
                color: getColorForType(node.typ),
                font: { color: '#ffffff' },
                _content: node.content,
                typ: node.typ
            };
        }));

        const visEdges = new vis.DataSet(data.links.map(link => ({
            from: link.source,
            to: link.target,
            color: { color: 'rgba(255, 255, 255, 0.2)', highlight: '#3b82f6' }
        })));

        // Uppdatera tooltip text
        visNodes.update(visNodes.get().map(n => ({
            ...n,
            title: `<strong>${n.label}</strong><br>Kopplingar: ${connectionCounts[n.id] || 0}`
        })));

        const networkData = {
            nodes: visNodes,
            edges: visEdges
        };

        const options = {
            nodes: {
                shape: 'dot',
                scaling: {
                    min: 10,
                    max: 40,
                    label: { enabled: true, min: 14, max: 20 }
                },
                shadow: true
            },
            edges: {
                width: 1,
                smooth: { type: 'continuous' }
            },
            physics: {
                barnesHut: {
                    gravitationalConstant: -2000,
                    centralGravity: 0.1,
                    springLength: 150,
                    springConstant: 0.04
                },
                stabilization: { iterations: 150 }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                zoomView: true,
                dragView: true
            }
        };

        window.wikiNetwork = new vis.Network(container, networkData, options);

        window.wikiNetwork.on("click", function (params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const nodeData = visNodes.get(nodeId);
                showGraphSidebar(nodeData, data.links, visNodes);
            } else {
                hideGraphSidebar();
            }
        });

    } catch (err) {
        console.error('Kunde inte ladda grafen:', err);
        container.innerHTML = '<div style="color: #ef4444;">Kunde inte ansluta till Wiki-servern. Säkerställ att backend är startad på port 3000.</div>';
    }
}

function getColorForType(type) {
    switch(type) {
        case 'källa': return '#ef4444'; // Röd
        case 'entitet': return '#3b82f6'; // Blå
        case 'begrepp': return '#10b981'; // Grön
        case 'syntes': return '#8b5cf6'; // Lila
        default: return '#10b981';
    }
}

function showGraphSidebar(node, allLinks, allNodes) {
    let sidebar = document.getElementById('graph-sidebar');
    if (!sidebar) {
        sidebar = document.createElement('div');
        sidebar.id = 'graph-sidebar';
        sidebar.style.position = 'absolute';
        sidebar.style.top = '0';
        sidebar.style.right = '0';
        sidebar.style.width = '350px';
        sidebar.style.height = '100%';
        sidebar.style.background = 'rgba(15, 23, 42, 0.95)';
        sidebar.style.backdropFilter = 'blur(10px)';
        sidebar.style.borderLeft = '1px solid rgba(255,255,255,0.1)';
        sidebar.style.color = '#fff';
        sidebar.style.padding = '20px';
        sidebar.style.boxSizing = 'border-box';
        sidebar.style.overflowY = 'auto';
        sidebar.style.zIndex = '10';
        sidebar.style.transition = 'transform 0.3s ease';
        
        const container = document.getElementById('digital-brain-container');
        container.appendChild(sidebar);
    }
    
    // Leta upp kopplingar
    const connectedIds = allLinks
        .filter(l => l.source === node.id || l.target === node.id)
        .map(l => l.source === node.id ? l.target : l.source);
    
    const connectedList = connectedIds.map(id => {
        const n = allNodes.get(id);
        return n ? `<li><a href="#" onclick="window.focusGraphNode('${n.id}'); return false;" style="color:#3b82f6;">${n.label}</a></li>` : '';
    }).join('');

    const formattedContent = window.marked ? marked.parse(node._content || '*Inget innehåll*') : node._content;

    sidebar.innerHTML = `
        <button onclick="document.getElementById('graph-sidebar').style.transform='translateX(100%)'" style="float:right; background:transparent; border:none; color:#fff; cursor:pointer; font-size:1.2rem;">&times;</button>
        <h3 style="margin-top:0; color:#00f0ff;">${node.label}</h3>
        <p style="font-size:0.8rem; color:#94a3b8; text-transform:uppercase;">Typ: ${node.typ || 'begrepp'}</p>
        <hr style="border-color:rgba(255,255,255,0.1); margin:15px 0;">
        <div class="markdown-body" style="font-size: 0.9rem; color: #e2e8f0;">
            ${formattedContent}
        </div>
        <hr style="border-color:rgba(255,255,255,0.1); margin:15px 0;">
        <h4 style="font-size:0.9rem;">Relaterade ämnen:</h4>
        <ul style="padding-left: 20px; font-size:0.85rem; line-height: 1.6;">
            ${connectedList || '<li>Inga kopplingar</li>'}
        </ul>
        <button class="nav-btn" onclick="window.askAITopic('${node.label}')" style="width:100%; margin-top:20px; background:#e11d48; color:white; justify-content:center; padding: 10px; border-radius: 8px;">
            <i class="fas fa-robot"></i> Fråga AI om detta
        </button>
    `;
    sidebar.style.transform = 'translateX(0)';
}

function hideGraphSidebar() {
    const sidebar = document.getElementById('graph-sidebar');
    if (sidebar) {
        sidebar.style.transform = 'translateX(100%)';
    }
}

window.focusGraphNode = function(id) {
    if (window.wikiNetwork) {
        window.wikiNetwork.selectNodes([id]);
        window.wikiNetwork.focus(id, { scale: 1.2, animation: true });
        // Trigger click event manually to update sidebar
        window.wikiNetwork.emit("click", { nodes: [id] });
    }
};

window.askAITopic = function(topic) {
    const chatInput = document.getElementById('mentor-chat-input');
    if (chatInput) {
        chatInput.value = `Berätta mer om ${topic}`;
        // Automatically click the send button
        const sendBtn = document.getElementById('mentorSendBtn') || document.querySelector('.send-button');
        if (sendBtn) {
            sendBtn.click();
        } else {
            window.sendMessage('mentor');
        }
    }
};
