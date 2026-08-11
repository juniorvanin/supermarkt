import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db, ITEMS_COLLECTION } from './firebase'
import './App.css'

function normalize(value) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR')
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

const CROATIA_FUN_FACTS = [
  'A Croácia tem mais de mil ilhas ao longo do Adriático — só cerca de 50 são habitadas.',
  'Dubrovnik serviu de inspiração (e cenário) para King\'s Landing em Game of Thrones.',
  'A gravata moderna tem origem nos croatas do século XVII: a palavra “cravate” vem de “Hrvat”.',
  'O Dalmatian (cão dálmata) leva o nome da Dalmácia, região costeira da Croácia.',
  'Zadar tem o Sea Organ: um órgão musical tocado pelas ondas do mar.',
  'O parque nacional dos Lagos de Plitvice é Patrimônio Mundial da UNESCO desde 1979.',
  'Em Split, o Palácio de Diocleciano ainda é um bairro vivo — pessoas moram dentro das ruínas romanas.',
  'A costa croata tem um dos mares mais limpos e transparentes da Europa.',
  'O kuna foi a moeda croata até 2023, quando o país adotou o euro.',
  'A Croácia tem formato de lua crescente (ou de bumerangue) no mapa.',
  'Hvar é famosa por ser uma das cidades mais ensolaradas da Europa.',
  'O inventor da caneta esferográfica, Slavoljub Eduard Penkala, era croata.',
  'O laço croata (cravat) virou moda na corte francesa no século XVII.',
  'Korčula afirma ser a terra natal de Marco Polo — a cidade ainda celebra essa história.',
  'O muro de Dubrovnik tem cerca de 2 km e oferece uma das melhores vistas do Adriático.',
  'Na Croácia se fala croata, e o alfabeto usa caracteres como č, ć, š, ž e đ.',
  'O truffle (trufas) da Ístria está entre os mais cobiçados da Europa.',
  'Pula guarda um anfiteatro romano tão bem preservado que ainda recebe shows.',
  'A Croácia tem fronteiras com Eslovênia, Hungria, Sérvia, Bósnia e Herzegovina e Montenegro.',
  'O vinho croata é antigo: há registros de vinicultura na região há milhares de anos.',
]

function randomFunFact() {
  return CROATIA_FUN_FACTS[Math.floor(Math.random() * CROATIA_FUN_FACTS.length)]
}

function NameGate({ users, onEnter }) {
  const [funFact] = useState(() => randomFunFact())

  return (
    <div className="page gate-page">
      <header className="gate-header">
        <p className="gate-kicker">Croácia 2026</p>
        <h1>Lista de compras</h1>
      </header>

      <p className="fun-fact">
        <span className="fun-fact-label">Você sabia?</span>
        {funFact}
      </p>

      <p className="gate-hint">Para começar, clique no seu nome abaixo.</p>

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
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const itemsQuery = query(collection(db, ITEMS_COLLECTION))

    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const nextItems = snapshot.docs.map((itemDoc) => {
          const data = itemDoc.data()
          return {
            id: itemDoc.id,
            name: data.name || '',
            type: data.type || 'essential',
            category: data.category || 'alimentacao',
            observation: data.observation || '',
            addedBy: data.addedBy || 'Alguém',
          }
        })
        setItems(nextItems)
        setLoading(false)
        setError('')
      },
      (err) => {
        console.error(err)
        setLoading(false)
        setError(
          'Não foi possível carregar a lista. Confira se o Firestore está ativo e em modo de teste.',
        )
      },
    )

    return unsubscribe
  }, [])

  function handleEnter(name) {
    setPerson(name)
  }

  async function handleAddIngredient(e) {
    e.preventDefault()
    const name = ingredientInput.trim()
    if (!name || !person || saving) return

    const type = isEssential ? 'essential' : 'optional'
    const observation = observationInput.trim()
    const addedBy = person

    const exists = items.some(
      (item) =>
        normalize(item.name) === normalize(name) &&
        item.type === type &&
        item.category === 'alimentacao' &&
        normalize(item.observation || '') === normalize(observation) &&
        normalize(item.addedBy) === normalize(addedBy),
    )
    if (exists) {
      setIngredientInput('')
      setObservationInput('')
      setIsEssential(true)
      return
    }

    setSaving(true)
    setError('')

    try {
      await addDoc(collection(db, ITEMS_COLLECTION), {
        name,
        type,
        category: 'alimentacao',
        observation,
        addedBy,
        createdAt: serverTimestamp(),
      })

      setIngredientInput('')
      setObservationInput('')
      setIsEssential(true)
    } catch (err) {
      console.error(err)
      setError('Não foi possível salvar o item. Tente de novo.')
    } finally {
      setSaving(false)
    }
  }

  async function removeItem(id) {
    const target = items.find((item) => item.id === id)
    if (!target || normalize(target.addedBy) !== normalize(person)) return

    setError('')
    try {
      await deleteDoc(doc(db, ITEMS_COLLECTION, id))
    } catch (err) {
      console.error(err)
      setError('Não foi possível remover o item. Tente de novo.')
    }
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
  const canAddIngredient = ingredientInput.trim() && !saving

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
        {error ? <p className="banner-error">{error}</p> : null}
        {loading ? <p className="banner-info">Carregando lista…</p> : null}
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
                {saving ? 'Salvando…' : 'Adicionar item'}
              </button>
            </form>
          </section>

          <section className="my-items">
            <h3>
              Seus itens
              <span>{myFoodItems.length}</span>
            </h3>

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
            Itens iguais com a mesma observação serão agrupados com um contador.
          </p>

          {foodItems.length === 0 ? (
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
