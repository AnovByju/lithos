/**
 * Lithos Fetcher v4
 *
 * "story" type  → actual prose passages from short stories
 * "summary" type → plot summaries of novels/plays
 * Actively rejects meta-descriptions ("X is a novel by...") from story cards.
 */
import type { LitItem, LitType } from "./literature-data"

// ── Author thumbnail cache ────────────────────────────────────────────────────
const thumbCache: Record<string, string> = {}

export async function fetchAuthorThumbnail(author: string): Promise<string | null> {
  if (author in thumbCache) return thumbCache[author] || null
  try {
    const slug = encodeURIComponent(author.replace(/ /g, "_"))
    const res  = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) { thumbCache[author] = ""; return null }
    const d = await res.json()
    const url = d.thumbnail?.source || d.originalimage?.source || ""
    thumbCache[author] = url
    return url || null
  } catch { thumbCache[author] = ""; return null }
}

// ── Section priorities ────────────────────────────────────────────────────────
const SECTION_PRIORITY: Record<LitType, string[]> = {
  story:      ["text","full text","the story","opening","incipit","beginning","first chapter","narrative","content"],
  summary:    ["plot","plot summary","synopsis","summary","the story","storyline","overview","narrative"],
  poem:       ["text","poem","the poem","verse","full text","lyrics","content","stanzas"],
  philosophy: ["overview","content","argument","key ideas","ideas","themes","main ideas","central ideas","core ideas","doctrine","teachings"],
  essay:      ["argument","content","overview","themes","main argument","structure","ideas"],
  letter:     ["content","letters","correspondence","text","overview","early life","career","life"],
  diary:      ["content","themes","writing","overview","text","extracts","passages"],
  quote:      ["overview","content","lead"],
}

// ── Seeds ─────────────────────────────────────────────────────────────────────
type Seed = { author: string; era: string; works: Work[] }
type Work = { title: string; type: LitType; slug: string; isPerson?: boolean }

