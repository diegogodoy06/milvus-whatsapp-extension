  togglePanel(show = null) {
    const panel = document.getElementById('ti-support-panel');
    if (!panel) return;

    this.panelVisible = show !== null ? show : !this.panelVisible;
    
    if (this.panelVisible) {
      console.log('📂 Mostrando painel fixo lateral...');
      
      panel.classList.remove('hidden');
      document.body.classList.remove('ti-panel-hidden');
      
      // LIMPA cache e força recarregamento SEMPRE ao mostrar
      console.log('🧹 Limpando cache de tickets...');
      this.tickets = [];
      this.currentContact = null;
      this.currentPhone = null;
      
      // Aguarda painel aparecer, então detecta contato e carrega
      setTimeout(() => {
        console.log('🔍 Forçando detecção de contato ao mostrar painel...');
        this.detectContactChange();
        this.loadTickets();
      }, 100);
      
    } else {
      console.log('📁 Ocultando painel fixo lateral...');
      
      panel.classList.add('hidden');
      document.body.classList.add('ti-panel-hidden');
    }
  }
