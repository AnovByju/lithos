/**
 * Lithos Real-Time Fetcher v3
 * Sources: Wikipedia Sections API + Internet Archive
 * - Uses mobile-sections API for actual literary content, not just summary
 * - For person pages: shows biographical content about the person
 * - For work pages: shows plot/text/synopsis sections
 * - Internet Archive: searches public domain literary texts
 */
import type { LitItem, LitType } from "./literature-data"

// ── Author thumbnail cache (fetched live from Wikipedia) ──────────────────────
const thumbCache: Record<string, string> = {}

export async function fetchAuthorThumbnail(author: string): Promise<string | null> {
  if (author in thumbCache) return thumbCache[author] || null
  try {
    const slug = encodeURIComponent(author.replace(/ /g, "_"))
    const res  = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) { thumbCache[author] = ""; return null }
    const d   = await res.json()
    const url = d.thumbnail?.source || d.originalimage?.source || ""
    thumbCache[author] = url
    return url || null
  } catch {
    thumbCache[author] = ""
    return null
  }
}

// ── Seed catalogue ────────────────────────────────────────────────────────────
type Seed = { author: string; era: string; works: Work[] }
type Work = { title: string; type: LitType; slug: string; isPerson?: boolean }

const SEEDS: Seed[] = [
  { author:"William Shakespeare", era:"1564–1616 · English Playwright", works:[
    {title:"Hamlet",                        type:"story",      slug:"Hamlet"},
    {title:"Sonnet 18",                     type:"poem",       slug:"Sonnet_18"},
    {title:"Sonnet 116",                    type:"poem",       slug:"Sonnet_116"},
    {title:"Sonnet 73",                     type:"poem",       slug:"Sonnet_73"},
    {title:"Macbeth",                       type:"story",      slug:"Macbeth"},
    {title:"Romeo and Juliet",              type:"story",      slug:"Romeo_and_Juliet"},
    {title:"The Tempest",                   type:"story",      slug:"The_Tempest"},
    {title:"King Lear",                     type:"story",      slug:"King_Lear"},
    {title:"Othello",                       type:"story",      slug:"Othello"},
    {title:"A Midsummer Night's Dream",     type:"story",      slug:"A_Midsummer_Night%27s_Dream"},
  ]},
  { author:"Emily Dickinson", era:"1830–1886 · American Poet", works:[
    {title:"Because I could not stop for Death", type:"poem", slug:"Because_I_could_not_stop_for_Death"},
    {title:"I heard a Fly buzz",            type:"poem",       slug:"I_heard_a_Fly_buzz"},
    {title:"Hope is the thing with feathers",type:"poem",      slug:"Hope_is_the_thing_with_feathers"},
    {title:"I'm Nobody! Who are you?",      type:"poem",       slug:"I%27m_Nobody!_Who_are_you%3F"},
    {title:"Tell all the truth",            type:"poem",       slug:"Tell_all_the_truth_but_tell_it_slant"},
  ]},
  { author:"Edgar Allan Poe", era:"1809–1849 · American Author", works:[
    {title:"The Raven",                     type:"poem",       slug:"The_Raven"},
    {title:"The Tell-Tale Heart",           type:"story",      slug:"The_Tell-Tale_Heart"},
    {title:"Annabel Lee",                   type:"poem",       slug:"Annabel_Lee"},
    {title:"The Fall of the House of Usher",type:"story",      slug:"The_Fall_of_the_House_of_Usher"},
    {title:"The Masque of the Red Death",   type:"story",      slug:"The_Masque_of_the_Red_Death"},
    {title:"Ligeia",                        type:"story",      slug:"Ligeia"},
    {title:"Berenice",                      type:"story",      slug:"Berenice_(short_story)"},
  ]},
  { author:"Franz Kafka", era:"1883–1924 · Czech Author", works:[
    {title:"The Metamorphosis",             type:"story",      slug:"The_Metamorphosis"},
    {title:"The Trial",                     type:"story",      slug:"The_Trial"},
    {title:"The Castle",                    type:"story",      slug:"The_Castle_(novel)"},
    {title:"In the Penal Colony",           type:"story",      slug:"In_the_Penal_Colony"},
    {title:"A Hunger Artist",               type:"story",      slug:"A_Hunger_Artist"},
    {title:"Before the Law",               type:"story",      slug:"Before_the_Law"},
  ]},
  { author:"Virginia Woolf", era:"1882–1941 · English Author", works:[
    {title:"Mrs Dalloway",                  type:"story",      slug:"Mrs_Dalloway"},
    {title:"To the Lighthouse",             type:"story",      slug:"To_the_Lighthouse"},
    {title:"A Room of One's Own",           type:"essay",      slug:"A_Room_of_One%27s_Own"},
    {title:"The Waves",                     type:"story",      slug:"The_Waves_(novel)"},
    {title:"Orlando: A Biography",          type:"story",      slug:"Orlando:_A_Biography"},
    {title:"A Writer's Diary",              type:"diary",      slug:"A_Writer%27s_Diary"},
  ]},
  { author:"Oscar Wilde", era:"1854–1900 · Irish Playwright", works:[
    {title:"The Picture of Dorian Gray",    type:"story",      slug:"The_Picture_of_Dorian_Gray"},
    {title:"The Importance of Being Earnest",type:"story",     slug:"The_Importance_of_Being_Earnest"},
    {title:"De Profundis",                  type:"letter",     slug:"De_Profundis_(Oscar_Wilde)"},
    {title:"The Happy Prince",              type:"story",      slug:"The_Happy_Prince_and_Other_Tales"},
    {title:"An Ideal Husband",              type:"story",      slug:"An_Ideal_Husband"},
  ]},
  { author:"Walt Whitman", era:"1819–1892 · American Poet", works:[
    {title:"Song of Myself",                type:"poem",       slug:"Song_of_Myself"},
    {title:"O Captain! My Captain!",        type:"poem",       slug:"O_Captain!_My_Captain!"},
    {title:"When Lilacs Last…",             type:"poem",       slug:"When_Lilacs_Last_in_the_Dooryard_Bloom%27d"},
    {title:"I Sing the Body Electric",      type:"poem",       slug:"I_Sing_the_Body_Electric_(poem)"},
    {title:"Crossing Brooklyn Ferry",       type:"poem",       slug:"Crossing_Brooklyn_Ferry"},
  ]},
  { author:"Jane Austen", era:"1775–1817 · English Novelist", works:[
    {title:"Pride and Prejudice",           type:"story",      slug:"Pride_and_Prejudice"},
    {title:"Sense and Sensibility",         type:"story",      slug:"Sense_and_Sensibility"},
    {title:"Emma",                          type:"story",      slug:"Emma_(novel)"},
    {title:"Persuasion",                    type:"story",      slug:"Persuasion_(novel)"},
    {title:"Northanger Abbey",              type:"story",      slug:"Northanger_Abbey"},
  ]},
  { author:"Fyodor Dostoevsky", era:"1821–1881 · Russian Novelist", works:[
    {title:"Crime and Punishment",          type:"story",      slug:"Crime_and_Punishment"},
    {title:"The Brothers Karamazov",        type:"story",      slug:"The_Brothers_Karamazov"},
    {title:"The Idiot",                     type:"story",      slug:"The_Idiot"},
    {title:"Notes from Underground",        type:"story",      slug:"Notes_from_Underground"},
    {title:"The Possessed",                 type:"story",      slug:"Demons_(Dostoevsky_novel)"},
  ]},
  { author:"Leo Tolstoy", era:"1828–1910 · Russian Author", works:[
    {title:"War and Peace",                 type:"story",      slug:"War_and_Peace"},
    {title:"Anna Karenina",                 type:"story",      slug:"Anna_Karenina"},
    {title:"The Death of Ivan Ilyich",      type:"story",      slug:"The_Death_of_Ivan_Ilyich"},
    {title:"The Kreutzer Sonata",           type:"story",      slug:"The_Kreutzer_Sonata"},
  ]},
  { author:"Friedrich Nietzsche", era:"1844–1900 · German Philosopher", works:[
    {title:"Thus Spoke Zarathustra",        type:"philosophy", slug:"Thus_Spoke_Zarathustra"},
    {title:"Beyond Good and Evil",          type:"philosophy", slug:"Beyond_Good_and_Evil"},
    {title:"The Birth of Tragedy",          type:"philosophy", slug:"The_Birth_of_Tragedy"},
    {title:"The Gay Science",               type:"philosophy", slug:"The_Gay_Science"},
    {title:"Twilight of the Idols",         type:"philosophy", slug:"Twilight_of_the_Idols"},
  ]},
  { author:"Marcus Aurelius", era:"121–180 AD · Roman Emperor", works:[
    {title:"Meditations",                   type:"philosophy", slug:"Meditations"},
  ]},
  { author:"Plato", era:"428–348 BC · Greek Philosopher", works:[
    {title:"The Republic",                  type:"philosophy", slug:"Republic_(Plato)"},
    {title:"Symposium",                     type:"philosophy", slug:"Symposium_(Plato)"},
    {title:"Phaedo",                        type:"philosophy", slug:"Phaedo"},
    {title:"The Apology",                   type:"philosophy", slug:"Apology_(Plato)"},
  ]},
  { author:"Aristotle", era:"384–322 BC · Greek Philosopher", works:[
    {title:"Nicomachean Ethics",            type:"philosophy", slug:"Nicomachean_Ethics"},
    {title:"Poetics",                       type:"philosophy", slug:"Poetics_(Aristotle)"},
  ]},
  { author:"Albert Camus", era:"1913–1960 · French-Algerian Author", works:[
    {title:"The Stranger",                  type:"story",      slug:"The_Stranger_(Camus_novel)"},
    {title:"The Myth of Sisyphus",          type:"philosophy", slug:"The_Myth_of_Sisyphus"},
    {title:"The Plague",                    type:"story",      slug:"The_Plague"},
  ]},
  { author:"Pablo Neruda", era:"1904–1973 · Chilean Poet", works:[
    {title:"Twenty Love Poems",             type:"poem",       slug:"Twenty_Love_Poems_and_a_Song_of_Despair"},
    {title:"Canto General",                 type:"poem",       slug:"Canto_General"},
  ]},
  { author:"Rumi", era:"1207–1273 · Persian Poet & Mystic", works:[
    {title:"Masnavi",                       type:"poem",       slug:"Masnavi"},
    {title:"Divan-i Kebir",                type:"poem",       slug:"Divan-i_Kebir"},
  ]},
  { author:"Homer", era:"c. 8th century BC · Ancient Greek Poet", works:[
    {title:"The Odyssey",                   type:"story",      slug:"Odyssey"},
    {title:"The Iliad",                     type:"story",      slug:"Iliad"},
  ]},
  { author:"Charles Dickens", era:"1812–1870 · English Author", works:[
    {title:"A Tale of Two Cities",          type:"story",      slug:"A_Tale_of_Two_Cities"},
    {title:"Great Expectations",            type:"story",      slug:"Great_Expectations"},
    {title:"Oliver Twist",                  type:"story",      slug:"Oliver_Twist"},
    {title:"A Christmas Carol",             type:"story",      slug:"A_Christmas_Carol"},
    {title:"Bleak House",                   type:"story",      slug:"Bleak_House"},
    {title:"David Copperfield",             type:"story",      slug:"David_Copperfield_(novel)"},
  ]},
  { author:"Mark Twain", era:"1835–1910 · American Author", works:[
    {title:"Adventures of Huckleberry Finn",type:"story",      slug:"Adventures_of_Huckleberry_Finn"},
    {title:"The Adventures of Tom Sawyer",  type:"story",      slug:"The_Adventures_of_Tom_Sawyer"},
  ]},
  { author:"Mary Shelley", era:"1797–1851 · English Author", works:[
    {title:"Frankenstein",                  type:"story",      slug:"Frankenstein"},
    {title:"The Last Man",                  type:"story",      slug:"The_Last_Man"},
  ]},
  { author:"Herman Melville", era:"1819–1891 · American Author", works:[
    {title:"Moby-Dick",                     type:"story",      slug:"Moby-Dick"},
    {title:"Bartleby, the Scrivener",       type:"story",      slug:"Bartleby,_the_Scrivener"},
  ]},
  { author:"F. Scott Fitzgerald", era:"1896–1940 · American Author", works:[
    {title:"The Great Gatsby",              type:"story",      slug:"The_Great_Gatsby"},
    {title:"Tender Is the Night",           type:"story",      slug:"Tender_Is_the_Night"},
  ]},
  { author:"Gabriel García Márquez", era:"1927–2014 · Colombian Author", works:[
    {title:"One Hundred Years of Solitude", type:"story",      slug:"One_Hundred_Years_of_Solitude"},
    {title:"Love in the Time of Cholera",   type:"story",      slug:"Love_in_the_Time_of_Cholera"},
    {title:"Chronicle of a Death Foretold", type:"story",      slug:"Chronicle_of_a_Death_Foretold"},
  ]},
  { author:"Dante Alighieri", era:"1265–1321 · Italian Poet", works:[
    {title:"Inferno",                       type:"story",      slug:"Inferno_(Dante)"},
    {title:"Purgatorio",                    type:"poem",       slug:"Purgatorio"},
    {title:"La Vita Nuova",                 type:"poem",       slug:"La_Vita_Nuova"},
  ]},
  { author:"John Keats", era:"1795–1821 · English Romantic Poet", works:[
    {title:"Ode to a Nightingale",          type:"poem",       slug:"Ode_to_a_Nightingale"},
    {title:"Ode on a Grecian Urn",          type:"poem",       slug:"Ode_on_a_Grecian_Urn"},
    {title:"La Belle Dame sans Merci",      type:"poem",       slug:"La_Belle_Dame_sans_Merci"},
    {title:"To Autumn",                     type:"poem",       slug:"To_Autumn"},
  ]},
  { author:"Percy Bysshe Shelley", era:"1792–1822 · English Romantic Poet", works:[
    {title:"Ozymandias",                    type:"poem",       slug:"Ozymandias"},
    {title:"Ode to the West Wind",          type:"poem",       slug:"Ode_to_the_West_Wind"},
    {title:"Adonais",                       type:"poem",       slug:"Adonais"},
  ]},
  { author:"Lord Byron", era:"1788–1824 · English Romantic Poet", works:[
    {title:"She Walks in Beauty",           type:"poem",       slug:"She_Walks_in_Beauty"},
    {title:"Don Juan",                      type:"poem",       slug:"Don_Juan_(Byron)"},
    {title:"Childe Harold's Pilgrimage",    type:"poem",       slug:"Childe_Harold%27s_Pilgrimage"},
  ]},
  { author:"William Blake", era:"1757–1827 · English Poet & Artist", works:[
    {title:"The Tyger",                     type:"poem",       slug:"The_Tyger"},
    {title:"Songs of Innocence and Experience",type:"poem",    slug:"Songs_of_Innocence_and_of_Experience"},
    {title:"The Lamb",                      type:"poem",       slug:"The_Lamb_(poem)"},
  ]},
  { author:"Anton Chekhov", era:"1860–1904 · Russian Author", works:[
    {title:"The Cherry Orchard",            type:"story",      slug:"The_Cherry_Orchard"},
    {title:"Three Sisters",                 type:"story",      slug:"Three_Sisters_(play)"},
    {title:"The Lady with the Dog",         type:"story",      slug:"The_Lady_with_the_Dog"},
    {title:"Ward No. 6",                    type:"story",      slug:"Ward_No._6"},
    {title:"The Seagull",                   type:"story",      slug:"The_Seagull"},
  ]},
  { author:"James Joyce", era:"1882–1941 · Irish Author", works:[
    {title:"Ulysses",                       type:"story",      slug:"Ulysses_(novel)"},
    {title:"Dubliners",                     type:"story",      slug:"Dubliners"},
    {title:"A Portrait of the Artist",      type:"story",      slug:"A_Portrait_of_the_Artist_as_a_Young_Man"},
  ]},
  { author:"Ralph Waldo Emerson", era:"1803–1882 · American Essayist", works:[
    {title:"Self-Reliance",                 type:"essay",      slug:"Self-Reliance"},
    {title:"Nature",                        type:"essay",      slug:"Nature_(essay)"},
  ]},
  { author:"Henry David Thoreau", era:"1817–1862 · American Essayist", works:[
    {title:"Walden",                        type:"essay",      slug:"Walden"},
    {title:"Civil Disobedience",            type:"essay",      slug:"Civil_Disobedience_(Thoreau)"},
  ]},
  { author:"Sylvia Plath", era:"1932–1963 · American Poet", works:[
    {title:"The Bell Jar",                  type:"diary",      slug:"The_Bell_Jar"},
    {title:"Lady Lazarus",                  type:"poem",       slug:"Lady_Lazarus"},
    {title:"Daddy",                         type:"poem",       slug:"Daddy_(poem)"},
  ]},
  { author:"Simone de Beauvoir", era:"1908–1986 · French Philosopher", works:[
    {title:"The Second Sex",                type:"essay",      slug:"The_Second_Sex"},
  ]},
  { author:"Khalil Gibran", era:"1883–1931 · Lebanese-American Poet", works:[
    {title:"The Prophet",                   type:"poem",       slug:"The_Prophet_(book)"},
    {title:"The Madman",                    type:"poem",       slug:"The_Madman_(book)"},
  ]},
  { author:"Rabindranath Tagore", era:"1861–1941 · Bengali Poet", works:[
    {title:"Gitanjali",                     type:"poem",       slug:"Gitanjali"},
  ]},
  { author:"Victor Hugo", era:"1802–1885 · French Author", works:[
    {title:"Les Misérables",                type:"story",      slug:"Les_Mis%C3%A9rables"},
    {title:"Notre-Dame de Paris",           type:"story",      slug:"The_Hunchback_of_Notre-Dame"},
  ]},
  { author:"Marcel Proust", era:"1871–1922 · French Novelist", works:[
    {title:"In Search of Lost Time",        type:"story",      slug:"In_Search_of_Lost_Time"},
    {title:"Swann's Way",                   type:"story",      slug:"Swann%27s_Way"},
  ]},
  { author:"Lao Tzu", era:"6th–4th century BC · Chinese Philosopher", works:[
    {title:"Tao Te Ching",                  type:"philosophy", slug:"Tao_Te_Ching"},
  ]},
  { author:"Confucius", era:"551–479 BC · Chinese Philosopher", works:[
    {title:"Analects",                      type:"philosophy", slug:"Analects"},
  ]},
  { author:"George Orwell", era:"1903–1950 · English Author", works:[
    {title:"Nineteen Eighty-Four",          type:"story",      slug:"Nineteen_Eighty-Four"},
    {title:"Animal Farm",                   type:"story",      slug:"Animal_Farm"},
    {title:"Homage to Catalonia",           type:"essay",      slug:"Homage_to_Catalonia"},
  ]},
  { author:"Samuel Beckett", era:"1906–1989 · Irish Author", works:[
    {title:"Waiting for Godot",             type:"story",      slug:"Waiting_for_Godot"},
    {title:"Endgame",                       type:"story",      slug:"Endgame_(play)"},
  ]},
  { author:"Jean-Paul Sartre", era:"1905–1980 · French Philosopher", works:[
    {title:"Nausea",                        type:"story",      slug:"Nausea_(novel)"},
    {title:"Being and Nothingness",         type:"philosophy", slug:"Being_and_Nothingness"},
    {title:"No Exit",                       type:"story",      slug:"No_Exit"},
  ]},
  { author:"W.B. Yeats", era:"1865–1939 · Irish Poet", works:[
    {title:"The Second Coming",             type:"poem",       slug:"The_Second_Coming_(poem)"},
    {title:"Sailing to Byzantium",          type:"poem",       slug:"Sailing_to_Byzantium"},
    {title:"The Wild Swans at Coole",       type:"poem",       slug:"The_Wild_Swans_at_Coole"},
  ]},
  { author:"T.S. Eliot", era:"1888–1965 · American-British Poet", works:[
    {title:"The Waste Land",                type:"poem",       slug:"The_Waste_Land"},
    {title:"The Love Song of J. Alfred Prufrock",type:"poem",  slug:"The_Love_Song_of_J._Alfred_Prufrock"},
    {title:"Four Quartets",                 type:"poem",       slug:"Four_Quartets"},
  ]},
  { author:"Rainer Maria Rilke", era:"1875–1926 · Bohemian-Austrian Poet", works:[
    {title:"Letters to a Young Poet",       type:"letter",     slug:"Letters_to_a_Young_Poet"},
    {title:"Duino Elegies",                 type:"poem",       slug:"Duino_Elegies"},
    {title:"Sonnets to Orpheus",            type:"poem",       slug:"Sonnets_to_Orpheus"},
  ]},
  { author:"Jorge Luis Borges", era:"1899–1986 · Argentine Author", works:[
    {title:"Ficciones",                     type:"story",      slug:"Ficciones"},
    {title:"The Aleph",                     type:"story",      slug:"The_Aleph_(short_story)"},
    {title:"Labyrinths",                    type:"story",      slug:"Labyrinths"},
  ]},
  { author:"Italo Calvino", era:"1923–1985 · Italian Author", works:[
    {title:"Invisible Cities",              type:"story",      slug:"Invisible_Cities"},
    {title:"If on a winter's night…",       type:"story",      slug:"If_on_a_winter%27s_night_a_traveler"},
  ]},
  { author:"Milan Kundera", era:"1929–2023 · Czech-French Author", works:[
    {title:"The Unbearable Lightness of Being",type:"story",   slug:"The_Unbearable_Lightness_of_Being"},
  ]},
  { author:"Toni Morrison", era:"1931–2019 · American Author", works:[
    {title:"Beloved",                       type:"story",      slug:"Beloved_(novel)"},
    {title:"Song of Solomon",               type:"story",      slug:"Song_of_Solomon_(novel)"},
  ]},
  { author:"Langston Hughes", era:"1901–1967 · American Poet", works:[
    {title:"The Weary Blues",               type:"poem",       slug:"The_Weary_Blues"},
    {title:"Montage of a Dream Deferred",   type:"poem",       slug:"Montage_of_a_Dream_Deferred"},
  ]},
  { author:"Haruki Murakami", era:"1949– · Japanese Author", works:[
    {title:"Norwegian Wood",                type:"story",      slug:"Norwegian_Wood_(novel)"},
    {title:"Kafka on the Shore",            type:"story",      slug:"Kafka_on_the_Shore"},
  ]},
  { author:"Zora Neale Hurston", era:"1891–1960 · American Author", works:[
    {title:"Their Eyes Were Watching God",  type:"story",      slug:"Their_Eyes_Were_Watching_God"},
  ]},
  { author:"Charlotte Brontë", era:"1816–1855 · English Novelist", works:[
    {title:"Jane Eyre",                     type:"story",      slug:"Jane_Eyre"},
  ]},
  { author:"Emily Brontë", era:"1818–1848 · English Novelist & Poet", works:[
    {title:"Wuthering Heights",             type:"story",      slug:"Wuthering_Heights"},
  ]},
  { author:"Leonardo da Vinci", era:"1452–1519 · Renaissance Polymath", works:[
    {title:"Notebooks",                     type:"letter",     slug:"Leonardo_da_Vinci", isPerson:true},
  ]},
  { author:"Michelangelo", era:"1475–1564 · Renaissance Artist", works:[
    {title:"Letters & Sonnets",             type:"letter",     slug:"Michelangelo", isPerson:true},
  ]},
  { author:"Sappho", era:"c. 630–570 BC · Greek Lyric Poet", works:[
    {title:"Fragments",                     type:"poem",       slug:"Sappho", isPerson:true},
  ]},
  { author:"Virgil", era:"70–19 BC · Roman Poet", works:[
    {title:"The Aeneid",                    type:"poem",       slug:"Aeneid"},
    {title:"Eclogues",                      type:"poem",       slug:"Eclogues"},
  ]},
  { author:"Ovid", era:"43 BC–17 AD · Roman Poet", works:[
    {title:"Metamorphoses",                 type:"poem",       slug:"Metamorphoses"},
  ]},
  { author:"Gustave Flaubert", era:"1821–1880 · French Author", works:[
    {title:"Madame Bovary",                 type:"story",      slug:"Madame_Bovary"},
  ]},
]