const SEEDS: Seed[] = [
  // SHORT STORIES (story type — real prose)
  { author:"Edgar Allan Poe", era:"1809–1849 · American Author", works:[
    {title:"The Tell-Tale Heart",             type:"story",   slug:"The_Tell-Tale_Heart"},
    {title:"The Fall of the House of Usher",  type:"story",   slug:"The_Fall_of_the_House_of_Usher"},
    {title:"The Masque of the Red Death",     type:"story",   slug:"The_Masque_of_the_Red_Death"},
    {title:"Ligeia",                          type:"story",   slug:"Ligeia"},
    {title:"Berenice",                        type:"story",   slug:"Berenice_(short_story)"},
    {title:"The Black Cat",                   type:"story",   slug:"The_Black_Cat_(short_story)"},
    {title:"The Cask of Amontillado",         type:"story",   slug:"The_Cask_of_Amontillado"},
    {title:"The Murders in the Rue Morgue",   type:"story",   slug:"The_Murders_in_the_Rue_Morgue"},
    {title:"The Pit and the Pendulum",        type:"story",   slug:"The_Pit_and_the_Pendulum"},
    {title:"The Raven",                       type:"poem",    slug:"The_Raven"},
    {title:"Annabel Lee",                     type:"poem",    slug:"Annabel_Lee"},
  ]},
  { author:"Franz Kafka", era:"1883–1924 · Czech Author", works:[
    {title:"The Metamorphosis",               type:"story",   slug:"The_Metamorphosis"},
    {title:"In the Penal Colony",             type:"story",   slug:"In_the_Penal_Colony"},
    {title:"A Hunger Artist",                 type:"story",   slug:"A_Hunger_Artist"},
    {title:"Before the Law",                  type:"story",   slug:"Before_the_Law"},
    {title:"A Country Doctor",                type:"story",   slug:"A_Country_Doctor_(short_story)"},
    {title:"The Trial",                       type:"summary", slug:"The_Trial"},
    {title:"The Castle",                      type:"summary", slug:"The_Castle_(novel)"},
    {title:"Amerika",                         type:"summary", slug:"Amerika_(novel)"},
  ]},
  { author:"Anton Chekhov", era:"1860–1904 · Russian Author", works:[
    {title:"The Lady with the Dog",           type:"story",   slug:"The_Lady_with_the_Dog"},
    {title:"Ward No. 6",                      type:"story",   slug:"Ward_No._6"},
    {title:"Gooseberries",                    type:"story",   slug:"Gooseberries_(story)"},
    {title:"The Man in a Case",               type:"story",   slug:"The_Man_in_a_Case"},
    {title:"In the Ravine",                   type:"story",   slug:"In_the_Ravine"},
    {title:"The Duel",                        type:"story",   slug:"The_Duel_(Chekhov)"},
    {title:"The Cherry Orchard",              type:"summary", slug:"The_Cherry_Orchard"},
    {title:"Three Sisters",                   type:"summary", slug:"Three_Sisters_(play)"},
    {title:"The Seagull",                     type:"summary", slug:"The_Seagull"},
  ]},
  { author:"Guy de Maupassant", era:"1850–1893 · French Author", works:[
    {title:"The Necklace",                    type:"story",   slug:"The_Necklace"},
    {title:"Boule de Suif",                   type:"story",   slug:"Boule_de_Suif"},
    {title:"The Piece of String",             type:"story",   slug:"The_Piece_of_String"},
    {title:"A Piece of String",               type:"story",   slug:"A_Piece_of_String"},
  ]},
  { author:"O. Henry", era:"1862–1910 · American Author", works:[
    {title:"The Gift of the Magi",            type:"story",   slug:"The_Gift_of_the_Magi"},
    {title:"The Last Leaf",                   type:"story",   slug:"The_Last_Leaf"},
    {title:"A Retrieved Reformation",         type:"story",   slug:"A_Retrieved_Reformation"},
    {title:"The Ransom of Red Chief",         type:"story",   slug:"The_Ransom_of_Red_Chief"},
  ]},
  { author:"Jack London", era:"1876–1916 · American Author", works:[
    {title:"To Build a Fire",                 type:"story",   slug:"To_Build_a_Fire"},
    {title:"The Call of the Wild",            type:"summary", slug:"The_Call_of_the_Wild"},
    {title:"White Fang",                      type:"summary", slug:"White_Fang"},
  ]},
  { author:"H.G. Wells", era:"1866–1946 · English Author", works:[
    {title:"The Country of the Blind",        type:"story",   slug:"The_Country_of_the_Blind"},
    {title:"The Door in the Wall",            type:"story",   slug:"The_Door_in_the_Wall_(short_story)"},
    {title:"The Star",                        type:"story",   slug:"The_Star_(Wells)"},
    {title:"The Time Machine",                type:"summary", slug:"The_Time_Machine"},
    {title:"The War of the Worlds",           type:"summary", slug:"The_War_of_the_Worlds"},
    {title:"The Island of Doctor Moreau",     type:"summary", slug:"The_Island_of_Doctor_Moreau"},
  ]},
  { author:"Nathaniel Hawthorne", era:"1804–1864 · American Author", works:[
    {title:"The Birthmark",                   type:"story",   slug:"The_Birthmark"},
    {title:"Young Goodman Brown",             type:"story",   slug:"Young_Goodman_Brown"},
    {title:"Rappaccini's Daughter",           type:"story",   slug:"Rappaccini%27s_Daughter"},
    {title:"The Scarlet Letter",              type:"summary", slug:"The_Scarlet_Letter"},
  ]},
  { author:"Herman Melville", era:"1819–1891 · American Author", works:[
    {title:"Bartleby, the Scrivener",         type:"story",   slug:"Bartleby,_the_Scrivener"},
    {title:"Benito Cereno",                   type:"story",   slug:"Benito_Cereno"},
    {title:"Billy Budd",                      type:"story",   slug:"Billy_Budd"},
    {title:"Moby-Dick",                       type:"summary", slug:"Moby-Dick"},
  ]},
  { author:"James Joyce", era:"1882–1941 · Irish Author", works:[
    {title:"The Dead",                        type:"story",   slug:"The_Dead_(short_story)"},
    {title:"Araby",                           type:"story",   slug:"Araby_(short_story)"},
    {title:"Eveline",                         type:"story",   slug:"Eveline_(short_story)"},
    {title:"A Painful Case",                  type:"story",   slug:"A_Painful_Case"},
    {title:"Ulysses",                         type:"summary", slug:"Ulysses_(novel)"},
    {title:"A Portrait of the Artist",        type:"summary", slug:"A_Portrait_of_the_Artist_as_a_Young_Man"},
  ]},
  { author:"D.H. Lawrence", era:"1885–1930 · English Author", works:[
    {title:"The Rocking-Horse Winner",        type:"story",   slug:"The_Rocking-Horse_Winner"},
    {title:"Odour of Chrysanthemums",         type:"story",   slug:"Odour_of_Chrysanthemums"},
    {title:"Sons and Lovers",                 type:"summary", slug:"Sons_and_Lovers"},
  ]},
  { author:"Kate Chopin", era:"1850–1904 · American Author", works:[
    {title:"The Story of an Hour",            type:"story",   slug:"The_Story_of_an_Hour"},
    {title:"Désirée's Baby",                  type:"story",   slug:"D%C3%A9sir%C3%A9e%27s_Baby"},
    {title:"The Awakening",                   type:"summary", slug:"The_Awakening_(Chopin_novel)"},
  ]},
  { author:"Charlotte Perkins Gilman", era:"1860–1935 · American Author", works:[
    {title:"The Yellow Wallpaper",            type:"story",   slug:"The_Yellow_Wallpaper"},
  ]},
  { author:"Ambrose Bierce", era:"1842–1914 · American Author", works:[
    {title:"An Occurrence at Owl Creek Bridge", type:"story", slug:"An_Occurrence_at_Owl_Creek_Bridge"},
  ]},
  { author:"Stephen Crane", era:"1871–1900 · American Author", works:[
    {title:"The Open Boat",                   type:"story",   slug:"The_Open_Boat"},
    {title:"The Blue Hotel",                  type:"story",   slug:"The_Blue_Hotel"},
    {title:"The Red Badge of Courage",        type:"summary", slug:"The_Red_Badge_of_Courage"},
  ]},
  { author:"Katherine Mansfield", era:"1888–1923 · New Zealand Author", works:[
    {title:"The Garden Party",                type:"story",   slug:"The_Garden_Party_(short_story)"},
    {title:"Bliss",                           type:"story",   slug:"Bliss_(short_story)"},
    {title:"Miss Brill",                      type:"story",   slug:"Miss_Brill"},
    {title:"The Fly",                         type:"story",   slug:"The_Fly_(short_story)"},
    {title:"Prelude",                         type:"story",   slug:"Prelude_(short_story)"},
  ]},
  { author:"F. Scott Fitzgerald", era:"1896–1940 · American Author", works:[
    {title:"The Diamond as Big as the Ritz",  type:"story",   slug:"The_Diamond_as_Big_as_the_Ritz"},
    {title:"Babylon Revisited",               type:"story",   slug:"Babylon_Revisited"},
    {title:"The Great Gatsby",                type:"summary", slug:"The_Great_Gatsby"},
    {title:"Tender Is the Night",             type:"summary", slug:"Tender_Is_the_Night"},
  ]},
  { author:"Ernest Hemingway", era:"1899–1961 · American Author", works:[
    {title:"Hills Like White Elephants",      type:"story",   slug:"Hills_Like_White_Elephants"},
    {title:"A Clean, Well-Lighted Place",     type:"story",   slug:"A_Clean,_Well-Lighted_Place"},
    {title:"The Short Happy Life of Francis Macomber", type:"story", slug:"The_Short_Happy_Life_of_Francis_Macomber"},
    {title:"The Snows of Kilimanjaro",        type:"story",   slug:"The_Snows_of_Kilimanjaro_(short_story)"},
    {title:"The Old Man and the Sea",         type:"summary", slug:"The_Old_Man_and_the_Sea"},
    {title:"A Farewell to Arms",              type:"summary", slug:"A_Farewell_to_Arms"},
    {title:"The Sun Also Rises",              type:"summary", slug:"The_Sun_Also_Rises"},
  ]},
  { author:"William Faulkner", era:"1897–1962 · American Author", works:[
    {title:"A Rose for Emily",                type:"story",   slug:"A_Rose_for_Emily"},
    {title:"Barn Burning",                    type:"story",   slug:"Barn_Burning"},
    {title:"The Sound and the Fury",          type:"summary", slug:"The_Sound_and_the_Fury"},
    {title:"As I Lay Dying",                  type:"summary", slug:"As_I_Lay_Dying"},
  ]},
  { author:"John Steinbeck", era:"1902–1968 · American Author", works:[
    {title:"The Chrysanthemums",              type:"story",   slug:"The_Chrysanthemums"},
    {title:"Of Mice and Men",                 type:"summary", slug:"Of_Mice_and_Men"},
    {title:"The Grapes of Wrath",             type:"summary", slug:"The_Grapes_of_Wrath"},
    {title:"East of Eden",                    type:"summary", slug:"East_of_Eden_(novel)"},
  ]},
  { author:"Flannery O'Connor", era:"1925–1964 · American Author", works:[
    {title:"A Good Man Is Hard to Find",      type:"story",   slug:"A_Good_Man_Is_Hard_to_Find"},
    {title:"Good Country People",             type:"story",   slug:"Good_Country_People"},
  ]},
  { author:"Raymond Carver", era:"1938–1988 · American Author", works:[
    {title:"Cathedral",                       type:"story",   slug:"Cathedral_(short_story)"},
    {title:"What We Talk About When We Talk About Love", type:"story", slug:"What_We_Talk_About_When_We_Talk_About_Love_(short_story)"},
  ]},
  { author:"Ursula K. Le Guin", era:"1929–2018 · American Author", works:[
    {title:"The Ones Who Walk Away from Omelas", type:"story", slug:"The_Ones_Who_Walk_Away_from_Omelas"},
    {title:"The Left Hand of Darkness",       type:"summary", slug:"The_Left_Hand_of_Darkness"},
  ]},
  { author:"Ray Bradbury", era:"1920–2012 · American Author", works:[
    {title:"A Sound of Thunder",              type:"story",   slug:"A_Sound_of_Thunder"},
    {title:"The Veldt",                       type:"story",   slug:"The_Veldt"},
    {title:"There Will Come Soft Rains",      type:"story",   slug:"There_Will_Come_Soft_Rains_(short_story)"},
    {title:"Fahrenheit 451",                  type:"summary", slug:"Fahrenheit_451"},
  ]},
  { author:"Jorge Luis Borges", era:"1899–1986 · Argentine Author", works:[
    {title:"The Library of Babel",            type:"story",   slug:"The_Library_of_Babel"},
    {title:"The Garden of Forking Paths",     type:"story",   slug:"The_Garden_of_Forking_Paths"},
    {title:"Tlön, Uqbar, Orbis Tertius",      type:"story",   slug:"Tl%C3%B6n,_Uqbar,_Orbis_Tertius"},
    {title:"The Aleph",                       type:"story",   slug:"The_Aleph_(short_story)"},
  ]},
  { author:"Gabriel García Márquez", era:"1927–2014 · Colombian Author", works:[
    {title:"A Very Old Man with Enormous Wings", type:"story", slug:"A_Very_Old_Man_with_Enormous_Wings"},
    {title:"The Handsomest Drowned Man",      type:"story",   slug:"The_Handsomest_Drowned_Man_in_the_World"},
    {title:"One Hundred Years of Solitude",   type:"summary", slug:"One_Hundred_Years_of_Solitude"},
    {title:"Love in the Time of Cholera",     type:"summary", slug:"Love_in_the_Time_of_Cholera"},
  ]},
  { author:"Julio Cortázar", era:"1914–1984 · Argentine Author", works:[
    {title:"Continuity of Parks",             type:"story",   slug:"Continuity_of_Parks"},
    {title:"House Taken Over",                type:"story",   slug:"House_Taken_Over"},
  ]},
  { author:"Italo Calvino", era:"1923–1985 · Italian Author", works:[
    {title:"The Distance of the Moon",        type:"story",   slug:"The_Distance_of_the_Moon"},
    {title:"Invisible Cities",                type:"summary", slug:"Invisible_Cities"},
  ]},
  { author:"Mark Twain", era:"1835–1910 · American Author", works:[
    {title:"The Celebrated Jumping Frog",     type:"story",   slug:"The_Celebrated_Jumping_Frog_of_Calaveras_County"},
    {title:"Adventures of Huckleberry Finn",  type:"summary", slug:"Adventures_of_Huckleberry_Finn"},
  ]},
  // POEMS
  { author:"William Shakespeare", era:"1564–1616 · English Playwright", works:[
    {title:"Sonnet 18",   type:"poem",    slug:"Sonnet_18"},
    {title:"Sonnet 116",  type:"poem",    slug:"Sonnet_116"},
    {title:"Sonnet 73",   type:"poem",    slug:"Sonnet_73"},
    {title:"Sonnet 130",  type:"poem",    slug:"Sonnet_130"},
    {title:"Hamlet",      type:"summary", slug:"Hamlet"},
    {title:"Macbeth",     type:"summary", slug:"Macbeth"},
    {title:"King Lear",   type:"summary", slug:"King_Lear"},
    {title:"The Tempest", type:"summary", slug:"The_Tempest"},
    {title:"Othello",     type:"summary", slug:"Othello"},
  ]},
  { author:"Emily Dickinson", era:"1830–1886 · American Poet", works:[
    {title:"Because I could not stop for Death", type:"poem", slug:"Because_I_could_not_stop_for_Death"},
    {title:"I heard a Fly buzz",               type:"poem", slug:"I_heard_a_Fly_buzz"},
    {title:"Hope is the thing with feathers",  type:"poem", slug:"Hope_is_the_thing_with_feathers"},
    {title:"I'm Nobody! Who are you?",          type:"poem", slug:"I%27m_Nobody!_Who_are_you%3F"},
    {title:"Tell all the truth",               type:"poem", slug:"Tell_all_the_truth_but_tell_it_slant"},
    {title:"Wild Nights – Wild Nights!",       type:"poem", slug:"Wild_Nights_%E2%80%93_Wild_Nights!"},
  ]},
  { author:"Walt Whitman", era:"1819–1892 · American Poet", works:[
    {title:"Song of Myself",                   type:"poem", slug:"Song_of_Myself"},
    {title:"O Captain! My Captain!",           type:"poem", slug:"O_Captain!_My_Captain!"},
    {title:"When Lilacs Last…",                type:"poem", slug:"When_Lilacs_Last_in_the_Dooryard_Bloom%27d"},
    {title:"I Sing the Body Electric",         type:"poem", slug:"I_Sing_the_Body_Electric_(poem)"},
    {title:"Crossing Brooklyn Ferry",          type:"poem", slug:"Crossing_Brooklyn_Ferry"},
  ]},
  { author:"John Keats", era:"1795–1821 · English Romantic Poet", works:[
    {title:"Ode to a Nightingale",             type:"poem", slug:"Ode_to_a_Nightingale"},
    {title:"Ode on a Grecian Urn",             type:"poem", slug:"Ode_on_a_Grecian_Urn"},
    {title:"La Belle Dame sans Merci",         type:"poem", slug:"La_Belle_Dame_sans_Merci"},
    {title:"To Autumn",                        type:"poem", slug:"To_Autumn"},
    {title:"Bright Star",                      type:"poem", slug:"Bright_Star,_would_I_were_stedfast_as_thou_art"},
  ]},
  { author:"Percy Bysshe Shelley", era:"1792–1822 · English Romantic Poet", works:[
    {title:"Ozymandias",                       type:"poem", slug:"Ozymandias"},
    {title:"Ode to the West Wind",             type:"poem", slug:"Ode_to_the_West_Wind"},
    {title:"To a Skylark",                     type:"poem", slug:"To_a_Skylark"},
    {title:"Adonais",                          type:"poem", slug:"Adonais"},
  ]},
  { author:"Lord Byron", era:"1788–1824 · English Romantic Poet", works:[
    {title:"She Walks in Beauty",              type:"poem", slug:"She_Walks_in_Beauty"},
    {title:"When We Two Parted",               type:"poem", slug:"When_We_Two_Parted"},
    {title:"So We'll Go No More a Roving",     type:"poem", slug:"So,_We%27ll_Go_No_More_a_Roving"},
  ]},
  { author:"William Blake", era:"1757–1827 · English Poet & Artist", works:[
    {title:"The Tyger",                        type:"poem", slug:"The_Tyger"},
    {title:"The Lamb",                         type:"poem", slug:"The_Lamb_(poem)"},
    {title:"London",                           type:"poem", slug:"London_(poem)"},
    {title:"The Sick Rose",                    type:"poem", slug:"The_Sick_Rose"},
  ]},
  { author:"W.B. Yeats", era:"1865–1939 · Irish Poet", works:[
    {title:"The Second Coming",                type:"poem", slug:"The_Second_Coming_(poem)"},
    {title:"Sailing to Byzantium",             type:"poem", slug:"Sailing_to_Byzantium"},
    {title:"The Wild Swans at Coole",          type:"poem", slug:"The_Wild_Swans_at_Coole"},
    {title:"Easter, 1916",                     type:"poem", slug:"Easter,_1916"},
    {title:"When You Are Old",                 type:"poem", slug:"When_You_Are_Old"},
    {title:"The Lake Isle of Innisfree",       type:"poem", slug:"The_Lake_Isle_of_Innisfree"},
  ]},
  { author:"T.S. Eliot", era:"1888–1965 · American-British Poet", works:[
    {title:"The Love Song of J. Alfred Prufrock", type:"poem", slug:"The_Love_Song_of_J._Alfred_Prufrock"},
    {title:"The Waste Land",                   type:"poem", slug:"The_Waste_Land"},
    {title:"Four Quartets",                    type:"poem", slug:"Four_Quartets"},
  ]},
  { author:"Langston Hughes", era:"1901–1967 · American Poet", works:[
    {title:"The Weary Blues",                  type:"poem", slug:"The_Weary_Blues"},
    {title:"I, Too",                           type:"poem", slug:"I,_Too"},
    {title:"The Negro Speaks of Rivers",       type:"poem", slug:"The_Negro_Speaks_of_Rivers"},
  ]},
  { author:"Rainer Maria Rilke", era:"1875–1926 · Bohemian-Austrian Poet", works:[
    {title:"Duino Elegies",    type:"poem",   slug:"Duino_Elegies"},
    {title:"Sonnets to Orpheus", type:"poem", slug:"Sonnets_to_Orpheus"},
    {title:"Letters to a Young Poet", type:"letter", slug:"Letters_to_a_Young_Poet"},
  ]},
  { author:"Pablo Neruda", era:"1904–1973 · Chilean Poet", works:[
    {title:"Twenty Love Poems", type:"poem", slug:"Twenty_Love_Poems_and_a_Song_of_Despair"},
    {title:"Odes to Common Things", type:"poem", slug:"Odes_to_Common_Things"},
  ]},
  { author:"Rumi", era:"1207–1273 · Persian Poet & Mystic", works:[
    {title:"Masnavi", type:"poem", slug:"Masnavi"},
  ]},
  { author:"Khalil Gibran", era:"1883–1931 · Lebanese-American Poet", works:[
    {title:"The Prophet", type:"poem", slug:"The_Prophet_(book)"},
  ]},
  { author:"Rabindranath Tagore", era:"1861–1941 · Bengali Poet", works:[
    {title:"Gitanjali", type:"poem", slug:"Gitanjali"},
  ]},
  { author:"Dante Alighieri", era:"1265–1321 · Italian Poet", works:[
    {title:"Inferno",      type:"summary", slug:"Inferno_(Dante)"},
    {title:"Purgatorio",   type:"poem",    slug:"Purgatorio"},
    {title:"La Vita Nuova", type:"poem",   slug:"La_Vita_Nuova"},
  ]},
  { author:"Homer", era:"c. 8th century BC · Ancient Greek Poet", works:[
    {title:"The Odyssey", type:"summary", slug:"Odyssey"},
    {title:"The Iliad",   type:"summary", slug:"Iliad"},
  ]},
  { author:"Sappho", era:"c. 630–570 BC · Greek Lyric Poet", works:[
    {title:"Fragments", type:"poem", slug:"Sappho", isPerson:true},
  ]},
  { author:"Virgil", era:"70–19 BC · Roman Poet", works:[
    {title:"The Aeneid", type:"poem", slug:"Aeneid"},
    {title:"Eclogues",   type:"poem", slug:"Eclogues"},
  ]},
  // PHILOSOPHY
  { author:"Marcus Aurelius", era:"121–180 AD · Roman Emperor", works:[
    {title:"Meditations", type:"philosophy", slug:"Meditations"},
  ]},
  { author:"Plato", era:"428–348 BC · Greek Philosopher", works:[
    {title:"The Republic",   type:"philosophy", slug:"Republic_(Plato)"},
    {title:"Symposium",      type:"philosophy", slug:"Symposium_(Plato)"},
    {title:"Phaedo",         type:"philosophy", slug:"Phaedo"},
    {title:"The Apology",    type:"philosophy", slug:"Apology_(Plato)"},
    {title:"Meno",           type:"philosophy", slug:"Meno"},
    {title:"Phaedrus",       type:"philosophy", slug:"Phaedrus_(dialogue)"},
  ]},
  { author:"Aristotle", era:"384–322 BC · Greek Philosopher", works:[
    {title:"Nicomachean Ethics", type:"philosophy", slug:"Nicomachean_Ethics"},
    {title:"Poetics",            type:"philosophy", slug:"Poetics_(Aristotle)"},
    {title:"Politics",           type:"philosophy", slug:"Politics_(Aristotle)"},
  ]},
  { author:"Friedrich Nietzsche", era:"1844–1900 · German Philosopher", works:[
    {title:"Thus Spoke Zarathustra", type:"philosophy", slug:"Thus_Spoke_Zarathustra"},
    {title:"Beyond Good and Evil",   type:"philosophy", slug:"Beyond_Good_and_Evil"},
    {title:"The Birth of Tragedy",   type:"philosophy", slug:"The_Birth_of_Tragedy"},
    {title:"The Gay Science",        type:"philosophy", slug:"The_Gay_Science"},
    {title:"Twilight of the Idols",  type:"philosophy", slug:"Twilight_of_the_Idols"},
  ]},
  { author:"Albert Camus", era:"1913–1960 · French-Algerian Author", works:[
    {title:"The Myth of Sisyphus", type:"philosophy", slug:"The_Myth_of_Sisyphus"},
    {title:"The Stranger",        type:"summary",     slug:"The_Stranger_(Camus_novel)"},
    {title:"The Plague",          type:"summary",     slug:"The_Plague"},
  ]},
  { author:"Jean-Paul Sartre", era:"1905–1980 · French Philosopher", works:[
    {title:"Being and Nothingness", type:"philosophy", slug:"Being_and_Nothingness"},
    {title:"Nausea",                type:"summary",    slug:"Nausea_(novel)"},
    {title:"No Exit",               type:"summary",    slug:"No_Exit"},
  ]},
  { author:"Lao Tzu", era:"6th–4th century BC · Chinese Philosopher", works:[
    {title:"Tao Te Ching", type:"philosophy", slug:"Tao_Te_Ching"},
  ]},
  { author:"Confucius", era:"551–479 BC · Chinese Philosopher", works:[
    {title:"Analects", type:"philosophy", slug:"Analects"},
  ]},
  // ESSAYS
  { author:"Ralph Waldo Emerson", era:"1803–1882 · American Essayist", works:[
    {title:"Self-Reliance",       type:"essay", slug:"Self-Reliance"},
    {title:"Nature",              type:"essay", slug:"Nature_(essay)"},
    {title:"The American Scholar",type:"essay", slug:"The_American_Scholar"},
  ]},
  { author:"Henry David Thoreau", era:"1817–1862 · American Essayist", works:[
    {title:"Walden",              type:"essay", slug:"Walden"},
    {title:"Civil Disobedience",  type:"essay", slug:"Civil_Disobedience_(Thoreau)"},
  ]},
  { author:"Simone de Beauvoir", era:"1908–1986 · French Philosopher", works:[
    {title:"The Second Sex",      type:"essay", slug:"The_Second_Sex"},
  ]},
  { author:"George Orwell", era:"1903–1950 · English Author", works:[
    {title:"Nineteen Eighty-Four", type:"summary", slug:"Nineteen_Eighty-Four"},
    {title:"Animal Farm",          type:"summary", slug:"Animal_Farm"},
    {title:"Homage to Catalonia",  type:"essay",   slug:"Homage_to_Catalonia"},
  ]},
  // MAJOR NOVELS AS SUMMARIES
  { author:"Jane Austen", era:"1775–1817 · English Novelist", works:[
    {title:"Pride and Prejudice", type:"summary", slug:"Pride_and_Prejudice"},
    {title:"Sense and Sensibility",type:"summary", slug:"Sense_and_Sensibility"},
    {title:"Emma",                type:"summary", slug:"Emma_(novel)"},
    {title:"Persuasion",          type:"summary", slug:"Persuasion_(novel)"},
    {title:"Northanger Abbey",    type:"summary", slug:"Northanger_Abbey"},
  ]},
  { author:"Charlotte Brontë", era:"1816–1855 · English Novelist", works:[
    {title:"Jane Eyre", type:"summary", slug:"Jane_Eyre"},
  ]},
  { author:"Emily Brontë", era:"1818–1848 · English Novelist & Poet", works:[
    {title:"Wuthering Heights", type:"summary", slug:"Wuthering_Heights"},
  ]},
  { author:"Charles Dickens", era:"1812–1870 · English Author", works:[
    {title:"A Tale of Two Cities", type:"summary", slug:"A_Tale_of_Two_Cities"},
    {title:"Great Expectations",   type:"summary", slug:"Great_Expectations"},
    {title:"Oliver Twist",         type:"summary", slug:"Oliver_Twist"},
    {title:"A Christmas Carol",    type:"summary", slug:"A_Christmas_Carol"},
    {title:"Bleak House",          type:"summary", slug:"Bleak_House"},
  ]},
  { author:"Fyodor Dostoevsky", era:"1821–1881 · Russian Novelist", works:[
    {title:"Crime and Punishment",  type:"summary", slug:"Crime_and_Punishment"},
    {title:"The Brothers Karamazov",type:"summary", slug:"The_Brothers_Karamazov"},
    {title:"The Idiot",             type:"summary", slug:"The_Idiot"},
    {title:"Notes from Underground",type:"summary", slug:"Notes_from_Underground"},
  ]},
  { author:"Leo Tolstoy", era:"1828–1910 · Russian Author", works:[
    {title:"War and Peace",          type:"summary", slug:"War_and_Peace"},
    {title:"Anna Karenina",          type:"summary", slug:"Anna_Karenina"},
    {title:"The Death of Ivan Ilyich",type:"summary",slug:"The_Death_of_Ivan_Ilyich"},
  ]},
  { author:"Virginia Woolf", era:"1882–1941 · English Author", works:[
    {title:"Mrs Dalloway",         type:"summary", slug:"Mrs_Dalloway"},
    {title:"To the Lighthouse",    type:"summary", slug:"To_the_Lighthouse"},
    {title:"A Room of One's Own",  type:"essay",   slug:"A_Room_of_One%27s_Own"},
    {title:"A Writer's Diary",     type:"diary",   slug:"A_Writer%27s_Diary"},
  ]},
  { author:"Victor Hugo", era:"1802–1885 · French Author", works:[
    {title:"Les Misérables",     type:"summary", slug:"Les_Mis%C3%A9rables"},
    {title:"Notre-Dame de Paris",type:"summary", slug:"The_Hunchback_of_Notre-Dame"},
  ]},
  { author:"Marcel Proust", era:"1871–1922 · French Novelist", works:[
    {title:"In Search of Lost Time",type:"summary", slug:"In_Search_of_Lost_Time"},
    {title:"Swann's Way",           type:"summary", slug:"Swann%27s_Way"},
  ]},
  { author:"Haruki Murakami", era:"1949– · Japanese Author", works:[
    {title:"Norwegian Wood",    type:"summary", slug:"Norwegian_Wood_(novel)"},
    {title:"Kafka on the Shore",type:"summary", slug:"Kafka_on_the_Shore"},
  ]},
  { author:"Toni Morrison", era:"1931–2019 · American Author", works:[
    {title:"Beloved",         type:"summary", slug:"Beloved_(novel)"},
    {title:"Song of Solomon", type:"summary", slug:"Song_of_Solomon_(novel)"},
  ]},
  { author:"Samuel Beckett", era:"1906–1989 · Irish Author", works:[
    {title:"Waiting for Godot",type:"summary", slug:"Waiting_for_Godot"},
    {title:"Endgame",          type:"summary", slug:"Endgame_(play)"},
  ]},
  { author:"Oscar Wilde", era:"1854–1900 · Irish Playwright", works:[
    {title:"De Profundis",                   type:"letter",  slug:"De_Profundis_(Oscar_Wilde)"},
    {title:"The Importance of Being Earnest",type:"summary", slug:"The_Importance_of_Being_Earnest"},
    {title:"The Picture of Dorian Gray",     type:"summary", slug:"The_Picture_of_Dorian_Gray"},
  ]},
  { author:"Sylvia Plath", era:"1932–1963 · American Poet", works:[
    {title:"Lady Lazarus", type:"poem",    slug:"Lady_Lazarus"},
    {title:"Daddy",        type:"poem",    slug:"Daddy_(poem)"},
    {title:"The Bell Jar", type:"summary", slug:"The_Bell_Jar"},
  ]},
  { author:"Mary Shelley", era:"1797–1851 · English Author", works:[
    {title:"Frankenstein", type:"summary", slug:"Frankenstein"},
  ]},
  { author:"Milan Kundera", era:"1929–2023 · Czech-French Author", works:[
    {title:"The Unbearable Lightness of Being", type:"summary", slug:"The_Unbearable_Lightness_of_Being"},
  ]},
  { author:"Leonardo da Vinci", era:"1452–1519 · Renaissance Polymath", works:[
    {title:"Notebooks", type:"letter", slug:"Leonardo_da_Vinci", isPerson:true},
  ]},
  { author:"Michelangelo", era:"1475–1564 · Renaissance Artist", works:[
    {title:"Letters & Sonnets", type:"letter", slug:"Michelangelo", isPerson:true},
  ]},
]

