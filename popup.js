// Popup Script - Gerencia as configurações da extensão

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('configForm');
  const apiTokenInput = document.getElementById('apiToken');
  const geminiKeyInput = document.getElementById('geminiKey');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // URL fixa da API Milvus
  const MILVUS_API_URL = 'https://apiintegracao.milvus.com.br/api';

  // Carrega o token salvo
  chrome.storage.sync.get(['apiToken', 'geminiApiKey'], (result) => {
    if (result.apiToken) {
      apiTokenInput.value = result.apiToken;
    }
    if (result.geminiApiKey) {
      geminiKeyInput.value = result.geminiApiKey;
    }
  });

  // Salva o token
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
  const apiToken = apiTokenInput.value.trim();
  const geminiKey = geminiKeyInput.value.trim();
    
    if (!apiToken) {
      showStatus('❌ Por favor, insira o token', 'error');
      return;
    }

    // Validação básica do token
    if (apiToken.length < 20) {
      showStatus('❌ Token parece muito curto. Verifique se copiou corretamente.', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ Testando conexão...';

    try {
      // Testa a conexão com a API Milvus
      const testResponse = await fetch(`${MILVUS_API_URL}/chamado/listagem?total_registros=1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiToken
        },
        body: JSON.stringify({ 
          filtro_body: {
            status: 9 // Status "em aberto"
          }
        })
      });

      // Salva o token (sempre salva, mesmo se falhar o teste)
      chrome.storage.sync.set({ 
        apiBaseUrl: MILVUS_API_URL,
        apiToken: apiToken,
        geminiApiKey: geminiKey || null
      }, () => {
        if (testResponse.ok) {
          showStatus('✅ Token salvo e conexão validada!', 'success');
        } else if (testResponse.status === 401 || testResponse.status === 403) {
          showStatus('⚠️ Token salvo, mas parece estar inválido ou sem permissões', 'error');
        } else {
          showStatus(`⚠️ Token salvo, mas API retornou erro ${testResponse.status}`, 'error');
        }
        
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Salvar Token';

        // Recarrega a extensão nas abas do WhatsApp Web
        chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.reload(tab.id);
          });
        });
      });
    } catch (error) {
      console.error('Erro ao testar token:', error);
      
      // Salva mesmo com erro de conexão
      chrome.storage.sync.set({ 
        apiBaseUrl: MILVUS_API_URL,
        apiToken: apiToken,
        geminiApiKey: geminiKey || null
      }, () => {
        showStatus('⚠️ Token salvo, mas não foi possível testar a conexão', 'error');
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Salvar Token';
      });
    }
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';

    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 5000);
  }
});