// ── Internet Archive queries ───────────────────────────────────────────────────
const IA_QUERIES = [
  { q:"subject:poetry mediatype:texts language:English",          type:"poem"        as LitType },
  { q:"subject:fiction short_stories mediatype:texts",            type:"story"       as LitType },
  { q:"creator:Shakespeare mediatype:texts",                      type:"story"       as LitType },
  { q:"creator:Poe Edgar Allan mediatype:texts",                  type:"story"       as LitType },
  { q:"creator:Whitman Walt mediatype:texts",                     type:"poem"        as LitType },
  { q:"subject:philosophy ancient_greek mediatype:texts",         type:"philosophy"  as LitType },
  { q:"creator:Dickens Charles mediatype:texts",                  type:"story"       as LitType },
  { q:"subject:letters literature mediatype:texts",               type:"letter"      as LitType },
  { q:"creator:Thoreau mediatype:texts",                          type:"essay"       as LitType },
  { q:"creator:Emerson Ralph Waldo mediatype:texts",              type:"essay"       as LitType },
  { q:"subject:romantic poetry mediatype:texts language:English", type:"poem"        as LitType },
  { q:"creator:Tolstoy mediatype:texts",                          type:"story"       as LitType },
]

// ── HTML strip ────────────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\[\d+\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