// ── Internet Archive queries ──────────────────────────────────────────────────
const IA_QUERIES = [
  { q:"subject:short_stories mediatype:texts language:English", type:"story" as LitType },
  { q:"creator:O._Henry mediatype:texts",                        type:"story" as LitType },
  { q:"creator:Jack_London subject:short_stories",               type:"story" as LitType },
  { q:"creator:Chekhov mediatype:texts",                         type:"story" as LitType },
  { q:"creator:Maupassant mediatype:texts",                      type:"story" as LitType },
  { q:"subject:poetry mediatype:texts language:English",         type:"poem"  as LitType },
  { q:"creator:Whitman mediatype:texts",                         type:"poem"  as LitType },
  { q:"subject:philosophy ancient mediatype:texts",              type:"philosophy" as LitType },
  { q:"subject:letters literature mediatype:texts",              type:"letter" as LitType },
  { q:"creator:Emerson mediatype:texts",                         type:"essay" as LitType },
  { q:"creator:Thoreau mediatype:texts",                         type:"essay" as LitType },
  { q:"subject:fiction novels mediatype:texts language:English", type:"summary" as LitType },
]

// ── Utils ──────────────────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g," ").replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim()
}
function shuffle<T>(arr: T[]): T[] {
  const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a
}
function normCreator(c: string): string {
  const p=c.split(",").map(s=>s.trim())
  if(p.length===2&&!p[0].includes(" ")) return `${p[1]} ${p[0]}`
  return c
}
function cleanTitle(t: string): string {
  return t.replace(/\s*\([^)]*\)/g,"").replace(/\s+/g," ").trim().slice(0,80)
}

