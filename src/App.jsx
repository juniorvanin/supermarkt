import { useState } from 'react'
import './App.css'

function normalize(value) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR')
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const INITIAL_USERS = [
  'Ana',
  'Junior',
  'Jean',
  'Karla',
  'Sarah',
  'Vitor',
  'Felipe',
  'Mariana',
]

const WELCOME_BY_USER = {
  Ana: 'Oi, Ana! Que bom ter você aqui. Animada para a Croácia? 😊',
  Junior: 'Oi, Junior! Que bom ter você aqui. Animado para a Croácia? 😊',
  Jean: 'Oi, Jean! Que bom ter você aqui. Animado para a Croácia? 😊',
  Karla: 'Oi, Karla! Que bom ter você aqui. Animada para a Croácia? 😊',
  Sarah: 'Oi, Sarah! Que bom ter você aqui. Animada para a Croácia? 😊',
  Vitor: 'Oi, Vitor! Que bom ter você aqui. Animado para a Croácia? 😊',
  Felipe: 'Oi, Felipe! Que bom ter você aqui. Animado para a Croácia? 😊',
  Mariana: 'Oi, Mariana! Que bom ter você aqui. Animada para a Croácia? 😊',
}

function welcomeMessage(name) {
  return (
    WELCOME_BY_USER[name] ||
    `Oi, ${name}! Que bom ter você aqui. Animado(a) para a Croácia? 😊`
  )
}

const INITIAL_ITEMS = [
  {
    id: 'demo-1',
    name: 'Leite',
    type: 'essential',
    category: 'alimentacao',
    observation: 'Sem lactose',
    addedBy: 'Ana',
  },
  {
    id: 'demo-2',
    name: 'Pão',
    type: 'essential',
    category: 'alimentacao',
    observation: 'Integral, se tiver',
    addedBy: 'Junior',
  },
  {
    id: 'demo-3',
    name: 'Ovos',
    type: 'essential',
    category: 'alimentacao',
    observation: '',
    addedBy: 'Jean',
  },
  {
    id: 'demo-4',
    name: 'Iogurte',
    type: 'optional',
    category: 'alimentacao',
    observation: 'Marca Activia',
    addedBy: 'Karla',
  },
  {
    id: 'demo-5',
    name: 'Café',
    type: 'essential',
    category: 'alimentacao',
    observation: 'Torrado médio',
    addedBy: 'Sarah',
  },
  {
    id: 'demo-6',
    name: 'Geleia',
    type: 'optional',
    category: 'alimentacao',
    observation: 'Morango',
    addedBy: 'Vitor',
  },
  {
    id: 'demo-7',
    name: 'Manteiga',
    type: 'essential',
    category: 'alimentacao',
    observation: '',
    addedBy: 'Felipe',
  },
  {
    id: 'demo-8',
    name: 'Granola',
    type: 'optional',
    category: 'alimentacao',
    observation: 'Sem açúcar',
    addedBy: 'Mariana',
  },
  {
    id: 'demo-9',
    name: 'leite',
    type: 'essential',
    category: 'alimentacao',
    observation: 'sem lactose',
    addedBy: 'Junior',
  },
]