// ── Wikipedia sections fetch ───────────────────────────────────────────────────
async function fetchSections(slug: string): Promise<Array<{title:string; text:string}>> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/mobile-sections/${encodeURIComponent(slug)}`,
      { signal: AbortSignal.timeout(7000) }
    )
    if (!res.ok) return []
    const d = await res.json()
    const out: Array<{title:string; text:string}> = []

    // Lead
    const leadText = stripHtml(d.lead?.sections?.[0]?.text || "")
    if (leadText.length > 60) out.push({ title: "lead", text: leadText })

    // Rest
    for (const s of (d.remaining?.sections || [])) {
      const t = stripHtml(s.text || "")
      if (t.length > 80) out.push({ title: (s.title || "").toLowerCase(), text: t })
    }
    return out
  } catch { return [] }
}

async function fetchSummary(slug: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const d = await res.json()
    return d.extract || null
  } catch { return null }
}

// ── Content extraction ────────────────────────────────────────────────────────
const WORK_PRIORITY  = ["text","poem","verse","plot","synopsis","opening","incipit","the story","narrative","reception","themes","composition","notable"]
const PERSON_PRIORITY= ["early life","career","literary career","biography","life","personal life","philosophy","writing style","works","character"]

function extractContent(
  sections: Array<{title:string; text:string}>,
  isPerson: boolean
): string | null {
  const priority = isPerson ? PERSON_PRIORITY : WORK_PRIORITY

  for (const kw of priority) {
    const s = sections.find(x => x.title.includes(kw))
    if (s && s.text.length > 100) return makeExcerpt(s.text, isPerson)
  }
  const lead = sections.find(s => s.title === "lead")
  if (lead) return makeExcerpt(lead.text, isPerson)
  const any = sections.find(s => s.text.length > 120)
  if (any) return makeExcerpt(any.text, isPerson)
  return null
}

function makeExcerpt(text: string, isPerson: boolean): string {
  const clean = text.replace(/\([^)]{0,60}\)/g, "").replace(/\s+/g, " ").trim()
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean]
  const start = isPerson
    ? (sentences.length > 3 ? 1 : 0)   // skip "X was a..." opener
    : Math.floor(Math.random() * Math.min(3, Math.max(0, sentences.length - 2)))
  let excerpt = sentences.slice(start, start + 4).join(" ").trim()
  if (excerpt.length > 520) excerpt = excerpt.slice(0, 500).replace(/\s\S+$/, "") + "…"
  return excerpt
}

// ── Internet Archive ──────────────────────────────────────────────────────────
async function fetchArchiveBatch(query: string, type: LitType): Promise<LitItem[]> {
  const results: LitItem[] = []
  try {
    const url =
      `https://archive.org/advancedsearch.php?` +
      `q=${encodeURIComponent(query)}&` +
      `fl[]=identifier,title,creator,description&` +
      `rows=6&output=json&sort[]=downloads+desc`
    const res = await fetch(url, { signal: AbortSignal.timeout(7000) })
    if (!res.ok) return []
    const docs = (await res.json()).response?.docs || []

    for (const doc of docs) {
      const creator = Array.isArray(doc.creator) ? doc.creator[0] : (doc.creator || "")
      const raw     = Array.isArray(doc.description) ? doc.description[0] : (doc.description || "")
      const desc    = stripHtml(raw).replace(/\s+/g, " ").trim()
      if (!creator || desc.length < 80) continue

      const excerpt = desc.length > 480
        ? desc.slice(0, 460).replace(/\s\S+$/, "") + "…"
        : desc

      const author  = normaliseCreator(creator)
      const seedEra = SEEDS.find(s => s.author.toLowerCase().split(" ").some(w => author.toLowerCase().includes(w)))?.era || "· Internet Archive"

      results.push({
        id:        `ia-${doc.identifier}-${Math.random().toString(36).slice(2,6)}`,
        author,
        era:       seedEra,
        type,
        title:     cleanTitle(doc.title || "Untitled"),
        content:   excerpt,
        source:    `Internet Archive — ${cleanTitle(doc.title || "Untitled")}`,
        sourceUrl: `https://archive.org/details/${doc.identifier}`,
      })
    }
  } catch {}
  return results
}