// Is this text a book description rather than literary prose?
function isMetaText(text: string): boolean {
  const l = text.toLowerCase().slice(0,150)
  return l.includes(" is a novel by ")||l.includes(" is a short story by ")||
    l.includes(" is a play by ")||l.includes(" is a poem by ")||
    l.includes("first published in")||l.includes("was first published")||
    l.includes("was written by")||l.includes("is considered one of")
}

// ── Wikipedia sections ────────────────────────────────────────────────────────
async function fetchSections(slug: string): Promise<Array<{title:string;text:string}>> {
  try {
    const res=await fetch(`https://en.wikipedia.org/api/rest_v1/page/mobile-sections/${encodeURIComponent(slug)}`,{signal:AbortSignal.timeout(7000)})
    if(!res.ok) return []
    const d=await res.json()
    const out:Array<{title:string;text:string}>=[]
    const lead=stripHtml(d.lead?.sections?.[0]?.text||"")
    if(lead.length>60) out.push({title:"lead",text:lead})
    for(const s of (d.remaining?.sections||[])){
      const t=stripHtml(s.text||"")
      if(t.length>80) out.push({title:(s.title||"").toLowerCase(),text:t})
    }
    return out
  } catch { return [] }
}
async function fetchWikiSummary(slug: string): Promise<string|null> {
  try {
    const res=await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,{signal:AbortSignal.timeout(5000)})
    if(!res.ok) return null
    return (await res.json()).extract||null
  } catch { return null }
}

