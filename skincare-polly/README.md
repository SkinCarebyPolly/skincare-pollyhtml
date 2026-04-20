# 🌿 skincarebypolly · Protocolos de Clientes

Repositório privado com os apps de protocolo de skincare personalizado para cada cliente.

---

## 🗂 Estrutura do repositório

```
skincare-polly/
├── index.html                    ← Hub de clientes (página inicial)
├── _template/                    ← Template para novos clientes
│   └── index.html
└── clientes/
    └── bianca-levak/             ← Um folder por cliente
        ├── index.html            ← Tela de login
        ├── app.html              ← Conteúdo do protocolo
        ├── manifest.json         ← Configuração PWA
        ├── sw.js                 ← Service Worker (modo offline)
        └── icons/                ← Ícones do app
```

---

## 🚀 Deploy no GitHub Pages

### Primeira vez

```bash
git clone https://github.com/SEU_USUARIO/skincare-polly.git
cd skincare-polly
git add .
git commit -m "deploy inicial"
git push origin main
```

Depois no GitHub:
1. Vá em **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** → **/ (root)**
4. Clique em **Save**

Seu link vai ser: `https://SEU_USUARIO.github.io/skincare-polly`

Link da Bianca: `https://SEU_USUARIO.github.io/skincare-polly/clientes/bianca-levak`

---

## 🔄 Como atualizar o protocolo de uma cliente

1. Peça o novo `app.html` atualizado (gerado pelo Claude)
2. Substitua o arquivo na pasta da cliente:
   ```bash
   cp novo-app.html clientes/bianca-levak/app.html
   git add .
   git commit -m "atualiza protocolo bianca - abril 2026"
   git push
   ```
3. Em ~1 minuto o link já está atualizado. Link não muda.

---

## ➕ Como adicionar uma nova cliente

### 1. Crie a pasta da cliente
```bash
mkdir -p clientes/nome-da-cliente/icons
```

### 2. Copie os arquivos do template
```bash
cp _template/index.html clientes/nome-da-cliente/
cp clientes/bianca-levak/manifest.json clientes/nome-da-cliente/
cp clientes/bianca-levak/sw.js clientes/nome-da-cliente/
cp -r clientes/bianca-levak/icons clientes/nome-da-cliente/
```

### 3. Coloque o app.html gerado pelo Claude
```bash
cp novo-protocolo.html clientes/nome-da-cliente/app.html
```

### 4. Edite o login no `index.html` da nova cliente
Abra `clientes/nome-da-cliente/index.html` e altere:
```js
const USUARIOS = [
  { nome: 'Nome da Cliente', usuario: 'usuario', senha: 'senha123' },
  { nome: 'Pollianna',       usuario: 'polly',   senha: 'admin2025' },
];
```

### 5. Adicione a cliente no hub (`index.html` da raiz)
```html
<a href="clientes/nome-da-cliente/index.html" class="card">
  <div class="card-avatar">N</div>
  <div>
    <div class="card-name">Nome da Cliente</div>
    <div class="card-sub">Protocolo Ativo · Tipo de Pele</div>
  </div>
  <div class="card-arrow">›</div>
</a>
```

### 6. Faça o push
```bash
git add .
git commit -m "adiciona cliente nome-da-cliente"
git push
```

---

## 🔐 Credenciais de acesso

| Cliente | Usuário | Senha | Link |
|---|---|---|---|
| Bianca Levak | `bianca` | `skincarepolly123` | `/clientes/bianca-levak` |
| Polly (admin) | `polly` | `admin2025` | qualquer |

> ⚠️ Nunca compartilhe este repositório publicamente. Mantenha como **privado**.

---

## 📲 Instrução para a cliente instalar como app

Manda essa mensagem junto com o link:

> *"Oi! Aqui está seu protocolo personalizado 🌿*
> *Acesse pelo link abaixo, faça login com a senha que te enviei.*
> *Para salvar como app no seu celular:*
> *📱 iPhone: toque no ícone de compartilhar (⬆️) → "Adicionar à Tela de Início"*
> *📱 Android: toque nos 3 pontinhos (⋮) → "Adicionar à tela inicial"*
> *Vai aparecer um ícone na tela do seu celular, igual a um app!"*

---

## 🛠 Dicas

- O repositório pode ser **privado** — o GitHub Pages funciona normalmente
- O link da cliente **nunca muda**, mesmo quando você atualiza o conteúdo
- O app funciona **offline** depois do primeiro acesso (Service Worker)
- Para mudar a senha de uma cliente, edite o `index.html` dela e faça push

---

*@skincarebypolly · Protocolos exclusivos personalizados*