function normaliseCreator(c: string): string {
  const p = c.split(",").map(s => s.trim())
  if (p.length === 2 && !p[0].includes(" ")) return `${p[1]} ${p[0]}`
  return c
}
function cleanTitle(t: string): string {
  return t.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim().slice(0, 80)
}

// ── Shuffle helper ────────────────────────────────────────────────────────────
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── State ─────────────────────────────────────────────────────────────────────
let flat: Array<{ seed: Seed; work: Work }> = []
const usedSlugs  = new Set<string>()
const usedIAUrls = new Set<string>()

function buildFlat() {
  if (flat.length) return
  for (const seed of SEEDS) for (const work of seed.works) flat.push({ seed, work })
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function fetchLiteratureBatch(count = 14): Promise<LitItem[]> {
  buildFlat()
  const results: LitItem[] = []

  // Wikipedia slice (75%)
  const wikiN = Math.ceil(count * 0.75)
  let avail   = flat.filter(f => !usedSlugs.has(f.work.slug))
  if (avail.length < wikiN) { usedSlugs.clear(); avail = [...flat] }
  const targets = shuffle(avail).slice(0, wikiN)

  await Promise.allSettled(targets.map(async ({ seed, work }) => {
    usedSlugs.add(work.slug)
    const sections = await fetchSections(work.slug)
    let content    = sections.length
      ? extractContent(sections, work.isPerson || false)
      : null

    if (!content) {
      const sum = await fetchSummary(work.slug)
      if (sum) content = makeExcerpt(sum, work.isPerson || false)
    }
    if (!content || content.length < 60) return

    results.push({
      id:        `wiki-${work.slug}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      author:    seed.author,
      era:       seed.era,
      type:      work.type,
      title:     work.title,
      content,
      source:    `Wikipedia — ${work.title}`,
      sourceUrl: `https://en.wikipedia.org/wiki/${work.slug}`,
    })
  }))

  // Internet Archive slice (25%)
  const iaTargets = shuffle(IA_QUERIES).slice(0, Math.ceil(count * 0.25 / 2))
  const iaBatches = await Promise.allSettled(iaTargets.map(({ q, type }) => fetchArchiveBatch(q, type)))
  for (const r of iaBatches) {
    if (r.status !== "fulfilled") continue
    for (const item of r.value) {
      if (!usedIAUrls.has(item.sourceUrl)) {
        usedIAUrls.add(item.sourceUrl)
        results.push(item)
        if (results.length >= count + 6) break
      }
    }
  }

  return shuffle(results)
}
