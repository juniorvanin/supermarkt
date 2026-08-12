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
  writeBatch,
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
const TRANSLATE_URL =
  'https://us-central1-croacia-2026-8857e.cloudfunctions.net/translate'

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

function needsTranslation(nameHr) {
  return !String(nameHr || '').trim()
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

async function translateItem(name) {
  const response = await fetch(TRANSLATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })

  if (!response.ok) {
    throw new Error('Falha ao traduzir')
  }

  const data = await response.json()
  return String(data.translation || '').trim()
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
  Ana: 'Oi, Ana — pronta para a Croácia?',
  Junior: 'Oi, Junior — pronto para a Croácia?',
  Jean: 'Oi, Jean — pronto para a Croácia?',
  Karla: 'Oi, Karla — pronta para a Croácia?',
  Sarah: 'Oi, Sarah — pronta para a Croácia?',
  Vitor: 'Oi, Vitor — pronto para a Croácia?',
  Felipe: 'Oi, Felipe — pronto para a Croácia?',
  Mariana: 'Oi, Mariana — pronta para a Croácia?',
}

function welcomeMessage(name) {
  return WELCOME_BY_USER[name] || `Oi, ${name} — pronto(a) para a Croácia?`
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

const PERSON_STORAGE_KEY = 'supermarkt-person'

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

      <p className="gate-hint">Quem está montando a lista?</p>

      <ul className="name-grid">
        {users.map((user) => (
          <li key={user}>
            <button
              type="button"
              className="name-card"
              onClick={() => onEnter(user)}
            >
              {user}
            </button>
          </li>
        ))}
      </ul>

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
  const [person, setPerson] = useState(() => {
    try {
      const saved = sessionStorage.getItem(PERSON_STORAGE_KEY)
      return INITIAL_USERS.includes(saved) ? saved : null
    } catch {
      return null
    }
  })
  const [ingredientInput, setIngredientInput] = useState('')
  const [observationInput, setObservationInput] = useState('')
  const [isEssential, setIsEssential] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [clearingBought, setClearingBought] = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [activeDepartment, setActiveDepartment] = useState(null)
  const [activeMainTab, setActiveMainTab] = useState('adicionar')
  const [ingredientFocused, setIngredientFocused] = useState(false)
  const [suggestionIndex, setSuggestionIndex] = useState(-1)
  const ingredientRef = useRef(null)
  const reviewedItemIds = useRef(new Set())
  const departmentCache = useRef(new Map())
  const translationCache = useRef(new Map())

  useEffect(() => {
    try {
      if (person) sessionStorage.setItem(PERSON_STORAGE_KEY, person)
      else sessionStorage.removeItem(PERSON_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [person])

  useEffect(() => {
    if (activeMainTab !== 'adicionar') return
    const id = window.setTimeout(() => ingredientRef.current?.focus(), 40)
    return () => window.clearTimeout(id)
  }, [activeMainTab, person, editingId])

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
            nameHr: data.nameHr || '',
            type: data.type || 'essential',
            category: data.category || 'compras',
            department: resolveDepartment(maybeDepartment),
            observation: data.observation || '',
            addedBy: data.addedBy || 'Alguém',
            bought: Boolean(data.bought),
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
        !reviewedItemIds.current.has(item.id) &&
        (needsDepartmentReview(item.department) || needsTranslation(item.nameHr)),
    )

    if (pending.length === 0) {
      setEnriching(false)
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

    async function resolveCachedTranslation(name) {
      const cacheKey = normalize(name)
      if (translationCache.current.has(cacheKey)) {
        return translationCache.current.get(cacheKey)
      }

      const request = translateItem(name).catch((err) => {
        translationCache.current.delete(cacheKey)
        throw err
      })
      translationCache.current.set(cacheKey, request)
      return request
    }

    async function enrichPending() {
      setEnriching(true)

      for (const item of pending) {
        if (cancelled) return

        try {
          const updates = {}
          const tasks = []

          if (needsDepartmentReview(item.department)) {
            tasks.push(
              resolveCachedDepartment(item.name).then((department) => {
                if (department !== resolveDepartment(item.department)) {
                  updates.department = department
                }
              }),
            )
          }

          if (needsTranslation(item.nameHr)) {
            tasks.push(
              resolveCachedTranslation(item.name).then((nameHr) => {
                if (nameHr) updates.nameHr = nameHr
              }),
            )
          }

          await Promise.all(tasks)
          if (cancelled) return

          if (Object.keys(updates).length > 0) {
            await updateDoc(doc(db, ITEMS_COLLECTION, item.id), updates)
          }

          reviewedItemIds.current.add(item.id)
        } catch (err) {
          console.error(err)
        }
      }

      if (!cancelled) setEnriching(false)
    }

    enrichPending()

    return () => {
      cancelled = true
    }
  }, [loading, items])

  function handleEnter(name) {
    setPerson(name)
  }

  function resetItemForm() {
    setEditingId(null)
    setIngredientInput('')
    setObservationInput('')
    setIsEssential(true)
    setSuggestionIndex(-1)
  }

  function applySuggestion(suggestion) {
    setIngredientInput(suggestion.name)
    setSuggestionIndex(-1)
    setIngredientFocused(false)
    window.setTimeout(() => {
      document.getElementById('observation')?.focus()
    }, 30)
  }

  function startEdit(item) {
    if (!item || normalize(item.addedBy) !== normalize(person)) return
    setEditingId(item.id)
    setIngredientInput(item.name)
    setObservationInput(item.observation || '')
    setIsEssential(item.type !== 'optional')
    setError('')
    setActiveMainTab('adicionar')
  }

  function cancelEdit() {
    resetItemForm()
    setError('')
    setActiveMainTab('meus')
  }

  function switchMainTab(tab) {
    if (tab !== 'adicionar' && editingId) {
      resetItemForm()
    }
    setActiveMainTab(tab)
  }

  async function handleAddIngredient(e) {
    e.preventDefault()
    if (editingId) {
      await handleUpdateIngredient()
      return
    }

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
      resetItemForm()
      return
    }

    setSaving(true)
    setError('')

    try {
      let department = 'outros'
      let nameHr = ''

      const [departmentResult, translationResult] = await Promise.allSettled([
        categorizeItem(name),
        translateItem(name),
      ])

      if (departmentResult.status === 'fulfilled') {
        department = departmentResult.value
        departmentCache.current.set(normalize(name), Promise.resolve(department))
      } else {
        console.error(departmentResult.reason)
      }

      if (translationResult.status === 'fulfilled') {
        nameHr = translationResult.value
        if (nameHr) {
          translationCache.current.set(
            normalize(name),
            Promise.resolve(nameHr),
          )
        }
      } else {
        console.error(translationResult.reason)
      }

      await addDoc(collection(db, ITEMS_COLLECTION), {
        name,
        nameHr,
        type,
        category: 'compras',
        department: resolveDepartment(department),
        observation,
        addedBy,
        bought: false,
        createdAt: serverTimestamp(),
      })

      resetItemForm()
      setActiveMainTab('meus')
    } catch (err) {
      console.error(err)
      setError('Não foi possível salvar o item. Tente de novo.')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateIngredient() {
    const name = ingredientInput.trim()
    if (!name || !person || saving || !editingId) return

    const target = items.find((item) => item.id === editingId)
    if (!target || normalize(target.addedBy) !== normalize(person)) {
      cancelEdit()
      return
    }

    const type = isEssential ? 'essential' : 'optional'
    const observation = observationInput.trim()

    const exists = items.some(
      (item) =>
        item.id !== editingId &&
        normalize(item.name) === normalize(name) &&
        item.type === type &&
        normalize(item.observation || '') === normalize(observation) &&
        normalize(item.addedBy) === normalize(person),
    )
    if (exists) {
      setError('Você já tem esse item com a mesma observação.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const updates = {
        name,
        type,
        observation,
      }
      const nameChanged = normalize(target.name) !== normalize(name)

      if (nameChanged) {
        const [departmentResult, translationResult] = await Promise.allSettled([
          categorizeItem(name),
          translateItem(name),
        ])

        if (departmentResult.status === 'fulfilled') {
          updates.department = resolveDepartment(departmentResult.value)
          departmentCache.current.set(
            normalize(name),
            Promise.resolve(updates.department),
          )
        } else {
          console.error(departmentResult.reason)
        }

        if (translationResult.status === 'fulfilled') {
          updates.nameHr = translationResult.value || ''
          if (updates.nameHr) {
            translationCache.current.set(
              normalize(name),
              Promise.resolve(updates.nameHr),
            )
          }
        } else {
          console.error(translationResult.reason)
          updates.nameHr = ''
        }

        reviewedItemIds.current.delete(editingId)
      }

      await updateDoc(doc(db, ITEMS_COLLECTION, editingId), updates)

      resetItemForm()
      setActiveMainTab('meus')
    } catch (err) {
      console.error(err)
      setError('Não foi possível atualizar o item. Tente de novo.')
    } finally {
      setSaving(false)
    }
  }

  async function removeItem(id) {
    const target = items.find((item) => item.id === id)
    if (!target || normalize(target.addedBy) !== normalize(person)) return

    if (editingId === id) {
      resetItemForm()
    }

    setError('')
    try {
      await deleteDoc(doc(db, ITEMS_COLLECTION, id))
    } catch (err) {
      console.error(err)
      setError('Não foi possível remover o item. Tente de novo.')
    }
  }

  async function toggleBought(aggregatedItem) {
    if (!aggregatedItem?.ids?.length) return

    const nextBought = !aggregatedItem.bought
    setError('')
    try {
      const batch = writeBatch(db)
      for (const id of aggregatedItem.ids) {
        batch.update(doc(db, ITEMS_COLLECTION, id), { bought: nextBought })
      }
      await batch.commit()
    } catch (err) {
      console.error(err)
      setError('Não foi possível atualizar o item. Tente de novo.')
    }
  }

  async function clearBoughtItems() {
    const boughtDocs = items.filter((item) => item.bought)
    if (boughtDocs.length === 0 || clearingBought) return

    const linesToRemove = aggregateItems(boughtDocs).length
    const label =
      linesToRemove === 1
        ? 'Apagar 1 item comprado da lista?'
        : `Apagar ${linesToRemove} itens comprados da lista?`

    if (!window.confirm(label)) return

    setClearingBought(true)
    setError('')

    try {
      const ids = boughtDocs.map((item) => item.id)
      if (editingId && ids.includes(editingId)) {
        resetItemForm()
      }

      for (let i = 0; i < ids.length; i += 450) {
        const chunk = ids.slice(i, i + 450)
        const batch = writeBatch(db)
        for (const id of chunk) {
          batch.delete(doc(db, ITEMS_COLLECTION, id))
        }
        await batch.commit()
      }
    } catch (err) {
      console.error(err)
      setError('Não foi possível apagar os comprados. Tente de novo.')
    } finally {
      setClearingBought(false)
    }
  }

  if (!person) {
    return <NameGate users={INITIAL_USERS} onEnter={handleEnter} />
  }

  const aggregatedItems = aggregateItems(items)
  const departmentsInSummary = groupByDepartment(aggregatedItems)
  const selectedDepartment = departmentsInSummary.some(
    (group) => group.department === activeDepartment,
  )
    ? activeDepartment
    : departmentsInSummary[0]?.department || null
  const activeDepartmentGroup =
    departmentsInSummary.find(
      (group) => group.department === selectedDepartment,
    ) || null
  const boughtCount = aggregatedItems.filter((item) => item.bought).length
  const myItems = items.filter(
    (item) => normalize(item.addedBy) === normalize(person),
  )
  const myEssentialItems = myItems.filter((item) => item.type === 'essential')
  const myOptionalItems = myItems.filter((item) => item.type === 'optional')
  const canAddIngredient = ingredientInput.trim() && !saving
  const itemSuggestions = getItemSuggestions(items, ingredientInput, {
    excludeId: editingId,
  })
  const showItemSuggestions =
    ingredientFocused && itemSuggestions.length > 0

  return (
    <>
      <div className="page app-page">
        <header className="app-header">
          <div className="app-top">
            <h1 className="app-brand">
              <IconCart className="title-icon" />
              Lista de compras
            </h1>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                resetItemForm()
                setPerson(null)
              }}
            >
              Sair
            </button>
          </div>
          <p className="app-user">{welcomeMessage(person)}</p>
          {error ? <p className="banner-error">{error}</p> : null}
          {loading ? <p className="banner-info">Carregando lista…</p> : null}
          {enriching ? (
            <p className="banner-info">Atualizando departamentos e traduções…</p>
          ) : null}
        </header>

        <div className="main-panel">
          {activeMainTab === 'adicionar' ? (
            <section
              id="panel-adicionar"
              role="tabpanel"
              aria-labelledby="tab-adicionar"
            >
              <h2 className="panel-title">
                {editingId ? 'Editar item' : 'Novo item'}
              </h2>
              <p className="panel-copy">
                {editingId
                  ? 'Ajuste o nome, a observação ou se o item é essencial.'
                  : 'Café da manhã, snacks, bebidas ou o que mais precisarmos no supermercado. Use a observação para marca ou restrição.'}
              </p>

              <form className="add" onSubmit={handleAddIngredient}>
                <label htmlFor="ingredient">Item</label>
                <div className="suggest-field">
                  <input
                    id="ingredient"
                    ref={ingredientRef}
                    type="text"
                    value={ingredientInput}
                    onChange={(e) => {
                      setIngredientInput(e.target.value)
                      setSuggestionIndex(-1)
                    }}
                    onFocus={() => setIngredientFocused(true)}
                    onBlur={() => {
                      window.setTimeout(() => setIngredientFocused(false), 120)
                    }}
                    onKeyDown={(e) => {
                      if (!showItemSuggestions) return

                      if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        setSuggestionIndex((current) =>
                          current < itemSuggestions.length - 1
                            ? current + 1
                            : 0,
                        )
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        setSuggestionIndex((current) =>
                          current > 0
                            ? current - 1
                            : itemSuggestions.length - 1,
                        )
                      } else if (e.key === 'Enter' && suggestionIndex >= 0) {
                        e.preventDefault()
                        applySuggestion(itemSuggestions[suggestionIndex])
                      } else if (e.key === 'Escape') {
                        setIngredientFocused(false)
                        setSuggestionIndex(-1)
                      }
                    }}
                    placeholder="Leite, ovos…"
                    autoComplete="off"
                    enterKeyHint="done"
                    role="combobox"
                    aria-expanded={showItemSuggestions}
                    aria-controls="item-suggestions"
                    aria-autocomplete="list"
                  />
                  {showItemSuggestions ? (
                    <ul
                      id="item-suggestions"
                      className="suggest-list"
                      role="listbox"
                    >
                      {itemSuggestions.map((suggestion, index) => (
                        <li key={normalize(suggestion.name)} role="option">
                          <button
                            type="button"
                            className={
                              index === suggestionIndex
                                ? 'suggest-option is-active'
                                : 'suggest-option'
                            }
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applySuggestion(suggestion)}
                          >
                            {suggestion.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <label htmlFor="observation">Observação</label>
                <input
                  id="observation"
                  type="text"
                  value={observationInput}
                  onChange={(e) => setObservationInput(e.target.value)}
                  placeholder="Sem lactose, marca preferida…"
                  autoComplete="off"
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
                  {saving
                    ? 'Salvando…'
                    : editingId
                      ? 'Salvar alterações'
                      : 'Adicionar à lista'}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    className="ghost form-cancel"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                ) : null}
              </form>
            </section>
          ) : null}

          {activeMainTab === 'meus' ? (
            <section
              id="panel-meus"
              className="my-items"
              role="tabpanel"
              aria-labelledby="tab-meus"
            >
              <h2 className="panel-title">Meus itens</h2>
              <p className="panel-copy">
                Só o que você adicionou. Edite ou remova se mudar de ideia.
              </p>

              {myItems.length === 0 ? (
                <p className="empty">Nenhum item seu ainda.</p>
              ) : (
                <div className="option">
                  <ItemGroup
                    title="Essencial"
                    kind="essential"
                    items={myEssentialItems}
                    onEdit={startEdit}
                    onRemove={removeItem}
                    hideAddedBy
                  />
                  <ItemGroup
                    title="Opcional"
                    kind="optional"
                    items={myOptionalItems}
                    onEdit={startEdit}
                    onRemove={removeItem}
                    hideAddedBy
                  />
                </div>
              )}
            </section>
          ) : null}

          {activeMainTab === 'lista' ? (
            <section
              id="panel-lista"
              className="summary"
              role="tabpanel"
              aria-labelledby="tab-lista"
            >
              <h2 className="panel-title">Lista completa</h2>
              <p className="panel-copy">
                Marque o que já foi comprado. Croata entre parênteses para achar
                no mercado.
              </p>
              {aggregatedItems.length > 0 ? (
                <div className="list-progress-row">
                  <p className="list-progress" aria-live="polite">
                    {boughtCount} de {aggregatedItems.length} comprados
                  </p>
                  {boughtCount > 0 ? (
                    <button
                      type="button"
                      className="ghost clear-bought"
                      onClick={clearBoughtItems}
                      disabled={clearingBought}
                    >
                      {clearingBought ? 'Apagando…' : 'Apagar comprados'}
                    </button>
                  ) : null}
                </div>
              ) : null}

              {items.length === 0 ? (
                <p className="empty">A lista ainda está vazia.</p>
              ) : (
                <div className="department-tabs-wrap">
                  <p className="department-select-label" id="department-label">
                    Departamento
                  </p>
                  <div
                    className="department-tabs"
                    role="tablist"
                    aria-labelledby="department-label"
                  >
                    {departmentsInSummary.map((group) => {
                      const selected = group.department === selectedDepartment
                      return (
                        <button
                          key={group.department}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          className={
                            selected
                              ? 'department-tab is-active'
                              : 'department-tab'
                          }
                          onClick={() => setActiveDepartment(group.department)}
                        >
                          <span className="department-tab-label">
                            {departmentLabel(group.department)}
                          </span>
                          <span className="department-tab-count">
                            {group.items.length}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {activeDepartmentGroup ? (
                    <div
                      className="department-panel"
                      role="tabpanel"
                      aria-label={departmentLabel(
                        activeDepartmentGroup.department,
                      )}
                    >
                      <SummaryGroup
                        items={activeDepartmentGroup.items}
                        onToggleBought={toggleBought}
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </section>
          ) : null}
        </div>
      </div>

      <nav className="bottom-nav" role="tablist" aria-label="Navegação">
        <button
          id="tab-adicionar"
          type="button"
          role="tab"
          aria-selected={activeMainTab === 'adicionar'}
          aria-controls="panel-adicionar"
          className={
            activeMainTab === 'adicionar' ? 'main-tab is-active' : 'main-tab'
          }
          onClick={() => switchMainTab('adicionar')}
        >
          <IconBag className="main-tab-icon" />
          <span className="main-tab-label">{editingId ? 'Editar' : 'Novo'}</span>
        </button>
        <button
          id="tab-meus"
          type="button"
          role="tab"
          aria-selected={activeMainTab === 'meus'}
          aria-controls="panel-meus"
          className={activeMainTab === 'meus' ? 'main-tab is-active' : 'main-tab'}
          onClick={() => switchMainTab('meus')}
        >
          <IconUser className="main-tab-icon" />
          <span className="main-tab-label">Meus</span>
          {myItems.length > 0 ? (
            <span className="main-tab-badge">{myItems.length}</span>
          ) : null}
        </button>
        <button
          id="tab-lista"
          type="button"
          role="tab"
          aria-selected={activeMainTab === 'lista'}
          aria-controls="panel-lista"
          className={
            activeMainTab === 'lista' ? 'main-tab is-active' : 'main-tab'
          }
          onClick={() => switchMainTab('lista')}
        >
          <IconList className="main-tab-icon" />
          <span className="main-tab-label">Lista</span>
          {aggregatedItems.length > 0 ? (
            <span className="main-tab-badge">{aggregatedItems.length}</span>
          ) : null}
        </button>
      </nav>
    </>
  )
}

function getItemSuggestions(items, query, { excludeId = null, limit = 6 } = {}) {
  const q = normalize(query)
  if (q.length < 2) return []

  const map = new Map()

  for (const item of items) {
    if (excludeId && item.id === excludeId) continue

    const nameKey = normalize(item.name)
    if (!nameKey) continue
    if (!nameKey.includes(q) && !normalize(item.nameHr || '').includes(q)) {
      continue
    }

    if (!map.has(nameKey)) {
      map.set(nameKey, {
        name: item.name,
        count: 0,
      })
    }

    map.get(nameKey).count += 1
  }

  return [...map.values()]
    .filter((item) => normalize(item.name) !== q)
    .sort((a, b) => {
      const aStarts = normalize(a.name).startsWith(q) ? 0 : 1
      const bStarts = normalize(b.name).startsWith(q) ? 0 : 1
      if (aStarts !== bStarts) return aStarts - bStarts
      if (b.count !== a.count) return b.count - a.count
      return normalize(a.name).localeCompare(normalize(b.name), 'pt-BR')
    })
    .slice(0, limit)
}

function preferDepartment(current, next) {
  const left = resolveDepartment(current)
  const right = resolveDepartment(next)
  if (left === 'outros' && right !== 'outros') return right
  if (right === 'outros' && left !== 'outros') return left
  return left
}

function preferTranslation(current, next) {
  const left = String(current || '').trim()
  const right = String(next || '').trim()
  return left || right
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
        nameHr: item.nameHr || '',
        type: item.type,
        department,
        observation: item.observation || '',
        count: 0,
        boughtCount: 0,
        bought: true,
        addedBy: [],
        ids: [],
      })
    }

    const entry = map.get(key)
    entry.count += 1
    entry.ids.push(item.id)
    if (item.bought) entry.boughtCount += 1
    entry.bought = entry.boughtCount === entry.count
    entry.department = preferDepartment(entry.department, department)
    entry.nameHr = preferTranslation(entry.nameHr, item.nameHr)

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

function ItemGroup({
  title,
  kind,
  items,
  onEdit,
  onRemove,
  hideAddedBy = false,
}) {
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
              <button
                type="button"
                className="link"
                onClick={() => onEdit(item)}
              >
                Editar
              </button>
              <button
                type="button"
                className="link link-danger"
                onClick={() => onRemove(item.id)}
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SummaryGroup({ items, onToggleBought }) {
  if (items.length === 0) return null

  return (
    <ul className="summary-items">
      {items.map((item) => {
        const label = item.nameHr
          ? `${item.name} (${String(item.nameHr).trim()})`
          : item.name

        return (
          <li
            key={item.key}
            className={item.bought ? 'summary-row is-bought' : 'summary-row'}
          >
            <label className="summary-check">
              <input
                type="checkbox"
                checked={item.bought}
                onChange={() => onToggleBought(item)}
                aria-label={`Marcar ${label} como comprado`}
              />
              <span className="summary-check-body">
                <span className="summary-row-main">
                  <strong>
                    {item.name}
                    {item.nameHr ? (
                      <span className="summary-hr-name">
                        {' '}
                        ({String(item.nameHr).trim()})
                      </span>
                    ) : null}
                    {item.count > 1 ? (
                      <span className="count">×{item.count}</span>
                    ) : null}
                  </strong>
                  {item.type === 'optional' ? (
                    <span className="tag tag-optional">opcional</span>
                  ) : null}
                </span>
                <span className="summary-row-meta">
                  {item.observation ? `${item.observation} · ` : ''}
                  {item.addedBy.join(', ')}
                </span>
              </span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}
