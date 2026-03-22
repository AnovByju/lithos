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

export const LITERATURE: LitItem[] = [
  {
    id:"s1", author:"William Shakespeare", era:"1564–1616 · English Playwright", type:"poem",
    title:"Sonnet 18",
    content:`Shall I compare thee to a summer's day?\nThou art more lovely and more temperate.\nRough winds do shake the darling buds of May,\nAnd summer's lease hath all too short a date.\nSometime too hot the eye of heaven shines,\nAnd often is his gold complexion dimmed;\nAnd every fair from fair sometime declines,\nBy chance, or nature's changing course, untrimmed.\nBut thy eternal summer shall not fade,\nNor lose possession of that fair thou ow'st,\nNor shall death brag thou wand'rest in his shade,\nWhen in eternal lines to Time thou grow'st.\nSo long as men can breathe, or eyes can see,\nSo long lives this, and this gives life to thee.`,
    source:"Wikipedia — Sonnet 18", sourceUrl:"https://en.wikipedia.org/wiki/Sonnet_18"
  },
  {
    id:"ma1", author:"Marcus Aurelius", era:"121–180 AD · Roman Emperor", type:"philosophy",
    title:"Meditations, Book II",
    content:"You have power over your mind, not outside events. Realize this, and you will find strength. The impediment to action advances action. What stands in the way becomes the way.",
    source:"Wikipedia — Meditations", sourceUrl:"https://en.wikipedia.org/wiki/Meditations"
  },
  {
    id:"ed1", author:"Emily Dickinson", era:"1830–1886 · American Poet", type:"poem",
    title:"Because I could not stop for Death",
    content:`Because I could not stop for Death –\nHe kindly stopped for me –\nThe Carriage held but just Ourselves –\nAnd Immortality.\n\nWe slowly drove – He knew no haste\nAnd I had put away\nMy labor and my leisure too,\nFor His Civility –`,
    source:"Wikipedia — Because I could not stop for Death", sourceUrl:"https://en.wikipedia.org/wiki/Because_I_could_not_stop_for_Death"
  },
  {
    id:"ow1", author:"Oscar Wilde", era:"1854–1900 · Irish Playwright", type:"quote",
    title:"The Picture of Dorian Gray",
    content:"To live is the rarest thing in the world. Most people exist, that is all.",
    source:"Wikipedia — Oscar Wilde", sourceUrl:"https://en.wikipedia.org/wiki/Oscar_Wilde"
  },
  {
    id:"lv1", author:"Leonardo da Vinci", era:"1452–1519 · Renaissance Polymath", type:"letter",
    title:"Notebooks, c. 1508",
    content:"I have been impressed with the urgency of doing. Knowing is not enough; we must apply. Being willing is not enough; we must do. Learning never exhausts the mind — it only ignites it further.",
    source:"Internet Archive — Da Vinci Notebooks", sourceUrl:"https://archive.org/details/notebooksofleonar00leon"
  },
  {
    id:"r1", author:"Rumi", era:"1207–1273 · Persian Poet & Mystic", type:"poem",
    title:"The Guest House",
    content:`This being human is a guest house.\nEvery morning a new arrival.\n\nA joy, a depression, a meanness,\nsome momentary awareness comes\nas an unexpected visitor.\n\nWelcome and entertain them all!\nEven if they are a crowd of sorrows,\nwho violently sweep your house\nempty of its furniture,\n\nStill, treat each guest honorably.`,
    source:"Wikipedia — Rumi", sourceUrl:"https://en.wikipedia.org/wiki/Rumi"
  },
  {
    id:"vw1", author:"Virginia Woolf", era:"1882–1941 · English Author", type:"diary",
    title:"A Writer's Diary, March 1926",
    content:"I thought how unpleasant it is to be locked out; and I thought how it is worse perhaps to be locked in. Arrange whatever pieces come your way. You cannot find peace by avoiding life.",
    source:"Wikipedia — A Writer's Diary", sourceUrl:"https://en.wikipedia.org/wiki/A_Writer%27s_Diary"
  },
  {
    id:"fk1", author:"Franz Kafka", era:"1883–1924 · Czech Author", type:"story",
    title:"The Metamorphosis — Opening",
    content:"One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by stiff arched segments.",
    source:"Wikipedia — The Metamorphosis", sourceUrl:"https://en.wikipedia.org/wiki/The_Metamorphosis"
  },
  {
    id:"ww1", author:"Walt Whitman", era:"1819–1892 · American Poet", type:"poem",
    title:"Song of Myself, §1",
    content:`I celebrate myself, and sing myself,\nAnd what I assume you shall assume,\nFor every atom belonging to me as good belongs to you.\n\nI loafe and invite my soul,\nI lean and loafe at my ease observing a spear of summer grass.`,
    source:"Wikipedia — Song of Myself", sourceUrl:"https://en.wikipedia.org/wiki/Song_of_Myself"
  },
  {
    id:"ja1", author:"Jane Austen", era:"1775–1817 · English Novelist", type:"quote",
    title:"Pride and Prejudice, Chapter 1",
    content:"It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    source:"Wikipedia — Pride and Prejudice", sourceUrl:"https://en.wikipedia.org/wiki/Pride_and_Prejudice"
  },
  {
    id:"ep1", author:"Edgar Allan Poe", era:"1809–1849 · American Author", type:"poem",
    title:"The Raven, Stanza I",
    content:`Once upon a midnight dreary, while I pondered, weak and weary,\nOver many a quaint and curious volume of forgotten lore—\nWhile I nodded, nearly napping, suddenly there came a tapping,\nAs of some one gently rapping, rapping at my chamber door.\n"'Tis some visitor," I muttered, "tapping at my chamber door—\nOnly this and nothing more."`,
    source:"Wikipedia — The Raven", sourceUrl:"https://en.wikipedia.org/wiki/The_Raven"
  },
  {
    id:"pn1", author:"Pablo Neruda", era:"1904–1973 · Chilean Poet", type:"poem",
    title:"Tonight I Can Write",
    content:`Tonight I can write the saddest lines.\nWrite, for example, 'The night is starry,\nand the stars, blue, shiver in the distance.'\n\nThe night wind revolves in the sky and sings.\nTonight I can write the saddest lines.\nI loved her, and sometimes she loved me too.`,
    source:"Wikipedia — Pablo Neruda", sourceUrl:"https://en.wikipedia.org/wiki/Pablo_Neruda"
  },
  {
    id:"s2", author:"William Shakespeare", era:"1564–1616 · English Playwright", type:"quote",
    title:"Hamlet, Act III, Scene 1",
    content:"To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them.",
    source:"Wikipedia — To be, or not to be", sourceUrl:"https://en.wikipedia.org/wiki/To_be,_or_not_to_be"
  },
  {
    id:"ms1", author:"Mary Shelley", era:"1797–1851 · English Author", type:"story",
    title:"Frankenstein, Chapter 5",
    content:"It was on a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet.",
    source:"Wikipedia — Frankenstein", sourceUrl:"https://en.wikipedia.org/wiki/Frankenstein"
  },
  {
    id:"lb1", author:"Lord Byron", era:"1788–1824 · English Romantic Poet", type:"poem",
    title:"She Walks in Beauty",
    content:`She walks in beauty, like the night\nOf cloudless climes and starry skies;\nAnd all that's best of dark and bright\nMeet in her aspect and her eyes;\nThus mellowed to that tender light\nWhich heaven to gaudy day denies.`,
    source:"Wikipedia — She Walks in Beauty", sourceUrl:"https://en.wikipedia.org/wiki/She_Walks_in_Beauty"
  },
  {
    id:"jk1", author:"John Keats", era:"1795–1821 · English Romantic Poet", type:"poem",
    title:"Ode to a Nightingale, Stanza I",
    content:`My heart aches, and a drowsy numbness pains\nMy sense, as though of hemlock I had drunk,\nOr emptied some dull opiate to the drains\nOne minute past, and Lethe-wards had sunk:\n'Tis not through envy of thy happy lot,\nBut being too happy in thine happiness,\nThat thou, light-wingèd Dryad of the trees,\nSingest of summer in full-throated ease.`,
    source:"Wikipedia — Ode to a Nightingale", sourceUrl:"https://en.wikipedia.org/wiki/Ode_to_a_Nightingale"
  },
  {
    id:"ps1", author:"Percy Bysshe Shelley", era:"1792–1822 · English Romantic Poet", type:"poem",
    title:"Ozymandias",
    content:`I met a traveller from an antique land,\nWho said—"Two vast and trunkless legs of stone\nStand in the desert. Near them, on the sand,\nHalf sunk a shattered visage lies, whose frown,\nAnd wrinkled lip, and sneer of cold command,\nTell that its sculptor well those passions read.\n\nAnd on the pedestal, these words appear:\nMy name is Ozymandias, King of Kings;\nLook on my Works, ye Mighty, and despair!"`,
    source:"Wikipedia — Ozymandias", sourceUrl:"https://en.wikipedia.org/wiki/Ozymandias"
  },
  {
    id:"wb1", author:"William Blake", era:"1757–1827 · English Poet & Artist", type:"poem",
    title:"The Tyger",
    content:`Tyger Tyger, burning bright,\nIn the forests of the night;\nWhat immortal hand or eye,\nCould frame thy fearful symmetry?\n\nIn what distant deeps or skies,\nBurnt the fire of thine eyes?\nOn what wings dare he aspire?\nWhat the hand, dare seize the fire?`,
    source:"Wikipedia — The Tyger", sourceUrl:"https://en.wikipedia.org/wiki/The_Tyger"
  },
  {
    id:"fd1", author:"Fyodor Dostoevsky", era:"1821–1881 · Russian Novelist", type:"quote",
    title:"The Brothers Karamazov",
    content:"Above all, don't lie to yourself. The man who lies to himself and listens to his own lie comes to a point that he cannot distinguish the truth within him, or around him, and so loses all respect for himself and for others.",
    source:"Wikipedia — The Brothers Karamazov", sourceUrl:"https://en.wikipedia.org/wiki/The_Brothers_Karamazov"
  },
  {
    id:"mt1", author:"Mark Twain", era:"1835–1910 · American Author", type:"quote",
    title:"Notebook, 1894",
    content:"The secret of getting ahead is getting started. The two most important days in your life are the day you are born and the day you find out why.",
    source:"Wikipedia — Mark Twain", sourceUrl:"https://en.wikipedia.org/wiki/Mark_Twain"
  },
  {
    id:"h1", author:"Homer", era:"c. 8th century BC · Ancient Greek Poet", type:"story",
    title:"The Odyssey, Book I",
    content:"Sing to me of the man, Muse, the man of twists and turns driven time and again off course, once he had plundered the hallowed heights of Troy. Many cities of men he saw and learned their minds, many pains he suffered, heartsick on the open sea.",
    source:"Wikipedia — Odyssey", sourceUrl:"https://en.wikipedia.org/wiki/Odyssey"
  },
  {
    id:"fn1", author:"Friedrich Nietzsche", era:"1844–1900 · German Philosopher", type:"philosophy",
    title:"Thus Spoke Zarathustra",
    content:"One must still have chaos in oneself to be able to give birth to a dancing star. And those who were seen dancing were thought to be insane by those who could not hear the music.",
    source:"Wikipedia — Thus Spoke Zarathustra", sourceUrl:"https://en.wikipedia.org/wiki/Thus_Spoke_Zarathustra"
  },
  {
    id:"vw2", author:"Virginia Woolf", era:"1882–1941 · English Author", type:"quote",
    title:"A Room of One's Own",
    content:"A woman must have money and a room of her own if she is to write fiction. Lock up your libraries if you like; but there is no gate, no lock, no bolt that you can set upon the freedom of my mind.",
    source:"Wikipedia — A Room of One's Own", sourceUrl:"https://en.wikipedia.org/wiki/A_Room_of_One%27s_Own"
  },
  {
    id:"ac1", author:"Albert Camus", era:"1913–1960 · French-Algerian Author", type:"philosophy",
    title:"The Myth of Sisyphus",
    content:"One must imagine Sisyphus happy. The struggle itself towards the heights is enough to fill a man's heart. In the depth of winter, I finally learned that within me there lay an invincible summer.",
    source:"Wikipedia — The Myth of Sisyphus", sourceUrl:"https://en.wikipedia.org/wiki/The_Myth_of_Sisyphus"
  },
  {
    id:"kg1", author:"Khalil Gibran", era:"1883–1931 · Lebanese-American Poet", type:"poem",
    title:"The Prophet — On Love",
    content:`When love beckons to you, follow him,\nThough his ways are hard and steep.\nAnd when his wings enfold you yield to him,\nThough the sword hidden among his pinions may wound you.\nAnd when he speaks to you believe in him,\nThough his voice may shatter your dreams\nas the north wind lays waste the garden.`,
    source:"Wikipedia — The Prophet (book)", sourceUrl:"https://en.wikipedia.org/wiki/The_Prophet_(book)"
  },
  {
    id:"lt1", author:"Leo Tolstoy", era:"1828–1910 · Russian Author", type:"story",
    title:"Anna Karenina — Opening",
    content:"All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house.",
    source:"Wikipedia — Anna Karenina", sourceUrl:"https://en.wikipedia.org/wiki/Anna_Karenina"
  },
  {
    id:"ow2", author:"Oscar Wilde", era:"1854–1900 · Irish Playwright", type:"letter",
    title:"De Profundis, 1897",
    content:"I don't want to be at the mercy of my emotions. I want to use them, to enjoy them, and to dominate them. We are all in the gutter, but some of us are looking at the stars.",
    source:"Wikipedia — De Profundis", sourceUrl:"https://en.wikipedia.org/wiki/De_Profundis_(Oscar_Wilde)"
  },
  {
    id:"pl1", author:"Plato", era:"428–348 BC · Greek Philosopher", type:"philosophy",
    title:"The Republic",
    content:"The measure of a man is what he does with power. Wise men talk because they have something to say; fools, because they have to say something. The heaviest penalty for declining to rule is to be ruled by someone inferior to yourself.",
    source:"Wikipedia — The Republic", sourceUrl:"https://en.wikipedia.org/wiki/Republic_(Plato)"
  },
  {
    id:"sp1", author:"Sylvia Plath", era:"1932–1963 · American Poet", type:"diary",
    title:"The Bell Jar",
    content:"I took a deep breath and listened to the old brag of my heart: I am, I am, I am. I felt my lungs inflate with the onrush of scenery—air, mountains, trees, people. I thought, this is what it is to be happy.",
    source:"Wikipedia — The Bell Jar", sourceUrl:"https://en.wikipedia.org/wiki/The_Bell_Jar"
  },
  {
    id:"re1", author:"Ralph Waldo Emerson", era:"1803–1882 · American Essayist", type:"essay",
    title:"Self-Reliance, 1841",
    content:"To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. Trust thyself: every heart vibrates to that iron string.",
    source:"Wikipedia — Self-Reliance", sourceUrl:"https://en.wikipedia.org/wiki/Self-Reliance"
  },
  {
    id:"rt1", author:"Rabindranath Tagore", era:"1861–1941 · Bengali Poet", type:"poem",
    title:"Gitanjali, Poem 35",
    content:`Where the mind is without fear and the head is held high;\nWhere knowledge is free;\nWhere the world has not been broken up into fragments\nby narrow domestic walls;\nWhere words come out from the depth of truth;\nInto that heaven of freedom, my Father, let my country awake.`,
    source:"Wikipedia — Gitanjali", sourceUrl:"https://en.wikipedia.org/wiki/Gitanjali"
  },
  {
    id:"da1", author:"Dante Alighieri", era:"1265–1321 · Italian Poet", type:"story",
    title:"Inferno, Canto I",
    content:"Midway upon the journey of our life I found myself within a forest dark, for the straightforward pathway had been lost. Ah me! how hard a thing it is to say what was this forest savage, rough, and stern, which in the very thought renews the fear.",
    source:"Wikipedia — Inferno (Dante)", sourceUrl:"https://en.wikipedia.org/wiki/Inferno_(Dante)"
  },
  {
    id:"ach1", author:"Anton Chekhov", era:"1860–1904 · Russian Author", type:"letter",
    title:"Letter to A.S. Suvorin, 1889",
    content:"Don't tell me the moon is shining; show me the glint of light on broken glass. The role of the artist is to ask questions, not answer them. If you want to work on your art, work on your life.",
    source:"Wikipedia — Anton Chekhov", sourceUrl:"https://en.wikipedia.org/wiki/Anton_Chekhov"
  },
  {
    id:"ar1", author:"Aristotle", era:"384–322 BC · Greek Philosopher", type:"philosophy",
    title:"Nicomachean Ethics",
    content:"We are what we repeatedly do. Excellence, then, is not an act, but a habit. It is the mark of an educated mind to be able to entertain a thought without accepting it.",
    source:"Wikipedia — Nicomachean Ethics", sourceUrl:"https://en.wikipedia.org/wiki/Nicomachean_Ethics"
  },
  {
    id:"fsf1", author:"F. Scott Fitzgerald", era:"1896–1940 · American Author", type:"story",
    title:"The Great Gatsby — Closing",
    content:"So we beat on, boats against the current, borne back ceaselessly into the past. Gatsby believed in the green light, the orgastic future that year by year recedes before us.",
    source:"Wikipedia — The Great Gatsby", sourceUrl:"https://en.wikipedia.org/wiki/The_Great_Gatsby"
  },
  {
    id:"ltz1", author:"Lao Tzu", era:"6th–4th century BC · Chinese Philosopher", type:"philosophy",
    title:"Tao Te Ching, Chapter 33",
    content:"Knowing others is wisdom. Knowing yourself is enlightenment. Mastering others requires force. Mastering yourself requires strength. The journey of a thousand miles begins with one step.",
    source:"Wikipedia — Tao Te Ching", sourceUrl:"https://en.wikipedia.org/wiki/Tao_Te_Ching"
  },
  {
    id:"ww2", author:"Walt Whitman", era:"1819–1892 · American Poet", type:"poem",
    title:"O Captain! My Captain!",
    content:`O Captain! my Captain! our fearful trip is done,\nThe ship has weather'd every rack, the prize we sought is won,\nThe port is near, the bells I hear, the people all exulting,\nWhile follow eyes the steady keel, the vessel grim and daring;\n    But O heart! heart! heart!\n      O the bleeding drops of red,\n        Where on the deck my Captain lies,\n          Fallen cold and dead.`,
    source:"Wikipedia — O Captain! My Captain!", sourceUrl:"https://en.wikipedia.org/wiki/O_Captain!_My_Captain!"
  },
  {
    id:"cd1", author:"Charles Dickens", era:"1812–1870 · English Author", type:"story",
    title:"A Tale of Two Cities — Opening",
    content:"It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness.",
    source:"Wikipedia — A Tale of Two Cities", sourceUrl:"https://en.wikipedia.org/wiki/A_Tale_of_Two_Cities"
  },
  {
    id:"jj1", author:"James Joyce", era:"1882–1941 · Irish Author", type:"story",
    title:"The Dead — Closing Lines",
    content:"His soul swooned slowly as he heard the snow falling faintly through the universe and faintly falling, like the descent of their last end, upon all the living and the dead.",
    source:"Wikipedia — The Dead (Joyce)", sourceUrl:"https://en.wikipedia.org/wiki/The_Dead_(short_story)"
  },
  {
    id:"cf1", author:"Confucius", era:"551–479 BC · Chinese Philosopher", type:"philosophy",
    title:"The Analects",
    content:"Life is really simple, but we insist on making it complicated. It does not matter how slowly you go as long as you do not stop. Our greatest glory is not in never falling, but in rising every time we fall.",
    source:"Wikipedia — Analects", sourceUrl:"https://en.wikipedia.org/wiki/Analects"
  },
  {
    id:"ep2", author:"Edgar Allan Poe", era:"1809–1849 · American Author", type:"story",
    title:"The Tell-Tale Heart — Opening",
    content:"True! — nervous — very, very dreadfully nervous I had been and am; but why will you say that I am mad? The disease had sharpened my senses — not destroyed — not dulled them. Above all was the sense of hearing acute.",
    source:"Wikipedia — The Tell-Tale Heart", sourceUrl:"https://en.wikipedia.org/wiki/The_Tell-Tale_Heart"
  },
  {
    id:"sb1", author:"Simone de Beauvoir", era:"1908–1986 · French Philosopher", type:"essay",
    title:"The Second Sex, 1949",
    content:"One is not born, but rather becomes, a woman. No biological, psychological, or economic fate determines the figure that the human female presents in society; it is civilization as a whole that produces this creature.",
    source:"Wikipedia — The Second Sex", sourceUrl:"https://en.wikipedia.org/wiki/The_Second_Sex"
  },
  {
    id:"hm1", author:"Herman Melville", era:"1819–1891 · American Author", type:"story",
    title:"Moby Dick — Opening",
    content:"Call me Ishmael. Some years ago — never mind how long precisely — having little money in my pocket and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
    source:"Wikipedia — Moby-Dick", sourceUrl:"https://en.wikipedia.org/wiki/Moby-Dick"
  },
  {
    id:"gg1", author:"Gabriel García Márquez", era:"1927–2014 · Colombian Author", type:"story",
    title:"One Hundred Years of Solitude",
    content:"Many years later, as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon when his father took him to discover ice.",
    source:"Wikipedia — One Hundred Years of Solitude", sourceUrl:"https://en.wikipedia.org/wiki/One_Hundred_Years_of_Solitude"
  },
  {
    id:"sa1", author:"Sappho", era:"c. 630–570 BC · Greek Lyric Poet", type:"poem",
    title:"Fragment 31",
    content:`He seems to me equal to the gods,\nthe man who, sitting across from you,\nlistens closely to your sweet speaking\nand lovely laughing—\n\nwhich strikes fear in the heart in my breast.\nFor whenever I look at you briefly,\nI can no longer speak even a little.`,
    source:"Wikipedia — Sappho", sourceUrl:"https://en.wikipedia.org/wiki/Sappho"
  },
  {
    id:"mi1", author:"Michelangelo", era:"1475–1564 · Renaissance Artist", type:"letter",
    title:"Letter to Giorgio Vasari, c. 1549",
    content:"The greatest danger for most of us is not that our aim is too high and we miss it, but that it is too low and we reach it. I saw the angel in the marble and carved until I set him free.",
    source:"Wikipedia — Michelangelo", sourceUrl:"https://en.wikipedia.org/wiki/Michelangelo"
  },
  {
    id:"mp1", author:"Marcel Proust", era:"1871–1922 · French Novelist", type:"story",
    title:"In Search of Lost Time, Vol. I",
    content:"For a long time, I used to go to bed early. Sometimes, when I had put out my candle, my eyes would close so quickly that I had not even time to say 'I'm going to sleep.'",
    source:"Wikipedia — In Search of Lost Time", sourceUrl:"https://en.wikipedia.org/wiki/In_Search_of_Lost_Time"
  },
  {
    id:"eb1", author:"Emily Brontë", era:"1818–1848 · English Novelist & Poet", type:"poem",
    title:"No Coward Soul Is Mine",
    content:`No coward soul is mine\nNo trembler in the world's storm-troubled sphere\nI see Heaven's glories shine\nAnd Faith shines equal arming me from Fear.`,
    source:"Wikipedia — Emily Brontë", sourceUrl:"https://en.wikipedia.org/wiki/Emily_Bront%C3%AB"
  },
  {
    id:"vw3", author:"Virginia Woolf", era:"1882–1941 · English Author", type:"diary",
    title:"Diary Entry, April 1930",
    content:"I thought of my own life. One must be ruthless. Life runs away, runs away. Nothing remains. And yet — one must continue to walk forward into the light.",
    source:"Wikipedia — Virginia Woolf", sourceUrl:"https://en.wikipedia.org/wiki/Virginia_Woolf"
  },
]

export function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
