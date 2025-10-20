# 🔍 Debug do WhatsApp Web

## Execute estes comandos no Console (F12):

### 1. Verificar estrutura do header:
```javascript
document.querySelector('header')
```

### 2. Verificar headers com classe específica:
```javascript
document.querySelectorAll('header')
```

### 3. Verificar por classes comuns do WhatsApp:
```javascript
document.querySelector('header[class*="header"]')
```

### 4. Verificar estrutura do chat:
```javascript
document.querySelector('[data-testid="chat"]')
```

### 5. Listar todos os data-testid:
```javascript
Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid'))
```

### 6. Verificar header alternativo:
```javascript
document.querySelector('header._amid')
```

### 7. Buscar por estrutura de conversa:
```javascript
document.querySelector('[data-id][data-tab]')
```

---

## 📋 COPIE E COLE NO CONSOLE:

```javascript
console.log('=== DEBUG WHATSAPP ===');
console.log('1. Header padrão:', document.querySelector('header'));
console.log('2. Header conversa:', document.querySelector('header[data-testid="conversation-header"]'));
console.log('3. Headers total:', document.querySelectorAll('header').length);
console.log('4. Chat testid:', document.querySelector('[data-testid="chat"]'));
console.log('5. Header com classe:', document.querySelector('header[class]'));
console.log('6. Todos testids:', Array.from(document.querySelectorAll('[data-testid]')).slice(0, 10).map(el => el.getAttribute('data-testid')));
```

**Cole o resultado aqui!**