// ── Content extraction ────────────────────────────────────────────────────────
function extractContent(
  sections: Array<{title:string;text:string}>,
  type: LitType,
  isPerson: boolean
): string|null {
  const priority = isPerson
    ? ["early life","career","literary career","biography","life","personal life","philosophy","writing style"]
    : (SECTION_PRIORITY[type] || ["overview","content","lead"])

  for(const kw of priority){
    const s=sections.find(x=>x.title.includes(kw))
    if(s&&s.text.length>100){
      const ex=makeExcerpt(s.text,type,isPerson)
      if(type==="story"&&isMetaText(ex)) continue
      return ex
    }
  }
  // For story: search all non-lead sections for actual prose
  if(type==="story"){
    for(const s of sections){
      if(s.title==="lead"||s.text.length<100) continue
      const ex=makeExcerpt(s.text,type,false)
      if(!isMetaText(ex)) return ex
    }
  }
  const lead=sections.find(s=>s.title==="lead")
  if(lead&&lead.text.length>80) return makeExcerpt(lead.text,type,isPerson)
  return null
}

function makeExcerpt(text: string, type: LitType, isPerson: boolean): string {
  const clean=text.replace(/\([^)]{0,70}\)/g,"").replace(/\s+/g," ").trim()
  const sentences=clean.match(/[^.!?]+[.!?]+/g)||[clean]
  let start: number
  if(isPerson) {
    start=sentences.length>3?1:0
  } else if(type==="story") {
    start=sentences.length>2&&isMetaText(sentences[0])?1:0
    if(sentences.length>6) start=Math.floor(Math.random()*3)
  } else {
    start=Math.floor(Math.random()*Math.min(3,Math.max(0,sentences.length-2)))
  }
  const count=type==="summary"?5:4
  let ex=sentences.slice(start,start+count).join(" ").trim()
  const maxLen=type==="summary"?600:480
  if(ex.length>maxLen) ex=ex.slice(0,maxLen-20).replace(/\s\S+$/,"")+"…"
  return ex
}

