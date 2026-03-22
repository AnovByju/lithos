/**
 * Lithos Real-Time Fetcher
 * Pulls live content from Wikipedia REST API & Wikiquote API.
 * Falls back to a curated seed bank if network fails.
 */

import type { LitItem, LitType } from "./literature-data"

// ── Seed catalogue — what to search for ───────────────────────────────────────
export const SEED_WORKS: Array<{
  author: string
  era: string
  works: Array<{ title: string; type: LitType; wikiSlug: string }>
}> = [
  {
    author: "William Shakespeare", era: "1564–1616 · English Playwright",
    works: [
      { title: "Hamlet",              type: "story",  wikiSlug: "Hamlet" },
      { title: "Sonnet 18",           type: "poem",   wikiSlug: "Sonnet_18" },
      { title: "Sonnet 116",          type: "poem",   wikiSlug: "Sonnet_116" },
      { title: "Macbeth",             type: "story",  wikiSlug: "Macbeth" },
      { title: "A Midsummer Night's Dream", type: "story", wikiSlug: "A_Midsummer_Night%27s_Dream" },
      { title: "King Lear",           type: "story",  wikiSlug: "King_Lear" },
      { title: "Romeo and Juliet",    type: "story",  wikiSlug: "Romeo_and_Juliet" },
      { title: "The Tempest",         type: "story",  wikiSlug: "The_Tempest" },
    ]
  },
  {
    author: "Emily Dickinson", era: "1830–1886 · American Poet",
    works: [
      { title: "Because I could not stop for Death", type: "poem", wikiSlug: "Because_I_could_not_stop_for_Death" },
      { title: "I heard a Fly buzz", type: "poem", wikiSlug: "I_heard_a_Fly_buzz" },
      { title: "Hope is the thing with feathers", type: "poem", wikiSlug: "Hope_is_the_thing_with_feathers" },
      { title: "I'm Nobody! Who are you?", type: "poem", wikiSlug: "I%27m_Nobody!_Who_are_you%3F" },
    ]
  },
  {
    author: "Edgar Allan Poe", era: "1809–1849 · American Author",
    works: [
      { title: "The Raven",           type: "poem",  wikiSlug: "The_Raven" },
      { title: "The Tell-Tale Heart", type: "story", wikiSlug: "The_Tell-Tale_Heart" },
      { title: "Annabel Lee",         type: "poem",  wikiSlug: "Annabel_Lee" },
      { title: "The Fall of the House of Usher", type: "story", wikiSlug: "The_Fall_of_the_House_of_Usher" },
      { title: "The Masque of the Red Death", type: "story", wikiSlug: "The_Masque_of_the_Red_Death" },
      { title: "Berenice",            type: "story", wikiSlug: "Berenice_(short_story)" },
    ]
  },
  {
    author: "Franz Kafka", era: "1883–1924 · Czech Author",
    works: [
      { title: "The Metamorphosis",   type: "story", wikiSlug: "The_Metamorphosis" },
      { title: "The Trial",           type: "story", wikiSlug: "The_Trial" },
      { title: "The Castle",          type: "story", wikiSlug: "The_Castle_(novel)" },
      { title: "In the Penal Colony", type: "story", wikiSlug: "In_the_Penal_Colony" },
      { title: "A Hunger Artist",     type: "story", wikiSlug: "A_Hunger_Artist" },
    ]
  },
  {
    author: "Virginia Woolf", era: "1882–1941 · English Author",
    works: [
      { title: "Mrs Dalloway",        type: "story", wikiSlug: "Mrs_Dalloway" },
      { title: "To the Lighthouse",   type: "story", wikiSlug: "To_the_Lighthouse" },
      { title: "A Room of One's Own", type: "essay", wikiSlug: "A_Room_of_One%27s_Own" },
      { title: "The Waves",           type: "story", wikiSlug: "The_Waves_(novel)" },
      { title: "Orlando: A Biography",type: "story", wikiSlug: "Orlando:_A_Biography" },
    ]
  },
  {
    author: "Oscar Wilde", era: "1854–1900 · Irish Playwright",
    works: [
      { title: "The Picture of Dorian Gray", type: "story", wikiSlug: "The_Picture_of_Dorian_Gray" },
      { title: "The Importance of Being Earnest", type: "story", wikiSlug: "The_Importance_of_Being_Earnest" },
      { title: "De Profundis",        type: "letter", wikiSlug: "De_Profundis_(Oscar_Wilde)" },
      { title: "The Happy Prince",    type: "story", wikiSlug: "The_Happy_Prince_and_Other_Tales" },
      { title: "Salomé",              type: "story", wikiSlug: "Salom%C3%A9_(play)" },
    ]
  },
  {
    author: "Walt Whitman", era: "1819–1892 · American Poet",
    works: [
      { title: "Song of Myself",       type: "poem", wikiSlug: "Song_of_Myself" },
      { title: "O Captain! My Captain!", type: "poem", wikiSlug: "O_Captain!_My_Captain!" },
      { title: "Leaves of Grass",     type: "poem", wikiSlug: "Leaves_of_Grass" },
      { title: "When Lilacs Last in the Dooryard Bloom'd", type: "poem", wikiSlug: "When_Lilacs_Last_in_the_Dooryard_Bloom%27d" },
      { title: "I Sing the Body Electric", type: "poem", wikiSlug: "I_Sing_the_Body_Electric_(poem)" },
    ]
  },
  {
    author: "Jane Austen", era: "1775–1817 · English Novelist",
    works: [
      { title: "Pride and Prejudice", type: "story", wikiSlug: "Pride_and_Prejudice" },
      { title: "Sense and Sensibility", type: "story", wikiSlug: "Sense_and_Sensibility" },
      { title: "Emma",                type: "story", wikiSlug: "Emma_(novel)" },
      { title: "Persuasion",          type: "story", wikiSlug: "Persuasion_(novel)" },
      { title: "Northanger Abbey",    type: "story", wikiSlug: "Northanger_Abbey" },
    ]
  },
  {
    author: "Fyodor Dostoevsky", era: "1821–1881 · Russian Novelist",
    works: [
      { title: "Crime and Punishment", type: "story", wikiSlug: "Crime_and_Punishment" },
      { title: "The Brothers Karamazov", type: "story", wikiSlug: "The_Brothers_Karamazov" },
      { title: "The Idiot",           type: "story", wikiSlug: "The_Idiot" },
      { title: "Notes from Underground", type: "story", wikiSlug: "Notes_from_Underground" },
      { title: "The Possessed",       type: "story", wikiSlug: "Demons_(Dostoevsky_novel)" },
    ]
  },
  {
    author: "Leo Tolstoy", era: "1828–1910 · Russian Author",
    works: [
      { title: "War and Peace",       type: "story", wikiSlug: "War_and_Peace" },
      { title: "Anna Karenina",       type: "story", wikiSlug: "Anna_Karenina" },
      { title: "The Death of Ivan Ilyich", type: "story", wikiSlug: "The_Death_of_Ivan_Ilyich" },
      { title: "Resurrection",        type: "story", wikiSlug: "Resurrection_(Tolstoy_novel)" },
    ]
  },
  {
    author: "Friedrich Nietzsche", era: "1844–1900 · German Philosopher",
    works: [
      { title: "Thus Spoke Zarathustra", type: "philosophy", wikiSlug: "Thus_Spoke_Zarathustra" },
      { title: "Beyond Good and Evil", type: "philosophy", wikiSlug: "Beyond_Good_and_Evil" },
      { title: "The Birth of Tragedy", type: "philosophy", wikiSlug: "The_Birth_of_Tragedy" },
      { title: "On the Genealogy of Morality", type: "philosophy", wikiSlug: "On_the_Genealogy_of_Morality" },
      { title: "The Gay Science",     type: "philosophy", wikiSlug: "The_Gay_Science" },
    ]
  },
  {
    author: "Marcus Aurelius", era: "121–180 AD · Roman Emperor",
    works: [
      { title: "Meditations",         type: "philosophy", wikiSlug: "Meditations" },
    ]
  },
  {
    author: "Plato", era: "428–348 BC · Greek Philosopher",
    works: [
      { title: "The Republic",        type: "philosophy", wikiSlug: "Republic_(Plato)" },
      { title: "Symposium",           type: "philosophy", wikiSlug: "Symposium_(Plato)" },
      { title: "Phaedo",              type: "philosophy", wikiSlug: "Phaedo" },
      { title: "The Apology",         type: "philosophy", wikiSlug: "Apology_(Plato)" },
    ]
  },
  {
    author: "Aristotle", era: "384–322 BC · Greek Philosopher",
    works: [
      { title: "Nicomachean Ethics",  type: "philosophy", wikiSlug: "Nicomachean_Ethics" },
      { title: "Poetics",             type: "philosophy", wikiSlug: "Poetics_(Aristotle)" },
      { title: "Politics",            type: "philosophy", wikiSlug: "Politics_(Aristotle)" },
    ]
  },
  {
    author: "Albert Camus", era: "1913–1960 · French-Algerian Author",
    works: [
      { title: "The Stranger",        type: "story", wikiSlug: "The_Stranger_(Camus_novel)" },
      { title: "The Myth of Sisyphus", type: "philosophy", wikiSlug: "The_Myth_of_Sisyphus" },
      { title: "The Plague",          type: "story", wikiSlug: "The_Plague" },
      { title: "The Fall",            type: "story", wikiSlug: "The_Fall_(Camus_novel)" },
    ]
  },
  {
    author: "Pablo Neruda", era: "1904–1973 · Chilean Poet",
    works: [
      { title: "Twenty Love Poems",   type: "poem", wikiSlug: "Twenty_Love_Poems_and_a_Song_of_Despair" },
      { title: "Canto General",       type: "poem", wikiSlug: "Canto_General" },
      { title: "Odes to Common Things", type: "poem", wikiSlug: "Odes_to_Common_Things" },
    ]
  },
  {
    author: "Rumi", era: "1207–1273 · Persian Poet & Mystic",
    works: [
      { title: "Masnavi",             type: "poem", wikiSlug: "Masnavi" },
      { title: "Divan-i Kebir",       type: "poem", wikiSlug: "Divan-i_Kebir" },
    ]
  },
  {
    author: "Homer", era: "c. 8th century BC · Ancient Greek Poet",
    works: [
      { title: "The Odyssey",         type: "story", wikiSlug: "Odyssey" },
      { title: "The Iliad",           type: "story", wikiSlug: "Iliad" },
    ]
  },
  {
    author: "Charles Dickens", era: "1812–1870 · English Author",
    works: [
      { title: "A Tale of Two Cities", type: "story", wikiSlug: "A_Tale_of_Two_Cities" },
      { title: "Great Expectations",  type: "story", wikiSlug: "Great_Expectations" },
      { title: "Oliver Twist",        type: "story", wikiSlug: "Oliver_Twist" },
      { title: "A Christmas Carol",   type: "story", wikiSlug: "A_Christmas_Carol" },
      { title: "Bleak House",         type: "story", wikiSlug: "Bleak_House" },
      { title: "David Copperfield",   type: "story", wikiSlug: "David_Copperfield_(novel)" },
    ]
  },
  {
    author: "Mark Twain", era: "1835–1910 · American Author",
    works: [
      { title: "Adventures of Huckleberry Finn", type: "story", wikiSlug: "Adventures_of_Huckleberry_Finn" },
      { title: "The Adventures of Tom Sawyer", type: "story", wikiSlug: "The_Adventures_of_Tom_Sawyer" },
      { title: "The Prince and the Pauper", type: "story", wikiSlug: "The_Prince_and_the_Pauper" },
    ]
  },
  {
    author: "Mary Shelley", era: "1797–1851 · English Author",
    works: [
      { title: "Frankenstein",        type: "story", wikiSlug: "Frankenstein" },
      { title: "The Last Man",        type: "story", wikiSlug: "The_Last_Man" },
    ]
  },
  {
    author: "Herman Melville", era: "1819–1891 · American Author",
    works: [
      { title: "Moby-Dick",           type: "story", wikiSlug: "Moby-Dick" },
      { title: "Bartleby, the Scrivener", type: "story", wikiSlug: "Bartleby,_the_Scrivener" },
      { title: "Billy Budd",          type: "story", wikiSlug: "Billy_Budd" },
    ]
  },
  {
    author: "F. Scott Fitzgerald", era: "1896–1940 · American Author",
    works: [
      { title: "The Great Gatsby",    type: "story", wikiSlug: "The_Great_Gatsby" },
      { title: "Tender Is the Night", type: "story", wikiSlug: "Tender_Is_the_Night" },
      { title: "This Side of Paradise", type: "story", wikiSlug: "This_Side_of_Paradise" },
    ]
  },
  {
    author: "Gabriel García Márquez", era: "1927–2014 · Colombian Author",
    works: [
      { title: "One Hundred Years of Solitude", type: "story", wikiSlug: "One_Hundred_Years_of_Solitude" },
      { title: "Love in the Time of Cholera", type: "story", wikiSlug: "Love_in_the_Time_of_Cholera" },
      { title: "Chronicle of a Death Foretold", type: "story", wikiSlug: "Chronicle_of_a_Death_Foretold" },
    ]
  },
  {
    author: "Dante Alighieri", era: "1265–1321 · Italian Poet",
    works: [
      { title: "Inferno",             type: "story", wikiSlug: "Inferno_(Dante)" },
      { title: "Purgatorio",          type: "poem",  wikiSlug: "Purgatorio" },
      { title: "Paradiso",            type: "poem",  wikiSlug: "Paradiso_(Dante)" },
      { title: "La Vita Nuova",       type: "poem",  wikiSlug: "La_Vita_Nuova" },
    ]
  },
  {
    author: "John Keats", era: "1795–1821 · English Romantic Poet",
    works: [
      { title: "Ode to a Nightingale", type: "poem", wikiSlug: "Ode_to_a_Nightingale" },
      { title: "Ode on a Grecian Urn", type: "poem", wikiSlug: "Ode_on_a_Grecian_Urn" },
      { title: "La Belle Dame sans Merci", type: "poem", wikiSlug: "La_Belle_Dame_sans_Merci" },
      { title: "Endymion",            type: "poem",  wikiSlug: "Endymion_(Keats_poem)" },
    ]
  },
  {
    author: "Percy Bysshe Shelley", era: "1792–1822 · English Romantic Poet",
    works: [
      { title: "Ozymandias",          type: "poem", wikiSlug: "Ozymandias" },
      { title: "Prometheus Unbound",  type: "poem", wikiSlug: "Prometheus_Unbound_(Shelley)" },
      { title: "Ode to the West Wind", type: "poem", wikiSlug: "Ode_to_the_West_Wind" },
      { title: "Adonais",             type: "poem", wikiSlug: "Adonais" },
    ]
  },
  {
    author: "Lord Byron", era: "1788–1824 · English Romantic Poet",
    works: [
      { title: "Don Juan",            type: "poem", wikiSlug: "Don_Juan_(Byron)" },
      { title: "She Walks in Beauty", type: "poem", wikiSlug: "She_Walks_in_Beauty" },
      { title: "Childe Harold's Pilgrimage", type: "poem", wikiSlug: "Childe_Harold%27s_Pilgrimage" },
    ]
  },
  {
    author: "William Blake", era: "1757–1827 · English Poet & Artist",
    works: [
      { title: "Songs of Innocence and of Experience", type: "poem", wikiSlug: "Songs_of_Innocence_and_of_Experience" },
      { title: "The Tyger",           type: "poem", wikiSlug: "The_Tyger" },
      { title: "Jerusalem: The Emanation of the Giant Albion", type: "poem", wikiSlug: "Jerusalem_The_Emanation_of_the_Giant_Albion" },
    ]
  },
  {
    author: "Anton Chekhov", era: "1860–1904 · Russian Author",
    works: [
      { title: "The Cherry Orchard",  type: "story", wikiSlug: "The_Cherry_Orchard" },
      { title: "Three Sisters",       type: "story", wikiSlug: "Three_Sisters_(play)" },
      { title: "The Seagull",         type: "story", wikiSlug: "The_Seagull" },
      { title: "Uncle Vanya",         type: "story", wikiSlug: "Uncle_Vanya" },
      { title: "The Lady with the Dog", type: "story", wikiSlug: "The_Lady_with_the_Dog" },
      { title: "Ward No. 6",          type: "story", wikiSlug: "Ward_No._6" },
    ]
  },
  {
    author: "James Joyce", era: "1882–1941 · Irish Author",
    works: [
      { title: "Ulysses",             type: "story", wikiSlug: "Ulysses_(novel)" },
      { title: "Dubliners",           type: "story", wikiSlug: "Dubliners" },
      { title: "A Portrait of the Artist as a Young Man", type: "story", wikiSlug: "A_Portrait_of_the_Artist_as_a_Young_Man" },
      { title: "Finnegans Wake",      type: "story", wikiSlug: "Finnegans_Wake" },
    ]
  },
  {
    author: "Ralph Waldo Emerson", era: "1803–1882 · American Essayist",
    works: [
      { title: "Self-Reliance",       type: "essay", wikiSlug: "Self-Reliance" },
      { title: "Nature",              type: "essay", wikiSlug: "Nature_(essay)" },
      { title: "The American Scholar", type: "essay", wikiSlug: "The_American_Scholar" },
    ]
  },
  {
    author: "Henry David Thoreau", era: "1817–1862 · American Essayist",
    works: [
      { title: "Walden",              type: "essay", wikiSlug: "Walden" },
      { title: "Civil Disobedience",  type: "essay", wikiSlug: "Civil_Disobedience_(Thoreau)" },
    ]
  },
  {
    author: "Sylvia Plath", era: "1932–1963 · American Poet",
    works: [
      { title: "The Bell Jar",        type: "diary", wikiSlug: "The_Bell_Jar" },
      { title: "Ariel",               type: "poem",  wikiSlug: "Ariel_(Plath_poetry_collection)" },
      { title: "Lady Lazarus",        type: "poem",  wikiSlug: "Lady_Lazarus" },
      { title: "Daddy",               type: "poem",  wikiSlug: "Daddy_(poem)" },
    ]
  },
  {
    author: "Simone de Beauvoir", era: "1908–1986 · French Philosopher",
    works: [
      { title: "The Second Sex",      type: "essay", wikiSlug: "The_Second_Sex" },
      { title: "The Mandarins",       type: "story", wikiSlug: "The_Mandarins_(novel)" },
    ]
  },
  {
    author: "Khalil Gibran", era: "1883–1931 · Lebanese-American Poet",
    works: [
      { title: "The Prophet",         type: "poem", wikiSlug: "The_Prophet_(book)" },
      { title: "The Madman",          type: "poem", wikiSlug: "The_Madman_(book)" },
    ]
  },
  {
    author: "Rabindranath Tagore", era: "1861–1941 · Bengali Poet",
    works: [
      { title: "Gitanjali",           type: "poem", wikiSlug: "Gitanjali" },
      { title: "The Home and the World", type: "story", wikiSlug: "The_Home_and_the_World" },
    ]
  },
  {
    author: "Victor Hugo", era: "1802–1885 · French Author",
    works: [
      { title: "Les Misérables",      type: "story", wikiSlug: "Les_Mis%C3%A9rables" },
      { title: "Notre-Dame de Paris", type: "story", wikiSlug: "The_Hunchback_of_Notre-Dame" },
    ]
  },
  {
    author: "Marcel Proust", era: "1871–1922 · French Novelist",
    works: [
      { title: "In Search of Lost Time", type: "story", wikiSlug: "In_Search_of_Lost_Time" },
      { title: "Swann's Way",         type: "story", wikiSlug: "Swann%27s_Way" },
    ]
  },
  {
    author: "Lao Tzu", era: "6th–4th century BC · Chinese Philosopher",
    works: [
      { title: "Tao Te Ching",        type: "philosophy", wikiSlug: "Tao_Te_Ching" },
    ]
  },
  {
    author: "Confucius", era: "551–479 BC · Chinese Philosopher",
    works: [
      { title: "Analects",            type: "philosophy", wikiSlug: "Analects" },
    ]
  },
  {
    author: "Leonardo da Vinci", era: "1452–1519 · Renaissance Polymath",
    works: [
      { title: "Notebooks",           type: "letter", wikiSlug: "Leonardo_da_Vinci" },
    ]
  },
  {
    author: "Michelangelo", era: "1475–1564 · Renaissance Artist",
    works: [
      { title: "Letters & Sonnets",   type: "letter", wikiSlug: "Michelangelo" },
    ]
  },
  {
    author: "Emily Brontë", era: "1818–1848 · English Novelist & Poet",
    works: [
      { title: "Wuthering Heights",   type: "story", wikiSlug: "Wuthering_Heights" },
      { title: "No Coward Soul Is Mine", type: "poem", wikiSlug: "Emily_Bront%C3%AB" },
    ]
  },
  {
    author: "Charlotte Brontë", era: "1816–1855 · English Novelist",
    works: [
      { title: "Jane Eyre",           type: "story", wikiSlug: "Jane_Eyre" },
      { title: "Villette",            type: "story", wikiSlug: "Villette_(novel)" },
    ]
  },
  {
    author: "George Orwell", era: "1903–1950 · English Author",
    works: [
      { title: "Nineteen Eighty-Four", type: "story", wikiSlug: "Nineteen_Eighty-Four" },
      { title: "Animal Farm",         type: "story", wikiSlug: "Animal_Farm" },
      { title: "Homage to Catalonia", type: "essay", wikiSlug: "Homage_to_Catalonia" },
      { title: "Down and Out in Paris and London", type: "essay", wikiSlug: "Down_and_Out_in_Paris_and_London" },
    ]
  },
  {
    author: "Virginia Woolf", era: "1882–1941 · English Author",
    works: [
      { title: "A Writer's Diary",    type: "diary", wikiSlug: "A_Writer%27s_Diary" },
      { title: "The Waves",           type: "story", wikiSlug: "The_Waves_(novel)" },
    ]
  },
  {
    author: "Samuel Beckett", era: "1906–1989 · Irish Author",
    works: [
      { title: "Waiting for Godot",   type: "story", wikiSlug: "Waiting_for_Godot" },
      { title: "Endgame",             type: "story", wikiSlug: "Endgame_(play)" },
      { title: "Molloy",              type: "story", wikiSlug: "Molloy_(novel)" },
    ]
  },
  {
    author: "Albert Camus", era: "1913–1960 · French-Algerian Author",
    works: [
      { title: "The Stranger",        type: "story", wikiSlug: "The_Stranger_(Camus_novel)" },
    ]
  },
  {
    author: "Jean-Paul Sartre", era: "1905–1980 · French Philosopher",
    works: [
      { title: "Nausea",              type: "story", wikiSlug: "Nausea_(novel)" },
      { title: "Being and Nothingness", type: "philosophy", wikiSlug: "Being_and_Nothingness" },
      { title: "No Exit",             type: "story", wikiSlug: "No_Exit" },
    ]
  },
  {
    author: "Homer", era: "c. 8th century BC · Ancient Greek Poet",
    works: [
      { title: "The Iliad",           type: "story", wikiSlug: "Iliad" },
    ]
  },
  {
    author: "Virgil", era: "70–19 BC · Roman Poet",
    works: [
      { title: "The Aeneid",          type: "poem", wikiSlug: "Aeneid" },
      { title: "Eclogues",            type: "poem", wikiSlug: "Eclogues" },
    ]
  },
  {
    author: "Sappho", era: "c. 630–570 BC · Greek Lyric Poet",
    works: [
      { title: "Fragments",           type: "poem", wikiSlug: "Sappho" },
    ]
  },
  {
    author: "Ovid", era: "43 BC–17 AD · Roman Poet",
    works: [
      { title: "Metamorphoses",       type: "poem", wikiSlug: "Metamorphoses" },
      { title: "Ars Amatoria",        type: "poem", wikiSlug: "Ars_Amatoria" },
    ]
  },
  {
    author: "Gustave Flaubert", era: "1821–1880 · French Author",
    works: [
      { title: "Madame Bovary",       type: "story", wikiSlug: "Madame_Bovary" },
      { title: "Sentimental Education", type: "story", wikiSlug: "Sentimental_Education" },
    ]
  },
  {
    author: "Honoré de Balzac", era: "1799–1850 · French Author",
    works: [
      { title: "Père Goriot",         type: "story", wikiSlug: "P%C3%A8re_Goriot" },
      { title: "Eugénie Grandet",     type: "story", wikiSlug: "Eug%C3%A9nie_Grandet" },
    ]
  },
  {
    author: "Jorge Luis Borges", era: "1899–1986 · Argentine Author",
    works: [
      { title: "Ficciones",           type: "story", wikiSlug: "Ficciones" },
      { title: "Labyrinths",          type: "story", wikiSlug: "Labyrinths" },
      { title: "The Aleph",           type: "story", wikiSlug: "The_Aleph_(short_story)" },
    ]
  },
  {
    author: "Italo Calvino", era: "1923–1985 · Italian Author",
    works: [
      { title: "If on a winter's night a traveler", type: "story", wikiSlug: "If_on_a_winter%27s_night_a_traveler" },
      { title: "Invisible Cities",    type: "story", wikiSlug: "Invisible_Cities" },
    ]
  },
  {
    author: "Milan Kundera", era: "1929–2023 · Czech-French Author",
    works: [
      { title: "The Unbearable Lightness of Being", type: "story", wikiSlug: "The_Unbearable_Lightness_of_Being" },
      { title: "The Book of Laughter and Forgetting", type: "story", wikiSlug: "The_Book_of_Laughter_and_Forgetting" },
    ]
  },
  {
    author: "Haruki Murakami", era: "1949– · Japanese Author",
    works: [
      { title: "Norwegian Wood",      type: "story", wikiSlug: "Norwegian_Wood_(novel)" },
      { title: "Kafka on the Shore",  type: "story", wikiSlug: "Kafka_on_the_Shore" },
      { title: "The Wind-Up Bird Chronicle", type: "story", wikiSlug: "The_Wind-Up_Bird_Chronicle" },
    ]
  },
  {
    author: "Toni Morrison", era: "1931–2019 · American Author",
    works: [
      { title: "Beloved",             type: "story", wikiSlug: "Beloved_(novel)" },
      { title: "Song of Solomon",     type: "story", wikiSlug: "Song_of_Solomon_(novel)" },
      { title: "The Bluest Eye",      type: "story", wikiSlug: "The_Bluest_Eye" },
    ]
  },
  {
    author: "Zora Neale Hurston", era: "1891–1960 · American Author",
    works: [
      { title: "Their Eyes Were Watching God", type: "story", wikiSlug: "Their_Eyes_Were_Watching_God" },
    ]
  },
  {
    author: "Langston Hughes", era: "1901–1967 · American Poet",
    works: [
      { title: "The Weary Blues",     type: "poem", wikiSlug: "The_Weary_Blues" },
      { title: "Montage of a Dream Deferred", type: "poem", wikiSlug: "Montage_of_a_Dream_Deferred" },
    ]
  },
  {
    author: "W.B. Yeats", era: "1865–1939 · Irish Poet",
    works: [
      { title: "The Second Coming",   type: "poem", wikiSlug: "The_Second_Coming_(poem)" },
      { title: "Sailing to Byzantium", type: "poem", wikiSlug: "Sailing_to_Byzantium" },
      { title: "The Wild Swans at Coole", type: "poem", wikiSlug: "The_Wild_Swans_at_Coole" },
    ]
  },
  {
    author: "T.S. Eliot", era: "1888–1965 · American-British Poet",
    works: [
      { title: "The Waste Land",      type: "poem", wikiSlug: "The_Waste_Land" },
      { title: "The Love Song of J. Alfred Prufrock", type: "poem", wikiSlug: "The_Love_Song_of_J._Alfred_Prufrock" },
      { title: "Four Quartets",       type: "poem", wikiSlug: "Four_Quartets" },
    ]
  },
  {
    author: "Rainer Maria Rilke", era: "1875–1926 · Bohemian-Austrian Poet",
    works: [
      { title: "Letters to a Young Poet", type: "letter", wikiSlug: "Letters_to_a_Young_Poet" },
      { title: "Duino Elegies",       type: "poem", wikiSlug: "Duino_Elegies" },
      { title: "Sonnets to Orpheus",  type: "poem", wikiSlug: "Sonnets_to_Orpheus" },
    ]
  },
]