function NameGate({ users, onEnter }) {
  return (
    <div className="page gate-page">
      <header>
        <h1>Lista de compras</h1>
        <p className="intro">
          Selecione seu nome para começar a adicionar itens do supermercado na
          Croácia.
        </p>
      </header>

      <div className="name-grid" role="list">
        {users.map((user) => (
          <button
            key={user}
            type="button"
            className="name-card"
            role="listitem"
            onClick={() => onEnter(user)}
          >
            {user}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [person, setPerson] = useState(null)
  const [ingredientInput, setIngredientInput] = useState('')
  const [observationInput, setObservationInput] = useState('')
  const [isEssential, setIsEssential] = useState(true)
  const [items, setItems] = useState(INITIAL_ITEMS)

  function handleEnter(name) {
    setPerson(name)
  }

  function handleAddIngredient(e) {
    e.preventDefault()
    const name = ingredientInput.trim()
    if (!name || !person) return

    const type = isEssential ? 'essential' : 'optional'
    const observation = observationInput.trim()
    const addedBy = person

    setItems((prev) => {
      const exists = prev.some(
        (item) =>
          normalize(item.name) === normalize(name) &&
          item.type === type &&
          item.category === 'alimentacao' &&
          normalize(item.observation || '') === normalize(observation) &&
          normalize(item.addedBy) === normalize(addedBy),
      )
      if (exists) return prev

      return [
        ...prev,
        {
          id: makeId(),
          name,
          type,
          category: 'alimentacao',
          observation,
          addedBy,
        },
      ]
    })

    setIngredientInput('')
    setObservationInput('')
    setIsEssential(true)
  }

  function removeItem(id) {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.id === id && normalize(item.addedBy) === normalize(person)),
      ),
    )
  }

  if (!person) {
    return <NameGate users={INITIAL_USERS} onEnter={handleEnter} />
  }

  const foodItems = items.filter((item) => item.category === 'alimentacao')
  const essentialItems = foodItems.filter((item) => item.type === 'essential')
  const optionalItems = foodItems.filter((item) => item.type === 'optional')
  const aggregatedFood = aggregateItems(foodItems)
  const aggregatedEssential = aggregateItems(essentialItems)
  const aggregatedOptional = aggregateItems(optionalItems)
  const myFoodItems = foodItems.filter(
    (item) => normalize(item.addedBy) === normalize(person),
  )
  const myEssentialItems = myFoodItems.filter(
    (item) => item.type === 'essential',
  )
  const myOptionalItems = myFoodItems.filter(
    (item) => item.type === 'optional',
  )
  const canAddIngredient = ingredientInput.trim()

  return (
    <div className="page">
      <header>
        <div className="header-top">
          <h1>Lista de compras</h1>
          <button type="button" className="ghost" onClick={() => setPerson(null)}>
            Trocar usuário
          </button>
        </div>
        <p className="user-chip">{welcomeMessage(person)}</p>
        <p className="intro">
          Adicione abaixo o que precisamos comprar no supermercado ao chegar na
          Croácia. Marque se o item é essencial e use a observação para indicar
          restrições, variedade ou marca favorita — vamos tentar ao máximo atender
          a todos os pedidos, dando preferência a itens essenciais.
        </p>
      </header>

      <div className="layout">
        <div className="groups">
          <section className="meal-group">
            <h2>Alimentação</h2>
            <p className="meal-copy">
              O que você costuma comprar para comer no dia a dia?
            </p>

            <form className="add" onSubmit={handleAddIngredient}>
              <label htmlFor="ingredient">Item</label>
              <input
                id="ingredient"
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                placeholder="Leite, ovos…"
              />

              <label htmlFor="observation">Observação ou restrição</label>
              <input
                id="observation"
                type="text"
                value={observationInput}
                onChange={(e) => setObservationInput(e.target.value)}
                placeholder="Ex: sem lactose, marca preferida…"
              />

              <label className="check">
                <input
                  type="checkbox"
                  checked={isEssential}
                  onChange={(e) => setIsEssential(e.target.checked)}
                />
                Item essencial
              </label>

              <button type="submit" disabled={!canAddIngredient}>
                Adicionar item
              </button>
            </form>
          </section>

          <section className="my-items">
            <h3>
              Seus itens
              <span>{myFoodItems.length}</span>
            </h3>
            <p className="my-items-copy">
              Apenas o que {person} adicionou em alimentação.
            </p>

            {myFoodItems.length === 0 ? (
              <p className="empty">Você ainda não adicionou itens.</p>
            ) : (
              <div className="option">
                <ItemGroup
                  title="Essencial"
                  kind="essential"
                  items={myEssentialItems}
                  onRemove={removeItem}
                  hideAddedBy
                />
                <ItemGroup
                  title="Opcional"
                  kind="optional"
                  items={myOptionalItems}
                  onRemove={removeItem}
                  hideAddedBy
                />
              </div>
            )}
          </section>
        </div>

        <aside className="summary">
          <h2>
            Resumo geral <span>{aggregatedFood.length}</span>
          </h2>
          <p className="summary-copy">
            Todos os itens de todos os usuários. Itens iguais com a mesma
            observação aparecem com contador.
          </p>

          {items.length === 0 ? (
            <p className="empty">Nenhum item ainda.</p>
          ) : (
            <div className="category">
              <h3>
                Alimentação <span>{aggregatedFood.length}</span>
              </h3>
              <div className="option">
                <SummaryGroup
                  title="Essencial"
                  kind="essential"
                  items={aggregatedEssential}
                />
                <SummaryGroup
                  title="Opcional"
                  kind="optional"
                  items={aggregatedOptional}
                />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function aggregateItems(items) {
  const map = new Map()

  for (const item of items) {
    const key = `${normalize(item.name)}|${item.type}|${normalize(item.observation || '')}`

    if (!map.has(key)) {
      map.set(key, {
        key,
        name: item.name,
        type: item.type,
        observation: item.observation || '',
        count: 0,
        addedBy: [],
        ids: [],
      })
    }

    const entry = map.get(key)
    entry.count += 1
    entry.ids.push(item.id)

    if (
      !entry.addedBy.some(
        (name) => normalize(name) === normalize(item.addedBy),
      )
    ) {
      entry.addedBy.push(item.addedBy)
    }
  }

  return [...map.values()]
}

function ItemGroup({ title, kind, items, onRemove, hideAddedBy = false }) {
  if (items.length === 0) return null

  return (
    <div className={`group ${kind}`}>
      <h5>
        {title} <span>{items.length}</span>
      </h5>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.name}</strong>
              {(item.observation || !hideAddedBy) && (
                <span className="meta">
                  {item.observation ? item.observation : ''}
                  {item.observation && !hideAddedBy ? ' · ' : ''}
                  {!hideAddedBy ? item.addedBy : ''}
                </span>
              )}
            </div>
            <div className="actions">
              <button type="button" className="link" onClick={() => onRemove(item.id)}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SummaryGroup({ title, kind, items }) {
  if (items.length === 0) return null

  return (
    <div className={`group ${kind}`}>
      <h5>
        {title} <span>{items.length}</span>
      </h5>
      <ul>
        {items.map((item) => (
          <li key={item.key}>
            <div>
              <strong>
                {item.name}
                {item.count > 1 ? (
                  <span className="count">×{item.count}</span>
                ) : null}
              </strong>
              <span className="meta">
                {item.observation ? `${item.observation} · ` : ''}
                {item.addedBy.join(', ')}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