// ── Archive fetch ─────────────────────────────────────────────────────────────
async function fetchArchiveBatch(query: string, type: LitType): Promise<LitItem[]> {
  const results:LitItem[]=[]
  try {
    const url=`https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}&fl[]=identifier,title,creator,description&rows=5&output=json&sort[]=downloads+desc`
    const res=await fetch(url,{signal:AbortSignal.timeout(7000)})
    if(!res.ok) return []
    const docs=(await res.json()).response?.docs||[]
    for(const doc of docs){
      const creator=Array.isArray(doc.creator)?doc.creator[0]:(doc.creator||"")
      const raw=Array.isArray(doc.description)?doc.description[0]:(doc.description||"")
      const desc=stripHtml(raw).replace(/\s+/g," ").trim()
      if(!creator||desc.length<80) continue
      const excerpt=desc.length>500?desc.slice(0,480).replace(/\s\S+$/,"")+"…":desc
      const author=normCreator(creator)
      const seed=SEEDS.find(s=>s.author.toLowerCase().split(" ").some(w=>w.length>3&&author.toLowerCase().includes(w)))
      results.push({
        id:`ia-${doc.identifier}-${Math.random().toString(36).slice(2,6)}`,
        author, era:seed?.era||"· Internet Archive",
        type, title:cleanTitle(doc.title||"Untitled"), content:excerpt,
        source:`Internet Archive — ${cleanTitle(doc.title||"Untitled")}`,
        sourceUrl:`https://archive.org/details/${doc.identifier}`,
      })
    }
  } catch {}
  return results
}

