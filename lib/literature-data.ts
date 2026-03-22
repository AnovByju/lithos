export type LitType = "poem" | "quote" | "story" | "letter" | "diary" | "essay" | "philosophy"

export interface LitItem {
  id: string
  author: string
  era: string
  type: LitType
  title: string
  content: string
  source: string
  sourceUrl: string
}

export const TYPE_COLORS: Record<LitType, string> = {
  poem:       "#bf5af2",
  quote:      "#0a84ff",
  story:      "#ff453a",
  letter:     "#ffd60a",
  diary:      "#30d158",
  essay:      "#ff9f0a",
  philosophy: "#5ac8fa",
}

// Public domain portrait URLs from Wikimedia Commons
const AUTHOR_IMAGES: Record<string, string> = {
  "William Shakespeare":     "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Shakespeare.jpg/120px-Shakespeare.jpg",
  "Marcus Aurelius":         "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/MSR-ra-1-1-1_b.jpg/120px-MSR-ra-1-1-1_b.jpg",
  "Emily Dickinson":         "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Black_white_photograph_of_Emily_Dickinson2.png/120px-Black_white_photograph_of_Emily_Dickinson2.png",
  "Oscar Wilde":             "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Oscar_Wilde%2C_1882.jpg/120px-Oscar_Wilde%2C_1882.jpg",
  "Leonardo da Vinci":       "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Leonardo_self.jpg/120px-Leonardo_self.jpg",
  "Virginia Woolf":          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/George_Charles_Beresford_-_Virginia_Woolf_in_1902_-_Restoration.jpg/120px-George_Charles_Beresford_-_Virginia_Woolf_in_1902_-_Restoration.jpg",
  "Franz Kafka":             "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Franz_Kafka%2C_circa_1910.jpg/120px-Franz_Kafka%2C_circa_1910.jpg",
  "Walt Whitman":            "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Walt_Whitman_-_George_Collins_Cox.jpg/120px-Walt_Whitman_-_George_Collins_Cox.jpg",
  "Jane Austen":             "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/CassandraAusten-JaneAusten%28c.1810%29_hires.jpg/120px-CassandraAusten-JaneAusten%28c.1810%29_hires.jpg",
  "Edgar Allan Poe":         "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Poe_Painting_Crop.jpg/120px-Poe_Painting_Crop.jpg",
  "Pablo Neruda":            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Pablo_Neruda_1963.jpg/120px-Pablo_Neruda_1963.jpg",
  "Mary Shelley":            "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/RothwellMaryWollstonecraftShelley.jpg/120px-RothwellMaryWollstonecraftShelley.jpg",
  "Lord Byron":              "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/George_Gordon_Byron%2C_6th_Baron_Byron_by_Richard_Westall_%282%29.jpg/120px-George_Gordon_Byron%2C_6th_Baron_Byron_by_Richard_Westall_%282%29.jpg",
  "John Keats":              "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/John_Keats_by_William_Hilton.jpg/120px-John_Keats_by_William_Hilton.jpg",
  "Percy Bysshe Shelley":    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Percy_Bysshe_Shelley_by_Alfred_Clint.jpg/120px-Percy_Bysshe_Shelley_by_Alfred_Clint.jpg",
  "William Blake":           "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/William_Blake_by_Thomas_Phillips.jpg/120px-William_Blake_by_Thomas_Phillips.jpg",
  "Fyodor Dostoevsky":       "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg/120px-Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg",
  "Mark Twain":              "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mark_Twain_by_AF_Bradley.jpg/120px-Mark_Twain_by_AF_Bradley.jpg",
  "Friedrich Nietzsche":     "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/120px-Nietzsche187a.jpg",
  "Albert Camus":            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Albert_Camus%2C_gagnant_de_prix_Nobel%2C_portrait_en_buste%2C_pos%C3%A9_au_bureau%2C_faisant_face_%C3%A0_gauche%2C_cigarette_de_tabagisme.jpg/120px-Albert_Camus%2C_gagnant_de_prix_Nobel%2C_portrait_en_buste%2C_pos%C3%A9_au_bureau%2C_faisant_face_%C3%A0_gauche%2C_cigarette_de_tabagisme.jpg",
  "Leo Tolstoy":             "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/L.N.Tolstoy_Prokudin-Gorsky.jpg/120px-L.N.Tolstoy_Prokudin-Gorsky.jpg",
  "Plato":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Plato_Silanion_Musei_Capitolini_MC1377.jpg/120px-Plato_Silanion_Musei_Capitolini_MC1377.jpg",
  "Sylvia Plath":            "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Sylvia_Plath.jpg/120px-Sylvia_Plath.jpg",
  "Ralph Waldo Emerson":     "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Ralph_Waldo_Emerson_ca1857_retouched.jpg/120px-Ralph_Waldo_Emerson_ca1857_retouched.jpg",
  "Dante Alighieri":         "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Dante_Alighieri_by_Luca_Signorelli%2C_1499-1502.jpg/120px-Dante_Alighieri_by_Luca_Signorelli%2C_1499-1502.jpg",
  "Anton Chekhov":           "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Chekhov.jpg/120px-Chekhov.jpg",
  "Aristotle":               "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Aristotle_Altemps_Inv8575.jpg/120px-Aristotle_Altemps_Inv8575.jpg",
  "F. Scott Fitzgerald":     "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/F_Scott_Fitzgerald_1921.jpg/120px-F_Scott_Fitzgerald_1921.jpg",
  "Herman Melville":         "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Herman_Melville_1860.jpg/120px-Herman_Melville_1860.jpg",
  "Charles Dickens":         "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Dickens_Gurney_head.jpg/120px-Dickens_Gurney_head.jpg",
  "Victor Hugo":             "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Victor_Hugo_by_%C3%89tienne_Carjat_1876_-_full.jpg/120px-Victor_Hugo_by_%C3%89tienne_Carjat_1876_-_full.jpg",
  "Michelangelo":            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Miguel_%C3%81ngel%2C_por_Daniele_da_Volterra_%28detalle%29.jpg/120px-Miguel_%C3%81ngel%2C_por_Daniele_da_Volterra_%28detalle%29.jpg",
  "Marcel Proust":           "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Marcel_Proust_1900.jpg/120px-Marcel_Proust_1900.jpg",
  "Emily Brontë":            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Emily_bront%C3%AB.jpg/120px-Emily_bront%C3%AB.jpg",
  "James Joyce":             "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/James_Joyce_by_Alex_Ehrenzweig%2C_1915_restored.jpg/120px-James_Joyce_by_Alex_Ehrenzweig%2C_1915_restored.jpg",
  "Gabriel García Márquez":  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Gabriel_Garcia_Marquez.jpg/120px-Gabriel_Garcia_Marquez.jpg",
  "George Orwell":           "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/George_Orwell_press_photo.jpg/120px-George_Orwell_press_photo.jpg",
  "W.B. Yeats":              "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/William_Butler_Yeats_by_George_Charles_Beresford.jpg/120px-William_Butler_Yeats_by_George_Charles_Beresford.jpg",
  "T.S. Eliot":              "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Thomas_Stearns_Eliot_by_Lady_Ottoline_Morrell_%281934%29.jpg/120px-Thomas_Stearns_Eliot_by_Lady_Ottoline_Morrell_%281934%29.jpg",
  "Rainer Maria Rilke":      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Rilke.jpg/120px-Rilke.jpg",
  "Langston Hughes":         "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Langston_Hughes_by_Carl_Van_Vechten_1936.jpg/120px-Langston_Hughes_by_Carl_Van_Vechten_1936.jpg",
  "Toni Morrison":           "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Toni_Morrison_2008-2.jpg/120px-Toni_Morrison_2008-2.jpg",
  "Jorge Luis Borges":       "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Jorge_Luis_Borges_1951%2C_by_Grete_Stern.jpg/120px-Jorge_Luis_Borges_1951%2C_by_Grete_Stern.jpg",
  "Khalil Gibran":           "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Kahlil_Gibran_1913.jpg/120px-Kahlil_Gibran_1913.jpg",
  "Samuel Beckett":          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Samuel_Beckett%2C_Pic%2C_1.jpg/120px-Samuel_Beckett%2C_Pic%2C_1.jpg",
  "Jean-Paul Sartre":        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Sartre_1967_crop.jpg/120px-Sartre_1967_crop.jpg",
  "Simone de Beauvoir":      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Simone_de_Beauvoir2.png/120px-Simone_de_Beauvoir2.png",
  "Rabindranath Tagore":     "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Rabindranath_Tagore_in_1909.jpg/120px-Rabindranath_Tagore_in_1909.jpg",
  "Gustave Flaubert":        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Gustave_flaubert.jpg/120px-Gustave_flaubert.jpg",
  "Charlotte Brontë":        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/CB-portrait-gm-c1850.jpg/120px-CB-portrait-gm-c1850.jpg",
  "Henry David Thoreau":     "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Henry_David_Thoreau.jpg/120px-Henry_David_Thoreau.jpg",
  "Haruki Murakami":         "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Murakami_Haruki_%282009%29.jpg/120px-Murakami_Haruki_%282009%29.jpg",
}

export function getAuthorImage(author: string): string | undefined {
  return AUTHOR_IMAGES[author]
}

export function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