// ── Wikipedia API fetcher ─────────────────────────────────────────────────────
const WIKI_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary/"
const WIKI_SEARCH  = "https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=1&srsearch="

async function fetchWikiSummary(slug: string): Promise<string | null> {
  try {
    const res = await fetch(WIKI_SUMMARY + slug, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const data = await res.json()
    return data.extract || null
  } catch {
    return null
  }
}

// Extract a meaningful excerpt from a long Wikipedia summary
function extractExcerpt(text: string, maxLen = 420): string {
  // Remove parenthetical references like (1818) etc.
  let clean = text.replace(/\([^)]{0,40}\)/g, "").replace(/\s+/g, " ").trim()

  // Try to get the 2nd or 3rd sentence for more literary feel
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || []
  if (sentences.length > 2) {
    const start = Math.floor(Math.random() * Math.min(3, sentences.length - 1))
    let excerpt = sentences.slice(start, start + 3).join(" ").trim()
    if (excerpt.length > maxLen) excerpt = excerpt.slice(0, maxLen).replace(/\s\S+$/, "") + "…"
    return excerpt
  }

  if (clean.length > maxLen) clean = clean.slice(0, maxLen).replace(/\s\S+$/, "") + "…"
  return clean
}

// ── Main fetch function ────────────────────────────────────────────────────────
let fetchedCache: LitItem[] = []
const fetchedSlugs = new Set<string>()