// ── State ─────────────────────────────────────────────────────────────────────
let flat: Array<{seed:Seed;work:Work}>=[]
const usedSlugs=new Set<string>()
const usedIAUrls=new Set<string>()
function buildFlat(){if(flat.length) return; for(const seed of SEEDS) for(const work of seed.works) flat.push({seed,work})}

// ── Main ──────────────────────────────────────────────────────────────────────
export async function fetchLiteratureBatch(count=14): Promise<LitItem[]> {
  buildFlat()
  const results:LitItem[]=[]
  const wikiN=Math.ceil(count*0.78)
  let avail=flat.filter(f=>!usedSlugs.has(f.work.slug))
  if(avail.length<wikiN){usedSlugs.clear();avail=[...flat]}
  const targets=shuffle(avail).slice(0,wikiN)

  await Promise.allSettled(targets.map(async({seed,work})=>{
    usedSlugs.add(work.slug)
    const sections=await fetchSections(work.slug)
    let content:string|null=null
    if(sections.length>0) content=extractContent(sections,work.type,work.isPerson||false)
    if(!content){const sum=await fetchWikiSummary(work.slug); if(sum) content=makeExcerpt(sum,work.type,work.isPerson||false)}
    if(!content||content.length<60) return
    results.push({
      id:`wiki-${work.slug}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      author:seed.author, era:seed.era, type:work.type, title:work.title, content,
      source:`Wikipedia — ${work.title}`, sourceUrl:`https://en.wikipedia.org/wiki/${work.slug}`,
    })
  }))

  const iaTargets=shuffle(IA_QUERIES).slice(0,Math.ceil(count*0.22/2))
  const iaBatches=await Promise.allSettled(iaTargets.map(({q,type})=>fetchArchiveBatch(q,type)))
  for(const r of iaBatches){
    if(r.status!=="fulfilled") continue
    for(const item of r.value){
      if(!usedIAUrls.has(item.sourceUrl)){usedIAUrls.add(item.sourceUrl);results.push(item)}
    }
  }
  return shuffle(results)
}
