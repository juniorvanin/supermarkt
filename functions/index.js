const { setGlobalOptions } = require('firebase-functions')
const { onRequest } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')

setGlobalOptions({ maxInstances: 10 })

const openaiKey = defineSecret('OPENAI_API_KEY')

const DEPARTMENTS = [
  'hortifruti',
  'padaria',
  'acougue',
  'peixaria',
  'frios_e_laticinios',
  'mercearia',
  'bebidas',
  'congelados',
  'doces_e_snacks',
  'higiene_pessoal',
  'limpeza',
  'bebe',
  'pet',
  'casa_e_utilidades',
  'outros',
]

const SYSTEM_PROMPT = `Voce e um classificador de departamentos de supermercado.

O item sempre vem em portugues. Escolha o departamento MAIS adequado.

Departamentos validos (responda EXATAMENTE com um destes ids):
${DEPARTMENTS.join(', ')}

Significado de cada departamento:
- hortifruti: frutas, legumes e verduras frescas (ex.: banana, maca, alface, tomate, cebola, batata)
- padaria: paes, bolos e itens de padaria
- acougue: carnes e aves frescas
- peixaria: peixes e frutos do mar
- frios_e_laticinios: leite, queijos, iogurtes, manteiga, ovos, frios
- mercearia: secos e embalados de despensa (arroz, feijao, macarrao, oleo, cafe, temperos, enlatados)
- bebidas: aguas, refrigerantes, sucos, cervejas, vinhos e similares
- congelados: alimentos congelados
- doces_e_snacks: chocolates, biscoitos, salgadinhos, balas
- higiene_pessoal: shampoo, sabonete, creme dental, desodorante
- limpeza: detergente, agua sanitaria, produtos de limpeza
- bebe: fraldas, formula, papinha
- pet: racao e produtos para animais
- casa_e_utilidades: papel toalha, utensilios e utilidades domesticas
- outros: SOMENTE se realmente nao couber em nenhum departamento acima

Regras importantes:
1. Sempre escolha o melhor departamento possivel.
2. Frutas e verduras frescas NUNCA sao "outros"; use hortifruti.
3. Nao invente departamentos.
4. Responda apenas com JSON no formato: {"department":"hortifruti"}`

function extractDepartment(raw) {
  const text = String(raw || '').trim()

  try {
    const parsed = JSON.parse(text)
    if (parsed && parsed.department) {
      return String(parsed.department).trim().toLowerCase()
    }
  } catch (error) {
    // fall through to plain-text parsing
  }

  const match = text.toLowerCase().match(/[a-z_]+/g)
  if (!match) return 'outros'

  for (let i = 0; i < match.length; i++) {
    if (DEPARTMENTS.indexOf(match[i]) !== -1) return match[i]
  }

  return 'outros'
}

exports.categorize = onRequest(
  {
    secrets: [openaiKey],
    cors: true,
    invoker: 'public',
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Use POST')
      return
    }

    const name = String((req.body && req.body.name) || '').trim()
    if (!name) {
      res.status(400).json({ error: 'name obrigatório' })
      return
    }

    try {
      const OpenAI = require('openai')
      const openai = new OpenAI({ apiKey: openaiKey.value() })

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0,
        max_tokens: 40,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Item: ${name}\nQual o departamento mais apropriado?`,
          },
        ],
      })

      const content =
        response.choices[0] &&
        response.choices[0].message &&
        response.choices[0].message.content

      let department = extractDepartment(content)
      if (DEPARTMENTS.indexOf(department) === -1) {
        department = 'outros'
      }

      res.json({
        category: department,
        departments: DEPARTMENTS,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Falha ao categorizar o item' })
    }
  },
)