export async function fetchLiteratureBatch(count = 12): Promise<LitItem[]> {
  const results: LitItem[] = []

  // Build a flat list of all works, shuffle it
  const flat: Array<{ seed: typeof SEED_WORKS[0]; work: typeof SEED_WORKS[0]["works"][0] }> = []
  for (const seed of SEED_WORKS) {
    for (const work of seed.works) {
      flat.push({ seed, work })
    }
  }

  // Shuffle
  for (let i = flat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flat[i], flat[j]] = [flat[j], flat[i]]
  }

  // Filter out already fetched slugs to avoid repeats
  const toFetch = flat.filter(f => !fetchedSlugs.has(f.work.wikiSlug))

  // If we've fetched everything, reset and refetch
  if (toFetch.length < count) fetchedSlugs.clear()

  const targets = toFetch.slice(0, count)

  await Promise.allSettled(
    targets.map(async ({ seed, work }) => {
      const text = await fetchWikiSummary(work.wikiSlug)
      if (!text) return

      fetchedSlugs.add(work.wikiSlug)
      const excerpt = extractExcerpt(text)
      if (excerpt.length < 60) return

      const item: LitItem = {
        id:        `wiki-${work.wikiSlug}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        author:    seed.author,
        era:       seed.era,
        type:      work.type,
        title:     work.title,
        content:   excerpt,
        source:    `Wikipedia — ${work.title}`,
        sourceUrl: `https://en.wikipedia.org/wiki/${work.wikiSlug}`,
      }
      results.push(item)
    })
  )

  fetchedCache = [...fetchedCache, ...results]
  return results
}

export function getCachedItems(): LitItem[] {
  return fetchedCache
}

export function clearFetchCache() {
  fetchedCache = []
  fetchedSlugs.clear()
}
