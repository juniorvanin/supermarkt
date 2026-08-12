import { useEffect, useRef, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db, ITEMS_COLLECTION } from './firebase'
import {
  CroatiaFlag,
  IconBag,
  IconCart,
  IconList,
  IconSpark,
  IconUser,
} from './Icons'
import './App.css'

const CATEGORIZE_URL = 'https://categorize-slhkez7p7a-uc.a.run.app'

const DEPARTMENT_LABELS = {
  hortifruti: 'Hortifruti',
  padaria: 'Padaria',
  acougue: 'Açougue',
  peixaria: 'Peixaria',
  frios_e_laticinios: 'Frios e laticínios',
  mercearia: 'Mercearia',
  bebidas: 'Bebidas',
  congelados: 'Congelados',
  doces_e_snacks: 'Doces e snacks',
  higiene_pessoal: 'Higiene pessoal',
  limpeza: 'Limpeza',
  bebe: 'Bebê',
  pet: 'Pet',
  casa_e_utilidades: 'Casa e utilidades',
  outros: 'Outros',
}

const DEPARTMENT_ORDER = Object.keys(DEPARTMENT_LABELS)

function normalize(value) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR')
}

function resolveDepartment(value) {
  const department = String(value || '')
    .trim()
    .toLowerCase()
  return DEPARTMENT_LABELS[department] ? department : 'outros'
}

function departmentLabel(department) {
  return DEPARTMENT_LABELS[resolveDepartment(department)]
}

function needsDepartmentReview(department) {
  const resolved = resolveDepartment(department)
  return !department || resolved === 'outros'
}

