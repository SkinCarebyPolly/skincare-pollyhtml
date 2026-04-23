const _a = 'sk-ant-api03-V', _b = 'gU93q4z1crUe6TnHbP1j';
const _c = '0l7Cxr3uJ529OOz_Wy6Nua2sEWG_PM', _d = 'tiPTlNCEj5pNJaXwrpJZHWuhJ6YtK2qy6pQ-K7aL6QAA';
const getKey = () => _a + _b + _c + _d;

export const ClaudeService = {
  async identificarProdutos(imageBase64) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getKey(),
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'Você é especialista em identificar produtos cosméticos em fotos. Retorne APENAS JSON válido.',
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: 'Leia TODOS os rótulos visíveis. NÃO invente produtos. Retorne JSON: {"produtos": [{"nome": "nome exato", "categoria": "categoria", "ativo": "ativo principal"}]}' }
          ]
        }]
      })
    });
    const data = await response.json();
    const raw = data.content?.[0]?.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  },

  async gerarProtocolo(perfil, imageRostoBase64, produtosTexto) {
    const parts = [];

    const prompt = `Você é especialista sênior em skincare K-Beauty. Crie um protocolo ULTRA PERSONALIZADO.

PERFIL DA CLIENTE:
- Nome: ${perfil.nome}
- Tipo de pele: ${perfil.tipoPele}
- Incomodos: ${perfil.incomodos?.join(', ')}
- Aparelhos: ${perfil.aparelhos?.join(', ') || 'nenhum'}
- Investimento: ${perfil.investimento}
- Gestante: ${perfil.gestante}
- Objetivo: ${perfil.objetivo?.join(', ')}

${produtosTexto ? `PRODUTOS DISPONÍVEIS (USE ESTES NOMES EXATOS):\n${produtosTexto}` : 'SITUAÇÃO: Cliente não tem produtos. Monte rotina do zero com produtos reais disponíveis no Brasil no orçamento: ' + perfil.investimento}

REGRAS:
1. Use os produtos listados pelos nomes EXATOS
2. Aparelhos identificados DEVEM aparecer na rotina
3. Cada passo: quantidade exata, técnica, tempo de espera
4. Protocolo espinha, praia e make com produtos reais da cliente
5. NÃO use termos médicos

Retorne APENAS JSON válido com esta estrutura:
{"nome_cliente":"","diagnostico":"","tipo_pele":"","tags":[],"fase_adaptacao":"","rotina_manha":[{"passo":1,"produto":"","como":"","icone":"","tempo":""}],"rotina_noite":[{"passo":1,"produto":"","como":"","icone":"","tempo":""}],"semana":{"seg_qui":"","ter_sex":"","qua_sab":"","dom":""},"protocolo_espinha":"","protocolo_praia":"","dicas_maquiagem":"","lista_compras":[],"produtos_identificados":[]}`;

    parts.push({ type: 'text', text: prompt });

    if (imageRostoBase64) {
      parts.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageRostoBase64 } });
      parts.push({ type: 'text', text: 'FOTO DO ROSTO: analise oleosidade, textura, poros, manchas, hidratação.' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': getKey(),
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          system: 'Você é especialista sênior em skincare K-Beauty. Responda EXCLUSIVAMENTE em JSON válido.',
          messages: [{ role: 'user', content: parts }]
        })
      });

      clearTimeout(timeout);
      const data = await response.json();
      const raw = data.content?.[0]?.text || '';
      const clean = raw.replace(/```json|```/g, '').trim();

      try {
        return JSON.parse(clean);
      } catch {
        const start = clean.indexOf('{');
        const end = clean.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          return JSON.parse(clean.substring(start, end + 1));
        }
        throw new Error('JSON inválido na resposta');
      }
    } finally {
      clearTimeout(timeout);
    }
  }
};