async function categorizeItem(name) {
  const response = await fetch(CATEGORIZE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })

  if (!response.ok) {
    throw new Error('Falha ao categorizar')
  }

  const data = await response.json()
  return resolveDepartment(data.category)
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
        <CroatiaFlag className="gate-flag" />
        <p className="gate-kicker">Croácia 2026</p>
        <h1>
          <IconCart className="title-icon" />
          Lista de compras
        </h1>
      </header>

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

      <p className="fun-fact">
        <span className="fun-fact-label">
          <IconSpark className="inline-icon" />
          Você sabia?
        </span>
        {funFact}
      </p>
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
  const [reclassifying, setReclassifying] = useState(false)
  const reviewedItemIds = useRef(new Set())
  const departmentCache = useRef(new Map())

  useEffect(() => {
    const itemsQuery = query(collection(db, ITEMS_COLLECTION))

    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const nextItems = snapshot.docs.map((itemDoc) => {
          const data = itemDoc.data()
          const maybeDepartment =
            data.department ||
            (DEPARTMENT_LABELS[data.category] ? data.category : null)

          return {
            id: itemDoc.id,
            name: data.name || '',
            type: data.type || 'essential',
            category: data.category || 'compras',
            department: resolveDepartment(maybeDepartment),
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

  useEffect(() => {
    if (loading) return

    const pending = items.filter(
      (item) =>
        needsDepartmentReview(item.department) &&
        !reviewedItemIds.current.has(item.id),
    )

    if (pending.length === 0) {
      setReclassifying(false)
      return
    }

    let cancelled = false

    async function resolveCachedDepartment(name) {
      const cacheKey = normalize(name)
      if (departmentCache.current.has(cacheKey)) {
        return departmentCache.current.get(cacheKey)
      }

      const request = categorizeItem(name).catch((err) => {
        departmentCache.current.delete(cacheKey)
        throw err
      })
      departmentCache.current.set(cacheKey, request)
      return request
    }

    async function reclassifyPending() {
      setReclassifying(true)

      for (const item of pending) {
        if (cancelled) return

        try {
          const department = await resolveCachedDepartment(item.name)
          if (cancelled) return

          if (department === resolveDepartment(item.department)) {
            reviewedItemIds.current.add(item.id)
            continue
          }

          await updateDoc(doc(db, ITEMS_COLLECTION, item.id), { department })
          reviewedItemIds.current.add(item.id)
        } catch (err) {
          console.error(err)
        }
      }

      if (!cancelled) setReclassifying(false)
    }

    reclassifyPending()

    return () => {
      cancelled = true
    }
  }, [loading, items])

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
      let department = 'outros'
      try {
        department = await categorizeItem(name)
        departmentCache.current.set(normalize(name), Promise.resolve(department))
      } catch (categorizeError) {
        console.error(categorizeError)
      }

      await addDoc(collection(db, ITEMS_COLLECTION), {
        name,
        type,
        category: 'compras',
        department: resolveDepartment(department),
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

  const aggregatedItems = aggregateItems(items)
  const departmentsInSummary = groupByDepartment(aggregatedItems)
  const myItems = items.filter(
    (item) => normalize(item.addedBy) === normalize(person),
  )
  const myEssentialItems = myItems.filter((item) => item.type === 'essential')
  const myOptionalItems = myItems.filter((item) => item.type === 'optional')
  const canAddIngredient = ingredientInput.trim() && !saving

  return (
    <div className="page">
      <header>
        <div className="header-top">
          <h1>
            <IconCart className="title-icon" />
            Lista de compras
          </h1>
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
        {reclassifying ? (
          <p className="banner-info">Organizando itens por departamento…</p>
        ) : null}
      </header>

      <div className="layout">
        <div className="groups">
          <section className="meal-group">
            <h2>
              <IconBag className="section-icon" />
              Compras
            </h2>
            <p className="meal-copy">O que precisamos comprar?</p>

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
                {saving ? 'Classificando e salvando…' : 'Adicionar item'}
              </button>
            </form>
          </section>

          <section className="my-items">
            <h3>
              <span className="section-title">
                <IconUser className="section-icon" />
                Seus itens
              </span>
              <span>{myItems.length}</span>
            </h3>

            {myItems.length === 0 ? (
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
            <span className="section-title">
              <IconList className="section-icon" />
              Resumo geral
            </span>
            <span>{aggregatedItems.length}</span>
          </h2>
          <p className="summary-copy">
            Organizado por departamento do supermercado. Itens iguais com a
            mesma observação serão agrupados.
          </p>

          {items.length === 0 ? (
            <p className="empty">Nenhum item ainda.</p>
          ) : (
            <div className="department-list">
              {departmentsInSummary.map((group) => (
                <div key={group.department} className="option department-group">
                  <h3>
                    {departmentLabel(group.department)}
                    <span>{group.items.length}</span>
                  </h3>
                  <SummaryGroup items={group.items} />
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function preferDepartment(current, next) {
  const left = resolveDepartment(current)
  const right = resolveDepartment(next)
  if (left === 'outros' && right !== 'outros') return right
  if (right === 'outros' && left !== 'outros') return left
  return left
}

function aggregateItems(items) {
  const map = new Map()

  for (const item of items) {
    const department = resolveDepartment(item.department)
    const key = `${normalize(item.name)}|${item.type}|${normalize(item.observation || '')}`

    if (!map.has(key)) {
      map.set(key, {
        key,
        name: item.name,
        type: item.type,
        department,
        observation: item.observation || '',
        count: 0,
        addedBy: [],
        ids: [],
      })
    }

    const entry = map.get(key)
    entry.count += 1
    entry.ids.push(item.id)
    entry.department = preferDepartment(entry.department, department)

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

function sortSummaryItems(items) {
  return [...items].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'essential' ? -1 : 1
    }
    return normalize(a.name).localeCompare(normalize(b.name), 'pt-BR')
  })
}

function groupByDepartment(aggregatedItems) {
  const map = new Map()

  for (const item of aggregatedItems) {
    const department = resolveDepartment(item.department)
    if (!map.has(department)) {
      map.set(department, [])
    }
    map.get(department).push(item)
  }

  return DEPARTMENT_ORDER.filter((department) => map.has(department)).map(
    (department) => ({
      department,
      items: sortSummaryItems(map.get(department)),
    }),
  )
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
              <span className="meta">
                {departmentLabel(item.department)}
                {item.observation ? ` · ${item.observation}` : ''}
                {!hideAddedBy ? ` · ${item.addedBy}` : ''}
              </span>
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

function SummaryGroup({ items }) {
  if (items.length === 0) return null

  return (
    <div className="group">
      <ul>
        {items.map((item) => (
          <li key={item.key}>
            <div>
              <strong>
                {item.name}
                {item.count > 1 ? (
                  <span className="count">×{item.count}</span>
                ) : null}
                <span className={`tag tag-${item.type}`}>
                  {item.type === 'essential' ? 'essencial' : 'opcional'}
                </span>
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
